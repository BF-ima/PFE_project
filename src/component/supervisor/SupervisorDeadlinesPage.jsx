import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SupervisorSidebar from '../../layout/SupervisorSidebar';
import { ProfileDropdown } from '../supervisor/HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
   CalendarClock, Plus, Trash2,
  ChevronDown, ChevronUp, Users, X, Loader2, Bell,
} from 'lucide-react';

const BASE      = 'http://localhost:3000';
const getToken  = () => localStorage.getItem('token');
const authHdr   = () => ({ Authorization: `Bearer ${getToken()}` });

const DELIVERABLE_TYPES = [
  'Final Report',
  'Source Code Repository',
  'Defense Presentation',
];



const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const dateOnly = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
  const d = new Date(`${dateOnly}T00:00:00`);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
};

// ── Add Deadline Modal ─────────────────────────────────────────────────────
const AddDeadlineModal = ({ team, onClose, onSaved }) => {
  const [deliverableType, setDeliverableType] = useState(DELIVERABLE_TYPES[0]);
  const [date,            setDate]            = useState('');
  const [time,            setTime]            = useState('');
  const [loading,         setLoading]         = useState(false);
  const [error,           setError]           = useState('');

  const handleSave = async () => {
    if (!date || !time) { setError('Date and time are required'); return; }
    setLoading(true);
    setError('');
    try {
      const res  = await fetch(`${BASE}/api/deliverable-deadlines`, {
        method:  'POST',
        headers: { ...authHdr(), 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          team_id:          team.team_id,
          deliverable_type: deliverableType,
          deadline_date:    date,
          deadline_time:    time,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.message || 'Failed to save'); return; }
      onSaved();
      onClose();
    } catch {
      setError('Server error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="bg-gradient-to-r from-[#18335E] to-[#2D8FBF] px-6 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white">Set Deadline</h3>
            <p className="text-xs text-blue-200 mt-0.5">{team.leader_name} — {team.project_title}</p>
          </div>
          <button onClick={onClose} className="text-white hover:text-blue-200 p-1 rounded-full hover:bg-white/20">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          {/* Deliverable type */}
          <div>
            <label className="block text-xs font-semibold text-[#1e3a5f] mb-1.5">
              Deliverable Type <span className="text-red-500">*</span>
            </label>
            <select
              value={deliverableType}
              onChange={e => setDeliverableType(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
            >
              {DELIVERABLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          

          {/* Date + Time side by side */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1e3a5f] mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={date}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => setDate(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#1e3a5f] mb-1.5">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
              />
            </div>
          </div>

          {/* Notification info */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-blue-50 border border-blue-100">
            <Bell size={14} className="text-[#2D8FBF] shrink-0 mt-0.5" />
            <p className="text-xs text-[#2D8FBF]">
              All students in this team will receive a notification when this deadline is saved.
            </p>
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl text-sm font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #18335E, #2D8FBF)' }}
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Save & Notify
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Team Card ──────────────────────────────────────────────────────────────
const TeamCard = ({ team, onDeadlineChange }) => {
  const [expanded, setExpanded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [deleting,  setDeleting]  = useState(null);

  const handleDelete = async (deadlineId) => {
    if (!window.confirm('Delete this deadline?')) return;
    setDeleting(deadlineId);
    try {
      await fetch(`${BASE}/api/deliverable-deadlines/${deadlineId}`, {
        method:  'DELETE',
        headers: authHdr(),
      });
      onDeadlineChange();
    } catch {
      alert('Server error');
    } finally {
      setDeleting(null);
    }
  };

  // Group deadlines by deliverable type for display
  const grouped = DELIVERABLE_TYPES.reduce((acc, type) => {
    acc[type] = (team.deadlines || []).filter(d => d.deliverable_type === type);
    return acc;
  }, {});

  const totalDeadlines = team.deadlines?.length || 0;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">

        {/* Team header — always visible */}
        <div
          className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
          onClick={() => setExpanded(v => !v)}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
              <Users size={18} style={{ color: '#2D8FBF' }} />
            </div>
            <div>
              <p className="text-sm font-bold text-[#1e3a5f]">{team.leader_name}</p>
              <p className="text-xs text-gray-500">{team.project_title}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: totalDeadlines > 0 ? '#EFF6FF' : '#F3F4F6', color: totalDeadlines > 0 ? '#2D8FBF' : '#9CA3AF' }}>
              {totalDeadlines} deadline{totalDeadlines !== 1 ? 's' : ''}
            </span>
            <button
              onClick={e => { e.stopPropagation(); setShowModal(true); }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#1e3a5f' }}
            >
              <Plus size={13} /> Add
            </button>
            {expanded ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
          </div>
        </div>

        {/* Expanded deadlines */}
        {expanded && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-4">
            {DELIVERABLE_TYPES.map(type => (
              <div key={type}>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{type}</p>
                {grouped[type].length === 0 ? (
                  <p className="text-xs text-gray-400 italic pl-2">No deadline set</p>
                ) : (
                  <div className="space-y-2">
                    {grouped[type].map(dl => (
                      <div
                        key={dl.id}
                        className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                        style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}
                      >
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{formatDate(dl.deadline_date)}</p>
                            <p className="text-xs text-gray-500">at {dl.deadline_time?.slice(0, 5)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(dl.id)}
                          disabled={deleting === dl.id}
                          className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-40"
                        >
                          {deleting === dl.id
                            ? <Loader2 size={14} className="animate-spin" />
                            : <Trash2 size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddDeadlineModal
          team={team}
          onClose={() => setShowModal(false)}
          onSaved={onDeadlineChange}
        />
      )}
    </>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const SupervisorDeadlinesPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [teams,   setTeams]   = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/deliverable-deadlines/my-teams`, { headers: authHdr() });
      const data = await res.json();
      setTeams(data.teams || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <SupervisorSidebar />

      <div className="flex-1 flex flex-col ml-16 overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs mb-1">Set submission deadlines per team</p>
              <h1 className="text-xl font-bold text-[#1e3a5f]">Deliverable Deadlines</h1>
            </div>
            <div className="flex items-center gap-2">
              
              <ProfileDropdown user={currentUser} onLogout={handleLogout} />
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">

            {/* Page title card */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-6 py-5 mb-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
                <CalendarClock size={26} style={{ color: '#2D8FBF' }} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#1e3a5f]">Deadline Management</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set deadlines for each deliverable type. Students are notified automatically when a deadline is saved.
                </p>
              </div>
            </div>

            {/* Teams list */}
            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 size={28} className="animate-spin text-[#2D8FBF]" />
              </div>
            ) : teams.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Users size={40} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm">No teams assigned to your projects yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teams.map(team => (
                  <TeamCard key={team.team_id} team={team} onDeadlineChange={fetchTeams} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupervisorDeadlinesPage;