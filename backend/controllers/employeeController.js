/**
 * Employee Controller
 * Handles CRUD operations and business logic for employee resources.
 */

import { validationResult } from 'express-validator';
import mongoose from 'mongoose';
import crypto from 'crypto';
import axios from 'axios';

import Employee from '../models/Employee.js';
import getAccessToken from '../utils/msgraph.js';
import logger from '../utils/logger.js';

function mapFilesToDoc(files, payload) {
  const lookup = Object.fromEntries(files.map(f => [f.fieldname, f.path]));

  return {
    ...payload,
    avatarPath: lookup.avatar || payload.avatarPath,
    bank: payload.bank
      ? { ...payload.bank, passbookUrl: lookup.passbook || payload.bank.passbookUrl }
      : undefined,
    educations: (payload.educations || []).map((edu, i) => ({
      ...edu,
      certificatePath: lookup[`education_${i}`] || edu.certificatePath,
    })),
    organisations: (payload.organisations || []).map((org, i) => ({
      ...org,
      experienceLetterPath: lookup[`organisation_${i}`] || org.experienceLetterPath,
    })),
  };
}

export async function addEmployee(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const session = await mongoose.startSession();

  try {
    session.startTransaction();

    const payload = JSON.parse(req.body.payload || '{}');

    // Generate a temporary password for MS Azure user
    const tempPassword = crypto.randomBytes(8).toString('base64');
    let msGraphUserId;

    try {
      const accessToken = await getAccessToken();
      const msUser = {
        accountEnabled: true,
        displayName: `${payload.personal.firstName} ${payload.personal.lastName}`,
        mailNickname: `${payload.personal.firstName}${payload.personal.lastName}`.toLowerCase(),
        userPrincipalName: payload.contact.email,
        usageLocation: "CA",
        passwordProfile: {
          forceChangePasswordNextSignIn: true,
          password: tempPassword,
        },
      };

      const { data } = await axios.post(
        'https://graph.microsoft.com/v1.0/users',
        msUser,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      msGraphUserId = data.id;

      await axios.post(
        `https://graph.microsoft.com/v1.0/users/${msGraphUserId}/assignLicense`,
        {
          addLicenses: [{ skuId: process.env.SKU_ID }],
          removeLicenses: [],
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
    } catch (err) {
      logger.error('Microsoft Graph operation failed', { error: err });
    }

    // Map uploaded files to payload fields
    const docWithFiles = mapFilesToDoc(req.files, payload);

    // Create employee record with msGraphUserId
    const [employee] = await Employee.create([{ ...docWithFiles, msGraphUserId }], { session });

    await session.commitTransaction();

    logger.info('Employee created successfully', { employeeId: employee._id });

    return res.status(201).json({
      message: 'Employee created',
      employee,
      temporaryPassword: tempPassword // you might want to send this securely, e.g., email or separate flow
    });
  } catch (err) {
    await session.abortTransaction();
    logger.error('Employee creation failed', {
      error: err.message,
      stack: err.stack
    });
    return res.status(500).json({
      message: 'Failed to create employee',
      error: err.message
    });
  } finally {
    session.endSession();
  }
}

/**
 * GET /all
 * List employees controller logic with pagination and optional search
 */
export async function listEmployees(req, res) {
  const { search = '', page = 1, limit = 10 } = req.query;

  try {
    const query = search ? {
      $or: [
        { 'personal.firstName': new RegExp(search, 'i') },
        { 'personal.lastName': new RegExp(search, 'i') },
        { 'contact.email': new RegExp(search, 'i') },
      ]
    } : {};

    const employees = await Employee.find(query)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    const count = await Employee.countDocuments(query);

    res.status(200).json({
      employees,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    });
  } catch (error) {
    logger.error('Employee list error', error);
    res.status(500).json({
      message: 'Error fetching employees',
      error: error.message
    });
  }
}

/**
 * GET /:_id
 * Get employee by ID controller logic
 */
export async function getEmployeeById(req, res) {
  try {
    const employee = await Employee.findById(req.params._id).lean();
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    res.status(200).json(employee);
  } catch (error) {
    logger.error('Employee fetch error', {
      employeeId: req.params._id,
      error: error.message
    });
    res.status(500).json({
      message: 'Error fetching employee',
      error: error.message
    });
  }
}

/**
 * PUT /update/:_id
 * Update employee controller logic (admin only)
 */
export async function updateEmployee(req, res) {
  // Ensure msGraphUserId and refreshToken cannot be updated here
  const { msGraphUserId, refreshToken, ...updateFields } = req.body;

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(
      req.params._id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    logger.info('Employee updated', { employeeId: req.params._id });
    res.status(200).json({
      message: 'Employee updated successfully',
      employee: updatedEmployee
    });
  } catch (error) {
    logger.error('Employee update failed', {
      employeeId: req.params._id,
      error: error.message
    });
    res.status(400).json({
      message: 'Error updating employee',
      error: error.message
    });
  }
}

/**
 * DELETE /delete/:_id
 * Delete employee controller logic (admin only)
 */
export async function deleteEmployee(req, res) {
  try {
    const deletedEmployee = await Employee.findByIdAndDelete(req.params._id);
    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    logger.info('Employee deleted', { employeeId: req.params._id });
    res.status(200).json({ message: 'Employee deleted successfully' });
  } catch (error) {
    logger.error('Employee deletion failed', {
      employeeId: req.params._id,
      error: error.message
    });
    res.status(500).json({
      message: 'Error deleting employee',
      error: error.message
    });
  }
}