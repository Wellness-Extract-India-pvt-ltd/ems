/**
 * Hardware Controller
 * Handles CRUD operations and business logic for hardware asset resources.
 */

import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';
<<<<<<< Updated upstream
import Hardware from '../models/Hardware.js';
=======
import { Hardware, Employee } from '../models/index.js';
import redisConfig from '../config/redis.js';
>>>>>>> Stashed changes

/**
 * Get all hardware assets.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function listHardware(req, res, next) {
  try {
<<<<<<< Updated upstream
    // Retrieve all hardware assets from the database
    const hardware = await Hardware.find();
=======
    const userRole = req.user?.role;
    const userId = req.user?.id;

    // Generate cache key based on user role and ID
    const cacheKey = redisConfig.generateKey('hardware', 'list', userRole, userId || 'anonymous');

    // Try to get from cache first
    if (redisConfig.isRedisConnected()) {
      const cachedData = await redisConfig.get(cacheKey);
      if (cachedData) {
        logger.info('Hardware list served from cache');
        return res.json(cachedData);
      }
    }

    let whereClause = {};
    
    // If user is not admin, only show assets assigned to them
    if (userRole !== 'admin') {
      whereClause.assigned_to = userId;
    }

    // Retrieve hardware assets based on user role
    const hardware = await Hardware.findAll({
      where: whereClause,
      include: [{
        model: Employee,
        as: 'assignedEmployee',
        attributes: ['id', 'first_name', 'last_name', 'employee_id']
      }]
    });

    // Cache the result for 5 minutes
    if (redisConfig.isRedisConnected()) {
      await redisConfig.set(cacheKey, hardware, 300);
    }
    
>>>>>>> Stashed changes
    res.json(hardware);
  } catch (err) {
    next(err);
  }
}

/**
 * Get a single hardware asset by ID.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function getHardwareById(req, res, next) {
  try {
<<<<<<< Updated upstream
    // Find hardware asset by ID
    const hardware = await Hardware.findById(req.params.id);
=======
    const userRole = req.user?.role;
    const userId = req.user?.id;

    let whereClause = { id: req.params.id };
    
    // If user is not admin, only allow access to assets assigned to them
    if (userRole !== 'admin') {
      whereClause.assigned_to = userId;
    }

    // Find hardware asset by ID with role-based access
    const hardware = await Hardware.findOne({
      where: whereClause,
      include: [{
        model: Employee,
        as: 'assignedEmployee',
        attributes: ['id', 'first_name', 'last_name', 'employee_id']
      }]
    });
    
>>>>>>> Stashed changes
    if (!hardware) {
      return res.status(404).json({ error: 'Hardware not found' });
    }
    
    res.json(hardware);
  } catch (err) {
    next(err);
  }
}

/**
 * Create a new hardware asset.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function addHardware(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    // Create and save a new hardware asset
<<<<<<< Updated upstream
    const hardware = new Hardware(req.body);
    await hardware.save();
=======
    const hardware = await Hardware.create(req.body);
    
    // Invalidate hardware cache
    if (redisConfig.isRedisConnected()) {
      const client = redisConfig.getClient();
      const keys = await client.keys('hardware:*');
      if (keys.length > 0) {
        await client.del(...keys);
        logger.info(`Invalidated ${keys.length} hardware cache keys`);
      }
    }
    
>>>>>>> Stashed changes
    res.status(201).json(hardware);
  } catch (err) {
    next(err);
  }
}

/**
 * Update an existing hardware asset by ID.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function updateHardware(req, res, next) {
  try {
    // Find hardware asset by ID and update
    const hardware = await Hardware.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hardware) {
      return res.status(404).json({ error: 'Hardware not found' });
    }
    res.json(hardware);
  } catch (err) {
    next(err);
  }
}

/**
 * Delete a hardware asset by ID.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function deleteHardware(req, res, next) {
  try {
    // Find hardware asset by ID and delete
    const hardware = await Hardware.findByIdAndDelete(req.params.id);
    if (!hardware) {
      return res.status(404).json({ error: 'Hardware not found' });
    }
    res.json({ message: 'Hardware deleted successfully' });
  } catch (err) {
    next(err);
  }
}

/**
 * Get hardware assets assigned to a specific employee.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function getHardwareByEmployee(req, res, next) {
  try {
    const userRole = req.user?.role;
    const userId = req.user?.id;
    const employeeId = req.params.employeeId;
    
    // If user is not admin, only allow access to their own assets
    if (userRole !== 'admin' && parseInt(employeeId) !== userId) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        message: 'Access denied. You can only view your own assets.' 
      });
    }
    
    // Find hardware assets assigned to the employee
    const hardware = await Hardware.findAll({
      where: { assigned_to: employeeId },
      include: [{
        model: Employee,
        as: 'assignedEmployee',
        attributes: ['id', 'first_name', 'last_name', 'employee_id']
      }]
    });
    
    res.json(hardware);
  } catch (err) {
    next(err);
  }
}