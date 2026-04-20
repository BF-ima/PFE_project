import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SupervisorSidebar from '../../layout/SupervisorSidebar';
import { ProfileDropdown } from './HomePage';
import {
  Facebook, Linkedin, FolderOpen, Upload, FileText,
  Clock, Code2, Monitor, AlertCircle, ArrowUpFromLine, X, Check, Plus, Paperclip, Users, ChevronLeft
} from 'lucide-react';
import { FaFileCircleCheck } from "react-icons/fa6";

// ============================================================
// CONFIRM UPLOAD MODAL
// Shows a confirmation dialog before uploading a file 
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
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600"><X size={22} /></button>
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
          <p className="text-sm text-gray-600 leading-relaxed">Are you ready to submit this file? Your supervisor will be notified immediately.</p>
        </div>
        <div className="flex items-center gap-3 px-7 pb-7">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-600 bg-[#D1D5DB] hover:opacity-80">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2D8FBF)' }}>Upload</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DOCUMENTS TAB
// Displays shared documents for teams with download functionality
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
            <p className="text-base font-bold text-gray-900 leading-tight">{doc.name}</p>
            <p className="text-sm text-gray-400 mt-1">{doc.size}</p>
          </div>
        </div>
        <span className="text-sm font-medium px-3 py-1 rounded-full shrink-0"
          style={{ backgroundColor: badge.bg, color: badge.text }}>{doc.type}</span>
      </div>
      <p className="text-sm text-gray-500 font-bold">Sent to: {doc.teamId}</p>
      <a href={doc.url || '#'} download className="text-sm font-medium" style={{ color: '#53C7FF' }}
        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}>
        Download
      </a>
    </div>
  );
};

