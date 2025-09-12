import express from 'express';
import { body, param, query } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { authMiddleware, requiresRole } from '../middleware/authMiddleware.js';
import {
  addSoftware,
  listSoftware,
  getSoftwareById,
  updateSoftware,
  deleteSoftware,
  getSoftwareByEmployee
} from '../controllers/softwareController.js';

const router = express.Router();
router.use(authMiddleware);
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many software creation attempts'
});

// Validation rules for POST and PUT
const softwareValidation = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('version').notEmpty().withMessage('Version is required').trim(),
  body('vendor').notEmpty().withMessage('Vendor is required').trim(),
  body('licenseType').notEmpty().isIn(['commercial', 'open-source', 'freeware', 'shareware'])
    .withMessage('Invalid license type'),
  body('purchaseDate').isISO8601().toDate().withMessage('Invalid purchase date'),
  body('expiryDate').optional().isISO8601().toDate().withMessage('Invalid expiry date'),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo ID'),
];

// POST /add - create software (admins only)
router.post('/add', createLimiter, requiresRole('admin'), softwareValidation, addSoftware);

// GET /all - list software (role-based access)
router.get('/all', listSoftware);

// GET /employee/:employeeId - get software assigned to specific employee (role-based access)
router.get('/employee/:employeeId', getSoftwareByEmployee);

// GET /:id - get software by ID (role-based access)
router.get('/:_id',
  param('_id').isMongoId().withMessage('Invalid software ID'),
  getSoftwareById
);

// PUT /update/:id - update software (admins only)
router.put('/update/:_id',
  requiresRole('admin'),
  param('_id').isMongoId().withMessage('Invalid software ID'),
  softwareValidation,
  updateSoftware
);

// DELETE /delete/:id - delete software (admins only)
router.delete('/delete/:_id',
  requiresRole('admin'),
  param('_id').isMongoId().withMessage('Invalid software ID'),
  deleteSoftware
);

export default router;