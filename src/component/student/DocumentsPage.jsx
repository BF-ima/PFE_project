import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../../layout/StudentSidebar';
import { ProfileDropdown } from '../supervisor/HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
  Facebook, Linkedin, FolderOpen, Upload, FileText,
  Clock, Code2, Monitor, AlertCircle, ArrowUpFromLine, X, Check,
} from 'lucide-react';

const BASE = 'http://localhost:3000';

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem('token')}`,
});

// ── Map deliverable type key → title stored in DB ─────────────────────────
const TITLE_MAP = {
  REPORT:       'Final Report',
  PRESENTATION: 'Defense Presentation',
  REPOSITORY:   'Source Code Repository',
};


// ── Format file size ───────────────────────────────────────────────────────
const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
};

// ── Format date ────────────────────────────────────────────────────────────
const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${d.getDate().toString().padStart(2, '0')}-${(d.getMonth() + 1)
    .toString()
    .padStart(2, '0')}-${d.getFullYear()}`;
};

// ── Status badge config ────────────────────────────────────────────────────
const STATUS_BADGE = {
  PENDING:        { bg: '#FEF3C7', text: '#92400E', label: 'Pending review' },
  APPROVED:       { bg: '#B4EDA8', text: '#166534', label: '✓ Approved'     },
  NEEDS_REVISION: { bg: '#FEE2E2', text: '#991B1B', label: 'Needs revision' },
};