// ============================================================
// UPLOAD DOCUMENT MODAL
// Modal for uploading new documents 
// radio buttons are used for team selection
// ============================================================
const UploadDocumentModal = ({ onClose, onUpload, teamsList = [] }) => {
  const [category, setCategory] = useState('Tutorial');
  const [selectedFile, setSelectedFile] = useState(null);
  const [targetAudience, setTargetAudience] = useState('all');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const teams = teamsList.length ? teamsList : ['Team ID 1', 'Team ID 2', 'Team ID 3'];

  const handleFileChange = (file) => {
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) { alert('File size must be less than 10MB'); return; }
    const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowed.includes(ext)) { alert('Allowed file types: PDF, DOC, DOCX, PPT, PPTX'); return; }
    setSelectedFile(file);
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
  };

  const handleUpload = () => {
    if (!selectedFile) { alert('Please select a file.'); return; }
    onUpload({
      id: Date.now(), name: selectedFile.name,
      size: (selectedFile.size / (1024 * 1024)).toFixed(1) + 'MB',
      type: category,
      teamId: targetAudience === 'all' ? 'All teams' : targetAudience,
      date: new Date().toLocaleDateString('en-GB'),
      url: URL.createObjectURL(selectedFile),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-100 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center pt-4 px-5">
          <h3 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>Upload a Document</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="p-5 space-y-4">
          {/* Category */}
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#193962' }}>Category <span className="text-red-500">*</span></label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg p-2 bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]">
              <option>Tutorial</option><option>Reference</option><option>Article</option><option>Material</option>
            </select>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-bold mb-1" style={{ color: '#193962' }}>File <span className="text-red-500">*</span></label>
            <div onClick={() => fileInputRef.current?.click()} onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
              className={`cursor-pointer flex flex-col items-center justify-center py-6 rounded-lg border-2 border-dashed transition-colors ${dragActive ? 'border-[#2D8FBF] bg-gray-200' : 'border-gray-300 bg-gray-100'}`}>
              {selectedFile ? (
                <div className="text-center"><FileText size={32} className="mx-auto text-[#2D8FBF]" /><p className="text-sm font-medium text-gray-700 mt-1">{selectedFile.name}</p><p className="text-xs text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p></div>
              ) : (
                <><Paperclip size={28} className="text-gray-400 mb-2" /><p className="text-sm text-gray-600">Click to upload or drag and drop</p><p className="text-xs text-gray-400 mt-1">PDF, DOC, DOCX, PPT, PPTX (Max 10MB)</p></>
              )}
              <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx" className="hidden" onChange={(e) => handleFileChange(e.target.files[0])} />
            </div>
          </div>

          {/* Target audience with radio buttons */}
          <div>
            <label className="block text-sm font-bold mb-2" style={{ color: '#193962' }}>Target audience <span className="text-red-500">*</span></label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="audience"
                  value="all"
                  checked={targetAudience === 'all'}
                  onChange={() => setTargetAudience('all')}
                  className="w-4 h-4 appearance-none border border-gray-400 rounded-md bg-gray-200 checked:bg-gray-500 checked:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
                />
                <span className="text-sm">all</span>
              </label>
              {teams.map((team) => (
                <label key={team} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="audience"
                    value={team}
                    checked={targetAudience === team}
                    onChange={() => setTargetAudience(team)}
                    className="w-4 h-4 appearance-none border border-gray-400 rounded-md bg-gray-200 checked:bg-gray-500 checked:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-400 transition-all"
                  />
                  <span className="text-sm">{team}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="px-5 pb-5 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-lg bg-gray-300 text-gray-800 font-medium hover:bg-gray-400 transition">Cancel</button>
          <button onClick={handleUpload} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white hover:opacity-90" style={{ background: 'linear-gradient(135deg, #18335E, #2D8FBF)' }}>Upload</button>
        </div>
      </div>
    </div>
  );
};

const DocumentsTab = ({ documents, onUploadDocument }) => {
  const [showUploadModal, setShowUploadModal] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
            <FolderOpen size={32} style={{ color: '#2D8FBF' }} />
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ color: '#193962' }}>Shared Documents & Resources</h2>
            <p className="text-base text-gray-500 mt-0.5">send documents for your teams</p>
          </div>
        </div>
        <button onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#193962' }}>
          <Plus size={14} /> Upload a document
        </button>
      </div>
      <div className="p-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {documents.map(doc => <DocCard key={doc.id} doc={doc} />)}
        </div>
      </div>
      {showUploadModal && <UploadDocumentModal onClose={() => setShowUploadModal(false)} onUpload={onUploadDocument} />}
    </div>
  );
};

// ============================================================
// SAVE FEEDBACK MODAL
// Allows supervisor to write and send feedback for a deliverable
// ============================================================
const SaveFeedbackModal = ({ onClose, onSend }) => {
  const [text, setText] = useState('');

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>Save a Feedback</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>
        <div className="px-6 pb-2">
          <p className="text-sm font-semibold text-gray-700 mb-1">Comment</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={5}
            placeholder="Your comment and notes about the progress or the deliverable"
            className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] resize-none"
          />
        </div>
        <div className="flex gap-3 px-6 pb-6 pt-2">
          <button onClick={onClose} className="flex-1 py-1.5 rounded-lg text-base font-semibold text-gray-600 bg-[#D1D5DB] hover:opacity-80 transition">Cancel</button>
          <button onClick={() => { if (text.trim()) { onSend(text.trim()); onClose(); } }} className="flex-1 py-1.5 rounded-lg text-base font-bold text-white hover:opacity-90 transition" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2D8FBF)' }}>Send</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// DEFENSE AUTHORIZATION MODAL
