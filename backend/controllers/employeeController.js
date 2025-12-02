/**
 * Employee Controller
 * Handles CRUD operations and business logic for employee resources.
 */

import { validationResult } from 'express-validator';
import { Op } from 'sequelize';
import crypto from 'crypto';
import axios from 'axios';

import { Employee, EmployeeEducation, EmployeeOrganization, sequelize } from '../models/index.js';
import getAccessToken from '../utils/msgraph.js';
import logger from '../utils/logger.js';

function mapFilesToDoc(files, payload) {
  const lookup = Object.fromEntries(files.map(f => [f.fieldname, f.path]));

  return {
    ...payload,
    avatar_path: lookup.avatar || payload.avatar_path,
    passbook_path: lookup.passbook || payload.passbook_path,
    educations: (payload.educations || []).map((edu, i) => ({
      ...edu,
      certificate_path: lookup[`education_${i}`] || edu.certificate_path,
    })),
    organisations: (payload.organisations || []).map((org, i) => ({
      ...org,
      experience_letter_path: lookup[`organisation_${i}`] || org.experience_letter_path,
    })),
  };
}

export async function addEmployee(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const transaction = await sequelize.transaction();

  try {
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

    // Flatten the nested structure for MySQL
    const employeeData = {
      first_name: payload.personal?.firstName,
      middle_name: payload.personal?.middleName,
      last_name: payload.personal?.lastName,
      date_of_birth: payload.personal?.dob,
      gender: payload.personal?.gender,
      marital_status: payload.personal?.maritalStatus,
      photo_path: payload.personal?.photoPath,
      resume_path: payload.personal?.resumePath,
      id_proof_path: payload.personal?.idProofPath,
      avatar_path: docWithFiles.avatar_path,
      
      email: payload.contact?.email,
      phone: payload.contact?.phone,
      emergency_contact: payload.contact?.emergencyContact,
      address: payload.contact?.address,
      
      employee_id: payload.employment?.employeeId,
      join_date: payload.employment?.joinDate,
      employment_type: payload.employment?.employmentType,
      department_id: payload.employment?.department,
      position: payload.employment?.position,
      status: payload.employment?.status || 'Active',
      manager_id: payload.employment?.manager,
      work_location: payload.employment?.workLocation,
      work_schedule: payload.employment?.workSchedule,
      
      bank_name: payload.bank?.bankName,
      account_number: payload.bank?.accountNumber,
      ifsc_code: payload.bank?.ifsc,
      passbook_path: docWithFiles.passbook_path,
      
      ms_graph_user_id: msGraphUserId,
      contact_email: payload.contact?.email
    };

    // Create employee record
    const employee = await Employee.create(employeeData, { transaction });

    // Create education records if any
    if (docWithFiles.educations && docWithFiles.educations.length > 0) {
      const educationData = docWithFiles.educations.map(edu => ({
        employee_id: employee.id,
        qualification: edu.qualification,
        field: edu.field,
        institution: edu.institution,
        year_of_completion: edu.yearOfCompletion,
        grade: edu.grade,
        certificate_path: edu.certificate_path
      }));
      await EmployeeEducation.bulkCreate(educationData, { transaction });
    }

    // Create organization records if any
    if (docWithFiles.organisations && docWithFiles.organisations.length > 0) {
      const organizationData = docWithFiles.organisations.map(org => ({
        employee_id: employee.id,
        company_name: org.companyName,
        position: org.position,
        experience_years: org.experienceYears,
        start_date: org.startDate,
        end_date: org.endDate,
        responsibilities: org.responsibilities,
        experience_letter_path: org.experience_letter_path
      }));
      await EmployeeOrganization.bulkCreate(organizationData, { transaction });
    }

    await transaction.commit();

    logger.info('Employee created successfully', { employeeId: employee.id });

    return res.status(201).json({
      message: 'Employee created',
      employee,
      temporaryPassword: tempPassword // you might want to send this securely, e.g., email or separate flow
    });
  } catch (err) {
    await transaction.rollback();
    logger.error('Employee creation failed', {
      error: err.message,
      stack: err.stack
    });
    return res.status(500).json({
      message: 'Failed to create employee',
      error: err.message
    });
  }
}

/**
 * GET /all
 * List employees controller logic with pagination and optional search
 */
export async function listEmployees(req, res) {
  const { search = '', page = 1, limit = 10 } = req.query;

  try {
    const whereClause = search ? {
      [Op.or]: [
        { first_name: { [Op.like]: `%${search}%` } },
        { last_name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
      ]
    } : {};

    const { count, rows: employees } = await Employee.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      include: [
        {
          model: EmployeeEducation,
          as: 'educations',
          required: false
        },
        {
          model: EmployeeOrganization,
          as: 'organizations',
          required: false
        }
      ]
    });

    res.status(200).json({
      employees,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page)
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
    const employee = await Employee.findByPk(req.params._id, {
      include: [
        {
          model: EmployeeEducation,
          as: 'educations',
          required: false
        },
        {
          model: EmployeeOrganization,
          as: 'organizations',
          required: false
        }
      ]
    });
    
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
    const [updatedRowsCount] = await Employee.update(
      updateFields,
      { 
        where: { id: req.params._id },
        returning: true
      }
    );

    if (updatedRowsCount === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    const updatedEmployee = await Employee.findByPk(req.params._id, {
      include: [
        {
          model: EmployeeEducation,
          as: 'educations',
          required: false
        },
        {
          model: EmployeeOrganization,
          as: 'organizations',
          required: false
        }
      ]
    });

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
    const deletedRowsCount = await Employee.destroy({
      where: { id: req.params._id }
    });
    
    if (deletedRowsCount === 0) {
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