import api from '../api/axios.js';

/**
 * Activity Tracker Utility
 * Automatically tracks user activities across the application
 */

// Activity type constants
export const ACTIVITY_TYPES = {
  // Employee activities
  EMPLOYEE_CREATED: 'employee_created',
  EMPLOYEE_UPDATED: 'employee_updated',
  EMPLOYEE_DELETED: 'employee_deleted',
  
  // Asset activities
  ASSET_ASSIGNED: 'asset_assigned',
  ASSET_UNASSIGNED: 'asset_unassigned',
  ASSET_CREATED: 'asset_created',
  ASSET_UPDATED: 'asset_updated',
  
  // License activities
  LICENSE_CREATED: 'license_created',
  LICENSE_UPDATED: 'license_updated',
  LICENSE_EXPIRING: 'license_expiring',
  
  // Ticket activities
  TICKET_CREATED: 'ticket_created',
  TICKET_UPDATED: 'ticket_updated',
  TICKET_RESOLVED: 'ticket_resolved',
  
  // Biometric activities
  BIOMETRIC_CHECKIN: 'biometric_checkin',
  BIOMETRIC_CHECKOUT: 'biometric_checkout',
  
  // System activities
  SYSTEM_LOGIN: 'system_login',
  SYSTEM_LOGOUT: 'system_logout',
  PROFILE_UPDATED: 'profile_updated',
  SETTINGS_CHANGED: 'settings_changed',
  PASSWORD_CHANGED: 'password_changed',
  ROLE_ASSIGNED: 'role_assigned',
  PERMISSION_GRANTED: 'permission_granted',
  PERMISSION_REVOKED: 'permission_revoked',
  
  // Report activities
  REPORT_GENERATED: 'report_generated',
  DATA_EXPORTED: 'data_exported'
};

// Severity levels
export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Track an activity
 * @param {string} activityType - Type of activity
 * @param {string} title - Activity title
 * @param {string} description - Activity description
 * @param {string} entityType - Type of entity affected
 * @param {number} entityId - ID of entity affected
 * @param {string} severity - Severity level
 * @param {object} metadata - Additional metadata
 * @param {boolean} isPublic - Whether activity is public
 */
export const trackActivity = async ({
  activityType,
  title,
  description = null,
  entityType = null,
  entityId = null,
  severity = SEVERITY_LEVELS.LOW,
  metadata = null,
  isPublic = true
}) => {
  try {
    await api.post('/activities', {
      activity_type: activityType,
      title,
      description,
      entity_type: entityType,
      entity_id: entityId,
      severity,
      metadata,
      is_public: isPublic
    });
  } catch (error) {
    console.error('Failed to track activity:', error);
    // Don't throw error to avoid breaking the main functionality
  }
};

/**
 * Track employee activities
 */
export const trackEmployeeActivity = {
  created: (employeeId, employeeName) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.EMPLOYEE_CREATED,
      title: 'New employee added',
      description: `${employeeName} joined the team`,
      entityType: 'employee',
      entityId: employeeId,
      severity: SEVERITY_LEVELS.LOW
    }),

  updated: (employeeId, employeeName, changes) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.EMPLOYEE_UPDATED,
      title: 'Employee updated',
      description: `${employeeName}'s profile was updated`,
      entityType: 'employee',
      entityId: employeeId,
      severity: SEVERITY_LEVELS.LOW,
      metadata: { changes }
    }),

  deleted: (employeeId, employeeName) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.EMPLOYEE_DELETED,
      title: 'Employee removed',
      description: `${employeeName} was removed from the system`,
      entityType: 'employee',
      entityId: employeeId,
      severity: SEVERITY_LEVELS.MEDIUM
    })
};

/**
 * Track asset activities
 */
export const trackAssetActivity = {
  assigned: (assetId, assetName, employeeName) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.ASSET_ASSIGNED,
      title: 'Asset assigned',
      description: `${assetName} assigned to ${employeeName}`,
      entityType: 'asset',
      entityId: assetId,
      severity: SEVERITY_LEVELS.LOW
    }),

  unassigned: (assetId, assetName, employeeName) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.ASSET_UNASSIGNED,
      title: 'Asset unassigned',
      description: `${assetName} unassigned from ${employeeName}`,
      entityType: 'asset',
      entityId: assetId,
      severity: SEVERITY_LEVELS.LOW
    }),

  created: (assetId, assetName) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.ASSET_CREATED,
      title: 'New asset added',
      description: `${assetName} was added to the system`,
      entityType: 'asset',
      entityId: assetId,
      severity: SEVERITY_LEVELS.LOW
    }),

  updated: (assetId, assetName, changes) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.ASSET_UPDATED,
      title: 'Asset updated',
      description: `${assetName} was updated`,
      entityType: 'asset',
      entityId: assetId,
      severity: SEVERITY_LEVELS.LOW,
      metadata: { changes }
    })
};

/**
 * Track license activities
 */
