import { validationResult } from "express-validator";
import { Op } from "sequelize";
import { Ticket, TicketAttachment, TicketComment, TicketEvent, Employee, sequelize } from "../models/index.js";
import logger from "../utils/logger.js";

// --- CREATE TICKET ---
export async function addTicket(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  // Employees always set themselves as creator; cannot assign to self
  const { title, description, status, priority, assignedTo, dueDate } = req.body;
  if (assignedTo && assignedTo === req.user.employee?.toString()) {
    return res.status(400).json({ message: "Cannot assign ticket to self." });
  }
  
  const transaction = await sequelize.transaction();
  
  try {
    const ticket = await Ticket.create({
      title,
      description,
      status: status || 'open',
      priority: priority || 'medium',
      due_date: dueDate,
      assigned_to: assignedTo,
      created_by: req.user.employee,
    }, { transaction });

    // Create initial event if assigned
    if (assignedTo) {
      await TicketEvent.create({
        ticket_id: ticket.id,
        field: "assigned_to",
        from_value: null,
        to_value: assignedTo,
        changed_by: req.user.employee,
      }, { transaction });
    }

    await transaction.commit();
    
    logger.info("Ticket created", { ticketId: ticket.id });
    res.status(201).json({ message: "Ticket created successfully", ticket });
  } catch (error) {
    await transaction.rollback();
    logger.error("Ticket creation failed", { error: error.message });
    res.status(400).json({ message: "Error creating ticket", error: error.message });
  }
}

// --- UPLOAD ATTACHMENTS ---
export async function uploadAttachments(req, res) {
  const { _id } = req.params;
  try {
    const ticket = await Ticket.findByPk(_id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ message: "No files uploaded" });
    
    const attachments = files.map(file => ({
      ticket_id: ticket.id,
      path: file.path,
      uploaded_by: req.user.employee,
      original_name: file.originalname,
      file_size: file.size,
      mime_type: file.mimetype
    }));
    
    const createdAttachments = await TicketAttachment.bulkCreate(attachments);
    res.status(200).json({ message: "Attachments uploaded successfully", attachments: createdAttachments });
  } catch (error) {
    logger.error("[Upload Error]", error.message);
    res.status(500).json({ message: "Failed to upload attachments", error: error.message });
  }
}

// --- LIST TICKETS ---
export async function listTickets(req, res) {
  try {
    let whereClause = {};
    
    if (req.user.role === "employee") {
      whereClause = { created_by: req.user.employee };
    }
    
    const tickets = await Ticket.findAll({
      where: whereClause,
      include: [
        {
          model: Employee,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: Employee,
          as: 'assignee',
          attributes: ['id', 'first_name', 'last_name']
        }
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.status(200).json(tickets);
  } catch (error) {
    logger.error("Error fetching tickets", { error: error.message });
    res.status(500).json({ message: "Error fetching tickets", error: error.message });
  }
}

// --- GET SINGLE TICKET ---
export async function getTicketById(req, res) {
  try {
    const ticket = await Ticket.findByPk(req.params._id, {
      include: [
        {
          model: Employee,
          as: 'creator',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: Employee,
          as: 'assignee',
          attributes: ['id', 'first_name', 'last_name']
        },
        {
          model: TicketAttachment,
          as: 'attachments',
          required: false
        },
        {
          model: TicketComment,
          as: 'comments',
          required: false,
          include: [{
            model: Employee,
            as: 'author',
            attributes: ['id', 'first_name', 'last_name']
          }]
        },
        {
          model: TicketEvent,
          as: 'events',
          required: false,
          include: [{
            model: Employee,
            as: 'changer',
            attributes: ['id', 'first_name', 'last_name']
          }]
        }
      ]
    });

    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // Employees can only fetch their own tickets
    if (req.user.role === "employee" && ticket.created_by !== req.user.employee) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    logger.error("Error fetching ticket", { error: error.message });
    res.status(500).json({ message: "Error fetching ticket", error: error.message });
  }
}

// --- UPDATE TICKET ---
export async function updateTicket(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const transaction = await sequelize.transaction();

  try {
    const ticket = await Ticket.findByPk(req.params._id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    // --- RBAC logic ---
    if (req.user.role === "employee" && ticket.created_by !== req.user.employee) {
      return res.status(403).json({ message: "Access denied" });
    }

    // --- COMMON UPDATE LOGIC ---
    const updates = req.body;
    const events = [];
    
    // Map field names to database column names
    const fieldMapping = {
      status: 'status',
      priority: 'priority',
      assignedTo: 'assigned_to'
    };

    Object.keys(fieldMapping).forEach(field => {
      const dbField = fieldMapping[field];
      if (updates[field] && updates[field] !== String(ticket[dbField])) {
        events.push({
          ticket_id: ticket.id,
          field: dbField,
          from_value: String(ticket[dbField] || ''),
          to_value: updates[field],
          changed_by: req.user.employee,
        });
      }
    });

    // Update ticket fields
    const updateData = {};
    if (updates.title) updateData.title = updates.title;
    if (updates.description) updateData.description = updates.description;
    if (updates.dueDate) updateData.due_date = updates.dueDate;
    if (updates.status) updateData.status = updates.status;
    if (updates.priority) updateData.priority = updates.priority;
    if (updates.assignedTo) updateData.assigned_to = updates.assignedTo;

    await ticket.update(updateData, { transaction });

    // Create events if any
    if (events.length) {
      await TicketEvent.bulkCreate(events, { transaction });
    }

    await transaction.commit();
    
    logger.info("Ticket updated", { ticketId: ticket.id });
    res.status(200).json({ message: "Ticket updated successfully", ticket });
  } catch (error) {
    await transaction.rollback();
    logger.error("Ticket update failed", { error: error.message });
    res.status(500).json({ message: "Error updating ticket", error: error.message });
  }
}

// --- DELETE TICKET (admin only) ---
export async function deleteTicket(req, res) {
  try {
    const deletedRowsCount = await Ticket.destroy({
      where: { id: req.params._id }
    });
    
    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: "Ticket not found" });
    }
    
    logger.info("Ticket deleted", { ticketId: req.params._id });
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    logger.error("Ticket deletion failed", { error: error.message });
    res.status(500).json({ message: "Error deleting ticket", error: error.message });
  }
}