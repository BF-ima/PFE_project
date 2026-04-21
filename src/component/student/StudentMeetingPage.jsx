import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../../layout/StudentSidebar';
import { ProfileDropdown } from '../supervisor/HomePage';
import {
  Facebook, Linkedin, Calendar, Clock, MapPin, Video, Users, Info
} from 'lucide-react';

// ============================================================
// MOCK DATA (to be replaced with API calls)
// ============================================================
// Student's team information (will come from backend)
const MOCK_STUDENT = {
  teamId: 'Team ID',
  projectTitle: 'The title of their project',
  memberNames: ["leader's name", "member's name"],
};

// Meetings are created by the supervisor and assigned to the student's team.
// The student can only view them. This mock will be replaced by a fetch.
const MOCK_MEETINGS = [
  {
    id: 1,
    date: 'Monday, 30 April 2026',
    time: '10:00',
    location: 'Salle 1',
    link: null,
    status: 'Planned',
    scheduledBy: 'Supervisor',
  },
  {
    id: 2,
    date: 'Sunday, 29 April 2026',
    time: '12:00',
    location: null,
    link: 'https://meet.google.com/abc-defg-hij',
    status: 'Canceled',
    scheduledBy: 'Supervisor',
  },
];

const IMPORTANT_TIPS = [
  'Make sure you are on time for each meeting',
  'Prepare your questions and discussion points in advance',
  'For online meetings, test your connection before the scheduled time',
  'If you cannot attend, notify your supervisor as soon as possible',
];


// STATUS BADGE 
const STATUS_STYLES = {
  Planned:     { bg: '#DBEAFE', text: '#1D4ED8' },
  Completed:   { bg: '#D1FAE5', text: '#065F46' },
  Canceled:    { bg: '#FFE4E6', text: '#BE123C' },
  Rescheduled: { bg: '#FEF08A', text: '#854D0E' },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_STYLES[status] || STATUS_STYLES.Planned;
  return (
    <span
      className="text-xs font-semibold px-3 py-1 rounded-full"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {status}
    </span>
  );
};

// ============================================================
// MEETING CARD – read‑only display for the student
// Shows date, time, location/link, status, and who scheduled it.
// ============================================================
const MeetingCard = ({ meeting }) => (
  <div className="border border-gray-200 rounded-xl px-5 py-4 bg-white">
    {/* Date and time row */}
    <div className="flex items-center gap-4 flex-wrap mb-3">
      <div className="flex items-center gap-2">
        <Calendar size={16} style={{ color: '#2D8FBF' }} />
        <span className="text-sm font-semibold text-gray-800">{meeting.date}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <Clock size={14} className="text-gray-400" />
        <span className="text-sm text-gray-600">{meeting.time}</span>
      </div>
    </div>

    {/* Physical location (if any) */}
    {meeting.location && (
      <div className="flex items-center gap-1.5 mb-2">
        <MapPin size={14} style={{ color: '#16A34A' }} />
        <span className="text-sm text-gray-600">{meeting.location}</span>
      </div>
    )}

    {/* Online meeting link (if any) */}
    {meeting.link && (
      <div className="flex items-center gap-1.5 mb-2">
        <Video size={14} style={{ color: '#7C3AED' }} />
        <a
          href={meeting.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium hover:underline"
          style={{ color: '#7C3AED' }}
        >
          Join the meeting
        </a>
      </div>
    )}

    {/* Status badge and scheduler info */}
    <div className="flex items-center justify-between mt-2">
      <StatusBadge status={meeting.status} />
      {meeting.scheduledBy && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Users size={13} />
          <span>{meeting.scheduledBy}</span>
        </div>
      )}
    </div>
  </div>
);

// IMPORTANT INFORMATION BANNER
const ImportantInfoBanner = ({ tips }) => (
  <div
    className="rounded-xl px-5 py-4"
    style={{ backgroundColor: '#DBEAFE', border: '1px solid #BFDBFE' }}
  >
    <div className="flex items-center gap-2 mb-3">
      <h4 className="text-lg font-bold" style={{ color: '#193962' }}>Important Information</h4>
    </div>
    <ul className="space-y-1.5 pl-1">
      {tips.map((tip, i) => (
        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#193962' }}>
          <span
            className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: '#193962' }}  
          />
          {tip}
        </li>
      ))}
    </ul>
  </div>
);

// ============================================================
// MAIN PAGE – Student Meeting Management
// 1. The supervisor creates meetings for a team (from the Supervisor MeetingManagement page).
// 2. Those meetings are stored in the backend and associated with the team.
// 3. The student fetches meetings for his/her own team via an API call.
// 4. The student can only view the meetings (no edit/cancel actions).
// ============================================================
const StudentMeetingPage = () => {
  const navigate = useNavigate();
  const [currentUser] = useState({
    id: 1, firstName: 'Student', lastName: '', email: 'student@esi-sba.dz', role: 'Student',
  });
  const [meetings] = useState(MOCK_MEETINGS);

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <StudentSidebar />

      <div className="flex-1 flex flex-col ml-16 overflow-hidden">

        {/* Header identical to other student pages */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track your projects</p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <a
                href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="Facebook"
              >
                <Facebook size={14} className="sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/https%3A%2F%2Fwww.linkedin.com%2Fschool%2Fesisba"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="LinkedIn"
              >
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
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: '#EFF6FF' }}
                >
                  <Calendar size={35} style={{ color: '#2D8FBF' }} />
                </div>
                <div>
                  <h2 className="sm:text-xl font-bold" style={{ color: '#193962' }}>Meeting Management</h2>
                  <p className="text-md text-gray-500 -mt-1">
                    You can view your scheduled meetings with your supervisor from this dashboard
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Team information */}
                <div>
                  <h3 className="text-lg font-bold" style={{ color: '#1e3a5f' }}>
                    {MOCK_STUDENT.teamId}
                  </h3>
                  <p className="text-sm text-gray-500">{MOCK_STUDENT.projectTitle}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {MOCK_STUDENT.memberNames.join(' • ')}
                  </p>
                </div>

                {/* List of meetings – each meeting card is read‑only */}
                {meetings.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <Calendar size={40} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No meetings scheduled yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {meetings.map((m) => (
                      <MeetingCard key={m.id} meeting={m} />
                    ))}
                  </div>
                )}

                {/* Important guidelines banner */}
                <ImportantInfoBanner tips={IMPORTANT_TIPS} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default StudentMeetingPage;