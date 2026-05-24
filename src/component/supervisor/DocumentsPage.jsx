import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import SupervisorSidebar from '../../layout/SupervisorSidebar';
import { ProfileDropdown } from './HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
   FolderOpen, Upload, FileText,
  Clock, Code2, Monitor, AlertCircle, ArrowUpFromLine,
  X, Check, Plus, Paperclip, Users, ChevronLeft, Loader2,
} from 'lucide-react';
import { FaFileCircleCheck } from 'react-icons/fa6';

const BASE     = 'http://localhost:3000';
const getToken  = () => localStorage.getItem('token');
const authHeader = () => ({ Authorization: `Bearer ${getToken()}` });

// ── Helpers ────────────────────────────────────────────────────────────────
const formatSize = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (str) => {
  if (!str) return '—';
  const d = new Date(str);
  return `${d.getDate().toString().padStart(2,'0')}-${(d.getMonth()+1).toString().padStart(2,'0')}-${d.getFullYear()}`;
};

const STATUS_BADGE = {
  PENDING:        { bg: '#FEF3C7', text: '#92400E', label: 'Pending review'  },
  APPROVED:       { bg: '#B4EDA8', text: '#166534', label: '✓ Approved'      },
  NEEDS_REVISION: { bg: '#FEE2E2', text: '#991B1B', label: 'Needs revision'  },
};

const TYPE_BADGE = {
  Tutorial:  { bg: '#B4EDA8', text: '#54B03B' },
  Reference: { bg: '#C2C2C2', text: '#787878' },
  Article:   { bg: '#FFE4B5', text: '#CC7B00' },
  Material:  { bg: '#E0D4FF', text: '#6B46C1' },
  Other:     { bg: '#FEF3C7', text: '#92400E' },
};

