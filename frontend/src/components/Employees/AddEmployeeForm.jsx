import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import {
  Plus, Trash, User, Mail, GraduationCap, RotateCcw,
  Banknote, Briefcase, LoaderCircle,
} from 'lucide-react';

import { createEmployee } from '../../store/slices/employeeSlice';

const AddEmployeeForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { status, error } = useSelector((s) => s.employees);
  const { token } = useSelector((s) => s.auth || {});

  /* ---------- local state ---------- */
  const [avatarFile, setAvatarFile] = useState(null);
  const [personal, setPersonal] = useState({ firstName: '', middleName: '', lastName: '', dob: '', gender: '', maritalStatus: '' });
  const [contact, setContact] = useState({ email: '', phone: '', emergencyContact: '', address: '' });
  const [educations, setEducations] = useState([{ qualification: '', field: '', institution: '', yearOfCompletion: '', grade: '', certificateFile: null }]);
  const [organisations, setOrganisations] = useState([{ companyName: '', position: '', experienceYears: '', startDate: '', endDate: '', responsibilities: '', experienceLetter: null }]);
  const [bank, setBank] = useState({ bankName: '', accountNumber: '', ifsc: '', passbookFile: null });
  const [employment, setEmployment] = useState({ employeeId: '', joinDate: '', employmentType: '', department: '', position: '', status: 'Active', manager: '', workLocation: '', workSchedule: '' });

  /* ---------- helpers ---------- */
  const handleState = (setter) => (e) => {
    const { name, value } = e.target;
    setter((prev) => ({ ...prev, [name]: value }));
  };
  const handleFile = (setter, field) => (e) => {
    const file = e.target.files?.[0] ?? null;
    setter((prev) => ({ ...prev, [field]: file }));
  };

  // === EDUCATION HELPERS ===
  const handleAddEducation = () =>
    setEducations((prev) => [...prev, { qualification: '', field: '', institution: '', yearOfCompletion: '', grade: '', certificateFile: null }]);

  const handleRemoveEducation = (index) =>
    setEducations((prev) => prev.filter((_, i) => i !== index));

  const handleEducationChange = (index, e) => {
    const { name, value } = e.target;
    setEducations((prev) => {
      const copy = [...prev];
      copy[index][name] = value;
      return copy;
    });
  };

  const handleEducationFile = (index, e) => {
    const file = e.target.files?.[0];
    setEducations((prev) => {
      const copy = [...prev];
      copy[index].certificateFile = file;
      return copy;
    });
  };

  // === ORGANIZATION HELPERS ===
  const handleAddOrganisation = () =>
    setOrganisations((prev) => [...prev, { companyName: '', position: '', experienceYears: '', startDate: '', endDate: '', responsibilities: '', experienceLetter: null }]);

  const handleRemoveOrganisation = (index) =>
    setOrganisations((prev) => prev.filter((_, i) => i !== index));

  const handleOrgChange = (index, e) => {
    const { name, value } = e.target;
    setOrganisations((prev) => {
      const copy = [...prev];
      copy[index][name] = value;
      return copy;
    });
  };

  const handleOrgFile = (index, e) => {
    const file = e.target.files?.[0];
    setOrganisations((prev) => {
      const copy = [...prev];
      copy[index].experienceLetter = file;
      return copy;
    });
  };
  /* ---------- validation ---------- */
  const validate = () => {
    const errs = [];
    if (!personal.firstName.trim()) errs.push('First name is required');
    if (!personal.lastName.trim()) errs.push('Last name is required');
    if (!personal.dob) errs.push('Date of birth is required');
    if (!personal.gender) errs.push('Gender is required');
    if (!contact.email.trim()) errs.push('Email is required');
    if (!contact.phone.trim()) errs.push('Phone is required');
    if (!bank.bankName.trim()) errs.push('Bank name is required');
    if (!bank.accountNumber.trim()) errs.push('Account number is required');
    if (!bank.ifsc.trim()) errs.push('IFSC is required');
    if (!bank.passbookFile) errs.push('Passbook file is required');
    if (!employment.employeeId.trim()) errs.push('Employee ID is required');
    if (!employment.joinDate) errs.push('Join date is required');
    if (!employment.employmentType) errs.push('Employment type is required');
    if (!employment.department.trim()) errs.push('Department is required');
    if (!employment.position.trim()) errs.push('Position is required');
    return errs;
  };

  /* ---------- submit ---------- */
    const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (errs.length) {
      errs.forEach((m) => toast.error(m));
      return;
    }

    const eduNoFiles = educations.map(({ certificateFile, ...rest }) => rest);
    const orgNoFiles = organisations.map(({ experienceLetter, ...rest }) => rest);
    const { passbookFile, ...bankNoFile } = bank;

    const payload = {
      personal,
      contact,
      educations: eduNoFiles,
      organisations: orgNoFiles,
      bank: bankNoFile,
      employment,
    };

    const fd = new FormData();
    fd.append('payload', JSON.stringify(payload));
    if (avatarFile) fd.append('avatar', avatarFile);
    if (passbookFile) fd.append('passbook', passbookFile);
    educations.forEach((e, i) => {
      if (e.certificateFile) fd.append(`education_${i}`, e.certificateFile);
    });
    organisations.forEach((o, i) => {
      if (o.experienceLetter) fd.append(`organisation_${i}`, o.experienceLetter);
    });
    
