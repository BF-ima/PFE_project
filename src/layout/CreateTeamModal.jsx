import React, { useState } from 'react';
import { X } from 'lucide-react';

const CreateTeamModal = ({ isOpen, onClose, onCreateTeam, currentUser }) => {
  const [formData, setFormData] = useState({
    fullName: currentUser?.firstName || "",
    email: currentUser?.email || "",
    studentId: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    if (!formData.studentId.trim()) newErrors.studentId = "Student ID is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onCreateTeam(formData);
      onClose();
      setFormData({ fullName: "", email: "", studentId: "" });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-50 rounded-2xl w-full max-w-md overflow-hidden shadow-xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <X size={20} />
        </button>
        
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-2xl font-bold text-[#1e3a5f] text-center">Create your team</h2>
          <p className="text-sm text-gray-500 text-center mt-1">
            Start by entering your information. You will automatically be designated as the team leader.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#1e3a5f]">Your information</h3>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-[#1e3a5f] mb-1">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-sm bg-[#D9D9D9] ${errors.fullName ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm text-[#1e3a5f] mb-1">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-sm bg-[#D9D9D9] ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm text-[#1e3a5f] mb-1">
              Student ID <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="studentId"
              value={formData.studentId}
              onChange={handleChange}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-sm bg-[#D9D9D9] ${errors.studentId ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.studentId && <p className="text-xs text-red-500 mt-1">{errors.studentId}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-colors text-sm font-medium"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;