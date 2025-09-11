import mongoose from 'mongoose';
const { Schema } = mongoose;

const departmentSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  manager: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  headOfDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Employee'
  },
  location: {
    type: String,
    trim: true
  },
  budget: {
    type: Number,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  parentDepartment: {
    type: Schema.Types.ObjectId,
    ref: 'Department'
  }
}, {
  timestamps: true
});

// Virtual for employee count
departmentSchema.virtual('employeeCount', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'employment.department',
  count: true
});

// Ensure virtuals are serialized
departmentSchema.set('toJSON', { virtuals: true });
departmentSchema.set('toObject', { virtuals: true });

export default mongoose.model('Department', departmentSchema);
