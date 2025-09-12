import express from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import { requiresRole, authMiddleware } from '../middleware/authMiddleware.js';
import {
  addHardware,
  listHardware,
  getHardwareById,
  updateHardware,
  deleteHardware,
  getHardwareByEmployee
} from '../controllers/hardwareController.js';

const router = express.Router();

// Apply authentication globally to hardware routes
router.use(authMiddleware);

// Rate limiter for hardware creation
const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many hardware creation attempts'
});

// Validation chain for hardware creation and update
const hardwareValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('type').isIn(['laptop', 'desktop', 'server', 'network device', 'peripheral']).withMessage('Invalid hardware type'),
  body('brand').optional().trim(),
  body('model').optional().trim(),
  body('serialNumber').optional().isAlphanumeric().withMessage('Serial number must be alphanumeric'),
  body('purchaseDate').isISO8601().toDate().withMessage('Invalid purchase date'),
  body('warrantyExpiryDate').optional().isISO8601().toDate().withMessage('Invalid warranty expiry date'),
  body('status').optional().isIn(['available', 'in use', 'maintenance', 'retired']),
  body('assignedTo').optional().isMongoId().withMessage('Invalid assignedTo employee ID')
];

// POST /add - Create hardware (admin only)
router.post('/add', createLimiter, requiresRole('admin'), hardwareValidation, addHardware);

// GET /all - List hardware (role-based access)
router.get('/all', listHardware);

// GET /employee/:employeeId - Get hardware assigned to specific employee (role-based access)
router.get('/employee/:employeeId', getHardwareByEmployee);

// GET /:id - Get single hardware by id (role-based access)
router.get('/:_id', getHardwareById);

// PUT /update/:id - Update hardware (admin only)
router.put('/update/:_id', requiresRole('admin'), hardwareValidation, updateHardware);

// DELETE /delete/:id - Delete hardware (admin only)
router.delete('/delete/:_id', requiresRole('admin'), deleteHardware);

export default router;