// Supervisor confirms that all deliverables are validated and can send authorization request
// ============================================================
const AuthorizationModal = ({ team, onClose, onConfirm }) => {
  const [validations, setValidations] = useState({ report: false, sourceCode: false, presentation: false });
  const [comment, setComment] = useState('');
  const allValidated = validations.report && validations.sourceCode && validations.presentation;

  const handleConfirm = () => { if (allValidated) { onConfirm({ validations, comment }); onClose(); } };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-100 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h3 className="text-xl font-bold" style={{ color: '#1e3a5f' }}>Defense Authorization</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <div className="px-6 pb-3  "><p className="text-sm text-gray-600 leading-relaxed border border-gray-200 rounded-lg p-2 ">This request will be sent to the administration for final approval.</p></div>
        <div className="px-6 pb-3">
          <p className="text-sm font-semibold text-gray-700 mb-2">Deliverables validation</p>
          <div className="space-y-2">
            <label className="flex items-center gap-2"><input type="checkbox" checked={validations.report} onChange={() => setValidations({ ...validations, report: !validations.report })} className="w-4 h-4 rounded border-gray-300 text-[#2D8FBF] focus:ring-[#2D8FBF]" /><span className="text-sm text-gray-700">Final report validated</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={validations.sourceCode} onChange={() => setValidations({ ...validations, sourceCode: !validations.sourceCode })} className="w-4 h-4 rounded border-gray-300 text-[#2D8FBF] focus:ring-[#2D8FBF]" /><span className="text-sm text-gray-700">Source code validated</span></label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={validations.presentation} onChange={() => setValidations({ ...validations, presentation: !validations.presentation })} className="w-4 h-4 rounded border-gray-300 text-[#2D8FBF] focus:ring-[#2D8FBF]" /><span className="text-sm text-gray-700">Presentation validated</span></label>
          </div>
        </div>
        <div className="px-6 pb-3">
          <p className="text-sm font-semibold text-gray-700 mb-2">Readiness assessment</p>
          <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Write a comment for the admin about the readiness of this team" className="w-full border border-gray-300 rounded-xl p-3 text-sm bg-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] resize-none" />
        </div>
        <div className="flex gap-3 px-6 pb-6 pt-2">
  <button 
    onClick={onClose} 
    className="flex-1 py-1.5 rounded-lg text-base font-semibold text-gray-600 bg-[#D1D5DB] hover:opacity-80 transition"
  >
    Cancel
  </button>
  <button 
    onClick={handleConfirm} 
    disabled={!allValidated} 
    className={`flex-1 py-1.5 rounded-lg text-base font-bold text-white transition-opacity hover:opacity-90 ${!allValidated ? 'opacity-50 cursor-not-allowed' : ''}`} 
    style={{ background: 'linear-gradient(135deg, #1e3a5f, #2D8FBF)' }}
  >
    Send
  </button>
</div>
      </div>
    </div>
  );
};

// ============================================================
// TEAM DELIVERABLES DETAIL PAGE
// Shows detailed view for a specific team: deliverables, progress, countdown, feedback
// ============================================================
const MOCK_DELIVERABLES = {
  1: {
    deadline: '30 mars 2026 at 00:00',
    submitted: 3,
    total: 3,
    items: [
      { id: 'final-report', title: 'Final Report', icon: 'file', type: 'file', fileName: "File's name", fileSize: '2.5MB', submittedAt: '21-04-2026', feedbacks: [] },
      { id: 'source-code', title: 'Source Code Repository', icon: 'code', type: 'link', link: 'https://github.com/username/repository', submittedAt: '21-04-2026', feedbacks: [] },
      { id: 'defense-presentation', title: 'Defense Presentation', icon: 'monitor', type: 'file', fileName: "File's name", fileSize: '2.5MB', submittedAt: '21-04-2026', feedbacks: [] },
    ],
  },
  2: {
    deadline: '30 mars 2026 at 00:00',
    submitted: 1,
    total: 3,
    items: [
      { id: 'final-report', title: 'Final Report', icon: 'file', type: 'file', fileName: "File's name", fileSize: '1.2MB', submittedAt: '21-04-2026', feedbacks: [] },
      { id: 'source-code', title: 'Source Code Repository', icon: 'code', type: 'link', link: null, submittedAt: null, feedbacks: [] },
      { id: 'defense-presentation', title: 'Defense Presentation', icon: 'monitor', type: 'file', fileName: null, fileSize: null, submittedAt: null, feedbacks: [] },
    ],
  },
  3: {
    deadline: '30 mars 2026 at 00:00',
    submitted: 0,
    total: 3,
    items: [
      { id: 'final-report', title: 'Final Report', icon: 'file', type: 'file', fileName: null, fileSize: null, submittedAt: null, feedbacks: [] },
      { id: 'source-code', title: 'Source Code Repository', icon: 'code', type: 'link', link: null, submittedAt: null, feedbacks: [] },
      { id: 'defense-presentation', title: 'Defense Presentation', icon: 'monitor', type: 'file', fileName: null, fileSize: null, submittedAt: null, feedbacks: [] },
    ],
  },
};

