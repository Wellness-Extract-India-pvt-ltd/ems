import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const GENDERS = ["Male", "Female", "Other"];
const MARITAL_STATUSES = ["Single", "Married", "Divorced", "Widowed"];
const EMPLOYMENT_TYPES = ["Full-time", "Intern", "Contractor"];
const STATUSES = ["Active", "Inactive", "Onboarding", "Suspended", "Terminated"];

// EDUCATION
const educationSchema = new Schema({
  qualification:     { type: String, required: true },
  field:             { type: String, required: true },
  institution:       { type: String, required: true },
  yearOfCompletion:  {
    type: Number,
    required: true,
    min: 1950,
    max: new Date().getFullYear()
  },
  grade:             { type: String },
  certificatePath:   { type: String },
}, { _id: false });

// ORGANISATION
const organisationSchema = new Schema({
  companyName:           { type: String },
  position:              { type: String },
  experienceYears:       { type: Number },
  startDate:             { type: Date },
  endDate:               { type: Date },
  responsibilities:      { type: String },
  experienceLetterPath:  { type: String },
}, { _id: false });

// BANK
const bankSchema = new Schema({
  bankName:      { type: String, required: true },
  accountNumber: { type: String, required: true, trim: true },
  ifsc:          { type: String, required: true, uppercase: true, trim: true },
  passbookPath:  { type: String, required: true }
}, { _id: false });

// PERSONAL
const personalSchema = new Schema({
  firstName:     { type: String, required: true },
  middleName:    { type: String },
  lastName:      { type: String, required: true },
  dob: {
      type: Date,
      required: true,
      validate: {
        validator: (dob) => dob <= new Date(),
        message: "DOB cannot be in the future",
      },
    },
  gender:        { type: String, enum: GENDERS, required: true },
  maritalStatus: { type: String, enum: MARITAL_STATUSES },
  photoPath:     { type: String },
  resumePath:    { type: String },
  idProofPath:   { type: String }
}, { _id: false });

// CONTACT
const contactSchema = new Schema({
  email: {
      type: String,
      required: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
  phone: {
      type: String,
      required: true,
      match: /^[0-9]{10,15}$/,
      set: v => v.trim()
    },
  emergencyContact: {
    type: String,
    match: /^[0-9]{10,15}$/,
    set: v => v.trim()
  },
  address: { type: String }
}, { _id: false });

// EMPLOYMENT
const employmentSchema = new Schema({
  employeeId:     { type: String, required: true, unique: true, trim: true },
  joinDate:       { type: Date, required: true },
  employmentType: {
      type: String,
      enum: EMPLOYMENT_TYPES,
      required: true,
    },
  department:     { type: Types.ObjectId, ref: 'Department', required: true },
  position:       { type: String, required: true },
  status:         { type: String, enum: STATUSES, default: "Active" },
  manager:        { type: Types.ObjectId, ref: 'Employee'},
  workLocation:   { type: String },
  workSchedule:   { type: String }
}, { _id: false });

// EMPLOYEE
const employeeSchema = new Schema({
  avatarPath: { type: String },
  personal:     personalSchema,
  contact:      contactSchema,
  educations:   [educationSchema],
  organisations:[organisationSchema],
  bank:         bankSchema,
  employment:   employmentSchema,
  msGraphUserId: { type: String, index: true },
  
  contactEmail: { type: String, required: true, lowercase: true, unique: true },
  
}, { timestamps: true });

employeeSchema.virtual('fullName').get(function () {
  return `${this.personal.firstName} ${this.personal.middleName || ''} ${this.personal.lastName}`.trim();
});

export default mongoose.model('Employee', employeeSchema);