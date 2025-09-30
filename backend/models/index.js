/**
 * Models Index
 * Exports all database models for the application
 */

// Import all models
import Employee from './Employee.js'
import Hardware from './Hardware.js'
import Software from './Software.js'
import License from './License.js'
import Ticket from './Ticket.js'
import Department from './Department.js'
import Integration from './Integration.js'
import UserRoleMap from './UserRoleMap.js'
import BiometricEmployee from './BiometricEmployee.js'
import Chat from './Chat.js'
import AuditLog from './AuditLog.js'
import Activity from './Activity.js'
import TimeTracking from './TimeTracking.js'

// Define associations
// Employee-Department associations
Employee.belongsTo(Department, {
  foreignKey: 'department_id',
  as: 'department'
})
Department.hasMany(Employee, { foreignKey: 'department_id', as: 'employees' })

// Employee-Manager self-reference
Employee.belongsTo(Employee, { foreignKey: 'manager_id', as: 'manager' })
Employee.hasMany(Employee, { foreignKey: 'manager_id', as: 'subordinates' })

// Hardware-Employee associations
Hardware.belongsTo(Employee, {
  foreignKey: 'assigned_to',
  as: 'assignedEmployee'
})
Employee.hasMany(Hardware, {
  foreignKey: 'assigned_to',
  as: 'assignedHardware'
})

// Software-Employee associations
Software.belongsTo(Employee, {
  foreignKey: 'assigned_to',
  as: 'assignedEmployee'
})
Employee.hasMany(Software, {
  foreignKey: 'assigned_to',
  as: 'assignedSoftware'
})

// License associations
License.belongsTo(Software, { foreignKey: 'software_id', as: 'software' })
License.belongsTo(Employee, {
  foreignKey: 'assigned_to',
  as: 'assignedEmployee'
})
Software.hasMany(License, { foreignKey: 'software_id', as: 'licenses' })
Employee.hasMany(License, {
  foreignKey: 'assigned_to',
  as: 'assignedLicenses'
})

// Ticket associations
Ticket.belongsTo(Employee, {
  foreignKey: 'created_by',
  as: 'createdByEmployee'
})
Ticket.belongsTo(Employee, {
  foreignKey: 'assigned_to',
  as: 'assignedToEmployee'
})
Employee.hasMany(Ticket, { foreignKey: 'created_by', as: 'createdTickets' })
Employee.hasMany(Ticket, { foreignKey: 'assigned_to', as: 'assignedTickets' })

// UserRoleMap associations
UserRoleMap.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' })
Employee.hasOne(UserRoleMap, { foreignKey: 'employee_id', as: 'roleMap' })

// Department-Hardware/Software associations (for department asset tracking)
Department.hasMany(Hardware, {
  foreignKey: 'department_id',
  as: 'departmentHardware'
})
Department.hasMany(Software, {
  foreignKey: 'department_id',
  as: 'departmentSoftware'
})

// BiometricEmployee associations (for biometric system integration)
BiometricEmployee.belongsTo(Employee, {
  foreignKey: 'employee_id',
  as: 'mainEmployee'
})
Employee.hasOne(BiometricEmployee, {
  foreignKey: 'employee_id',
  as: 'biometricProfile'
})

// Integration associations
Integration.belongsTo(Employee, { foreignKey: 'created_by', as: 'creator' })
Integration.belongsTo(Employee, { foreignKey: 'updated_by', as: 'updater' })
Employee.hasMany(Integration, {
  foreignKey: 'created_by',
  as: 'createdIntegrations'
})
Employee.hasMany(Integration, {
  foreignKey: 'updated_by',
  as: 'updatedIntegrations'
})

// Chat associations
Chat.belongsTo(UserRoleMap, { foreignKey: 'user_id', as: 'user' })
UserRoleMap.hasMany(Chat, { foreignKey: 'user_id', as: 'chats' })

// Activity associations
Activity.belongsTo(UserRoleMap, { foreignKey: 'user_id', as: 'user' })
UserRoleMap.hasMany(Activity, { foreignKey: 'user_id', as: 'activities' })

// TimeTracking associations
TimeTracking.belongsTo(UserRoleMap, { foreignKey: 'user_id', as: 'user' })
TimeTracking.belongsTo(Employee, { foreignKey: 'employee_id', as: 'employee' })
TimeTracking.belongsTo(UserRoleMap, { foreignKey: 'approved_by', as: 'approver' })
UserRoleMap.hasMany(TimeTracking, { foreignKey: 'user_id', as: 'timeTracking' })
Employee.hasMany(TimeTracking, { foreignKey: 'employee_id', as: 'timeTracking' })

// Export all models
export { 
  Employee, 
  Hardware, 
  Software, 
  License, 
  Ticket, 
  Department, 
  Integration, 
  UserRoleMap, 
  BiometricEmployee, 
  Chat,
  AuditLog,
  Activity,
  TimeTracking
}

// Default export with all models
export default {
  Employee,
  Hardware,
  Software,
  License,
  Ticket,
  Department,
  Integration,
  UserRoleMap,
  BiometricEmployee,
  Chat,
  AuditLog,
  Activity,
  TimeTracking
}
