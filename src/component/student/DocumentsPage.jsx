import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../../layout/StudentSidebar';
import { ProfileDropdown } from '../supervisor/HomePage';
import {
  Facebook, Linkedin, FolderOpen, Upload, FileText,
  Clock, Code2, Monitor, AlertCircle, ArrowUpFromLine, X, Check
} from 'lucide-react';

// ============================================================
// FEEDBACK MODAL
// Displays supervisor feedback messages
// Newest message has dark gray background (#B5B5B5) 
// Older messages have light gray background (#F3F4F6) 
// Double check icon appears only on older (read) 
// ============================================================
const FeedbackModal = ({ feedbacks, onClose }) => {
  if (!feedbacks) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>The Feedback</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pb-6 space-y-3">
          {[...feedbacks].reverse().map((fb, index, arr) => {
            const isNewest = index === 0;
            const hasDoubleCheck = arr.length > 1 && !isNewest;
            return (
              <div
                key={fb.id}
                className={`rounded-xl px-4 py-3 ${!isNewest ? 'border' : ''}`}
                style={{
                  backgroundColor: isNewest ? '#B5B5B5' : '#F3F4F6',
                  borderColor: !isNewest ? '#E5E5E5' : undefined
                }}
              >
                <p className="text-sm text-gray-800 leading-relaxed">{fb.text}</p>
                <div className="flex items-center justify-end gap-1 mt-2">
                  <span className="text-xs text-gray-400">{fb.time}</span>
                  {hasDoubleCheck && (
                    <div className="flex">
                      <Check size={12} style={{ color: '#2D8FBF' }} strokeWidth={2.5} />
                      <Check size={12} style={{ color: '#2D8FBF', marginLeft: -4 }} strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// CONFIRM UPLOAD MODAL
// Appears when a file is selected for upload
// Shows file name, size, and confirmation actions
// ============================================================
const ConfirmUploadModal = ({ file, onCancel, onConfirm }) => {
  if (!file) return null;

  const formatSize = (bytes) => {
    if (!bytes) return '—';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-gray-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-7 pt-7 pb-4">
          <h3 className="text-2xl font-bold" style={{ color: '#1e3a5f' }}>Confirm Upload</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={22} />
          </button>
        </div>
        <div className="px-7 pb-4">
          <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ backgroundColor: '#E5E7EB' }}>
            <div>
              <p className="text-sm font-bold text-gray-800">{file.name}</p>
              <p className="text-sm text-gray-500 mt-0.5">{formatSize(file.size)}</p>
            </div>
          </div>
        </div>
        <div className="px-7 pb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            Are you ready to submit this file? Your supervisor will be notified immediately.
          </p>
        </div>
        <div className="flex items-center gap-3 px-7 pb-7">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 transition-colors hover:opacity-80"
            style={{ backgroundColor: '#D1D5DB' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #2D8FBF)' }}
          >
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DOCUMENTS TAB
// Displays shared documents and resources
// Uses mock data 
// ============================================================
const TYPE_BADGE = {
  Tutorial:  { bg: '#B4EDA8', text: '#54B03B' },
  Reference: { bg: '#C2C2C2', text: '#787878' },
  Article:   { bg: '#FFE4B5', text: '#CC7B00' },
  Material:  { bg: '#E0D4FF', text: '#6B46C1' },
  Other:     { bg: '#FEF3C7', text: '#92400E' },
};

const DocCard = ({ doc }) => {
  const badge = TYPE_BADGE[doc.type] || TYPE_BADGE.Other;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
            <FileText size={28} style={{ color: '#2D8FBF' }} />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900 leading-tight">{doc.name}</p>
            <p className="text-sm text-gray-400 mt-1">{doc.size}</p>
          </div>
        </div>
        <span className="text-sm font-medium px-3 py-1 rounded-full shrink-0"
          style={{ backgroundColor: badge.bg, color: badge.text }}>{doc.type}</span>
      </div>
      <p className="text-sm text-gray-500">Uploaded by {doc.uploadedBy} on {doc.date}</p>
      <a href={doc.url || '#'} download className="text-sm font-medium" style={{ color: '#53C7FF' }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}>
        Download
      </a>
    </div>
  );
};

const MOCK_DOCUMENTS = [
  { id: 1, name: 'React Best Practices Guide.pdf',    size: '2.5MB', type: 'Tutorial',  uploadedBy: 'dr. charlie smith', date: '21-04-2026', url: '#' },
  { id: 2, name: 'Database Design Patterns.docx',     size: '2.5MB', type: 'Reference', uploadedBy: 'dr. charlie smith', date: '21-04-2026', url: '#' },
  { id: 3, name: 'AI in Education Article.pdf',       size: '1.8MB', type: 'Article',   uploadedBy: 'prof. sarah lee',   date: '22-04-2026', url: '#' },
  { id: 4, name: 'Project Management Material.pptx',  size: '4.2MB', type: 'Material',  uploadedBy: 'dr. john doe',      date: '23-04-2026', url: '#' },
];

const DocumentsTab = () => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
        <FolderOpen size={20} style={{ color: '#2D8FBF' }} />
      </div>
      <div>
        <h2 className="text-base font-bold" style={{ color: '#193962' }}>Shared Documents & Resources</h2>
        <p className="text-xs text-gray-500 mt-0.5">{MOCK_DOCUMENTS.length} New Documents</p>
      </div>
    </div>
    <div className="p-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {MOCK_DOCUMENTS.map(doc => <DocCard key={doc.id} doc={doc} />)}
      </div>
    </div>
  </div>
);

// ============================================================
// DELIVERABLES TAB
// Manages defense deliverables submission:
// - Final Report (PDF)
// - Source Code Repository (URL)
// - Defense Presentation (PDF/PPTX)
// Includes countdown timer, progress bar, file upload with confirmation
// and supervisor feedback modal for the report
// ============================================================
const useCountdown = (initial) => {
  const [timeLeft, setTimeLeft] = useState(initial);
  useEffect(() => {
    const t = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours   > 0) return { ...prev, hours:   prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days    > 0) return { ...prev, days:    prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(t);
  }, []);
  return timeLeft;
};

// DropZone component with confirmation modal
const DropZone = ({ accept, onConfirmedFile, confirmedFile }) => {
  const inputRef = useRef();
  const [dragging, setDragging]       = useState(false);
  const [pendingFile, setPendingFile] = useState(null);

  const handlePick   = (f) => { if (f) setPendingFile(f); };
  const handleDrop   = (e) => { e.preventDefault(); setDragging(false); handlePick(e.dataTransfer.files[0]); };
  const handleConfirm = () => { onConfirmedFile(pendingFile); setPendingFile(null); };

  return (
    <>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="cursor-pointer flex flex-col items-center justify-center py-6 rounded-lg border-2 border-dashed transition-colors"
        style={{ borderColor: dragging ? '#2D8FBF' : '#D1D5DB', backgroundColor: dragging ? '#EFF6FF' : '#FAFAFA' }}
      >
        <ArrowUpFromLine size={24} className="text-gray-400 mb-2" />
        <p className="text-xs text-gray-500">Click to upload or drag and drop</p>
        {confirmedFile && (
          <p className="text-xs font-medium mt-1" style={{ color: '#2D8FBF' }}>✓ {confirmedFile.name}</p>
        )}
        <input ref={inputRef} type="file" accept={accept} className="hidden"
          onChange={(e) => { if (e.target.files[0]) handlePick(e.target.files[0]); }} />
      </div>

      {pendingFile && (
        <ConfirmUploadModal
          file={pendingFile}
          onCancel={() => setPendingFile(null)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

// DeliverableCard - displays a single deliverable section
const DeliverableCard = ({
  icon: Icon,
  title,
  description,
  children,
  acceptLabel,
  confirmedFile,
  feedbacks,
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  const formatDate = (date) =>
    date
      ? `${date.getDate().toString().padStart(2,'0')}-${(date.getMonth()+1).toString().padStart(2,'0')}-${date.getFullYear()}`
      : '';

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-gray-100">
              <Icon size={18} className="text-gray-600" />
            </div>
            <div>
              <p className="text-base font-semibold" style={{ color: '#193962' }}>{title}</p>
              <p className="text-xs text-gray-500">{description}</p>
            </div>
          </div>

          {/* Show feedback button only if feedbacks exist */}
          {feedbacks && feedbacks.length > 0 && (
            <button
              onClick={() => setShowFeedback(true)}
              className="shrink-0 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1e3a5f' }}
            >
              Supervisor's Feedback
            </button>
          )}
        </div>

        {/* Show uploaded file info if a file has been confirmed */}
        {confirmedFile && (
          <div
            className="flex items-center justify-between px-4 py-3 rounded-xl"
            style={{ backgroundColor: '#F3F4F6' }}
          >
            <div>
              <p className="text-sm font-semibold text-gray-800">{confirmedFile.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {confirmedFile.size
                  ? confirmedFile.size < 1024 * 1024
                    ? `${(confirmedFile.size / 1024).toFixed(1)}KB`
                    : `${(confirmedFile.size / (1024 * 1024)).toFixed(1)}MB`
                  : '—'}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">submitted at</p>
              <p className="text-xs font-medium text-gray-700">{formatDate(new Date())}</p>
            </div>
          </div>
        )}

        {children}
        {acceptLabel && <p className="text-xs text-gray-400 text-center">{acceptLabel}</p>}
      </div>

      {showFeedback && (
        <FeedbackModal feedbacks={feedbacks} onClose={() => setShowFeedback(false)} />
      )}
    </>
  );
};

// Mock feedback data (simulates supervisor responses)
const FEEDBACKS = {
  report: [
    { id: 1, text: 'Your progress is good but the report needs more diagrams and more details.', time: '10:03' },
    { id: 2, text: 'The new version of the report is better so u need now to work on the presentation', time: '20:03' },
  ],
};

const DeliverablesTab = () => {
  const timeLeft = useCountdown({ days: 10, hours: 10, minutes: 10, seconds: 5 });

  const [reportFile,       setReportFile]       = useState(null);
  const [repoUrl,          setRepoUrl]          = useState('');
  const [repoSubmitted,    setRepoSubmitted]    = useState(false);
  const [presentationFile, setPresentationFile] = useState(null);

  const submitted = [reportFile, repoSubmitted ? repoUrl : '', presentationFile].filter(Boolean).length;
  const total     = 3;

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">

        {/* Deliverables header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
            <Upload size={20} style={{ color: '#2D8FBF' }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Defense Deliverables Submission</h2>
            <p className="text-xs text-gray-500 mt-0.5">Submit all required materials for defense authorization</p>
          </div>
        </div>

        <div className="px-14 pb-14 space-y-6">

          {/* Countdown timer */}
          <div className="rounded-xl flex items-center justify-between px-5 py-4 mt-4"
            style={{ backgroundColor: '#E8F4FD', border: '1px solid #B8DCF0' }}>
            <div className="flex items-center gap-2">
              <Clock size={18} style={{ color: '#2D8FBF' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: '#2D8FBF' }}>Submission Deadline</p>
                <p className="text-xs" style={{ color: '#2D8FBF' }}>30 mars 2026 on 00:00</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-mono text-xl font-bold" style={{ color: '#1e3a5f' }}>
                {String(timeLeft.days).padStart(2,'0')}d{' '}
                {String(timeLeft.hours).padStart(2,'0')}h{' '}
                {String(timeLeft.minutes).padStart(2,'0')}min{' '}
                {String(timeLeft.seconds).padStart(2,'0')}s
              </p>
              <p className="text-xs" style={{ color: '#2D8FBF' }}>remaining</p>
            </div>
          </div>

          {/* Progress bar */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Submission Progress</span>
              <span className="text-xs font-semibold text-gray-700">{submitted}/{total}</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${(submitted / total) * 100}%`, backgroundColor: '#2D8FBF' }} />
            </div>
          </div>

          {/* 1. Final Report */}
          <DeliverableCard
            icon={FileText}
            title="Final Report"
            description="Upload your final project report in PDF format (max 50MB)"
            acceptLabel="PDF (Max 50MB)"
            confirmedFile={reportFile}
            feedbacks={FEEDBACKS.report}
          >
            <DropZone accept=".pdf" confirmedFile={reportFile} onConfirmedFile={setReportFile} />
          </DeliverableCard>

          {/* 2. Source Code Repository  */}
          <DeliverableCard
            icon={Code2}
            title="Source Code Repository"
            description="Provide the URL to your source code repository (GitHub, GitLab, etc.)"
          >
            <input
              type="url"
              placeholder="https://github.com/username/repository"
              value={repoUrl}
              onChange={(e) => { setRepoUrl(e.target.value); setRepoSubmitted(false); }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-gray-700 placeholder-gray-400"
            />
            <button
              onClick={() => { if (repoUrl.trim()) setRepoSubmitted(true); }}
              className="w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-colors"
              style={{ backgroundColor: '#1e3a5f' }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#152a4d'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1e3a5f'; }}
            >
              {repoSubmitted ? '✓ URL Submitted' : 'Submit Repository URL'}
            </button>
          </DeliverableCard>

          {/* 3. Defense Presentation  */}
          <DeliverableCard
            icon={Monitor}
            title="Defense Presentation"
            description="Upload your defense presentation in PDF or PPTX format (max 50MB)"
            acceptLabel="PDF, PPTX (Max 50MB)"
            confirmedFile={presentationFile}
          >
            <DropZone accept=".pdf,.pptx,.ppt" confirmedFile={presentationFile} onConfirmedFile={setPresentationFile} />
          </DeliverableCard>

        </div>
      </div>

      {/* Important information box */}
      <div className="rounded-xl px-5 py-4" style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <div className="flex items-start gap-3">
          <AlertCircle size={18} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: '#92400E' }}>Important information</p>
            <ul className="space-y-1">
              {[
                'All three deliverables must be submitted before requesting teacher review',
                'Your supervisor will validate each deliverable and provide feedback',
                'Once all deliverables are validated, your supervisor will submit defense authorization',
                'You will receive notifications at each step of the process',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: '#92400E' }}>
                  <span className="mt-1.5 rounded-full shrink-0 inline-block"
                    style={{ width: 5, height: 5, backgroundColor: '#D97706' }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// MAIN PAGE COMPONENT
// Renders the student documents & deliverables dashboard.
// Contains two tabs: Documents (shared resources) and Deliverables (submissions).
// ============================================================
const DocumentsPage = () => {
  const navigate = useNavigate();
  // Mock current user (replace with actual auth context)
  const [currentUser] = useState({
    id: 1, firstName: 'Student', lastName: '', email: 'student@esi-sba.dz', role: 'Student',
  });
  const [activeTab, setActiveTab] = useState('documents');

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <StudentSidebar />
      <div className="flex-1 flex flex-col ml-16 overflow-hidden">

        {/* Header with social links and profile dropdown */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track your projects</p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <a href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v" target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm" title="Facebook">
                <Facebook size={14} className="sm:w-5 sm:h-5" />
              </a>
              <a href="https://www.linkedin.com/in/https%3A%2F%2Fwww.linkedin.com%2Fschool%2Fesisba" target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm" title="LinkedIn">
                <Linkedin size={14} className="sm:w-5 sm:h-5" />
              </a>
              <ProfileDropdown user={currentUser} onLogout={handleLogout} onChangePassword={() => {}} />
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">

            {/* Tab switcher */}
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setActiveTab('documents')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-[#C0C0C0] text-[#4E4B4B] hover:bg-[#A0A0A0] transition-colors">
                <FolderOpen size={16} /> Documents
              </button>
              <button onClick={() => setActiveTab('deliverables')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-[#C0C0C0] text-[#4E4B4B] hover:bg-[#A0A0A0] transition-colors">
                <Upload size={16} /> Deliverables
              </button>
            </div>

            {/* Render active tab content */}
            {activeTab === 'documents'    && <DocumentsTab />}
            {activeTab === 'deliverables' && <DeliverablesTab />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DocumentsPage;