//     console.log('Form Data Payload:');
// for (let [key, value] of fd.entries()) {
//   console.log(`${key}:`, value instanceof File ? value.name : value);
// }

    dispatch(createEmployee(fd))
      .unwrap()
      .then(() => {
        toast.success('Employee created 🎉');
        navigate('/employees');
      })
      .catch((err) => {
        toast.error(err || 'Failed to create employee');
      });
  };

  useEffect(() => {
    if (status === 'loading') toast.loading('Saving employee...', { id: 'saveEmp' });
    else toast.dismiss('saveEmp');
    if (status === 'failed' && error) toast.error(error);
  }, [status, error]);


    return (
  <form
    onSubmit={handleSubmit}
    className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-7xl text-sm"
  >
    {/* = Personal Information = */}
    <SectionHeader Icon={User} text="Personal Information" />

    <div className="flex flex-col items-center gap-2 my-6">
      <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
        {avatarFile ? (
          <img src={URL.createObjectURL(avatarFile)} alt="Avatar preview" className="object-cover w-full h-full" />
        ) : (
          <User className="w-16 h-16 text-gray-400" />
        )}
      </div>
      <label className="text-blue-600 font-medium cursor-pointer">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        Upload Photo
      </label>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input label="First Name*" name="firstName" placeholder="Enter first name" value={personal.firstName} onChange={handleState(setPersonal)} />
      <Input label="Middle Name" name="middleName" placeholder="Enter middle name" value={personal.middleName} onChange={handleState(setPersonal)} />
      <Input label="Last Name*" name="lastName" placeholder="Enter last name" value={personal.lastName} onChange={handleState(setPersonal)} />
      <Input type="date" label="Date of Birth*" name="dob" value={personal.dob} onChange={handleState(setPersonal)} />
      <Select label="Gender*" name="gender" value={personal.gender} onChange={handleState(setPersonal)} options={["Male", "Female", "Other"]} />
      <Select label="Marital Status" name="maritalStatus" value={personal.maritalStatus} onChange={handleState(setPersonal)} options={["Single", "Married", "Divorced", "Widowed"]} />
    </div>

    {/* = Contact Information = */}
    <SectionHeader Icon={Mail} text="Contact Information" className="mt-10" />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input label="Email*" name="email" type="email" placeholder="Enter email" value={contact.email} onChange={handleState(setContact)} />
      <Input label="Phone*" name="phone" placeholder="Enter phone number" value={contact.phone} onChange={handleState(setContact)} />
      <Input label="Emergency Contact" name="emergencyContact" placeholder="Emergency contact number" value={contact.emergencyContact} onChange={handleState(setContact)} />
      <Textarea className="md:col-span-3" label="Address" name="address" placeholder="Enter full address" value={contact.address} onChange={handleState(setContact)} />
    </div>

    {/* = Education Details = */}
    <SectionHeader Icon={GraduationCap} text="Education Details" className="mt-10" />

    {educations.map((edu, index) => (
      <div key={index} className="relative border rounded-xl p-5 mb-6 space-y-4">
        <h4 className="font-medium mb-2">Education #{index + 1}</h4>
        {educations.length > 1 && (
          <button
            type="button"
            onClick={() => handleRemoveEducation(index)}
            className="absolute top-4 right-4 text-red-600 hover:text-red-800"
          >
            <Trash size={18} />
          </button>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select label="Highest Qualification*" name="qualification" value={edu.qualification} onChange={(e) => handleEducationChange(index, e)} options={["High School", "Diploma", "Bachelor's", "Master's", "PhD"]} />
          <Input label="Field of Study*" name="field" value={edu.field} onChange={(e) => handleEducationChange(index, e)} placeholder="Enter field" />
          <Input label="Institution*" name="institution" value={edu.institution} onChange={(e) => handleEducationChange(index, e)} placeholder="Institution name" />
          <Input label="Year of Completion*" name="yearOfCompletion" value={edu.yearOfCompletion} onChange={(e) => handleEducationChange(index, e)} placeholder="e.g., 2020" />
          <Input label="Grade/CGPA" name="grade" value={edu.grade} onChange={(e) => handleEducationChange(index, e)} placeholder="Grade or CGPA" />
        </div>
        <FileDropzone label="Upload Certificate" accept=".pdf,.png,.jpg,.jpeg" file={edu.certificateFile} onFileChange={(e) => handleEducationFile(index, e)} />
      </div>
    ))}
    <AddAnotherButton label="Add Another Education" onClick={handleAddEducation} />

    {/* = Previous Organization = */}
    <SectionHeader Icon={RotateCcw} text="Previous Organization Details" className="mt-10" />

    {organisations.map((org, index) => (
      <div key={index} className="relative border rounded-xl p-5 mb-6 space-y-4">
        <h4 className="font-medium mb-2">Previous Organization #{index + 1}</h4>
        {organisations.length > 1 && (
          <button
            type="button"
            onClick={() => handleRemoveOrganisation(index)}
            className="absolute top-4 right-4 text-red-600 hover:text-red-800"
          >
            <Trash size={18} />
          </button>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input label="Company Name" name="companyName" value={org.companyName} onChange={(e) => handleOrgChange(index, e)} placeholder="Previous company" />
          <Input label="Position" name="position" value={org.position} onChange={(e) => handleOrgChange(index, e)} placeholder="Previous role" />
          <Input label="Experience (Years)" name="experienceYears" value={org.experienceYears} onChange={(e) => handleOrgChange(index, e)} placeholder="e.g., 2.5" />
          <Input type="date" label="Start Date" name="startDate" value={org.startDate} onChange={(e) => handleOrgChange(index, e)} />
          <Input type="date" label="End Date" name="endDate" value={org.endDate} onChange={(e) => handleOrgChange(index, e)} />
          <Textarea label="Responsibilities" name="responsibilities" value={org.responsibilities} onChange={(e) => handleOrgChange(index, e)} placeholder="Key duties and roles" />
        </div>
        <FileDropzone label="Upload Experience Letter" accept=".pdf,.png,.jpg,.jpeg" file={org.experienceLetter} onFileChange={(e) => handleOrgFile(index, e)} />
      </div>
    ))}
    <AddAnotherButton label="Add Another Organization" onClick={handleAddOrganisation} />

    {/* = Bank Details = */}
    <SectionHeader Icon={Banknote} text="Bank Details & Documents" className="mt-10" />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input label="Bank Name*" name="bankName" value={bank.bankName} onChange={handleState(setBank)} placeholder="e.g., HDFC Bank" />
      <Input label="Account Number*" name="accountNumber" value={bank.accountNumber} onChange={handleState(setBank)} placeholder="Enter account number" />
      <Input label="IFSC Code*" name="ifsc" value={bank.ifsc} onChange={handleState(setBank)} placeholder="e.g., HDFC0001234" />
    </div>
    <FileDropzone
      label="Upload Passbook/Cancelled Cheque*"
      accept=".pdf,.png,.jpg,.jpeg"
      file={bank.passbookFile}
      onFileChange={handleFile(setBank, 'passbookFile')}
    />

    {/* = Employment Details = */}
    <SectionHeader Icon={Briefcase} text="Employment Details" className="mt-10" />

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Input label="Employee ID*" name="employeeId" value={employment.employeeId} onChange={handleState(setEmployment)} placeholder="e.g., EMP1001" />
      <Input type="date" label="Join Date*" name="joinDate" value={employment.joinDate} onChange={handleState(setEmployment)} />
      <Select label="Employment Type*" name="employmentType" value={employment.employmentType} onChange={handleState(setEmployment)} options={["Full-time", "Intern", "Contractor"]} />
      <Input label="Department*" name="department" value={employment.department} onChange={handleState(setEmployment)} placeholder="e.g., Engineering" />
      <Input label="Position*" name="position" value={employment.position} onChange={handleState(setEmployment)} placeholder="e.g., Frontend Developer" />
      <Select label="Status*" name="status" value={employment.status} onChange={handleState(setEmployment)} options={["Active", "Inactive"]} />
      <Input label="Manager" name="manager" value={employment.manager} onChange={handleState(setEmployment)} placeholder="Reporting Manager" />
      <Input label="Work Location" name="workLocation" value={employment.workLocation} onChange={handleState(setEmployment)} placeholder="e.g., Mumbai HQ" />
      <Input label="Work Schedule" name="workSchedule" value={employment.workSchedule} onChange={handleState(setEmployment)} placeholder="e.g., 9am - 6pm" />
    </div>

    {/* = Action Buttons = */}
    <div className="flex justify-between items-center mt-12 flex-wrap gap-4">
        <p className="text-gray-500"><span className="font-medium">*</span> Fields marked with * are required</p>
        <div className="flex gap-3 ml-auto">
          <button
            type="button"
            onClick={() => navigate('/employees')}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Save Employee
          </button>
        </div>
      </div>
    </form>
  );
};

const SectionHeader = ({ Icon, text, className = '' }) => (
  <h3 className={`text-lg font-semibold flex items-center gap-2 ${className}`}>
    <Icon size={18} className="text-blue-600" />
    {text}
  </h3>
);

const Input = ({ label, name, value, onChange, placeholder = '', type = 'text', className = '', error }) => (
  <div className={className}>
    <label className="block text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Select = ({ label, name, value, onChange, options = [], className = '', error }) => (
  <div className={className}>
    <label className="block text-gray-700 mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={`w-full px-4 py-2 border rounded-md bg-white focus:outline-none focus:ring-2 ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
    >
      <option value="">Select {label.toLowerCase()}</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const Textarea = ({ label, name, value, onChange, placeholder = '', className = '', error }) => (
  <div className={className}>
    <label className="block text-gray-700 mb-1">{label}</label>
    <textarea
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={3}
      className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 resize-none ${error ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const FileDropzone = ({ label, accept, onFileChange, file, error }) => (
  <div className="mt-4">
    <p className="mb-2 text-gray-700 font-medium">{label}</p>
    <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer ${error ? 'border-red-500 hover:border-red-600' : 'border-gray-300 hover:border-blue-400'}`}>
      <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
        <svg aria-hidden="true" className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v-9A2.25 2.25 0 0 1 5.25 5.25h13.5A2.25 2.25 0 0 1 21 7.5v9a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 16.5Z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h.008v.008H3V12Zm18 0h.008v.008H21V12Zm-9 8.25h.008v.008H12v-.008Z" />
        </svg>
        {file ? (
          <span className="text-gray-600">{file.name}</span>
        ) : (
          <>
            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Upload file</span> or drag and drop</p>
            <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
          </>
        )}
      </div>
      <input type="file" accept={accept} className="hidden" onChange={onFileChange} />
    </label>
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const AddAnotherButton = ({ label, onClick }) => (
  <div className="flex justify-center my-4">
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
    >
      <Plus size={18} /> {label}
    </button>
  </div>
);

export default AddEmployeeForm;