// ── Feedback Modal (read-only) ─────────────────────────────────────────────
const FeedbackModal = ({ feedbacks, onClose }) => (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
    <div className="bg-gray-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h3 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>Feedbacks</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
      </div>
      <div className="px-6 pb-6 space-y-3 max-h-80 overflow-y-auto">
        {feedbacks.map(fb => {
          const badge = STATUS_BADGE[fb.status] || STATUS_BADGE.PENDING;
          return (
            <div key={fb.id} className="rounded-xl px-4 py-3 border" style={{ backgroundColor: '#F3F4F6', borderColor: '#E5E5E5' }}>
              <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2"
                style={{ backgroundColor: badge.bg, color: badge.text }}>{badge.label}</span>
              <p className="text-sm text-gray-800">{fb.text}</p>
              <p className="text-xs text-gray-400 mt-1">{fb.supervisor_name} · {formatDate(fb.created_at)}</p>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

// ── Save Feedback Modal ────────────────────────────────────────────────────
const SaveFeedbackModal = ({ deliverable, onClose, onSaved }) => {
  const [text,    setText]    = useState('');
  const [status,  setStatus]  = useState('NEEDS_REVISION');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/documents/deliverables/${deliverable.id}/feedback`, {
        method:  'POST',
        headers: { ...authHeader(), 'Content-Type': 'application/json' },
        body:    JSON.stringify({ text: text.trim(), status }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      onSaved();
      onClose();
    } catch { alert('Server error'); }
    finally  { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>Save Feedback</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="px-6 pb-2 space-y-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Decision</label>
            <div className="flex gap-3">
              {[
                { value: 'APPROVED',       label: '✓ Approve',        bg: '#16A34A' },
                { value: 'NEEDS_REVISION', label: '↩ Needs Revision', bg: '#DC2626' },
              ].map(opt => (
                <button key={opt.value} onClick={() => setStatus(opt.value)}
                  className="flex-1 py-2 rounded-lg text-sm font-semibold text-white transition-opacity"
                  style={{ backgroundColor: opt.bg, opacity: status === opt.value ? 1 : 0.35 }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Comment</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={5}
              placeholder="Your comment about this deliverable..."
              className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] resize-none" />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-[#D1D5DB] hover:opacity-80">Cancel</button>
          <button onClick={handleSend} disabled={!text.trim() || loading}
            className="flex-1 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #2D8FBF)' }}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Authorization Modal ────────────────────────────────────────────────────
const AuthorizationModal = ({ team, onClose, onConfirm }) => {
  const [validations, setValidations] = useState({ report: false, sourceCode: false, presentation: false });
  const [comment,     setComment]     = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>Defense Authorization</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>
        <div className="px-6 pb-3">
          <p className="text-sm text-gray-600 border border-gray-200 rounded-lg p-2">
            This request will be sent to the administration for final approval.
          </p>
        </div>
        <div className="px-6 pb-3">
          <p className="text-sm font-semibold text-gray-700 mb-2">Readiness assessment</p>
          <textarea value={comment} onChange={e => setComment(e.target.value)} rows={3}
            placeholder="Write a comment for the admin about the readiness of this team"
            className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] resize-none" />
        </div>
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg text-sm font-semibold text-gray-600 bg-[#D1D5DB] hover:opacity-80">Cancel</button>
          <button
            onClick={() => { onConfirm(comment); onClose(); }}
            className="flex-1 py-2 rounded-lg text-sm font-bold text-white hover:opacity-90 disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #2D8FBF)' }}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Upload Document Modal ──────────────────────────────────────────────────
const UploadDocumentModal = ({ onClose, onUploaded, supervisorProjects }) => {
  const [category,     setCategory]     = useState('Tutorial');
  const [selectedFile, setSelectedFile] = useState(null);
  const [projectId,    setProjectId]    = useState('');  // '' = all teams
  const [dragActive,   setDragActive]   = useState(false);
  const [loading,      setLoading]      = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (file) => {
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { alert('File too large (max 50MB)'); return; }
    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) { alert('Please select a file.'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file',      selectedFile);
      formData.append('title',     selectedFile.name);
      formData.append('file_type', category);
      if (projectId) formData.append('project_id', projectId); // optional

      const res  = await fetch(`${BASE}/api/documents`, {
        method:  'POST',
        headers: authHeader(),
        body:    formData,
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message); return; }
      onUploaded();
      onClose();
    } catch { alert('Server error'); }
    finally  { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}>

        <div className="flex justify-between items-center pt-4 px-5">
          <h3 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>Upload a Document</h3>
          <button onClick={onClose}><X size={20} className="text-gray-400" /></button>
        </div>

        <div className="p-5 space-y-4">

          {/* Category */}
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#193962' }}>
              Category <span className="text-red-500">*</span>
            </label>
            <select value={category} onChange={e => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]">
              <option>Tutorial</option>
              <option>Reference</option>
              <option>Article</option>
              <option>Material</option>
              <option>Other</option>
            </select>
          </div>

          {/* Target team (optional) */}
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#193962' }}>
              Target team
              <span className="text-gray-400 font-normal ml-1">(optional — leave empty for all teams)</span>
            </label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]">
              <option value="">All my teams</option>
              {supervisorProjects.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>

          {/* File */}
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#193962' }}>
              File <span className="text-red-500">*</span>
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragEnter={handleDrag} onDragLeave={handleDrag}
              onDragOver={handleDrag}  onDrop={handleDrop}
              className={`cursor-pointer flex flex-col items-center justify-center py-6 rounded-lg border-2 border-dashed transition-colors
                ${dragActive ? 'border-[#2D8FBF] bg-gray-200' : 'border-gray-300 bg-gray-100'}`}>
              {selectedFile ? (
                <div className="text-center">
                  <FileText size={32} className="mx-auto text-[#2D8FBF]" />
                  <p className="text-sm font-medium text-gray-700 mt-1">{selectedFile.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(selectedFile.size)}</p>
                </div>
              ) : (
                <>
                  <Paperclip size={28} className="text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Click to upload or drag and drop</p>
                  <p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, PPT, PPTX (Max 50MB)</p>
                </>
              )}
              <input ref={fileInputRef} type="file"
                accept=".pdf,.doc,.docx,.ppt,.pptx" className="hidden"
                onChange={e => handleFileChange(e.target.files[0])} />
            </div>
          </div>
        </div>

        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-2 rounded-lg bg-gray-300 text-gray-800 font-medium hover:bg-gray-400">
            Cancel
          </button>
          <button onClick={handleUpload} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg, #18335E, #2D8FBF)' }}>
            {loading && <Loader2 size={14} className="animate-spin" />}
            Upload
          </button>
        </div>
      </div>
    </div>
  );
};
// ── Doc Card ───────────────────────────────────────────────────────────────
const DocCard = ({ doc }) => {
  const badge = TYPE_BADGE[doc.type] || TYPE_BADGE.Other;
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex flex-col gap-3 shadow-md hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#EFF6FF' }}>
            <FileText size={28} style={{ color: '#2D8FBF' }} />
          </div>
          <div>
            <p className="text-base font-bold text-gray-900 leading-tight">{doc.name}</p>
            <p className="text-sm text-gray-400 mt-1">{doc.uploaded_by} · {formatDate(doc.created_at)}</p>
            {/* Show target */}
            <p className="text-xs mt-1" style={{ color: '#2D8FBF' }}>
              {doc.project_title ? `→ ${doc.project_title}` : '→ All teams'}
            </p>
          </div>
        </div>
        <span className="text-sm font-medium px-3 py-1 rounded-full shrink-0"
          style={{ backgroundColor: badge.bg, color: badge.text }}>{doc.type}</span>
      </div>
      <a href={doc.file_path} target="_blank" rel="noopener noreferrer"
        className="text-sm font-medium" style={{ color: '#53C7FF' }}
        onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
        onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
        Download
      </a>
    </div>
  );
};

// ── Documents Tab ──────────────────────────────────────────────────────────
// DocumentsTab — add supervisorProjects prop back
const DocumentsTab = ({ supervisorProjects }) => {
  const [documents,       setDocuments]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [hasTeams,        setHasTeams]        = useState(null); // null = loading

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/documents`, { headers: authHeader() });
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  // ── Check whether this supervisor has at least one team ──────────────────
  useEffect(() => {
    fetch(`${BASE}/api/teams/my-supervisor-teams`, { headers: authHeader() })
      .then(r => r.json())
      .then(data => setHasTeams((data.teams || []).length > 0))
      .catch(() => setHasTeams(false));
  }, []);
  // ─────────────────────────────────────────────────────────────────────────

  useEffect(() => { fetchDocuments(); }, [fetchDocuments]);

  const uploadDisabled = hasTeams === false; // false = confirmed no teams; null = still loading

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: '#EFF6FF' }}>
            <FolderOpen size={32} style={{ color: '#2D8FBF' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#193962' }}>
              Shared Documents & Resources
            </h2>
            <p className="text-base text-gray-500 mt-0.5">Send documents to your teams</p>
          </div>
        </div>

        {/* ── Upload button — disabled with tooltip when no teams ── */}
        <div className="relative group">
          <button
            onClick={() => !uploadDisabled && setShowUploadModal(true)}
            disabled={uploadDisabled || hasTeams === null}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-sm font-semibold
                       hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#193962' }}>
            <Plus size={14} /> Upload a document
          </button>
          {uploadDisabled && (
            <div className="absolute right-0 top-full mt-1 w-64 bg-gray-800 text-white text-xs
                            rounded-lg px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100
                            transition-opacity pointer-events-none z-10">
              No teams are assigned to your project yet. You can upload documents once a team joins.
            </div>
          )}
        </div>
      </div>

      <div className="p-10">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin text-[#2D8FBF]" />
          </div>
        ) : documents.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No documents uploaded yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {documents.map(doc => <DocCard key={doc.id} doc={doc} />)}
          </div>
        )}
      </div>

      {showUploadModal && (
        <UploadDocumentModal
          onClose={() => setShowUploadModal(false)}
          onUploaded={fetchDocuments}
          supervisorProjects={supervisorProjects}
        />
      )}
    </div>
  );
};

// ── Deliverable Card (supervisor view) ─────────────────────────────────────
const DeliverableCard = ({ item, onFeedback }) => {
  const isSubmitted = !!item.file_path;
  const badge       = item.status ? (STATUS_BADGE[item.status] || STATUS_BADGE.PENDING) : null;

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
            {item.title === 'Source Code Repository'
              ? <Code2    size={20} style={{ color: '#1e3a5f' }} />
              : item.title === 'Defense Presentation'
              ? <Monitor  size={20} style={{ color: '#1e3a5f' }} />
              : <FileText size={20} style={{ color: '#1e3a5f' }} />}
          </div>
          <h3 className="text-base font-bold" style={{ color: '#1e3a5f' }}>{item.title}</h3>
        </div>
        {isSubmitted && (
          <button onClick={() => onFeedback(item)}
            className="px-4 py-1.5 rounded-lg text-sm font-bold text-white hover:opacity-90"
            style={{ backgroundColor: '#1e3a5f' }}>
            Feedback
          </button>
        )}
      </div>

      {isSubmitted ? (
        <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#F3F4F6' }}>
          <div className="flex items-center justify-between">
            <div>
              <a href={
                  item.file_type === 'url'
                    ? item.file_path
                    : item.file_path
                        ? item.file_path.includes('cloudinary.com')
                          ? item.file_path.replace('/upload/', '/upload/fl_attachment/')
                          : item.file_path
                        : '#'
                }
                target="_blank"
                rel="noopener noreferrer"
                download={item.file_type !== 'url'}
                className="text-sm font-semibold text-blue-600 hover:underline">
                {item.file_type === 'url' ? item.file_path : `Version ${item.version} — Download`}
              </a>
              <p className="text-xs text-gray-400 mt-0.5">v{item.version} · {formatDate(item.uploaded_at)}</p>
            </div>
            {badge && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: badge.bg, color: badge.text }}>
                {badge.label}
              </span>
            )}
          </div>
          {/* Latest feedback preview */}
          {item.feedbacks?.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
              {item.feedbacks.slice(-1).map(fb => {
                const fbBadge = STATUS_BADGE[fb.status] || STATUS_BADGE.PENDING;
                return (
                  <div key={fb.id} className="text-xs text-gray-600">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold mr-1"
                      style={{ backgroundColor: fbBadge.bg, color: fbBadge.text }}>
                      {fbBadge.label}
                    </span>
                    {fb.text}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl px-4 py-3 flex items-center gap-2" style={{ backgroundColor: '#FEF3C7' }}>
          <AlertCircle size={16} style={{ color: '#D97706' }} />
          <p className="text-sm text-yellow-700">Not submitted yet</p>
        </div>
      )}
    </div>
  );
};

// ── Team Deliverables Detail ───────────────────────────────────────────────
const TeamDeliverablesDetail = ({ team, onBack }) => {
  const [requestStatus, setRequestStatus] = useState(null); // null | 'PENDING' | 'APPROVED' | 'REJECTED'
  const [authLoading,   setAuthLoading]   = useState(false);
  const [deliverables,  setDeliverables]  = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [feedbackModal, setFeedbackModal] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authSent,      setAuthSent]      = useState(false);

  const TITLES = ['Final Report', 'Source Code Repository', 'Defense Presentation'];

  // Add this useEffect:
useEffect(() => {
  fetch(`${BASE}/api/soutenance/requests/team/${team.team_id}`, { headers: authHeader() })
    .then(r => r.ok ? r.json() : null)
    .then(data => { if (data?.request) setRequestStatus(data.request.status); })
    .catch(console.error);
}, [team.team_id]);

  const fetchDeliverables = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/documents/deliverables/all`, { headers: authHeader() });
      const data = await res.json();
      const all  = data.deliverables || [];

      // FIX: filter by team_id, not project_title — avoids mixing teams on the same project
      const teamDelivs = all.filter(d => d.team_id === team.team_id);
      setDeliverables(teamDelivs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, [team.team_id]);

  useEffect(() => { fetchDeliverables(); }, [fetchDeliverables]);

  const getDeliverable = (title) => deliverables.find(d => d.title === title);

  const submitted   = TITLES.filter(t => getDeliverable(t)).length;
  const progressPct = (submitted / 3) * 100;

    const handleSendAuthorization = async (comment) => {
  setAuthLoading(true);
  try {
    const res  = await fetch(`${BASE}/api/soutenance/requests`, {
      method:  'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body:    JSON.stringify({ team_id: team.team_id }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.message);
      return;
    }
    setRequestStatus('PENDING');
  } catch {
    alert('Server error');
  } finally {
    setAuthLoading(false);
  }
};

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100">
          <ChevronLeft size={20} className="text-gray-500" />
        </button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
          <FaFileCircleCheck size={32} style={{ color: '#2D8FBF' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#193962' }}>
            {team.leader_name} — Deliverables
          </h2>
          <p className="text-base text-gray-500 mt-0.5">{team.project_title}</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">Submission Progress</span>
            <span className="text-sm font-bold" style={{ color: '#1e3a5f' }}>{submitted}/3</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E0EDF7' }}>
            <div className="h-full rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%`, backgroundColor: '#1e3a5f' }} />
          </div>
        </div>

        {/* Deliverable cards */}
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-[#2D8FBF]" />
          </div>
        ) : (
          <div className="space-y-4">
            {TITLES.map(title => {
              const item = getDeliverable(title) || { title, file_path: null };
              return (
                <DeliverableCard
                  key={title}
                  item={item}
                  onFeedback={(d) => setFeedbackModal(d)}
                />
              );
            })}
          </div>
        )}

        {/* Defense authorization */}
{(() => {
  const alreadySent = requestStatus === 'PENDING' || requestStatus === 'APPROVED';
  const label = requestStatus === 'PENDING'  ? '⏳ Authorization Pending'
              : requestStatus === 'APPROVED' ? '✓ Authorization Approved'
              : requestStatus === 'REJECTED' ? '↩ Re-submit Authorization'
              : 'Send defense authorization request';
  return (
    <button
      onClick={() => !alreadySent && !authLoading && setShowAuthModal(true)}
      disabled={alreadySent || authLoading}
      className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60 flex items-center justify-center gap-2"
      style={{ backgroundColor: '#1e3a5f' }}>
      {authLoading && <Loader2 size={14} className="animate-spin" />}
      {label}
    </button>
  );
})()}


       
      </div>

      {feedbackModal && (
        <SaveFeedbackModal
          deliverable={feedbackModal}
          onClose={() => setFeedbackModal(null)}
          onSaved={fetchDeliverables}
        />
      )}
      {showAuthModal && (
        <AuthorizationModal
          team={team}
          onClose={() => setShowAuthModal(false)}
          onConfirm={handleSendAuthorization}
        />
      )}
    </div>
  );
};

