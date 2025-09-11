import mongoose from "mongoose";

const HARDWARE_TYPES = ["laptop", "desktop", "server", "network device", "peripheral"];
const STATUSES = ["available", "in use", "maintenance", "retired"];

const assignmentHistorySchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
  assignedDate: { type: Date, default: Date.now },
  returnedDate: { type: Date }
}, { _id: false });

const hardwareSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: HARDWARE_TYPES,
        trim: true
    },
    brand: {
        type: String,
        trim: true,
    },
    model: {
        type: String,
        trim: true,
    },
    serialNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true
    },
    purchaseDate: {
    type: Date,
    required: true,
    validate: {
      validator: date => date <= new Date(),
      message: "Purchase date cannot be in the future"
    }
  },
    warrantyExpiryDate: {
        type: Date,
        validate: {
        validator: function (value) {
          return !value || value > this.purchaseDate;
        },
        message: "Warranty expiry date must be after purchase date",
      },
    },
    status: {
        type: String,
        required: true,
        enum: STATUSES,
        default: 'available'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        validate: {
        validator: async function (value) {
          if (!value) return true;
          const employeeExists = await mongoose.model("Employee").exists({ _id: value });
          return employeeExists != null;
        },
        message: "Assigned employee does not exist",
      },
    },
    assignmentHistory: [assignmentHistorySchema]
},
{
  timestamps: true
});

hardwareSchema.index({ type: 1 });
hardwareSchema.index({ status: 1 });
hardwareSchema.index({ assignedTo: 1 });

export default mongoose.model("Hardware", hardwareSchema);