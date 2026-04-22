import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar.jsx";
import { ProfileDropdown } from "../supervisor/HomePage";
import useCurrentUser from "../../hooks/useCurrentUser";
import {
  Search, MoreVertical, Users, Eye, Edit2, Trash2,
  X, ChevronDown, CheckCircle, Clock, UserPlus, UserMinus,
  AlertTriangle, Loader2
} from "lucide-react";

const API = "http://localhost:3000/api";

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

// ─── Status Badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    FORMING:   { bg: "#E8F4FD", color: "#2D8FBF", label: "Forming" },
    VALIDATED: { bg: "#E8F8EE", color: "#4CAF50", label: "Validated" },
    COMPLETED: { bg: "#F0F0F0", color: "#6B7280", label: "Completed" },
  };
  const s = map[status] || { bg: "#F0F0F0", color: "#6B7280", label: status };
  return (
    <span className="px-2 py-0.5 rounded-full text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
};

// ─── Team Details Modal ───────────────────────────────────────────────────────
const TeamDetailsModal = ({ teamId, onClose, currentUserId }) => {
  const [team,    setTeam]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [acting,  setActing]  = useState(null); // memberId being acted on

  const fetchTeam = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/teams/${teamId}`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Error"); return; }
      setTeam(data.team);
    } catch { setError("Server error"); }
    finally  { setLoading(false); }
  }, [teamId]);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const handleAccept = async (memberId) => {
    setActing(memberId);
    try {
      const res  = await fetch(`${API}/teams/${teamId}/members/${memberId}/accept`, {
        method: "PUT", headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      fetchTeam();
    } catch { alert("Server error"); }
    finally  { setActing(null); }
  };

  const handleRemove = async (memberId) => {
    if (!window.confirm("Remove this member?")) return;
    setActing(memberId);
    try {
      const res  = await fetch(`${API}/teams/${teamId}/members/${memberId}`, {
        method: "DELETE", headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      fetchTeam();
    } catch { alert("Server error"); }
    finally  { setActing(null); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-gray-100">
          <div>
            <h3 className="text-xl font-bold text-[#1e3a5f]">Team Details</h3>
            {team && <p className="text-sm text-gray-400 mt-0.5">ID: {team.id}</p>}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-auto px-6 py-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={28} className="animate-spin text-[#2D8FBF]" />
            </div>
          ) : error ? (
            <p className="text-red-500 text-sm text-center py-8">{error}</p>
          ) : team ? (
            <div className="space-y-5">

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Leader",       value: team.leader_name },
                  { label: "Leader Email", value: team.leader_email },
                  { label: "Status",       value: <StatusBadge status={team.status} /> },
                  { label: "Project",      value: team.project_title || "Not assigned" },
                  { label: "Created",      value: team.created_at ? new Date(team.created_at).toLocaleDateString("en-GB") : "—" },
                  { label: "Max Teams", value: team.project_max_students ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 mb-1">{label}</p>
                    <p className="text-sm font-medium text-gray-800">{value}</p>
                  </div>
                ))}
              </div>

              {/* Members */}
              <div>
                <h4 className="text-sm font-semibold text-[#1e3a5f] mb-3">
                  Members ({team.members?.length || 0})
                </h4>
                {team.members?.length === 0 ? (
                  <p className="text-gray-400 text-sm">No members yet.</p>
                ) : (
                  <div className="space-y-2">
                    {team.members.map((m) => (
                      <div key={m.id}
                        className="flex items-center justify-between px-4 py-3 rounded-xl border border-gray-100 hover:bg-gray-50">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{m.student_name}</p>
                          <p className="text-xs text-gray-400">{m.student_email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            m.status === "ACCEPTED"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}>
                            {m.status}
                          </span>
                          {/* Leader sees action buttons */}
                          {currentUserId === team.leader_id && m.student_id !== team.leader_id && (
                            <div className="flex gap-1">
                              {m.status === "PENDING" && (
                                <button onClick={() => handleAccept(m.id)}
                                  disabled={acting === m.id}
                                  className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"
                                  title="Accept">
                                  {acting === m.id
                                    ? <Loader2 size={14} className="animate-spin" />
                                    : <CheckCircle size={14} />}
                                </button>
                              )}
                              <button onClick={() => handleRemove(m.id)}
                                disabled={acting === m.id}
                                className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                                title="Remove">
                                <UserMinus size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Edit Status Modal ────────────────────────────────────────────────────────
const EditStatusModal = ({ team, onClose, onUpdated }) => {
  const [status,  setStatus]  = useState(team.status);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/teams/${team.id}/status`, {
        method:  "PUT",
        headers: authHeaders(),
        body:    JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      onUpdated();
      onClose();
    } catch { alert("Server error"); }
    finally  { setLoading(false); }
  };

  const statuses = ["FORMING", "VALIDATED", "COMPLETED"];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 flex items-start justify-between border-b border-gray-100">
          <h3 className="text-xl font-bold text-[#1e3a5f]">Edit Team Status</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <p className="text-sm text-gray-500">Team: <span className="font-semibold text-gray-800">{team.id}</span></p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] appearance-none pr-8">
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}
            className="px-5 py-2 text-white rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2"
            style={{ backgroundColor: "#1e3a5f" }}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────
const DeleteConfirmModal = ({ team, onClose, onDeleted }) => {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${API}/teams/${team.id}`, {
        method: "DELETE", headers: authHeaders(),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      onDeleted();
      onClose();
    } catch { alert("Server error"); }
    finally  { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-full bg-red-100 flex items-center justify-center">
              <AlertTriangle size={22} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-[#1e3a5f]">Delete Team</h3>
          </div>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete team{" "}
            <span className="font-bold text-gray-900">{team.id}</span>?
            This action cannot be undone.
          </p>
        </div>
        <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">
          <button onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={loading}
            className="px-5 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Action Menu ──────────────────────────────────────────────────────────────
const ActionMenu = ({ onView, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <>
          {/* Click-away overlay */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
            <button onClick={() => { onView();   setIsOpen(false); }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
              <Eye size={16} className="text-gray-500" /> View Details
            </button>
            <button onClick={() => { onEdit();   setIsOpen(false); }}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
              <Edit2 size={16} className="text-gray-500" /> Edit Status
            </button>
            <button onClick={() => { onDelete(); setIsOpen(false); }}
              className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
              <Trash2 size={16} /> Delete Team
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const TeamsList = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const [teams,       setTeams]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [viewTeam,   setViewTeam]   = useState(null); // team object
  const [editTeam,   setEditTeam]   = useState(null);
  const [deleteTeam, setDeleteTeam] = useState(null);

  // ── Fetch teams ──────────────────────────────────────────────────────────
  const fetchTeams = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res  = await fetch(`${API}/teams`, { headers: authHeaders() });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Error fetching teams"); return; }
      setTeams(data.teams || []);
    } catch {
      setError("Server error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  // ── Auth ─────────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  // ── Filter ───────────────────────────────────────────────────────────────
  const filteredTeams = teams.filter((team) => {
    const q = searchQuery.toLowerCase();
    return (
      String(team.id).toLowerCase().includes(q)                ||
      (team.leader_name   || "").toLowerCase().includes(q)     ||
      (team.project_title || "").toLowerCase().includes(q)     ||
      (team.status        || "").toLowerCase().includes(q)
    );
  });

  // ── Loading / Error ───────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f5f6f8]">
      <Loader2 size={32} className="animate-spin text-[#2D8FBF]" />
    </div>
  );

  if (error) return (
    <div className="flex h-screen items-center justify-center bg-[#f5f6f8]">
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Manage and track your projects</p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">Teams List</h1>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by ID, leader, project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-2 w-80 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
              />
            </div>

            <div className="ml-4">
              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={() => {}}
              />
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    {["Team ID", "Leader", "Members", "Status", "Project", "Created", "Actions"].map((h) => (
                      <th key={h}
                        className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTeams.map((team) => (
                    <tr key={team.id} className="hover:bg-gray-50 transition-colors">

                      {/* Team ID */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-[#1e3a5f]">#{team.id}</span>
                      </td>

                      {/* Leader */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{team.leader_name || "—"}</p>
                        <p className="text-xs text-gray-400">{team.leader_email || ""}</p>
                      </td>

                      {/* Members */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users size={15} className="text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {team.member_count ?? "—"} member{team.member_count !== 1 ? "s" : ""}
                            {team.project_max_students
                              ? ` / ${team.project_max_students}`
                              : ""}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <StatusBadge status={team.status} />
                      </td>

                      {/* Project */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {team.project_title || (
                            <span className="italic text-gray-400">Not assigned</span>
                          )}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {team.created_at
                            ? new Date(team.created_at).toLocaleDateString("en-GB")
                            : "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-center">
                        <ActionMenu
                          team={team}
                          onView={()   => setViewTeam(team)}
                          onEdit={()   => setEditTeam(team)}
                          onDelete={()  => setDeleteTeam(team)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredTeams.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No teams found</p>
                <p className="text-sm mt-2">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      {viewTeam && (
        <TeamDetailsModal
          teamId={viewTeam.id}
          currentUserId={currentUser?.id}
          onClose={() => setViewTeam(null)}
        />
      )}

      {editTeam && (
        <EditStatusModal
          team={editTeam}
          onClose={() => setEditTeam(null)}
          onUpdated={fetchTeams}
        />
      )}

      {deleteTeam && (
        <DeleteConfirmModal
          team={deleteTeam}
          onClose={() => setDeleteTeam(null)}
          onDeleted={fetchTeams}
        />
      )}
    </div>
  );
};

export default TeamsList;