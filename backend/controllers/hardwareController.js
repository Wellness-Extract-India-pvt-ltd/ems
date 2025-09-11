/**
 * Hardware Controller
 * Handles CRUD operations and business logic for hardware asset resources.
 */

import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';
import Hardware from '../models/Hardware.js';

/**
 * Get all hardware assets.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
export async function listHardware(req, res, next) {
  try {
    // Retrieve all hardware assets from the database
    const hardware = await Hardware.find();
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
    // Find hardware asset by ID
    const hardware = await Hardware.findById(req.params.id);
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
    const hardware = new Hardware(req.body);
    await hardware.save();
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