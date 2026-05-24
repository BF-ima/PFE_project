import React, { useState } from 'react';
import { X } from 'lucide-react';

// ─── Reusable field helpers (defined OUTSIDE the modal to avoid remount) ──────

const inputClass =
  'flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500';
const labelClass = 'w-36 text-sm font-medium text-gray-700 text-right shrink-0';

const InputField = ({ label, value, onChange, type = 'text', required = true }) => (
  <div className="flex items-center gap-4 mb-3">
    <label className={labelClass}>
      {label} :{required && <span className="text-red-500"> *</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className={inputClass}
    />
  </div>
);

const SelectField = ({ label, value, onChange, options, required = true }) => (
  <div className="flex items-center gap-4 mb-3">
    <label className={labelClass}>
      {label} :{required && <span className="text-red-500"> *</span>}
    </label>
    <select
      value={value}
      onChange={onChange}
      required={required}
      className={inputClass}
    >
      <option value="">Sélectionner...</option>
      {options.map((opt) => (
        <option key={opt.value ?? opt} value={opt.value ?? opt}>
          {opt.label ?? opt}
        </option>
      ))}
    </select>
  </div>
);

// ─── Constants ────────────────────────────────────────────────────────────────

const ADMIN_PERMISSIONS = [
  { value: 'can_create_admin',      label: 'Gestion des Projets PFE' },
  { value: 'can_create_enseignant', label: 'Gestion des Attributions' },
  { value: 'can_create_etudiant',   label: 'Gestion des Soutenances' },
  { value: 'can_create_entreprise', label: 'Gestion des Notes et Résultats' },
  { value: 'config_systeme',        label: 'Configuration Système et Communication' },
];

const ROLE_MAP = {
  admin:              'admin',
  teacher:            'enseignant',
  externalSupervisor: 'entreprise',
  student:            'etudiant',
};

const TITLE_MAP = {
  admin:              'Admin',
  teacher:            'Internal Supervisor',
  externalSupervisor: 'External Supervisor',
  student:            'Student',
};

const EMPTY_FORM = {
  firstName:       '',
  lastName:        '',
  phoneNumber:     '',
  email:           '',
  password:        '',
  confirmPassword: '',
  department:      '',
  // admin
  permission:      '',
  // teacher
  specialization:  '',
  // external supervisor
  companyName:     '',
  contactPerson:   '',
  // student
  specialityId:    '',
  promoId:         '',
  annualAverage:   '',
};

// ─── Modal ────────────────────────────────────────────────────────────────────

const AddUserModal = ({ isOpen, onClose, userType, onAdd, specialities = [], promos = [], ranks = [] }) => {
  const [err, setErr]           = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);

  if (!isOpen) return null;

  const set = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr(null);

    if (formData.password !== formData.confirmPassword) {
      setErr('Les mots de passe ne correspondent pas');
      return;
    }

    const payload = {
      first_name: formData.firstName,
      last_name:  formData.lastName,
      full_name:  `${formData.firstName} ${formData.lastName}`.trim(),
      email:      formData.email,
      password:   formData.password,
      phone:      formData.phoneNumber || null,
      role:       ROLE_MAP[userType],
    };

    if (userType === 'admin') {
      payload.permissions = { [formData.permission]: true };
    }

    if (userType === 'teacher') {
  payload.specialization = formData.specialization;
  payload.rank = formData.rank;  
}

    if (userType === 'externalSupervisor') {
      payload.company_name   = formData.companyName;
      payload.contact_person = formData.contactPerson;
      payload.department = formData.department;
    }

    if (userType === 'student') {
      payload.moyenne       = formData.annualAverage ? parseFloat(formData.annualAverage) : null;
      payload.speciality_id = formData.specialityId  ? parseInt(formData.specialityId)    : null;
      payload.promo_id      = formData.promoId        ? parseInt(formData.promoId)         : null;
    }

    onAdd(payload);
    onClose();
    setFormData(EMPTY_FORM);
  };

  // Build dropdown options from fetched data
  const specialityOptions = specialities.map((s) => ({
    value: s.id,
    label: s.name ?? s.label ?? `Speciality ${s.id}`,
  }));

  const promoOptions = promos.map((p) => ({
    value: p.id,
    label: p.name ?? p.label ?? p.year ?? `Promo ${p.id}`,
  }));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-semibold">Add a new {TITLE_MAP[userType]}</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Personal Information */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-300 pb-2">
                Personal information
              </h3>

              

              <InputField label="First name"   value={formData.firstName}   onChange={set('firstName')} />
              <InputField label="Last name"    value={formData.lastName}    onChange={set('lastName')} />
              <InputField label="Phone number"  value={formData.phoneNumber}  onChange={set('phoneNumber')}  required={userType === 'externalSupervisor'}
              />


              {/* Admin */}
              {userType === 'admin' && (
                <SelectField
                  label="Permission"
                  value={formData.permission}
                  onChange={set('permission')}
                  options={ADMIN_PERMISSIONS}
                />
              )}

              {/* Teacher */}
{userType === 'teacher' && (
  <>
    <InputField
      label="Specialization"
      value={formData.specialization}
      onChange={set('specialization')}
    />
  <SelectField
      label="Rank"
      value={formData.rank}
      onChange={set('rank')}
      options={[
        { value: 'Professeur', label: 'Professeur' },
        { value: 'Maître_de_conférences_A', label: 'Maître_de_conférences_A' },
        { value: 'Maître_de_conférences_B', label: 'Maître_de_conférences_B' },
        { value: 'Maître_Assistant_A', label: 'Maître_Assistant_A' },
        { value: 'Maître_Assistant_B', label: 'Maître_Assistant_B' },
      ]}
    />
  </>
)}

              {/* External Supervisor */}
              {userType === 'externalSupervisor' && (
                <>
                  <InputField label="Company name"  value={formData.companyName}   onChange={set('companyName')} />
                  <InputField label="Contact person" value={formData.contactPerson} onChange={set('contactPerson')} />
                  <InputField label="department"  value={formData.department}  onChange={set('department')} />
                </>
              )}

              {/* Student — dropdowns fed from API */}
              {userType === 'student' && (
                <>
                  <SelectField
                    label="Speciality"
                    value={formData.specialityId}
                    onChange={set('specialityId')}
                    options={specialityOptions}
                  />
                  <SelectField
                    label="Promo"
                    value={formData.promoId}
                    onChange={set('promoId')}
                    options={promoOptions}
                  />
                  <InputField
                    label="Annual average"
                    value={formData.annualAverage}
                    onChange={set('annualAverage')}
                    type="number"
                    required={false}
                  />
                </>
              )}
            </div>

            {/* Account Information */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-300 pb-2">
                Account information
              </h3>
              {err && <p className="text-red-500 text-sm mb-3">{err}</p>}
              <InputField label="E-mail"          value={formData.email}           onChange={set('email')}           type="email" />
              <InputField label="Password"         value={formData.password}         onChange={set('password')}         type="password" />
              <InputField label="Confirm password" value={formData.confirmPassword}  onChange={set('confirmPassword')}  type="password" />
            </div>
          </div>

          <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="px-6 py-2 bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-md hover:from-[#152a4d] hover:to-[#2575a0] transition-colors">
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;