const DeliverableIcon = ({ icon }) => {
  const style = { color: '#1e3a5f' };
  if (icon === 'code') return <Code2 size={20} style={style} />;
  if (icon === 'monitor') return <Monitor size={20} style={style} />;
  return <FileText size={20} style={style} />;
};

const DeliverableCard = ({ item, onSendFeedback }) => {
  const isSubmitted = item.type === 'file' ? !!item.fileName : !!item.link;

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-6 py-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#EFF6FF' }}>
            <DeliverableIcon icon={item.icon} />
          </div>
          <h3 className="text-base font-bold" style={{ color: '#1e3a5f' }}>{item.title}</h3>
        </div>
        {isSubmitted && (
          <button
            onClick={() => onSendFeedback(item)}
            className="px-4 py-1.5 rounded-lg text-sm font-bold text-white hover:opacity-90 transition-opacity"
            style={{ backgroundColor: '#1e3a5f' }}
          >
            Feedback
          </button>
        )}
      </div>
      {isSubmitted ? (
        <div className="rounded-xl px-4 py-3" style={{ backgroundColor: '#F3F4F6' }}>
          {item.type === 'file' ? (
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-semibold text-gray-700">{item.fileName}</p><p className="text-sm text-gray-400 mt-0.5">{item.fileSize}</p></div>
              <div className="text-right"><p className="text-xs text-gray-400">submitted at</p><p className="text-xs font-medium text-gray-600">{item.submittedAt}</p></div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div><p className="text-xs text-gray-500 mb-1">The link :</p><a href={item.link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium" style={{ color: '#2D8FBF' }}>{item.link}</a></div>
              <div className="text-right"><p className="text-xs text-gray-400">submitted at</p><p className="text-xs font-medium text-gray-600">{item.submittedAt}</p></div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl px-4 py-3 flex items-center gap-2" style={{ backgroundColor: '#FEF3C7' }}><AlertCircle size={16} style={{ color: '#D97706' }} /><p className="text-sm text-yellow-700">Not submitted yet</p></div>
      )}
    </div>
  );
};

const TeamDeliverablesDetail = ({ team, onBack }) => {
  const data = MOCK_DELIVERABLES[team.id] || MOCK_DELIVERABLES[1];
  const [deliverables, setDeliverables] = useState(data.items);
  const [sendFeedbackModal, setSendFeedbackModal] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authSent, setAuthSent] = useState(false);

  const progressPct = (data.submitted / data.total) * 100;

  const [timeLeft, setTimeLeft] = useState({ days: 10, hours: 10, minutes: 10, seconds: 5 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSendFeedback = (item) => setSendFeedbackModal(item);

  const handleFeedbackSubmit = (text) => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setDeliverables(prev => prev.map(d =>
      d.id === sendFeedbackModal.id
        ? { ...d, feedbacks: [...d.feedbacks, { id: Date.now(), text, time }] }
        : d
    ));
    setSendFeedbackModal(null);
  };

  const handleAuthorizationConfirm = (data) => {
    console.log('Authorization data:', { team, ...data });
    setAuthSent(true);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <button onClick={onBack} className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"><ChevronLeft size={20} className="text-gray-500" /></button>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
          <FaFileCircleCheck size={32} style={{ color: '#2D8FBF' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#193962' }}>Deliverables and Defense Authorization</h2>
          <p className="text-base text-gray-500 mt-0.5">Submit and track feedback and send defense authorization request</p>
        </div>
      </div>
      <div className="p-6 space-y-5">
        {/* Countdown timer */}
        <div className="flex items-center justify-between px-5 py-4 rounded-xl" style={{ backgroundColor: '#EFF6FF' }}>
          <div className="flex items-center gap-3">
            <Clock size={35} style={{ color: '#2D8FBF' }} />
            <div>
              <p className="text-sm font-bold" style={{ color: '#2D8FBF' }}>Submission Deadline</p>
              <p className="text-base font-semibold text-gray-700">{data.deadline}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-lg font-bold" style={{ color: '#1e3a5f' }}>
              {String(timeLeft.days).padStart(2, '0')}d {' '}
              {String(timeLeft.hours).padStart(2, '0')}h {' '}
              {String(timeLeft.minutes).padStart(2, '0')}min {' '}
              {String(timeLeft.seconds).padStart(2, '0')}s
            </p>
            <p className="text-xs text-gray-400">remaining</p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-600">Submission Progress</span>
            <span className="text-sm font-bold" style={{ color: '#1e3a5f' }}>{data.submitted}/{data.total}</span>
          </div>
          <div className="w-full h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: '#E0EDF7' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progressPct}%`, backgroundColor: '#1e3a5f' }} />
          </div>
        </div>

        {/* Deliverable cards */}
        <div className="space-y-4">
          {deliverables.map(item => <DeliverableCard key={item.id} item={item} onSendFeedback={handleSendFeedback} />)}
        </div>

        {/* Defense authorization button */}
        <button
          onClick={() => !authSent && setShowAuthModal(true)}
          disabled={authSent}
          className="w-full py-3 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: '#1e3a5f' }}
        >
          {authSent ? '✓ Authorization Sent' : 'send defense authorization requests'}
        </button>
      </div>
      {sendFeedbackModal && <SaveFeedbackModal onClose={() => setSendFeedbackModal(null)} onSend={handleFeedbackSubmit} />}
      {showAuthModal && <AuthorizationModal team={team} onClose={() => setShowAuthModal(false)} onConfirm={handleAuthorizationConfirm} />}
    </div>
  );
};

// ============================================================
// DELIVERABLES TAB — Supervisor view
// Shows list of teams with their submission progress
// Clicking a team opens TeamDeliverablesDetail
// ============================================================
const MOCK_TEAMS = [
  { id: 1, teamId: 'Team ID', projectTitle: 'The title of their project', members: 2, submitted: 3, total: 3 },
  { id: 2, teamId: 'Team ID', projectTitle: 'The title of their project', members: 1, submitted: 1, total: 3 },
  { id: 3, teamId: 'Team ID', projectTitle: 'The title of their project', members: 2, submitted: 0, total: 3 },
];

const TeamDeliverableRow = ({ team, onClick }) => {
  const progressPct = (team.submitted / team.total) * 100;
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-6 py-5 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onClick(team)}>
      <h3 className="text-base font-bold mb-0.5" style={{ color: '#1e3a5f' }}>{team.teamId}</h3>
      <p className="text-sm text-gray-500 mb-4">{team.projectTitle}</p>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 shrink-0"><Users size={14} className="text-gray-400" /><span className="text-xs text-gray-500">{team.members} member{team.members !== 1 ? 's' : ''}</span></div>
        <div className="flex items-center gap-3 flex-1"><span className="text-xs text-gray-600 shrink-0">Submission Progress</span><div className="flex-1 h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E0EDF7' }}><div className="h-full rounded-full transition-all duration-500" style={{ width: `${progressPct}%`, backgroundColor: '#1e3a5f' }} /></div><span className="text-xs font-medium text-gray-600 shrink-0">{team.submitted}/{team.total}</span></div>
      </div>
    </div>
  );
};

const DeliverablesTab = () => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  if (selectedTeam) return <TeamDeliverablesDetail team={selectedTeam} onBack={() => setSelectedTeam(null)} />;
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: '#EFF6FF' }}>
          <FaFileCircleCheck size={32} style={{ color: '#2D8FBF' }} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: '#193962' }}>Deliverables and Defense Authorization</h2>
          <p className="text-base text-gray-500 mt-0.5">Submit and track feedback and send defense authorization requests</p>
        </div>
      </div>
      <div className="p-6 space-y-4">
        {MOCK_TEAMS.map(team => <TeamDeliverableRow key={team.id} team={team} onClick={setSelectedTeam} />)}
      </div>
    </div>
  );
};