export const trackLicenseActivity = {
  created: (licenseId, softwareName) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.LICENSE_CREATED,
      title: 'New license added',
      description: `${softwareName} license was added`,
      entityType: 'license',
      entityId: licenseId,
      severity: SEVERITY_LEVELS.LOW
    }),

  updated: (licenseId, softwareName, changes) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.LICENSE_UPDATED,
      title: 'License updated',
      description: `${softwareName} license was updated`,
      entityType: 'license',
      entityId: licenseId,
      severity: SEVERITY_LEVELS.LOW,
      metadata: { changes }
    }),

  expiring: (licenseId, softwareName, daysLeft) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.LICENSE_EXPIRING,
      title: 'License expiring soon',
      description: `${softwareName} license expires in ${daysLeft} days`,
      entityType: 'license',
      entityId: licenseId,
      severity: daysLeft <= 7 ? SEVERITY_LEVELS.HIGH : SEVERITY_LEVELS.MEDIUM
    })
};

/**
 * Track ticket activities
 */
export const trackTicketActivity = {
  created: (ticketId, ticketTitle) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.TICKET_CREATED,
      title: 'New ticket created',
      description: `Ticket: ${ticketTitle}`,
      entityType: 'ticket',
      entityId: ticketId,
      severity: SEVERITY_LEVELS.LOW
    }),

  updated: (ticketId, ticketTitle, changes) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.TICKET_UPDATED,
      title: 'Ticket updated',
      description: `Ticket: ${ticketTitle}`,
      entityType: 'ticket',
      entityId: ticketId,
      severity: SEVERITY_LEVELS.LOW,
      metadata: { changes }
    }),

  resolved: (ticketId, ticketTitle) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.TICKET_RESOLVED,
      title: 'Ticket resolved',
      description: `Ticket: ${ticketTitle}`,
      entityType: 'ticket',
      entityId: ticketId,
      severity: SEVERITY_LEVELS.LOW
    })
};

/**
 * Track biometric activities
 */
export const trackBiometricActivity = {
  checkin: (employeeId, employeeName) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.BIOMETRIC_CHECKIN,
      title: 'Employee checked in',
      description: `${employeeName} checked in via biometric`,
      entityType: 'biometric',
      entityId: employeeId,
      severity: SEVERITY_LEVELS.LOW
    }),

  checkout: (employeeId, employeeName) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.BIOMETRIC_CHECKOUT,
      title: 'Employee checked out',
      description: `${employeeName} checked out via biometric`,
      entityType: 'biometric',
      entityId: employeeId,
      severity: SEVERITY_LEVELS.LOW
    })
};

/**
 * Track system activities
 */
export const trackSystemActivity = {
  login: (userEmail) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.SYSTEM_LOGIN,
      title: 'User logged in',
      description: `${userEmail} logged into the system`,
      severity: SEVERITY_LEVELS.LOW
    }),

  logout: (userEmail) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.SYSTEM_LOGOUT,
      title: 'User logged out',
      description: `${userEmail} logged out of the system`,
      severity: SEVERITY_LEVELS.LOW
    }),

  profileUpdated: (userEmail, changes) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.PROFILE_UPDATED,
      title: 'Profile updated',
      description: `${userEmail} updated their profile`,
      severity: SEVERITY_LEVELS.LOW,
      metadata: { changes }
    }),

  settingsChanged: (userEmail, settings) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.SETTINGS_CHANGED,
      title: 'Settings changed',
      description: `${userEmail} changed system settings`,
      severity: SEVERITY_LEVELS.MEDIUM,
      metadata: { settings }
    }),

  passwordChanged: (userEmail) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.PASSWORD_CHANGED,
      title: 'Password changed',
      description: `${userEmail} changed their password`,
      severity: SEVERITY_LEVELS.MEDIUM
    }),

  roleAssigned: (userEmail, role) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.ROLE_ASSIGNED,
      title: 'Role assigned',
      description: `${userEmail} was assigned ${role} role`,
      severity: SEVERITY_LEVELS.HIGH
    }),

  permissionGranted: (userEmail, permission) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.PERMISSION_GRANTED,
      title: 'Permission granted',
      description: `${userEmail} was granted ${permission} permission`,
      severity: SEVERITY_LEVELS.MEDIUM
    }),

  permissionRevoked: (userEmail, permission) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.PERMISSION_REVOKED,
      title: 'Permission revoked',
      description: `${userEmail}'s ${permission} permission was revoked`,
      severity: SEVERITY_LEVELS.MEDIUM
    })
};

/**
 * Track report activities
 */
export const trackReportActivity = {
  generated: (reportType, reportName) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.REPORT_GENERATED,
      title: 'Report generated',
      description: `${reportName} report was generated`,
      severity: SEVERITY_LEVELS.LOW,
      metadata: { reportType, reportName }
    }),

  exported: (dataType, fileName) => 
    trackActivity({
      activityType: ACTIVITY_TYPES.DATA_EXPORTED,
      title: 'Data exported',
      description: `${dataType} data exported as ${fileName}`,
      severity: SEVERITY_LEVELS.LOW,
      metadata: { dataType, fileName }
    })
};

export default {
  trackActivity,
  trackEmployeeActivity,
  trackAssetActivity,
  trackLicenseActivity,
  trackTicketActivity,
  trackBiometricActivity,
  trackSystemActivity,
  trackReportActivity,
  ACTIVITY_TYPES,
  SEVERITY_LEVELS
};