// ============================================================
// FEEDBACK MODAL
// ============================================================
const FeedbackModal = ({ feedbacks, onClose }) => {
  if (!feedbacks || feedbacks.length === 0) return null;
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onClose}>
      <div
        className="bg-gray-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>Supervisor's Feedback</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pb-6 space-y-3 max-h-80 overflow-y-auto">
          {[...feedbacks].reverse().map((fb, index, arr) => {
            const isNewest       = index === 0;
            const hasDoubleCheck = arr.length > 1 && !isNewest;
            const fbBadge        = STATUS_BADGE[fb.status] || STATUS_BADGE.NEEDS_REVISION;
            return (
              <div
                key={fb.id}
                className="rounded-xl px-4 py-3 border"
                style={{
                  backgroundColor: isNewest ? '#E5E7EB' : '#F3F4F6',
                  borderColor: '#E5E5E5',
                }}>
                <span
                  className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2"
                  style={{ backgroundColor: fbBadge.bg, color: fbBadge.text }}>
                  {fbBadge.label}
                </span>
                <p className="text-sm text-gray-800 leading-relaxed">{fb.text}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{fb.supervisor_name}</span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400">
                      {new Date(fb.created_at).toLocaleTimeString('en-GB', {
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {hasDoubleCheck && (
                      <div className="flex">
                        <Check size={12} style={{ color: '#2D8FBF' }} strokeWidth={2.5} />
                        <Check size={12} style={{ color: '#2D8FBF', marginLeft: -4 }} strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
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
// ============================================================
const ConfirmUploadModal = ({ file, onCancel, onConfirm }) => {
  if (!file) return null;
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
      onClick={onCancel}>
      <div
        className="bg-gray-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-7 pt-7 pb-4">
          <h3 className="text-2xl font-bold" style={{ color: '#1e3a5f' }}>Confirm Upload</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={22} />
          </button>
        </div>
        <div className="px-7 pb-4">
          <div
            className="flex items-center justify-between px-5 py-4 rounded-xl"
            style={{ backgroundColor: '#E5E7EB' }}>
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
            style={{ backgroundColor: '#D1D5DB' }}>
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #2D8FBF)' }}>
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DOCUMENTS TAB
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
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#EFF6FF' }}>
            <FileText size={28} style={{ color: '#2D8FBF' }} />
          </div>
          <div>
            <p className="text-base font-semibold text-gray-900 leading-tight">{doc.name}</p>
            <p className="text-sm text-gray-400 mt-1">{formatSize(doc.file_size)}</p>
          </div>
        </div>
        <span
          className="text-sm font-medium px-3 py-1 rounded-full shrink-0"
          style={{ backgroundColor: badge.bg, color: badge.text }}>
          {doc.type}
        </span>
      </div>
      <p className="text-sm text-gray-500">
        Uploaded by {doc.uploaded_by} on {formatDate(doc.created_at)}
      </p>
      <a
        href={doc.file_path}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm font-medium"
        style={{ color: '#53C7FF' }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}>
        Download
      </a>
    </div>
  );
};

const DocumentsTab = () => {
  const [documents, setDocuments] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    fetch(`${BASE}/api/documents`, { headers: authHeader() })
      .then((r) => r.json())
      .then((d) => setDocuments(d.documents || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: '#EFF6FF' }}>
          <FolderOpen size={20} style={{ color: '#2D8FBF' }} />
        </div>
        <div>
          <h2 className="text-base font-bold" style={{ color: '#193962' }}>
            Shared Documents & Resources
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">{documents.length} Documents</p>
        </div>
      </div>
      <div className="p-10">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#2D8FBF] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No documents available yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {documents.map((doc) => (
              <DocCard key={doc.id} doc={doc} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================
// DELIVERABLES TAB
// ============================================================

// ── DropZone ───────────────────────────────────────────────────────────────
const DropZone = ({ accept, onConfirmedFile, confirmedFile }) => {
  const inputRef                = useRef();
  const [dragging, setDragging] = useState(false);
  const [pending,  setPending]  = useState(null);

  const handlePick    = (f) => { if (f) setPending(f); };
  const handleDrop    = (e) => { e.preventDefault(); setDragging(false); handlePick(e.dataTransfer.files[0]); };
  const handleConfirm = () => { onConfirmedFile(pending); setPending(null); };

  const submittedName = confirmedFile
    ? confirmedFile.title || confirmedFile.file_name || confirmedFile.name
    : null;

  return (
    <>
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className="cursor-pointer flex flex-col items-center justify-center py-6 rounded-lg border-2 border-dashed transition-colors"
        style={{
          borderColor:     dragging ? '#2D8FBF' : '#D1D5DB',
          backgroundColor: dragging ? '#EFF6FF' : '#FAFAFA',
        }}>
        <ArrowUpFromLine size={24} className="text-gray-400 mb-2" />
        <p className="text-xs text-gray-500">Click to upload or drag and drop</p>
        {submittedName && (
          <p className="text-xs font-medium mt-1" style={{ color: '#2D8FBF' }}>
            ✓ {submittedName}
          </p>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => { if (e.target.files[0]) handlePick(e.target.files[0]); }}
        />
      </div>
      {pending && (
        <ConfirmUploadModal
          file={pending}
          onCancel={() => setPending(null)}
          onConfirm={handleConfirm}
        />
      )}
    </>
  );
};

//  Deadline Table (shown inside each deliverable card) ─────────────
const DeadlineTable = ({ deadlines }) => {
  if (!deadlines || deadlines.length === 0) {
    return (
      <p className="text-xs text-gray-400 italic">
        No deadlines set by your supervisor yet.
      </p>
    );
  }
  return (
    <div className="space-y-1.5">
      {deadlines.map((dl) => {
        // ✅ Safely extract YYYY-MM-DD regardless of whether it's a date or full ISO string
        const dateOnly = dl.deadline_date?.slice(0, 10);
        const timeOnly = dl.deadline_time?.slice(0, 5);
        const isPast   = new Date(`${dateOnly}T${dl.deadline_time}`) < new Date();

        return (
          <div
            key={dl.id}
            className="flex items-center justify-between px-3 py-2 rounded-lg"
            style={{
              backgroundColor: isPast ? '#FEF2F2' : '#F0F9FF',
              border: `1px solid ${isPast ? '#FECACA' : '#BAE6FD'}`,
            }}>
            <span
              className="text-xs font-semibold mx-2"
              style={{ color: isPast ? '#DC2626' : '#1e3a5f' }}>
              {new Date(`${dateOnly}T00:00:00`).toLocaleDateString('en-GB', {
                day: 'numeric', month: 'short', year: 'numeric',
              })}{' '}
              at {timeOnly}
            </span>
            {isPast && (
              <span className="text-xs text-red-500 font-semibold shrink-0">Passed</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ── DeliverableCard ────────────────────────────────────────────────────────
const DeliverableCard = ({
  icon: Icon,
  title,
  description,
  children,
  acceptLabel,
  confirmedFile,
  feedbacks,
  isLeader,
  deadlines,
}) => {
  const [showFeedback, setShowFeedback] = useState(false);

  const displayName = confirmedFile
    ? confirmedFile.title || confirmedFile.file_name || confirmedFile.name || 'Submitted file'
    : null;

  const displayDate = confirmedFile
    ? formatDate(confirmedFile.uploaded_at || confirmedFile.submitted_at || new Date())
    : null;

  const displaySize = confirmedFile
    ? formatSize(confirmedFile.file_size || confirmedFile.size)
    : null;

  const status     = confirmedFile?.status || (confirmedFile ? 'PENDING' : null);
  const version    = confirmedFile?.version;
  const badge      = status ? STATUS_BADGE[status] || STATUS_BADGE.PENDING : null;
  const isApproved = status === 'APPROVED';
  const fileHref   = confirmedFile?.file_path || null;

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-3">

        {/* Card header */}
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
          {feedbacks && feedbacks.length > 0 && (
            <button
              onClick={() => setShowFeedback(true)}
              className="shrink-0 px-4 py-2 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: '#1e3a5f' }}>
              Supervisor's Feedback
            </button>
          )}
        </div>

        {/* deadlines section */}
        <div>
        
          <DeadlineTable deadlines={deadlines} />
        </div>

        {/* Submitted file info — clickable → opens file */}
        {confirmedFile && (
          <a
            href={fileHref}
            target="_blank"
            rel="noopener noreferrer"
            className="block hover:opacity-80 transition-opacity cursor-pointer">
            <div
              className="flex items-center justify-between px-4 py-3 rounded-xl"
              style={{ backgroundColor: '#F3F4F6' }}>
              <div>
                <p className="text-sm font-semibold text-gray-800">{displayName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  {version && (
                    <span className="text-xs text-gray-400">version{version}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {badge && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: badge.bg, color: badge.text }}>
                    {badge.label}
                  </span>
                )}
                <p className="text-xs text-gray-400">submitted {displayDate}</p>
              </div>
            </div>
          </a>
        )}

        {/* Approved banner */}
        {isApproved && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{ backgroundColor: '#F0FDF4', border: '1px solid #BBF7D0' }}>
            <Check size={14} style={{ color: '#16A34A' }} />
            <p className="text-xs font-medium" style={{ color: '#15803D' }}>
              This deliverable has been approved by your supervisor. No further uploads needed.
            </p>
          </div>
        )}

        {/* Upload controls — only for leader, only when not approved */}
        {!isApproved && isLeader && children}
        {!isApproved && isLeader && acceptLabel && (
          <p className="text-xs text-gray-400 text-center">{acceptLabel}</p>
        )}

        {/* Non-leader notice */}
        {!isApproved && !isLeader && !confirmedFile && (
          <div
            className="flex items-center gap-2 px-4 py-3 rounded-xl"
            style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <AlertCircle size={14} style={{ color: '#94A3B8' }} />
            <p className="text-xs text-gray-400">Only the team leader can upload deliverables.</p>
          </div>
        )}
      </div>

      {showFeedback && (
        <FeedbackModal feedbacks={feedbacks} onClose={() => setShowFeedback(false)} />
      )}
    </>
  );
};

// ── DeliverablesTab ────────────────────────────────────────────────────────
const DeliverablesTab = ({ isLeader }) => {
  const [deliverables,    setDeliverables]    = useState([]);
  const [deadlinesByType, setDeadlinesByType] = useState({});
  const [repoUrl,         setRepoUrl]         = useState('');
  const [uploading,       setUploading]       = useState({});
  const [loading,         setLoading]         = useState(true);


  // ── Fetch deliverables + per-team deadlines on mount ──────────────────────
  useEffect(() => {
    const token   = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${BASE}/api/documents/deliverables/my`,         { headers }).then((r) => r.json()),
      fetch(`${BASE}/api/deliverable-deadlines/for-student`, { headers }).then((r) => r.json()),
    ])
      .then(([delivData, dlData]) => {
        const items = delivData.deliverables || [];
        setDeliverables(items);

        // Pre-fill repo URL if already submitted
        const repo = items.find((d) => d.title === TITLE_MAP.REPOSITORY);
        if (repo?.file_path) setRepoUrl(repo.file_path);

        // Group deadlines by deliverable_type
        const grouped = {};
        (dlData.deadlines || []).forEach((dl) => {
          if (!grouped[dl.deliverable_type]) grouped[dl.deliverable_type] = [];
          grouped[dl.deliverable_type].push(dl);
        });
        setDeadlinesByType(grouped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // ── Get a deliverable by type key ─────────────────────────────────────────
  const getDeliverable = (typeKey) =>
    deliverables.find((d) => d.title === TITLE_MAP[typeKey]);

  // ── Refresh helper ─────────────────────────────────────────────────────────
  const refreshDeliverables = async () => {
    const token = localStorage.getItem('token');
    const res   = await fetch(`${BASE}/api/documents/deliverables/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data  = await res.json();
    const items = data.deliverables || [];
    setDeliverables(items);
    const repo = items.find((d) => d.title === TITLE_MAP.REPOSITORY);
    if (repo?.file_path) setRepoUrl(repo.file_path);
  };

  // ── Upload file deliverable ────────────────────────────────────────────────
  const handleUpload = async (typeKey, file) => {
    setUploading((prev) => ({ ...prev, [typeKey]: true }));
    try {
      const token    = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file',  file);
      formData.append('type',  typeKey);
      formData.append('title', TITLE_MAP[typeKey]);

      const res  = await fetch(`${BASE}/api/documents/deliverables/upload`, {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    formData,
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || 'Upload failed'); return; }
      await refreshDeliverables();
    } catch (err) {
      console.error('upload error:', err);
      alert('Server error during upload');
    } finally {
      setUploading((prev) => ({ ...prev, [typeKey]: false }));
    }
  };

  // ── Submit repo URL ────────────────────────────────────────────────────────
  const handleRepoSubmit = async () => {
    if (!repoUrl.trim()) return;
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(`${BASE}/api/documents/deliverables/repo`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ repo_url: repoUrl }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || 'Failed to submit URL'); return; }
      await refreshDeliverables();
      alert('Repository URL submitted successfully!');
    } catch (err) {
      console.error('repoSubmit error:', err);
      alert('Server error');
    }
  };

  if (loading) return (
    <div className="flex justify-center py-16">
      <div className="w-8 h-8 border-4 border-[#2D8FBF] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const reportDeliverable       = getDeliverable('REPORT');
  const repoDeliverable         = getDeliverable('REPOSITORY');
  const presentationDeliverable = getDeliverable('PRESENTATION');

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#EFF6FF' }}>
            <Upload size={20} style={{ color: '#2D8FBF' }} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900">Defense Deliverables Submission</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Submit all required materials for defense authorization
            </p>
          </div>
        </div>

        <div className="px-14 pb-14 space-y-6 mt-4">

          {/* Progress */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-gray-700">Submission Progress</span>
              <span className="text-xs font-semibold text-gray-700">{deliverables.length}/3</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width:           `${(deliverables.length / 3) * 100}%`,
                  backgroundColor: '#2D8FBF',
                }}
              />
            </div>
          </div>

          {/* 1. Final Report */}
          <DeliverableCard
            icon={FileText}
            title="Final Report"
            description="Upload your final project report in PDF format (max 50MB)"
            acceptLabel="PDF (Max 50MB)"
            confirmedFile={reportDeliverable}
            feedbacks={reportDeliverable?.feedbacks || []}
            isLeader={isLeader}
            deadlines={deadlinesByType['Final Report'] || []}>
            <DropZone
              accept=".pdf"
              confirmedFile={reportDeliverable}
              onConfirmedFile={(file) => handleUpload('REPORT', file)}
            />
            {uploading['REPORT'] && (
              <p className="text-xs text-center text-blue-500">Uploading...</p>
            )}
          </DeliverableCard>

          {/* 2. Source Code Repository */}
          <DeliverableCard
            icon={Code2}
            title="Source Code Repository"
            description="Provide the URL to your source code repository (GitHub, GitLab, etc.)"
            confirmedFile={repoDeliverable}
            feedbacks={repoDeliverable?.feedbacks || []}
            isLeader={isLeader}
            deadlines={deadlinesByType['Source Code Repository'] || []}>
            {repoDeliverable?.status !== 'APPROVED' && (
              <>
                <input
                  type="url"
                  placeholder="https://github.com/username/repository"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] text-gray-700 placeholder-gray-400"
                />
                <button
                  onClick={handleRepoSubmit}
                  className="w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-colors"
                  style={{ backgroundColor: '#1e3a5f' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#152a4d'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1e3a5f'; }}>
                  {repoDeliverable ? '✓ Update Repository URL' : 'Submit Repository URL'}
                </button>
              </>
            )}
          </DeliverableCard>

          {/* 3. Defense Presentation */}
          <DeliverableCard
            icon={Monitor}
            title="Defense Presentation"
            description="Upload your defense presentation in PDF or PPTX format (max 50MB)"
            acceptLabel="PDF, PPTX (Max 50MB)"
            confirmedFile={presentationDeliverable}
            feedbacks={presentationDeliverable?.feedbacks || []}
            isLeader={isLeader}
            deadlines={deadlinesByType['Defense Presentation'] || []}>
            <DropZone
              accept=".pdf,.pptx,.ppt"
              confirmedFile={presentationDeliverable}
              onConfirmedFile={(file) => handleUpload('PRESENTATION', file)}
            />
            {uploading['PRESENTATION'] && (
              <p className="text-xs text-center text-blue-500">Uploading...</p>
            )}
          </DeliverableCard>

        </div>
      </div>

      {/* Important info */}
      <div
        className="rounded-xl px-5 py-4"
        style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A' }}>
        <div className="flex items-start gap-3">
          <AlertCircle size={18} style={{ color: '#D97706', flexShrink: 0, marginTop: 1 }} />
          <div>
            <p className="text-sm font-semibold mb-2" style={{ color: '#92400E' }}>
              Important information
            </p>
            <ul className="space-y-1">
              {[
                "All three deliverables must be submitted before requesting teacher review",
                "Your supervisor will validate each deliverable and provide feedback",
                "If marked 'Needs Revision', you can re-upload an improved version",
                'Once approved, a deliverable is locked — no further uploads are allowed',
                'Once all deliverables are validated, your supervisor will submit defense authorization',
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: '#92400E' }}>
                  <span
                    className="mt-1.5 rounded-full shrink-0 inline-block"
                    style={{ width: 5, height: 5, backgroundColor: '#D97706' }}
                  />
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
// MAIN PAGE
// ============================================================
const DocumentsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [activeTab, setActiveTab] = useState('documents');
  const [isLeader,  setIsLeader]  = useState(false);
  const [assignedProject, setAssignedProject] = useState(null);
  const [checkingAssignment, setCheckingAssignment] = useState(true);

useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) return;
  fetch(`${BASE}/api/distribution/my-result`, {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(r => r.json())
    .then(data => {
      if (data.assignment) setAssignedProject(data.assignment);
    })
    .catch(console.error)
    .finally(() => setCheckingAssignment(false));
}, []);

  // ── Determine if current user is team leader ───────────────────────────────
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch(`${BASE}/api/documents/deliverables/is-leader`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => setIsLeader(data.isLeader === true))
      .catch(() => setIsLeader(false));
  }, []);

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
              <a
                href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm">
                <Facebook size={14} className="sm:w-5 sm:h-5" />
              </a>
              <a
                href="https://www.linkedin.com/in/https%3A%2F%2Fwww.linkedin.com%2Fschool%2Fesisba"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm">
                <Linkedin size={14} className="sm:w-5 sm:h-5" />
              </a>
              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={() => {}}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
  <div className="max-w-6xl mx-auto">

    {checkingAssignment ? (
      <div className="flex justify-center py-24">
        <div className="w-8 h-8 border-4 border-[#2D8FBF] border-t-transparent rounded-full animate-spin" />
      </div>

    ) : !assignedProject ? (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-orange-50 flex items-center justify-center mx-auto mb-5">
            <FolderOpen size={32} className="text-orange-400" />
          </div>
          <h3 className="text-xl font-bold text-[#1e3a5f] mb-2">
            No Project Assigned Yet
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            This section will be available once your team has been assigned a project.
            Please check back after the project allocation is complete.
          </p>
        </div>
      </div>

    ) : (
      <>

            {/* Tab switcher */}
            <div className="flex items-center gap-3 mb-6">
              <button
                onClick={() => setActiveTab('documents')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors
                  ${activeTab === 'documents'
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-[#C0C0C0] text-[#4E4B4B] hover:bg-[#A0A0A0]'}`}>
                <FolderOpen size={16} /> Documents
              </button>
              <button
                onClick={() => setActiveTab('deliverables')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors
                  ${activeTab === 'deliverables'
                    ? 'bg-[#1e3a5f] text-white'
                    : 'bg-[#C0C0C0] text-[#4E4B4B] hover:bg-[#A0A0A0]'}`}>
                <Upload size={16} /> Deliverables
              </button>
            </div>

            {activeTab === 'documents'    && <DocumentsTab />}
            {activeTab === 'deliverables' && <DeliverablesTab isLeader={isLeader} />}

      </>
    )}

  </div>
</main>
      </div>
    </div>
  );
};

export default DocumentsPage;