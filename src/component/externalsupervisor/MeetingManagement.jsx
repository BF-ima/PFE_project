import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SupervisorSidebar from '../../layout/ExternalSupervisorSidebar';
import { ProfileDropdown } from '../supervisor/HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
  Facebook, Linkedin, Calendar, Users, CheckCircle, Clock,
  ChevronLeft, Plus, Pencil, Check, X, MapPin, Video, TriangleAlert, Loader2,
} from 'lucide-react';

const BASE       = 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ── Helpers ────────────────────────────────────────────────────────────────
const formatDisplayDate = (datetimeStr) => {
  if (!datetimeStr) return '—';
  const d = new Date(datetimeStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
};

const formatDisplayTime = (datetimeStr) => {
  if (!datetimeStr) return '—';
  const d = new Date(datetimeStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
};

// Extract YYYY-MM-DD from a datetime string for the date input
const toDateInput = (datetimeStr) => {
  if (!datetimeStr) return '';
  return new Date(datetimeStr).toISOString().slice(0, 10);
};

// Extract HH:MM from a datetime string for the time input
const toTimeInput = (datetimeStr) => {
  if (!datetimeStr) return '';
  return new Date(datetimeStr).toTimeString().slice(0, 5);
};

// ── Status badge ───────────────────────────────────────────────────────────
const STATUS_STYLES = {
  SCHEDULED:   { bg: '#DBEAFE', text: '#1D4ED8', label: 'Scheduled'   },
  COMPLETED:   { bg: '#D1FAE5', text: '#065F46', label: 'Completed'   },
  CANCELED:    { bg: '#FFE4E6', text: '#BE123C', label: 'Canceled'    },
  RESCHEDULED: { bg: '#FEF08A', text: '#854D0E', label: 'Rescheduled' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.SCHEDULED;
  return (
    <span className="text-xs font-semibold px-3 py-1 rounded-full"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {s.label}
    </span>
  );
};

// ── Meeting Modal (create / edit) ──────────────────────────────────────────
const MeetingModal = ({ meeting, onClose, onSave }) => {
  const isEdit = !!meeting;

  const [dateISO,   setDateISO]   = useState(meeting ? toDateInput(meeting.date)  : '');
  const [time,      setTime]      = useState(meeting ? toTimeInput(meeting.date)   : '');
  const [type,      setType]      = useState(meeting?.link ? 'online' : 'in-person');
  const [location,  setLocation]  = useState(meeting?.location || '');
  const [link,      setLink]      = useState(meeting?.link || '');
  const [topic,     setTopic]     = useState(meeting?.topic || '');
  const [loading,   setLoading]   = useState(false);

  const handleSave = async () => {
    if (!dateISO) { alert('Please select a date.'); return; }
    setLoading(true);
    await onSave({
      date:     dateISO,
      time,
      location: type === 'in-person' ? location : null,
      link:     type === 'online'    ? link      : null,
      topic:    topic || null,
    });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>
            {isEdit ? 'Edit Meeting' : 'Schedule New Meeting'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="px-6 pb-4 space-y-4">
          {/* Topic */}
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#193962' }}>Topic</label>
            <input type="text" value={topic} onChange={e => setTopic(e.target.value)}
              placeholder="e.g. Progress review, Chapter 2 discussion..."
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-sm" />
          </div>

          {/* Date + Time */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1" style={{ color: '#193962' }}>Date</label>
              <input type="date" value={dateISO} onChange={e => setDateISO(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1" style={{ color: '#193962' }}>Time</label>
              <input type="time" value={time} onChange={e => setTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-sm" />
            </div>
          </div>

          {/* Meeting type */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#193962' }}>Meeting Type</label>
            <div className="flex flex-col gap-3">
              {[
                { value: 'in-person', icon: <MapPin size={14} style={{ color: '#16A34A' }} />, label: 'In-person' },
                { value: 'online',    icon: <Video   size={14} style={{ color: '#7C3AED' }} />, label: 'Online'    },
              ].map(opt => (
                <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer"
                  onClick={() => setType(opt.value)}>
                  <span className={`w-5 h-5 flex items-center justify-center rounded-md border transition-all
                    ${type === opt.value ? 'bg-gray-500 border-gray-500' : 'bg-gray-200 border-gray-400'}`}>
                    {type === opt.value && <Check size={12} className="text-white" />}
                  </span>
                  {opt.icon}
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location or link */}
          {type === 'in-person' ? (
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: '#193962' }}>Place</label>
              <input value={location} onChange={e => setLocation(e.target.value)}
                placeholder="Enter the room ..."
                className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-sm">  
              </input>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: '#193962' }}>Google Meet link</label>
              <input type="url" value={link} onChange={e => setLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-sm" />
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-[#D1D5DB] hover:opacity-80">
            Cancel
          </button>
          <button onClick={handleSave} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #2D8FBF)' }}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            {isEdit ? 'Save Changes' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Confirm Status Modal ───────────────────────────────────────────────────
const ConfirmStatusModal = ({ action, onClose, onConfirm }) => {
  const isCancel = action === 'cancel';
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-6 pt-6 pb-2">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center
            ${isCancel ? 'bg-red-100' : 'bg-green-100'}`}>
            {isCancel
              ? <TriangleAlert size={20} className="text-red-500" />
              : <CheckCircle  size={20} className="text-green-600" />}
          </div>
          <h3 className="text-lg font-bold" style={{ color: '#1e3a5f' }}>
            {isCancel ? 'Cancel Meeting' : 'Confirmation Required'}
          </h3>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed px-6 pb-4">
          {isCancel
            ? 'Are you sure you want to cancel this meeting? This action is irreversible.'
            : 'Are you sure you want to mark this meeting as completed? This action is irreversible.'}
        </p>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-md text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50">
            Cancel
          </button>
          <button onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-2 rounded-md text-sm font-bold text-white hover:opacity-90"
            style={{ backgroundColor: isCancel ? '#FF0000' : '#54B03B' }}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Meeting Card (supervisor) ──────────────────────────────────────────────
const MeetingCard = ({ meeting, onEdit, onMarkComplete, onCancel }) => (
  <div className="border border-gray-200 rounded-xl px-5 py-4 bg-white">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar size={16} style={{ color: '#2D8FBF' }} />
          <span className="text-sm font-semibold text-gray-800">{formatDisplayDate(meeting.date)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{formatDisplayTime(meeting.date)}</span>
        </div>
      </div>
      {/* Action buttons — hidden for completed/canceled meetings */}
      {!['COMPLETED','CANCELED'].includes(meeting.status) && (
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(meeting)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-50">
            <Pencil size={14} style={{ color: '#2D8FBF' }} />
          </button>
          <button onClick={() => onMarkComplete(meeting)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-green-50">
            <Check size={14} style={{ color: '#16A34A' }} />
          </button>
          <button onClick={() => onCancel(meeting)}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50">
            <X size={14} style={{ color: '#DC2626' }} />
          </button>
        </div>
      )}
    </div>

    {meeting.topic && (
      <p className="text-sm font-medium text-gray-700 mb-2">{meeting.topic}</p>
    )}

    {meeting.location && (
      <div className="flex items-center gap-1.5 mb-2">
        <MapPin size={14} style={{ color: '#16A34A' }} />
        <span className="text-sm text-gray-600">{meeting.location}</span>
      </div>
    )}
    {meeting.link && (
      <div className="flex items-center gap-1.5 mb-2">
        <Video size={14} style={{ color: '#7C3AED' }} />
        <a href={meeting.link} target="_blank" rel="noopener noreferrer"
          className="text-sm font-medium hover:underline" style={{ color: '#7C3AED' }}>
          Join the meeting
        </a>
      </div>
    )}
    <StatusBadge status={meeting.status} />
  </div>
);

// ── Team Detail View ───────────────────────────────────────────────────────
const TeamMeetingDetail = ({ team, onBack }) => {
  const [meetings,      setMeetings]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [showNewModal,  setShowNewModal]  = useState(false);
  const [editMeeting,   setEditMeeting]   = useState(null);
  const [confirmModal,  setConfirmModal]  = useState(null);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/meetings/team/${team.team_id}`, { headers: authHeader() });
      const data = await res.json();
      setMeetings(data.meetings || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [team.team_id]);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  // Create new meeting
  const handleCreate = async (formData) => {
    const res  = await fetch(`${BASE}/api/meetings`, {
      method:  'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body:    JSON.stringify({ team_id: team.team_id, ...formData }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.message); return; }
    await fetchMeetings();
  };

  // Edit existing meeting
  const handleEdit = async (formData) => {
    const res  = await fetch(`${BASE}/api/meetings/${editMeeting.id}`, {
      method:  'PUT',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body:    JSON.stringify(formData),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.message); return; }
    await fetchMeetings();
  };

  // Change status (complete / cancel)
  const handleStatusChange = async (meeting, status) => {
    const res  = await fetch(`${BASE}/api/meetings/${meeting.id}/status`, {
      method:  'PATCH',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body:    JSON.stringify({ status }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.message); return; }
    await fetchMeetings();
  };

  const completedCount = meetings.filter(m => m.status === 'COMPLETED').length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack}
            className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100">
            <ChevronLeft size={20} className="text-gray-500" />
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#EFF6FF' }}>
            <Calendar size={30} style={{ color: '#2D8FBF' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#193962' }}>Meeting Management</h2>
            <p className="text-sm text-gray-500 mt-0.5">Plan and manage your meetings with supervised teams</p>
          </div>
        </div>
        <button onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90"
          style={{ background: '#193962' }}>
          <Plus size={15} /> New meeting
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Team info */}
        <div>
          <h3 className="text-base font-bold" style={{ color: '#1e3a5f' }}>{team.leader_name}</h3>
          <p className="text-sm text-gray-600">{team.project_title}</p>
          {team.members_names && (
            <p className="text-xs text-gray-400 mt-1">{team.members_names}</p>
          )}
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-gray-700">Meetings Completed</span>
            <span className="text-xs font-semibold text-gray-700">{completedCount}/{meetings.length}</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E0EDF7' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: meetings.length ? `${(completedCount / meetings.length) * 100}%` : '0%',
                backgroundColor: '#1e3a5f',
              }} />
          </div>
        </div>

        {/* Meetings list */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-[#2D8FBF]" />
          </div>
        ) : meetings.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No meetings scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {meetings.map(m => (
              <MeetingCard
                key={m.id}
                meeting={m}
                onEdit={(mtg)        => setEditMeeting(mtg)}
                onMarkComplete={(mtg) => setConfirmModal({ action: 'complete', meeting: mtg })}
                onCancel={(mtg)      => setConfirmModal({ action: 'cancel',   meeting: mtg })}
              />
            ))}
          </div>
        )}
      </div>

      {showNewModal && (
        <MeetingModal meeting={null} onClose={() => setShowNewModal(false)} onSave={handleCreate} />
      )}
      {editMeeting && (
        <MeetingModal meeting={editMeeting} onClose={() => setEditMeeting(null)} onSave={handleEdit} />
      )}
      {confirmModal && (
        <ConfirmStatusModal
          action={confirmModal.action}
          onClose={() => setConfirmModal(null)}
          onConfirm={() => handleStatusChange(
            confirmModal.meeting,
            confirmModal.action === 'complete' ? 'COMPLETED' : 'CANCELED'
          )}
        />
      )}
    </div>
  );
};

// ── Team List View ─────────────────────────────────────────────────────────
const TeamListView = ({ onSelectTeam }) => {
  const [teams,   setTeams]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/teams/my-supervisor-teams`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => setTeams(d.teams || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#EFF6FF' }}>
          <Calendar size={30} style={{ color: '#2D8FBF' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#193962' }}>Meeting Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">Plan and manage your meetings with supervised teams</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin text-[#2D8FBF]" />
          </div>
        ) : teams.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users size={40} className="mx-auto mb-2 text-gray-200" />
            <p className="text-sm">No teams assigned to your projects yet.</p>
          </div>
        ) : (
          teams.map(team => (
            <div key={team.team_id}
              className="bg-white border border-gray-200 rounded-xl px-6 py-5 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => onSelectTeam(team)}>
              <h3 className="text-base font-bold mb-0.5" style={{ color: '#1e3a5f' }}>
                {team.leader_name}
              </h3>
              <p className="text-sm text-gray-500 mb-4">{team.project_title}</p>
              <div className="flex items-center gap-1.5">
                <Users size={14} className="text-gray-400" />
                <span className="text-xs text-gray-500">{team.member_count} member(s)</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const MeetingManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [selectedTeam, setSelectedTeam] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <SupervisorSidebar />
      <div className="flex-1 flex flex-col ml-16 overflow-hidden">

        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track projects</p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <a href="https://www.facebook.com/esisba.edu" target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-white rounded-lg shadow-sm"
                style={{ background: 'linear-gradient(135deg, #18335E, #2D8FBF)' }}>
                <Facebook size={14} />
              </a>
              <a href="https://www.linkedin.com/school/esisba" target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-white rounded-lg shadow-sm"
                style={{ background: 'linear-gradient(135deg, #18335E, #2D8FBF)' }}>
                <Linkedin size={14} />
              </a>
              <ProfileDropdown user={currentUser} onLogout={handleLogout} onChangePassword={() => {}} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-4xl mx-auto">
            {selectedTeam ? (
              <TeamMeetingDetail
                team={selectedTeam}
                onBack={() => setSelectedTeam(null)}
              />
            ) : (
              <TeamListView onSelectTeam={setSelectedTeam} />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MeetingManagement;