// ── Deliverables Tab ───────────────────────────────────────────────────────
const DeliverablesTab = () => {
  const [teams,        setTeams]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(null);

  const fetchTeams = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/teams/my-supervisor-teams`, { headers: authHeader() });
      const data = await res.json();
      setTeams(data.teams || []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTeams(); }, [fetchTeams]);

  if (selectedTeam) {
    return <TeamDeliverablesDetail team={selectedTeam} onBack={() => setSelectedTeam(null)} />;
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
          <FaFileCircleCheck size={32} style={{ color: '#2D8FBF' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#193962' }}>Deliverables & Defense Authorization</h2>
          <p className="text-base text-gray-500 mt-0.5">Review and give feedback on your teams' submissions</p>
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
          teams.map(team => {
            const submitted   = team.submitted_count || 0;
            const progressPct = (submitted / 3) * 100;
            return (
              <div key={team.team_id}
                className="bg-white border border-gray-200 rounded-xl px-6 py-5 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTeam(team)}>
                <h3 className="text-base font-bold mb-0.5" style={{ color: '#1e3a5f' }}>
                  {team.leader_name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">{team.project_title}</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Users size={14} className="text-gray-400" />
                    <span className="text-xs text-gray-500">{team.member_count} member(s)</span>
                  </div>
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-xs text-gray-600 shrink-0">Submission Progress</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E0EDF7' }}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%`, backgroundColor: '#1e3a5f' }} />
                    </div>
                    <span className="text-xs font-medium text-gray-600 shrink-0">{submitted}/3</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const SupervisorDocumentsPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();
  const [activeTab,          setActiveTab]          = useState('documents');
  const [supervisorProjects, setSupervisorProjects] = useState([]);

  useEffect(() => {
    fetch(`${BASE}/api/projects/my`, { headers: authHeader() })
      .then(r => r.json())
      .then(d => setSupervisorProjects(d.projects || []))
      .catch(console.error);
  }, []);

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
              <ProfileDropdown user={currentUser} onLogout={handleLogout} onChangePassword={() => {}} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setActiveTab('documents')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                style={{
                  backgroundColor: activeTab === 'documents' ? '#1e3a5f' : '#C0C0C0',
                  color:           activeTab === 'documents' ? '#fff'    : '#4E4B4B',
                }}>
                <FolderOpen size={20} /> Documents
              </button>
              <button onClick={() => setActiveTab('deliverables')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
                style={{
                  backgroundColor: activeTab === 'deliverables' ? '#1e3a5f' : '#C0C0C0',
                  color:           activeTab === 'deliverables' ? '#fff'    : '#4E4B4B',
                }}>
                <FaFileCircleCheck size={20} /> Deliverables
              </button>
            </div>

            {activeTab === 'documents'    && <DocumentsTab supervisorProjects={supervisorProjects} />}
            {activeTab === 'deliverables' && <DeliverablesTab />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupervisorDocumentsPage;