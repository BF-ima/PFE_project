import React, { useState } from "react";
import { X, Plus, Trash2 } from "lucide-react";

const AddJuryMemberModal = ({ isOpen, onClose, onConfirm, teamId }) => {
  // For PRESIDENT / EXAMINER: email input
  const [email, setEmail]           = useState("");
  const [selectedRole, setSelectedRole] = useState("Examiner");

  // For INVITEUR: list of { name, email }
  const [inviteurs, setInviteurs]   = useState([{ name: "", email: "" }]);

  // Which tab is active
  const [tab, setTab] = useState("jury"); // "jury" | "inviteur"

  const handleSubmitJury = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    onConfirm({ teamId, email: email.trim(), role: selectedRole, type: "jury" });
    setEmail("");
    setSelectedRole("Examiner");
  };

  const handleSubmitInviteurs = (e) => {
    e.preventDefault();
    const valid = inviteurs.filter(i => i.name.trim() && i.email.trim());
    if (!valid.length) return;
    valid.forEach(inv =>
      onConfirm({ teamId, email: inv.email.trim(), inviteur_name: inv.name.trim(), role: "Inviteur", type: "inviteur" })
    );
    setInviteurs([{ name: "", email: "" }]);
    onClose();
  };

  const updateInviteur = (index, field, value) => {
    setInviteurs(prev => prev.map((inv, i) => i === index ? { ...inv, [field]: value } : inv));
  };

  const addInviteurRow    = () => setInviteurs(prev => [...prev, { name: "", email: "" }]);
  const removeInviteurRow = (index) => setInviteurs(prev => prev.filter((_, i) => i !== index));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#193962]">Add Jury Member</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setTab("jury")}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${tab === "jury" ? "text-[#193962] border-b-2 border-[#193962]" : "text-gray-400 hover:text-gray-600"}`}
          >
            President / Examiner
          </button>
          <button
            onClick={() => setTab("inviteur")}
            className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${tab === "inviteur" ? "text-[#193962] border-b-2 border-[#193962]" : "text-gray-400 hover:text-gray-600"}`}
          >
            Inviteurs
          </button>
        </div>

        {tab === "jury" ? (
          <form onSubmit={handleSubmitJury} className="p-6 space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Teacher Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="teacher@esi-sba.dz"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#193962] focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-400 mt-1">Must match an existing teacher account.</p>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedRole}
                onChange={e => setSelectedRole(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#193962] focus:border-transparent transition-all bg-white"
              >
                <option value="President">President</option>
                <option value="Examiner">Examiner</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">
                President grade must be ≥ Examiner grade.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#193962] to-[#2D8FBF] hover:from-[#152f4d] hover:to-[#2575a0] text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg">
                Add
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSubmitInviteurs} className="p-6 space-y-4">
            <p className="text-xs text-gray-500">
              Inviteurs are optional. They receive the soutenance email but are not required to be in the system.
            </p>

            {inviteurs.map((inv, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input
                    type="text"
                    value={inv.name}
                    onChange={e => updateInviteur(index, "name", e.target.value)}
                    placeholder="Full name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#193962]"
                  />
                  <input
                    type="email"
                    value={inv.email}
                    onChange={e => updateInviteur(index, "email", e.target.value)}
                    placeholder="email@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#193962]"
                  />
                </div>
                {inviteurs.length > 1 && (
                  <button type="button" onClick={() => removeInviteurRow(index)}
                    className="mt-1 p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}

            <button type="button" onClick={addInviteurRow}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-300 rounded-lg text-sm text-gray-500 hover:border-[#193962] hover:text-[#193962] transition-colors">
              <Plus size={16} /> Add another inviteur
            </button>

            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all">
                Cancel
              </button>
              <button type="submit"
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#193962] to-[#2D8FBF] hover:from-[#152f4d] hover:to-[#2575a0] text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg">
                Save Inviteurs
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddJuryMemberModal;