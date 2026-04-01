import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const AddMemberModal = ({ isOpen, onClose, onSendInvitation, maxMembers, currentMemberCount }) => {
  const [newMember, setNewMember] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!newMember.name.trim()) newErrors.name = "Full name is required";
    if (!newMember.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(newMember.email)) newErrors.email = "Email is invalid";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentMemberCount >= maxMembers) {
      toast.error(`Maximum ${maxMembers} members reached`);
      return;
    }
    if (validateForm()) {
      onSendInvitation(newMember);
      setNewMember({ name: '', email: '' });
      onClose();
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
          <h2 className="text-2xl font-bold text-[#1e3a5f] text-left">Add a member</h2>
          <p className="text-sm text-gray-500 text-left mt-1">
            An invitation will be sent to the member. They must accept to join the team. The team can have up to {maxMembers} members.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4">
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-[#1e3a5f]">Member information</h3>
          </div>

          <div className="mb-4">
            <label className="block text-sm text-[#1e3a5f] mb-1">
              Full name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={newMember.name}
              onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-sm bg-[#D9D9D9] ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>
          
          <div className="mb-6">
            <label className="block text-sm text-[#1e3a5f] mb-1">
              E-mail <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={newMember.email}
              onChange={(e) => setNewMember({...newMember, email: e.target.value})}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-sm bg-[#D9D9D9] ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
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
              className="px-8 py-2 bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-colors text-sm font-medium"
            >
              Send Invitation
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMemberModal;