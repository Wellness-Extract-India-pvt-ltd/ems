import { validationResult } from 'express-validator';
import { Software, Employee } from '../models/index.js';
import logger from '../utils/logger.js';

// POST /add
export async function addSoftware(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const newSoftware = await Software.create(req.body);
    logger.info('Software added', { softwareId: newSoftware.id, name: newSoftware.name });

    res.status(201).json({ message: 'Software added successfully', software: newSoftware });
  } catch (error) {
    logger.error('Software creation failed', { error: error.message, payload: req.body });
    res.status(400).json({ message: 'Error adding software', error: error.message });
  }
}

// GET /all
export async function listSoftware(req, res) {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let whereClause = {};
    
    // If user is not admin, only show software assigned to them
    if (userRole !== 'admin') {
      whereClause.assigned_to = userId;
    }

    const softwareItems = await Software.findAll({
      where: whereClause,
      include: [{
        model: Employee,
        as: 'assignedEmployee',
        attributes: ['id', 'first_name', 'last_name', 'employee_id']
      }]
    });
    res.status(200).json(softwareItems);
  } catch (error) {
    logger.error('Software list error', error);
    res.status(500).json({ message: 'Error fetching software', error: error.message });
  }
}

// GET /:id
export async function getSoftwareById(req, res) {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let whereClause = { id: req.params.id };
    
    // If user is not admin, only allow access to software assigned to them
    if (userRole !== 'admin') {
      whereClause.assigned_to = userId;
    }

    const softwareItem = await Software.findOne({
      where: whereClause,
      include: [{
        model: Employee,
        as: 'assignedEmployee',
        attributes: ['id', 'first_name', 'last_name', 'employee_id']
      }]
    });
    
    if (!softwareItem) return res.status(404).json({ message: 'Software not found' });
    res.status(200).json(softwareItem);
  } catch (error) {
    logger.error('Software fetch error', { softwareId: req.params.id, error: error.message });
    res.status(500).json({ message: 'Error fetching software', error: error.message });
  }
}

// PUT /update/:id
export async function updateSoftware(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const [updatedRowsCount] = await Software.update(req.body, { where: { id: req.params.id } });
    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Software not found' });
    }
    
    const updatedSoftware = await Software.findByPk(req.params.id);
    logger.info('Software updated', { softwareId: req.params.id });
    res.status(200).json({ message: 'Software updated successfully', software: updatedSoftware });
  } catch (error) {
    logger.error('Software update failed', { softwareId: req.params.id, error: error.message });
    res.status(400).json({ message: 'Error updating software', error: error.message });
  }
}

// DELETE /delete/:id
export async function deleteSoftware(req, res) {
  try {
    const deletedRowsCount = await Software.destroy({ where: { id: req.params.id } });
    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: 'Software not found' });
    }

    logger.info('Software deleted', { softwareId: req.params.id });
    res.status(200).json({ message: 'Software deleted successfully' });
  } catch (error) {
    logger.error('Software deletion failed', { softwareId: req.params.id, error: error.message });
    res.status(500).json({ message: 'Error deleting software', error: error.message });
  }
}

/**
 * Get software assigned to a specific employee.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function getSoftwareByEmployee(req, res, next) {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const employeeId = req.params.employeeId;
    
    // If user is not admin, only allow access to their own software
    if (userRole !== 'admin' && parseInt(employeeId) !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Access denied. You can only view your own software.' 
      });
    }
    
    // Find software assigned to the employee
    const software = await Software.findAll({
      where: { assigned_to: employeeId },
      include: [{
        model: Employee,
        as: 'assignedEmployee',
        attributes: ['id', 'first_name', 'last_name', 'employee_id']
      }]
    });
    
    res.json(software);
  } catch (err) {
    next(err);
  }
}