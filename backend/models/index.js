import sequelize from '../database/connection.js';

// Import all models
import Department from './Department.js';
import Employee from './Employee.js';
import EmployeeEducation from './EmployeeEducation.js';
import EmployeeOrganization from './EmployeeOrganization.js';
import Ticket from './Ticket.js';
import TicketAttachment from './TicketAttachment.js';
import TicketComment from './TicketComment.js';
import TicketEvent from './TicketEvent.js';
import Hardware from './Hardware.js';
import HardwareAssignmentHistory from './HardwareAssignmentHistory.js';
import Software from './Software.js';
import License from './License.js';
import Integration from './Integration.js';
import UserRoleMap from './UserRoleMap.js';

// Create models object
const models = {
  Department,
  Employee,
  EmployeeEducation,
  EmployeeOrganization,
  Ticket,
  TicketAttachment,
  TicketComment,
  TicketEvent,
  Hardware,
  HardwareAssignmentHistory,
  Software,
  License,
  Integration,
  UserRoleMap
};

// Define associations
Object.keys(models).forEach(modelName => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export models and sequelize instance
export { sequelize };
export {
  Department,
  Employee,
  EmployeeEducation,
  EmployeeOrganization,
  Ticket,
  TicketAttachment,
  TicketComment,
  TicketEvent,
  Hardware,
  HardwareAssignmentHistory,
  Software,
  License,
  Integration,
  UserRoleMap
};
export default models;