// ============================================================
// MAIN SUPERVISOR DOCUMENTS PAGE
// ============================================================
const SupervisorDocumentsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('documents');
  const [documents, setDocuments] = useState([
    { id: 1, name: 'React Best Practices Guide.pdf', size: '2.5MB', type: 'Tutorial', teamId: 'Team ID 1', date: '21-04-2026', url: '#' },
    { id: 2, name: 'Database Design Patterns.docx', size: '2.5MB', type: 'Reference', teamId: 'Team ID 2', date: '21-04-2026', url: '#' },
    { id: 3, name: 'AI in Education Article.pdf', size: '1.8MB', type: 'Article', teamId: 'Team ID 3', date: '22-04-2026', url: '#' },
    { id: 4, name: 'Project Management Material.pptx', size: '4.2MB', type: 'Material', teamId: 'Team ID 1', date: '23-04-2026', url: '#' },
  ]);
  const [currentUser] = useState({ firstName: 'Supervisor', lastName: '', role: 'Supervisor' });

  const handleUploadDocument = (newDoc) => setDocuments([...documents, newDoc]);
  const handleLogout = () => { localStorage.removeItem('token'); sessionStorage.clear(); navigate('/login'); };

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <SupervisorSidebar />
      <div className="flex-1 flex flex-col ml-16 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div><p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track projects</p><h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1></div>
            <div className="flex items-center gap-1 sm:gap-2">
              <a href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v" target="_blank" rel="noopener noreferrer" className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-white rounded-lg hover:opacity-80 transition-all duration-300 shadow-sm" style={{ background: 'linear-gradient(135deg, #18335E, #2D8FBF)' }}><Facebook size={14} className="sm:w-5 sm:h-5" /></a>
              <a href="https://www.linkedin.com/school/esisba" target="_blank" rel="noopener noreferrer" className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center text-white rounded-lg hover:opacity-80 transition-all duration-300 shadow-sm" style={{ background: 'linear-gradient(135deg, #18335E, #2D8FBF)' }}><Linkedin size={14} className="sm:w-5 sm:h-5" /></a>
              <ProfileDropdown user={currentUser} onLogout={handleLogout} onChangePassword={() => {}} />
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setActiveTab('documents')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors" style={{ backgroundColor: activeTab === 'documents' ? '#1e3a5f' : '#C0C0C0', color: activeTab === 'documents' ? '#ffffff' : '#4E4B4B' }}><FolderOpen size={20} /> Documents</button>
              <button onClick={() => setActiveTab('deliverables')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors" style={{ backgroundColor: activeTab === 'deliverables' ? '#1e3a5f' : '#C0C0C0', color: activeTab === 'deliverables' ? '#ffffff' : '#4E4B4B' }}><FaFileCircleCheck size={20} /> Deliverables</button>
            </div>
            {activeTab === 'documents' && <DocumentsTab documents={documents} onUploadDocument={handleUploadDocument} />}
            {activeTab === 'deliverables' && <DeliverablesTab />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupervisorDocumentsPage;