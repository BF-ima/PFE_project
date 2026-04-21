import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SupervisorSidebar from '../../layout/SupervisorSidebar';
import { ProfileDropdown } from './HomePage';
import {
  Facebook, Linkedin, Calendar, Users, CheckCircle, Clock,
  ChevronLeft, Plus, Pencil, Check, X, MapPin, Video, TriangleAlert
} from 'lucide-react';

// MOCK DATA 
const MOCK_TEAMS = [
  {
    id: 1,
    teamId: 'Team ID',
    projectTitle: 'The title of their project',
    members: 2,
    memberNames: ["leader's name", "member's name"],
    meetingsTotal: 3,
  },
  {
    id: 2,
    teamId: 'Team ID',
    projectTitle: 'The title of their project',
    members: 1,
    memberNames: ["leader's name"],
    meetingsTotal: 3,
  },
  {
    id: 3,
    teamId: 'Team ID',
    projectTitle: 'The title of their project',
    members: 2,
    memberNames: ["leader's name", "member's name"],
    meetingsTotal: 3,
  },
];

// Converts ISO date (YYYY-MM-DD) to full readable format
const formatFullDate = (isoDate) => {
  if (!isoDate) return '';
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Mock meetings data. Each team has its own array.
const INITIAL_MEETINGS = {
  1: [
    {
      id: 1,
      dateISO: '2026-04-30',
      date: formatFullDate('2026-04-30'),
      time: '10:00',
      location: 'Salle 1',
      link: null,
      status: 'Planned',
    },
    {
      id: 2,
      dateISO: '2026-04-29',
      date: formatFullDate('2026-04-29'),
      time: '12:00',
      location: null,
      link: 'https://meet.example.com/room/123',
      status: 'Canceled',
    },
  ],
  2: [],
  3: [],
};

// ============================================================
// STATUS BADGE – visual indicator for meeting status
// ============================================================
const STATUS_STYLES = {
  Planned:    { bg: '#DBEAFE', text: '#1D4ED8' },
  Completed:  { bg: '#D1FAE5', text: '#065F46' },
  Canceled:   { bg: '#FFE4E6', text: '#BE123C' },
  Rescheduled:{ bg: '#FEF08A', text: '#854D0E' }, 
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Planned;
  return (
    <span className="text-xs font-semibold px-3 py-1 rounded-full"
      style={{ backgroundColor: s.bg, color: s.text }}>
      {status}
    </span>
  );
};

// ============================================================
// MEETING MODAL – used for both creating and editing a meeting
// ============================================================
const MeetingModal = ({ meeting, onClose, onSave }) => {
  const isEdit = !!meeting;
  const [dateISO, setDateISO]     = useState(meeting?.dateISO || '');
  const [time, setTime]           = useState(meeting?.time || '');
  const [type, setType]           = useState(meeting?.link ? 'online' : 'In-person');
  const [location, setLocation]   = useState(meeting?.location || '');
  const [link, setLink]           = useState(meeting?.link || '');
  const [status, setStatus]       = useState(meeting?.status || 'Planned');

  const handleSave = () => {
    if (!dateISO) {
      alert('Please select a date.');
      return;
    }
    const formattedDate = formatFullDate(dateISO);
    // When editing an existing meeting, automatically set status to 'Rescheduled'
    const newStatus = isEdit ? 'Rescheduled' : status;
    onSave({
      id: meeting?.id || Date.now(),
      dateISO: dateISO,
      date: formattedDate,
      time,
      location: type === 'In-person' ? location : null,
      link: type === 'online' ? link : null,
      status: newStatus,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>
            {isEdit ? 'Edit Meeting' : 'Schedule New Meeting'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>

        <div className="px-6 pb-6 space-y-4">
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1" style={{ color: '#193962' }}>Date</label>
              <input type="date" value={dateISO} onChange={(e) => setDateISO(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-sm" />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-bold mb-1" style={{ color: '#193962' }}>Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-sm" />
            </div>
          </div>

          {/* Meeting type selection with radio buttons */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#193962' }}>Meeting Type</label>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="type" value="In-person" checked={type === 'In-person'}
                  onChange={() => setType('In-person')} className="hidden" />
                <span onClick={() => setType('In-person')}
                  className={`w-5 h-5 flex items-center justify-center rounded-md border transition-all ${
                    type === 'In-person' ? 'bg-gray-500 border-gray-500' : 'bg-gray-200 border-gray-400'
                  }`}>
                  {type === 'In-person' && <Check size={12} className="text-white" />}
                </span>
                <MapPin size={14} style={{ color: '#16A34A' }} />
                <span>In-person</span>
              </label>

              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input type="radio" name="type" value="online" checked={type === 'online'}
                  onChange={() => setType('online')} className="hidden" />
                <span onClick={() => setType('online')}
                  className={`w-5 h-5 flex items-center justify-center rounded-md border transition-all ${
                    type === 'online' ? 'bg-gray-500 border-gray-500' : 'bg-gray-200 border-gray-400'
                  }`}>
                  {type === 'online' && <Check size={12} className="text-white" />}
                </span>
                <Video size={14} style={{ color: '#7C3AED' }} />
                <span>Online</span>
              </label>
            </div>
          </div>

          {/* Conditional field: Place (dropdown) or Google Meet link */}
          {type === 'In-person' ? (
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: '#193962' }}>Place</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-sm"
              >
                <option value="" disabled>Select a room</option>
                <option value="Salle 1">Salle 1</option>
                <option value="Salle 2">Salle 2</option>
                <option value="Salle 3">Salle 3</option>
                <option value="Amphi A">Amphi A</option>
                <option value="Amphi B">Amphi B</option>
                <option value="Salle de réunion">Salle de réunion</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-bold mb-1" style={{ color: '#193962' }}>Google meet link</label>
              <input type="url" value={link} onChange={(e) => setLink(e.target.value)}
                placeholder="https://meet.google.com/..."
                className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-sm" />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-md font-semibold text-gray-600 bg-[#D1D5DB] hover:opacity-80">
            Cancel
          </button>
          <button onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl text-md font-bold text-white hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #2D8FBF)' }}>
            {isEdit ? 'Save Changes' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// CONFIRMATION MODAL – used when marking a meeting as completed or canceled
// ============================================================
const ConfirmStatusModal = ({ action, onClose, onConfirm }) => {
  const isCancel = action === 'cancel';
  const title = isCancel ? 'Cancel Meeting' : 'Confirmation Required';
  const description = isCancel
    ? 'Are you sure you want to cancel the meeting? This action is irreversible. All scheduled participants will be notified and the meeting will be removed from the calendar.'
    : 'Are you sure you want to mark this meeting as completed? This action is irreversible. The meeting will be moved to your history and you will no longer be able to modify it.';
  const confirmColor = isCancel ? '#FF0000' : '#54B03B';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-6 pt-6 pb-2">
          {isCancel ? (
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
              <TriangleAlert size={20} className="text-red-500" />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
          )}
          <h3 className="text-lg font-bold" style={{ color: '#1e3a5f' }}>{title}</h3>
        </div>
        <div className="px-6 pb-4">
          <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-md text-sm font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-2 rounded-md text-sm font-bold text-white transition hover:opacity-90"
            style={{ backgroundColor: confirmColor }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MEETING CARD – displays a single meeting entry
// ============================================================
const MeetingCard = ({ meeting, onEdit, onMarkComplete, onCancel }) => (
  <div className="border border-gray-200 rounded-xl px-5 py-4 bg-white">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar size={16} style={{ color: '#2D8FBF' }} />
          <span className="text-sm font-semibold text-gray-800">{meeting.date}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} className="text-gray-400" />
          <span className="text-sm text-gray-600">{meeting.time}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onEdit(meeting)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-blue-50 transition-colors">
          <Pencil size={14} style={{ color: '#2D8FBF' }} />
        </button>
        <button onClick={() => onMarkComplete(meeting)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-green-50 transition-colors">
          <Check size={14} style={{ color: '#16A34A' }} />
        </button>
        <button onClick={() => onCancel(meeting)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors">
          <X size={14} style={{ color: '#DC2626' }} />
        </button>
      </div>
    </div>
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
          className="text-sm font-medium" style={{ color: '#7C3AED' }}>
          Join the meeting
        </a>
      </div>
    )}
    <StatusBadge status={meeting.status} />
  </div>
);

// ============================================================
// TEAM DETAIL VIEW – shows all meetings for a selected team
// ============================================================
const TeamMeetingDetail = ({ team, onBack, onMeetingUpdate }) => {
  const [meetings, setMeetings] = useState(INITIAL_MEETINGS[team.id] || []);
  const [showNewModal, setShowNewModal]       = useState(false);
  const [editMeeting, setEditMeeting]         = useState(null);
  const [confirmModal, setConfirmModal]       = useState(null);

  // Saves a new or edited meeting. Uses functional update to ensure parent gets the latest data.
  const handleSave = (data) => {
    const updatedMeetings = (prev) => {
      const exists = prev.find(m => m.id === data.id);
      return exists ? prev.map(m => m.id === data.id ? data : m) : [...prev, data];
    };
    setMeetings(prev => {
      const updated = updatedMeetings(prev);
      if (onMeetingUpdate) onMeetingUpdate(team.id, updated);
      return updated;
    });
  };

  // Changes the status of a meeting (Completed / Canceled) and notifies parent.
  const handleStatusChange = (meeting, newStatus) => {
    setMeetings(prev => {
      const updated = prev.map(m => m.id === meeting.id ? { ...m, status: newStatus } : m);
      if (onMeetingUpdate) onMeetingUpdate(team.id, updated);
      return updated;
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft size={20} className="text-gray-500" />
          </button>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#EFF6FF' }}>
            <Calendar size={30} style={{ color: '#2D8FBF' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#193962' }}>Meeting Management</h2>
            <p className="text-ms text-gray-500 mt-0.5">Plan and manage your meetings with supervised teams</p>
          </div>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-opacity"
          style={{ background: '#193962' }}>
          <Plus size={15} /> New meeting
        </button>
      </div>

      <div className="p-6 space-y-5">
        {/* Team info */}
        <div>
          <h3 className="text-base font-bold" style={{ color: '#1e3a5f' }}>{team.teamId}</h3>
          <p className="text-sm text-gray-600">{team.projectTitle}</p>
          <p className="text-xs text-gray-400 mt-1">{team.memberNames.join(' • ')}</p>
        </div>

        {/* List of meetings */}
        {meetings.length === 0 ? (
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
                onEdit={(mtg) => setEditMeeting(mtg)}
                onMarkComplete={(mtg) => setConfirmModal({ action: 'complete', meeting: mtg })}
                onCancel={(mtg) => setConfirmModal({ action: 'cancel', meeting: mtg })}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {showNewModal && <MeetingModal meeting={null} onClose={() => setShowNewModal(false)} onSave={handleSave} />}
      {editMeeting && <MeetingModal meeting={editMeeting} onClose={() => setEditMeeting(null)} onSave={handleSave} />}
      {confirmModal && (
        <ConfirmStatusModal
          action={confirmModal.action}
          onClose={() => setConfirmModal(null)}
          onConfirm={() => handleStatusChange(confirmModal.meeting, confirmModal.action === 'complete' ? 'Completed' : 'Canceled')}
        />
      )}
    </div>
  );
};

// ============================================================
// TEAM ROW – displays a single team in the main list with progress bar
// ============================================================
const TeamRow = ({ team, completedCount, onClick }) => {
  const progressPct = (completedCount / team.meetingsTotal) * 100;
  return (
    <div
      className="bg-white border border-gray-200 rounded-xl px-6 py-5 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(team)}
    >
      <h3 className="text-xl font-bold mb-0.5" style={{ color: '#1e3a5f' }}>{team.teamId}</h3>
      <p className="text-sm text-gray-500 mb-4">{team.projectTitle}</p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 shrink-0">
          <Users size={14} className="text-gray-400" />
          <span className="text-xs text-gray-500">{team.members} member{team.members !== 1 ? 's' : ''}</span>
        </div>
        <div className="flex items-center gap-3 flex-1">
          <span className="text-xs text-gray-600 shrink-0">Meetings Progress</span>
          <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E0EDF7' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: '#1e3a5f' }} />
          </div>
          <span className="text-xs font-medium text-gray-600 shrink-0">
            {completedCount}/{team.meetingsTotal}
          </span>
        </div>
      </div>
    </div>
  );
};


const TeamListView = ({ teams, meetingsData, onSelectTeam }) => {
  const getCompletedCount = (teamId) => {
    const meetings = meetingsData[teamId] || [];
    return meetings.filter(m => m.status === 'Completed').length;
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#EFF6FF' }}>
          <Calendar size={30} style={{ color: '#2D8FBF' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#193962' }}>Meeting Management</h2>
          <p className="text-ms text-gray-500 mt-0.5">Plan and manage your meetings with supervised teams</p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {teams.map(team => (
          <TeamRow
            key={team.id}
            team={team}
            completedCount={getCompletedCount(team.id)}
            onClick={onSelectTeam}
          />
        ))}
      </div>
    </div>
  );
};

// ============================================================
// MAIN PAGE – supervisor meeting management dashboard
// ============================================================
const MeetingManagement = () => {
  const navigate = useNavigate();
  const [currentUser] = useState({ firstName: 'Supervisor', lastName: '', role: 'Supervisor' });
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [meetingsData, setMeetingsData] = useState(INITIAL_MEETINGS);

  // Callback from child components to update the global meetings data state.
  const handleMeetingUpdate = (teamId, updatedMeetings) => {
    setMeetingsData(prev => ({ ...prev, [teamId]: updatedMeetings }));
  };

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
              <a href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v" target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-white rounded-lg hover:opacity-80 transition-all duration-300 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #18335E, #2D8FBF)' }}>
                <Facebook size={14} className="sm:w-5 sm:h-5" />
              </a>
              <a href="https://www.linkedin.com/school/esisba" target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-white rounded-lg hover:opacity-80 transition-all duration-300 shadow-sm"
                style={{ background: 'linear-gradient(135deg, #18335E, #2D8FBF)' }}>
                <Linkedin size={14} className="sm:w-5 sm:h-5" />
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
                onMeetingUpdate={handleMeetingUpdate}
              />
            ) : (
              <TeamListView
                teams={MOCK_TEAMS}
                meetingsData={meetingsData}
                onSelectTeam={setSelectedTeam}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MeetingManagement;