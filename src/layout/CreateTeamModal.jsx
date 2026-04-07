import React, { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateTeamModal = ({ isOpen, onClose, onCreateTeam  }) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Step 1: POST /api/teams
      const createRes = await fetch("http://localhost:3000/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const createData = await createRes.json();
      if (!createRes.ok) throw new Error(createData.message || "Erreur lors de la création");

      // Step 2: GET /api/teams/:id
      const teamRes = await fetch(`http://localhost:3000/api/teams/${createData.teamId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const teamData = await teamRes.json();
      if (!teamRes.ok) throw new Error(teamData.message || "Erreur lors du chargement");

      const backendTeam = teamData.team;

      // Step 3: map and pass to parent
      const mappedTeam = {
        id:         backendTeam.id,
        leaderId:   backendTeam.leader_id,
        leaderName: backendTeam.leader_name,
        projectId:  backendTeam.project_id,
        status:     backendTeam.status,
        createdAt:  backendTeam.created_at
          ? new Date(backendTeam.created_at).toLocaleDateString("fr-FR")
          : null,
        maxMembers: backendTeam.project_max_students || 2,
        members: (backendTeam.members || []).map((m) => ({
          id:        m.id,
          studentId: m.student_id,
          name:      m.student_name,
          email:     m.student_email,
          status:    m.status,
          isLeader:  m.student_id === backendTeam.leader_id,
        })),
      };

      onCreateTeam(mappedTeam);
      onClose();

    } catch (err) {
      toast.error(err.message || "Error creating team");
    } finally {
      setLoading(false);
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
            You will automatically be designated as the team leader.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4">
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-colors text-sm font-medium disabled:opacity-70"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeamModal;