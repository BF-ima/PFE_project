// src/component/supervisor/TeamsPage.jsx
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileDropdown } from './HomePage';
import SupervisorSidebar from '../../layout/SupervisorSidebar';
import {
  Search, MoreVertical,
  Eye, Loader2, Users, GraduationCap, X,
} from 'lucide-react';
import useCurrentUser from '../../hooks/useCurrentUser';

const API = 'http://localhost:3000/api';
const getToken = () => localStorage.getItem('token') || sessionStorage.getItem('token');

// ── Status badge ──────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    FORMING:   'bg-yellow-100 text-yellow-700 border-yellow-200',
    VALIDATED: 'bg-green-100  text-green-700  border-green-200',
    COMPLETED: 'bg-blue-100   text-blue-700   border-blue-200',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${map[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
      {status}
    </span>
  );
};

// ── Team detail modal ─────────────────────────────────────────────────────────
const TeamDetailModal = ({ team, onClose }) => {
  if (!team) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-lg shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h3 className="text-lg font-semibold">Team #{team.team_id} — Details</h3>
          <button onClick={onClose} className="hover:text-gray-200 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Status</p>
              <StatusBadge status={team.team_status} />
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Members</p>
              <p className="text-sm font-semibold text-[#1e3a5f]">{team.member_count} student(s)</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Speciality</p>
              <p className="text-sm font-semibold text-[#1e3a5f]">{team.speciality_name || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-500 mb-1">Created</p>
              <p className="text-sm font-semibold text-[#1e3a5f]">
                {team.created_at ? new Date(team.created_at).toLocaleDateString('en-GB') : '—'}
              </p>
            </div>
          </div>

          {/* Leader */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap size={16} className="text-blue-600" />
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Team Leader</p>
            </div>
            <p className="text-sm font-semibold text-[#1e3a5f]">{team.leader_name}</p>
            <p className="text-xs text-gray-500">{team.leader_email}</p>
          </div>

          {/* Members */}
          {team.members_names && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-gray-500" />
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">All Members</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {team.members_names.split(', ').map((name, i) => (
                  <span
                    key={i}
                    className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-700"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Project */}
          <div className="bg-green-50 border border-green-100 rounded-lg p-4">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-1">
              Assigned Project
            </p>
            <p className="text-sm font-semibold text-[#1e3a5f]">{team.project_title || '—'}</p>
            {team.max_students && (
              <p className="text-xs text-gray-500 mt-1">Max capacity: {team.max_students} students</p>
            )}
          </div>
        </div>

        <div className="px-6 pb-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────
function TeamsPage() {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const [searchQuery,  setSearchQuery]  = useState('');
  const [openMenuId,   setOpenMenuId]   = useState(null);
  const [teams,        setTeams]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);

  const menuRef   = useRef(null);
  const buttonRef = useRef(null);

  // ── Fetch supervisor teams ────────────────────────────────────────────────
  const loadTeams = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${API}/teams/my-supervisor-teams`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erreur serveur');
      setTeams(data.teams || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadTeams(); }, [loadTeams]);

  // ── Close menu on outside click ───────────────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        openMenuId &&
        menuRef.current   && !menuRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // ── Derived ───────────────────────────────────────────────────────────────
  const filteredTeams = teams.filter((t) =>
    t.leader_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.project_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    String(t.team_id).includes(searchQuery)
  );

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  const toggleMenu = (id, e) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <SupervisorSidebar />

      <div className="flex-1 flex flex-col ml-16 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Manage and track your projects</p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-72 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] bg-gray-50"
                />
              </div>
            
              <ProfileDropdown user={currentUser} onLogout={handleLogout} />
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 px-6 py-4 overflow-auto">
          <div className="flex items-center justify-between mb-4 ml-6">
            <h2 className="text-lg font-semibold text-[#1e3a5f] pb-1 border-b border-[#1e3a5f] inline-block">
              My Teams
            </h2>
            <span className="text-sm text-gray-400">{filteredTeams.length} team(s)</span>
          </div>

          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-16">
              <Loader2 size={28} className="animate-spin text-[#2D8FBF]" />
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="ml-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center justify-between">
              <span>{error}</span>
              <button onClick={loadTeams} className="underline text-red-600 hover:text-red-800">Retry</button>
            </div>
          )}

          {/* Table */}
          {!loading && !error && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible max-w-6xl ml-6">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">#</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Leader</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Members</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Project</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Speciality</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Status</th>
                    <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTeams.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400 text-sm">
                        <Users size={36} className="mx-auto mb-2 text-gray-200" />
                        No teams assigned to your projects yet.
                      </td>
                    </tr>
                  ) : (
                    filteredTeams.map((team) => (
                      <tr key={team.team_id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-xs font-medium text-gray-500">#{team.team_id}</td>
                        <td className="px-4 py-3">
                          <p className="text-xs font-semibold text-gray-800">{team.leader_name}</p>
                          <p className="text-[11px] text-gray-400">{team.leader_email}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1">
                            <Users size={13} className="text-gray-400" />
                            <span className="text-xs text-gray-700">{team.member_count}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 max-w-[180px] truncate">
                          {team.project_title || '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          {team.speciality_name || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={team.team_status} />
                        </td>
                        <td className="px-3 py-3 text-center relative w-10">
                          <button
                            ref={openMenuId === team.team_id ? buttonRef : null}
                            onClick={(e) => toggleMenu(team.team_id, e)}
                            className="p-1 text-[#1e3a5f] hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <MoreVertical size={15} />
                          </button>

                          {openMenuId === team.team_id && (
                            <div
                              ref={menuRef}
                              className="absolute right-0 top-full mt-1 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1"
                            >
                              <button
                                onClick={() => {
                                  setSelectedTeam(team);
                                  setOpenMenuId(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <Eye size={15} className="text-gray-500" /> View details
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Detail modal */}
      <TeamDetailModal
        team={selectedTeam}
        onClose={() => setSelectedTeam(null)}
      />
    </div>
  );
}

export default TeamsPage;