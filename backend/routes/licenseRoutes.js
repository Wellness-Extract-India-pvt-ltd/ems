import express from 'express';
import { body, param } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { authMiddleware, requiresRole } from '../middleware/authMiddleware.js';
import {
  addLicense,
  listLicenses,
  getLicenseById,
  updateLicense,
  deleteLicense,
  getLicensesByEmployee
} from '../controllers/licenseController.js';

const router = express.Router();
router.use(authMiddleware);

const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many license creation attempts'
});

const licenseValidation = [
  body('softwareId').notEmpty().isMongoId().withMessage('Valid softwareId required'),
  body('licenseKey').notEmpty().trim().withMessage('License key is required'),
  body('purchaseDate').notEmpty().isISO8601().toDate().withMessage('Valid purchase date required'),
  body('expiryDate').optional().isISO8601().toDate().withMessage('Invalid expiry date'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo employee ID')
];

router.post('/add', createLimiter, requiresRole('admin'), licenseValidation, addLicense);

// GET /all (role-based access)
router.get('/all', listLicenses);

// GET /employee/:employeeId - get licenses assigned to specific employee (role-based access)
router.get('/employee/:employeeId', getLicensesByEmployee);

// GET /:id (role-based access)
router.get('/:_id', param('_id').isMongoId().withMessage('Invalid license ID'), getLicenseById);

// PUT /update/:id (admin only)
router.put('/update/:_id', requiresRole('admin'), param('_id').isMongoId(), licenseValidation, updateLicense);

// DELETE /delete/:id (admin only)
router.delete('/delete/:_id', requiresRole('admin'), param('_id').isMongoId(), deleteLicense);

export default router;