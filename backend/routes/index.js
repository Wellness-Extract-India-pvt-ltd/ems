import express from 'express';
import authRoutes from './authRoutes.js';
import employeeRoutes from './employeeRoutes.js';
import hardwareRoutes from './hardwareRoutes.js';
import softwareRoutes from './softwareRoutes.js';
import licenseRoutes from './licenseRoutes.js';
import ticketRoutes from './ticketRoutes.js';
import integrationRoutes from './integrationRoutes.js';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'EMS API is healthy',
    timestamp: new Date().toISOString()
  });
});

// Mount all route modules
router.use('/auth', authRoutes);
router.use('/employees', employeeRoutes);
router.use('/hardware', hardwareRoutes);
router.use('/software', softwareRoutes);
router.use('/licenses', licenseRoutes);
router.use('/tickets', ticketRoutes);
router.use('/integrations', integrationRoutes);

export default router;
