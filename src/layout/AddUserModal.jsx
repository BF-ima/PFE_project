import React, { useState } from "react";
import { X } from "lucide-react";

// ✅ Props: s = liste depuis Academic Entities
const AddUserModal = ({
  isOpen,
  onClose,
  userType,
  onAdd,
  specializations = [],
}) => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phoneNumber: "",
    email: "",
    username: "",
    password: "",
    confirmPassword: "",
    // Champs spécifiques
    permission: "", // Admin
    specialization: "", // ✅ Teacher / External Supervisor
    major: "", // ✅ Student
    annualAverage: "", // Student
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validation des mots de passe
    if (formData.password !== formData.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }

    // ✅ Validation email : @esi-sba.dz requis SAUF pour superviseur externe
    const isExternalSupervisor = userType === "externalSupervisor";
    if (!isExternalSupervisor && !formData.email.endsWith("@esi-sba.dz")) {
      alert("L'email doit se terminer par @esi-sba.dz");
      return;
    }

    // Créer le nom complet
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    if (!fullName || !formData.email || !formData.username) {
      alert("Erreur: Données utilisateur invalides");
      return;
    }

    // ✅ Créer l'objet utilisateur avec champs distincts
    const newUser = {
      id: Date.now(),
      name: fullName,
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      username: formData.username,
      password: formData.password,
      status: "Active",
      lastActive: new Date().toISOString().split("T")[0],

      // Champs spécifiques selon le type
      ...(userType === "admin" && {
        role: formData.permission,
        phoneNumber: formData.phoneNumber,
      }),

      // ✅ Teacher/External Supervisor → specialization
      ...(userType === "teacher" && {
        specialization: formData.specialization,
        phoneNumber: formData.phoneNumber,
      }),

      ...(userType === "externalSupervisor" && {
        phoneNumber: formData.phoneNumber,
      }),

      // ✅ Student → major
      ...(userType === "student" && {
        major: formData.major,
        annualAverage: formData.annualAverage,
      }),
    };

    onAdd(newUser);
    onClose();

    // Reset du formulaire
    setFormData({
      firstName: "",
      lastName: "",
      phoneNumber: "",
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
      permission: "",
      specialization: "",
      major: "",
      annualAverage: "",
    });
  };

  if (!isOpen) return null;

  const getInputField = (
    label,
    value,
    onChange,
    type = "text",
    required = true,
    placeholder = "",
  ) => (
    <div className="flex items-center gap-4 mb-3">
      <label className="w-32 text-sm font-medium text-gray-700 text-right">
        {label} : {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  const getSelectField = (label, value, onChange, options, required = true) => (
    <div className="flex items-start gap-4 mb-3">
      <label className="w-32 text-sm font-medium text-gray-700 text-right pt-2">
        {label} : {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex-1 relative">
        <select
          value={value}
          onChange={onChange}
          required={required}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent bg-white text-gray-700 appearance-none cursor-pointer"
        >
          <option value="" disabled hidden>
            Sélectionner...
          </option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
        {/* Flèche personnalisée */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </div>
      </div>
    </div>
  );

  // ✅ Liste des noms de spécialités (sans formatage)
  const specializationNames =
    specializations.length > 0
      ? specializations.map((spec) => spec.name)
      : [
          "Génie Logiciel",
          "Systèmes d'Information",
          "Réseaux & Sécurité",
          "Internet des Objets",
        ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-semibold">
            Add a new{" "}
            {userType === "admin"
              ? "Admin"
              : userType === "teacher"
                ? "Teacher"
                : userType === "externalSupervisor"
                  ? "External Supervisor"
                  : "Student"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
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

              {getInputField("First name", formData.firstName, (e) =>
                setFormData({ ...formData, firstName: e.target.value }),
              )}
              {getInputField("Last name", formData.lastName, (e) =>
                setFormData({ ...formData, lastName: e.target.value }),
              )}

              {/* ✅ Admin - Permissions */}
              {userType === "admin" && (
                <>
                  {getSelectField(
                    "Permission given",
                    formData.permission,
                    (e) =>
                      setFormData({ ...formData, permission: e.target.value }),
                    [
                      "Gestion Des Comptes Supervisor Et Student",
                      "Gestion des Projets PFE",
                      "Gestion des Attributions",
                      "Gestion des Soutenances",
                      "Gestion des Notes et Résultats",
                      "Configuration Système et Communication",
                    ],
                  )}
                  {getInputField("Phone number", formData.phoneNumber, (e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value }),
                  )}
                </>
              )}

              {/* ✅ Teacher - Specialization (terme original) */}
              {userType === "teacher" && (
                <>
                  {getSelectField(
                    "Specialization *",
                    formData.specialization,
                    (e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                      }),
                    specializationNames,
                  )}
                  {getInputField("Phone number", formData.phoneNumber, (e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value }),
                  )}
                </>
              )}

              {/* ✅ External Supervisor - Specialization */}
              {userType === "externalSupervisor" && (
                <>
                  {getInputField("Phone number", formData.phoneNumber, (e) =>
                    setFormData({ ...formData, phoneNumber: e.target.value }),
                  )}
                </>
              )}

              {/* ✅ Student - Major (terme original) */}
              {userType === "student" && (
                <>
                  {getSelectField(
                    "Major *",
                    formData.major,
                    (e) => setFormData({ ...formData, major: e.target.value }),
                    specializationNames,
                  )}
                  {getInputField(
                    "Annual average",
                    formData.annualAverage,
                    (e) =>
                      setFormData({
                        ...formData,
                        annualAverage: e.target.value,
                      }),
                    "number",
                  )}
                </>
              )}
            </div>

            {/* Account Information */}
            <div className="bg-gray-50 p-5 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 border-b border-gray-300 pb-2">
                Account information
              </h3>

              {getInputField(
                "E-mail",
                formData.email,
                (e) => setFormData({ ...formData, email: e.target.value }),
                "email",
                true,
              )}
              {getInputField("Username", formData.username, (e) =>
                setFormData({ ...formData, username: e.target.value }),
              )}
              {getInputField(
                "Password",
                formData.password,
                (e) => setFormData({ ...formData, password: e.target.value }),
                "password",
              )}
              {getInputField(
                "Confirm password",
                formData.confirmPassword,
                (e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value }),
                "password",
              )}
            </div>
          </div>

          {/* Info email pour superviseur */}
          {userType === "teacher" && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              Les superviseurs <strong>Internes</strong> doivent utiliser un
              email <strong>@esi-sba.dz</strong>.
            </div>
          )}

          {/* Buttons */}
          <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-md hover:from-blue-700 hover:to-blue-500 transition-colors"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUserModal;
