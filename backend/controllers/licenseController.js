import { validationResult } from 'express-validator';
import { License, Employee } from '../models/index.js';
import logger from '../utils/logger.js';

// POST /add
export async function addLicense(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const newLicense = await License.create(req.body);

    logger.info('License added', { licenseId: newLicense.id });
    res.status(201).json({ message: 'License added successfully', license: newLicense });
  } catch (error) {
    logger.error('License creation failed', { error: error.message });
    res.status(400).json({ message: 'Error adding license', error: error.message });
  }
}

// GET /all
export async function listLicenses(req, res) {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let whereClause = {};
    
    // If user is not admin, only show licenses assigned to them
    if (userRole !== 'admin') {
      whereClause.assigned_to = userId;
    }

    const licenses = await License.findAll({
      where: whereClause,
      include: [{
        model: Employee,
        as: 'assignedEmployee',
        attributes: ['id', 'first_name', 'last_name', 'employee_id']
      }]
    });

    res.status(200).json(licenses);
  } catch (error) {
    logger.error('License list error', error);
    res.status(500).json({ message: 'Error fetching licenses', error: error.message });
  }
}

// GET /:id
export async function getLicenseById(req, res) {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let whereClause = { id: req.params.id };
    
    // If user is not admin, only allow access to licenses assigned to them
    if (userRole !== 'admin') {
      whereClause.assigned_to = userId;
    }

    const license = await License.findOne({
      where: whereClause,
      include: [{
        model: Employee,
        as: 'assignedEmployee',
        attributes: ['id', 'first_name', 'last_name', 'employee_id']
      }]
    });

    if (!license) return res.status(404).json({ message: 'License not found' });
    res.status(200).json(license);
  } catch (error) {
    logger.error('License fetch error', { licenseId: req.params.id, error: error.message });
    res.status(500).json({ message: 'Error fetching license', error: error.message });
  }
}

// PUT /update/:id
export async function updateLicense(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  try {
    const [updatedRowsCount] = await License.update(req.body, { where: { id: req.params.id } });
    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'License not found' });
    }
    
    const updatedLicense = await License.findByPk(req.params.id);
    logger.info('License updated', { licenseId: req.params.id });
    res.status(200).json({ message: 'License updated successfully', license: updatedLicense });
  } catch (error) {
    logger.error('License update failed', { licenseId: req.params.id, error: error.message });
    res.status(400).json({ message: 'Error updating license', error: error.message });
  }
}

// DELETE /delete/:id
export async function deleteLicense(req, res) {
  try {
    const deletedRowsCount = await License.destroy({ where: { id: req.params.id } });
    if (deletedRowsCount === 0) {
      return res.status(404).json({ message: 'License not found' });
    }

    logger.info('License deleted', { licenseId: req.params.id });
    res.status(200).json({ message: 'License deleted successfully' });
  } catch (error) {
    logger.error('License deletion failed', { licenseId: req.params.id, error: error.message });
    res.status(500).json({ message: 'Error deleting license', error: error.message });
  }
}

/**
 * Get licenses assigned to a specific employee.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function getLicensesByEmployee(req, res, next) {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const employeeId = req.params.employeeId;
    
    // If user is not admin, only allow access to their own licenses
    if (userRole !== 'admin' && parseInt(employeeId) !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Access denied. You can only view your own licenses.' 
      });
    }
    
    // Find licenses assigned to the employee
    const licenses = await License.findAll({
      where: { assigned_to: employeeId },
      include: [{
        model: Employee,
        as: 'assignedEmployee',
        attributes: ['id', 'first_name', 'last_name', 'employee_id']
      }]
    });
    
    res.json(licenses);
  } catch (err) {
    next(err);
  }
}