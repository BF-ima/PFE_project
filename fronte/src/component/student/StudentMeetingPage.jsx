import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../../layout/StudentSidebar';
import { ProfileDropdown } from '../supervisor/HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
  Facebook, Linkedin, Calendar, Clock, MapPin, Video, Users, Loader2,
} from 'lucide-react';

const BASE       = 'http://localhost:3000';
const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// ── Helpers ────────────────────────────────────────────────────────────────
const formatDate = (datetimeStr) => {
  if (!datetimeStr) return '—';
  const d = new Date(datetimeStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
};

const formatTime = (datetimeStr) => {
  if (!datetimeStr) return '—';
  const d = new Date(datetimeStr);
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
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

// ── Meeting Card ───────────────────────────────────────────────────────────
const MeetingCard = ({ meeting }) => (
  <div className="border border-gray-200 rounded-xl px-5 py-4 bg-white">
    <div className="flex items-center gap-4 flex-wrap mb-3">
      <div className="flex items-center gap-2">
        <Calendar size={16} style={{ color: '#2D8FBF' }} />
        <span className="text-sm font-semibold text-gray-800">{formatDate(meeting.date)}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock size={14} className="text-gray-400" />
        <span className="text-sm text-gray-600">{formatTime(meeting.date)}</span>
      </div>
    </div>

    {meeting.topic && (
      <p className="text-sm text-gray-700 font-medium mb-2">{meeting.topic}</p>
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

    {/* Feedback from supervisor (if completed) */}
    {meeting.feedback && (
      <div className="mt-2 px-3 py-2 rounded-lg text-sm text-gray-700"
        style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
        <span className="font-semibold text-green-700">Supervisor's note: </span>
        {meeting.feedback}
      </div>
    )}

    <div className="flex items-center justify-between mt-3">
      <StatusBadge status={meeting.status} />
      {meeting.created_by_name && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Users size={13} />
          <span>{meeting.created_by_name}</span>
        </div>
      )}
    </div>
  </div>
);

// ── Important info banner ──────────────────────────────────────────────────
const TIPS = [
  'Make sure you are on time for each meeting',
  'Prepare your questions and discussion points in advance',
  'For online meetings, test your connection before the scheduled time',
  'If you cannot attend, notify your supervisor as soon as possible',
];

const ImportantInfoBanner = () => (
  <div className="rounded-xl px-5 py-4"
    style={{ backgroundColor: '#DBEAFE', border: '1px solid #BFDBFE' }}>
    <h4 className="text-lg font-bold mb-3" style={{ color: '#193962' }}>Important Information</h4>
    <ul className="space-y-1.5 pl-1">
      {TIPS.map((tip, i) => (
        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#193962' }}>
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: '#193962' }} />
          {tip}
        </li>
      ))}
    </ul>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────
const StudentMeetingPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const [meetings, setMeetings] = useState([]);
  const [teamInfo, setTeamInfo] = useState(null);
  const [loading,  setLoading]  = useState(true);

  const fetchMeetings = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/meetings/my`, { headers: authHeader() });
      const data = await res.json();
      setMeetings(data.meetings || []);
      setTeamInfo(data.team || null);
    } catch (err) {
      console.error('fetchMeetings error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchMeetings(); }, [fetchMeetings]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <StudentSidebar />
      <div className="flex-1 flex flex-col ml-16 overflow-hidden">

        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track your projects</p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <a href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v"
                target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm">
                <Facebook size={14} className="sm:w-5 sm:h-5" />
              </a>
              <a href="https://www.linkedin.com/in/https%3A%2F%2Fwww.linkedin.com%2Fschool%2Fesisba"
                target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm">
                <Linkedin size={14} className="sm:w-5 sm:h-5" />
              </a>
              <ProfileDropdown user={currentUser} onLogout={handleLogout} onChangePassword={() => {}} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">

              <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#EFF6FF' }}>
                  <Calendar size={35} style={{ color: '#2D8FBF' }} />
                </div>
                <div>
                  <h2 className="sm:text-xl font-bold" style={{ color: '#193962' }}>Meeting Management</h2>
                  <p className="text-md text-gray-500 -mt-1">
                    View your scheduled meetings with your supervisor
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6">

                {/* Team info */}
                {teamInfo && (
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: '#1e3a5f' }}>
                      Team #{teamInfo.id}
                    </h3>
                    <p className="text-sm text-gray-500">{teamInfo.project_title}</p>
                    {teamInfo.member_names && (
                      <p className="text-xs text-gray-400 mt-1">
                        {teamInfo.member_names.join(' • ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Meetings list */}
                {loading ? (
                  <div className="flex justify-center py-12">
                    <Loader2 size={28} className="animate-spin text-[#2D8FBF]" />
                  </div>
                ) : meetings.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No meetings scheduled yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {meetings.map(m => <MeetingCard key={m.id} meeting={m} />)}
                  </div>
                )}

                <ImportantInfoBanner />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentMeetingPage;