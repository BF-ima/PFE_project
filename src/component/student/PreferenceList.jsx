import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import StudentSidebar from '../../layout/StudentSidebar';
import { ProfileDropdown } from '../supervisor/HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
  Facebook, Linkedin, ArrowUp, ArrowDown,
  Clock, Save, CheckCircle, Trash2, X,
  Search, User, Calendar, AlertTriangle
} from 'lucide-react';

const PreferenceList = () => {
  const navigate = useNavigate();

  // ==================== DONNÉES UTILISATEUR ====================
  const { currentUser } = useCurrentUser();

  // ==================== STATE ====================
  const [availableProjects, setAvailableProjects] = useState([]);
  const [preferences,       setPreferences]       = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [error,             setError]             = useState('');

  const [showProjectModal,  setShowProjectModal]  = useState(false);
  const [showConfirmModal,  setShowConfirmModal]  = useState(false);
  const [searchQuery,       setSearchQuery]       = useState('');
  const [isSubmitting,      setIsSubmitting]      = useState(false);
  const [selectedInModal,   setSelectedInModal]   = useState([]);
  const [isFinalSubmitted,  setIsFinalSubmitted]  = useState(false);

  // ==================== COUNTDOWN TIMER ====================
  const [timeLeft, setTimeLeft] = useState({ days: 10, hours: 10, minutes: 10, seconds: 5 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        if (prev.hours > 0)   return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0)    return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // ==================== FETCH DATA ====================
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [projectsRes, wishesRes] = await Promise.all([
        fetch('http://localhost:3000/api/wishes/projects', { headers }),
        fetch('http://localhost:3000/api/wishes/my',       { headers }),
      ]);


      // if not a team leader
    if (projectsRes.status === 403) {
      setError('Only the team leader can manage project preferences.');
      return;
    }

      const projectsData = await projectsRes.json();
      const wishesData   = await wishesRes.json();

      if (!projectsRes.ok) { setError(projectsData.message || 'Erreur'); return; }
      if (!wishesRes.ok)   { setError(wishesData.message   || 'Erreur'); return; }

      setAvailableProjects(projectsData.projects || []);

      const wishes = wishesData.wishes || [];
      if (wishes.length > 0) {
        const mapped = wishes.map((w, i) => ({
          id:         w.project_id,
          title:      w.title,
          summary:    w.description,
          supervisor: w.supervisor || w.external_supervisor || '—',
          createdAt:  w.project_created_at,
          rank:       i + 1,
        }));
        setPreferences(mapped);

        if (wishes.some(w => w.status === 'SUBMITTED')) {
          setIsFinalSubmitted(true);
        }
      }
    } catch (err) {
      console.error('fetchData error:', err);
      setError('Erreur serveur');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ==================== AUTH ====================
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  const handleChangePassword = (formData) => {
    console.log('🔐 Password change:', formData);
  };

  // ==================== MODAL SELECTION ====================
  const toggleModalSelection = (project) => {
    setSelectedInModal(prev =>
      prev.some(p => p.id === project.id)
        ? prev.filter(p => p.id !== project.id)
        : [...prev, project]
    );
  };

  const confirmModalSelection = () => {
    setPreferences(prev => {
      const toAdd    = selectedInModal.filter(p => !prev.some(ex => ex.id === p.id));
      const combined = [...prev, ...toAdd];
      return combined.map((p, i) => ({ ...p, rank: i + 1 }));
    });
    setSelectedInModal([]);
    setSearchQuery('');
    setShowProjectModal(false);
  };

  // ==================== PREFERENCE LIST ACTIONS ====================
  const removeFromPreferences = (projectId) => {
    if (isFinalSubmitted) return;
    setPreferences(prev =>
      prev.filter(p => p.id !== projectId).map((p, i) => ({ ...p, rank: i + 1 }))
    );
  };

  const moveUp = (index) => {
    if (isFinalSubmitted || index === 0) return;
    setPreferences(prev => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next.map((p, i) => ({ ...p, rank: i + 1 }));
    });
  };

  const moveDown = (index) => {
    if (isFinalSubmitted || index === preferences.length - 1) return;
    setPreferences(prev => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next.map((p, i) => ({ ...p, rank: i + 1 }));
    });
  };

  // ==================== SAVE DRAFT ====================
  const handleSaveDraft = async () => {
    if (isFinalSubmitted || preferences.length === 0) return;
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch('http://localhost:3000/api/wishes/draft', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
         projectIds: preferences.map(p => p.id),

        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || 'Failed to save draft.'); return; }
      alert('Preferences saved as draft!');
    } catch (err) {
      console.error('saveDraft error:', err);
      alert('Erreur serveur');
    }
  };

  // ==================== SUBMIT ====================
  const handleSubmitClick = () => {
    if (preferences.length === 0) { alert('Please select at least one project'); return; }
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch('http://localhost:3000/api/wishes/submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
         projectIds: preferences.map(p => p.id),
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || 'Submission failed.'); return; }
      alert('Preferences submitted successfully!');
      setIsFinalSubmitted(true);
    } catch (err) {
      console.error('submitWishes error:', err);
      alert('Erreur serveur');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ==================== FILTER ====================
  const filteredAvailable = availableProjects.filter(
    project =>
      !preferences.some(p => p.id === project.id) &&
      (
        (project.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.teacher_name || project.external_supervisor_name || '')
          .toLowerCase().includes(searchQuery.toLowerCase())
      )
  );

  // ==================== RANK BADGE STYLE ====================
  const getRankStyle = (rank) => {
    switch (rank) {
      case 1:  return { backgroundColor: '#FFEFB1', color: '#9D7236', borderColor: '#9D7236' };
      case 2:  return { backgroundColor: '#B5B5B5', color: '#4A4848', borderColor: '#4A4848' };
      case 3:  return { backgroundColor: '#FFCD86', color: '#AC4624', borderColor: '#AC4624' };
      default: return { backgroundColor: '#6FD0FF', color: '#20698D', borderColor: '#20698D' };
    }
  };

  // ==================== LOADING / ERROR ====================
  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-[#f5f6f8]">
      <div className="w-8 h-8 border-4 border-[#2D8FBF] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="flex h-screen items-center justify-center bg-[#f5f6f8]">
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
    </div>
  );

  // ==================== RENDER ====================
  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <StudentSidebar />

      <div className="flex-1 flex flex-col ml-16 overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track your projects</p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Facebook Icon */}
              <a
                href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="Facebook"
              >
                <Facebook size={14} className="sm:w-5 sm:h-5" />
              </a>
              {/* LinkedIn Icon */}
              <a
                href="https://www.linkedin.com/in/https%3A%2F%2Fwww.linkedin.com%2Fschool%2Fesisba"
                target="_blank"
                rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="LinkedIn"
              >
                <Linkedin size={14} className="sm:w-5 sm:h-5" />
              </a>
              {/* Menu déroulant du profil */}
              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-2 sm:p-3 lg:p-4">
          <div className="max-w-6xl mx-auto pt-0">

            <div className="mb-3">
              <h2 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Preference Form</h2>
              <p className="text-gray-500 text-xs sm:text-sm mt-0.5">Select and rank your favorite projects.</p>
            </div>

            {/* Deadline Card */}
            <div
              className="rounded-xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3 shadow-md"
              style={{ backgroundColor: '#E8F4FD', border: '1px solid #B8DCF0' }}
            >
              <div className="flex items-center gap-2">
                <Clock size={20} style={{ color: '#2D8FBF' }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#2D8FBF' }}>Submission Deadline</p>
                  <p className="text-sm" style={{ color: '#2D8FBF' }}>30 avril 2026 on 00:00</p>
                </div>
              </div>
              <div className="text-right">
                <span className="font-mono text-2xl font-bold" style={{ color: '#1e3a5f' }}>
                  {String(timeLeft.days).padStart(2, '0')}d{' '}
                  {String(timeLeft.hours).padStart(2, '0')}h{' '}
                  {String(timeLeft.minutes).padStart(2, '0')}min{' '}
                  {String(timeLeft.seconds).padStart(2, '0')}s
                </span>
                <p className="text-sm" style={{ color: '#2D8FBF' }}>remaining</p>
              </div>
            </div>

            {/* Preferences List */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden mb-6">
              <div className="px-6 py-4">
                <h3 className="text-lg font-semibold text-[#1e3a5f]">
                  Your Preferences{' '}
                  <span className="text-[#1e3a5f] text-sm font-semibold">(in priority order)</span>
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-semibold">Rank your favorite projects from most to least preferred.</p>
              </div>

              {preferences.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-400 mb-6">No project selected</p>
                  <button
                    onClick={() => setShowProjectModal(true)}
                    className="px-5 py-2 border border-gray-700 text-gray-900 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm font-semibold"
                  >
                    Select the projects
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {preferences.map((project, index) => (
                    <div key={project.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start gap-3">

                        <div className="flex flex-col items-center gap-1 shrink-0">
                          {/* Rank badge */}
                          <div
                            className="flex items-center justify-center rounded-lg text-xs font-bold border"
                            style={{
                              width: 40,
                              height: 30,
                              backgroundColor: getRankStyle(project.rank).backgroundColor,
                              color:           getRankStyle(project.rank).color,
                              borderColor:     getRankStyle(project.rank).borderColor,
                            }}
                          >
                            #{project.rank}
                          </div>

                          {/* Arrow Up */}
                          <button
                            onClick={() => moveUp(index)}
                            disabled={index === 0 || isFinalSubmitted}
                            className={`flex items-center justify-center rounded-lg transition-colors border ${
                              (index === 0 || isFinalSubmitted)
                                ? 'text-gray-200 border-gray-100 cursor-not-allowed'
                                : 'text-gray-500 border-gray-200 hover:text-[#1e3a5f] hover:border-[#1e3a5f] hover:bg-blue-50'
                            }`}
                            style={{ width: 32, height: 32 }}
                          >
                            <ArrowUp size={18} />
                          </button>

                          {/* Arrow Down */}
                          <button
                            onClick={() => moveDown(index)}
                            disabled={index === preferences.length - 1 || isFinalSubmitted}
                            className={`flex items-center justify-center rounded-lg transition-colors border ${
                              (index === preferences.length - 1 || isFinalSubmitted)
                                ? 'text-gray-200 border-gray-100 cursor-not-allowed'
                                : 'text-gray-500 border-gray-200 hover:text-[#1e3a5f] hover:border-[#1e3a5f] hover:bg-blue-50'
                            }`}
                            style={{ width: 32, height: 32 }}
                          >
                            <ArrowDown size={18} />
                          </button>
                        </div>

                        {/* Project info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm">{project.title}</h4>
                          <p className="text-xs text-gray-500 mt-0.5">{project.summary || 'Summary about the project'}</p>
                          <div className="mt-4 space-y-1">
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <User size={13} className="text-gray-400 shrink-0" />
                              <span>Sent by : {project.supervisor}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                              <Calendar size={13} className="text-gray-400 shrink-0" />
                              <span>
                                {project.createdAt
                                  ? new Date(project.createdAt).toLocaleDateString('en-GB')
                                  : 'N/A'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Delete button — hidden after final submission */}
                        {!isFinalSubmitted && (
                          <button
                            onClick={() => removeFromPreferences(project.id)}
                            className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded shrink-0 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons — hidden after final submission */}
            {!isFinalSubmitted && (
              <div className="flex justify-end gap-3">
                <button
                  onClick={handleSaveDraft}
                  className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-600 bg-white rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                >
                  <Save size={16} />
                  Save as draft
                </button>

                <button
                  onClick={handleSubmitClick}
                  disabled={isSubmitting || preferences.length === 0}
                  className="flex items-center gap-2 px-6 py-2 text-white rounded-lg font-medium text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: '#4CAF50' }}
                  onMouseEnter={(e) => { if (!isSubmitting && preferences.length > 0) e.currentTarget.style.backgroundColor = '#3d9140'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4CAF50'; }}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={16} />
                      Submit permanently
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Add projects button — visible when preferences exist and not submitted */}
            {preferences.length > 0 && !isFinalSubmitted && (
              <div className="flex justify-start mt-3">
                <button
                  onClick={() => setShowProjectModal(true)}
                  className="px-5 py-2 border border-gray-300 text-gray-600 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  + Add more projects
                </button>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ==================== SUBMIT CONFIRMATION MODAL ==================== */}
      {showConfirmModal && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-6">
              <div className="flex items-center gap-4 mb-5">
                <div
                  className="flex items-center justify-center rounded-full shrink-0"
                  style={{ width: 52, height: 52, backgroundColor: '#E8F8EE', border: '1.5px solid #86efac' }}
                >
                  <CheckCircle size={28} style={{ color: '#4CAF50' }} />
                </div>
                <h3 className="text-xl font-bold text-[#1e3a5f]">Submit your preferences</h3>
              </div>

              <p className="text-gray-600 text-sm mb-5">
                You are about to permanently submit your project preferences with{' '}
                <span className="font-bold text-gray-900">{preferences.length} projects</span> selected.
              </p>

              {/* Warning box */}
              <div
                className="rounded-xl p-4 mb-6"
                style={{ backgroundColor: '#FFF5D6', border: '1px solid #DEA350' }}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle size={20} style={{ color: '#DEA350', flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#DEA350' }}>Warning:</p>
                    <ul className="space-y-1">
                      {[
                        'Submitting locks your preferences',
                        'Modifications are not allowed except in exceptional cases',
                        'Allocation follows your priority order',
                      ].map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm" style={{ color: '#DEA350' }}>
                          <span
                            className="mt-1.5 rounded-full shrink-0"
                            style={{ width: 6, height: 6, backgroundColor: '#DEA350', display: 'inline-block' }}
                          />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-6">Are you sure that you want to continue ?</p>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-6 py-2.5 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="px-6 py-2.5 text-white rounded-lg text-sm font-medium transition-colors"
                  style={{ backgroundColor: '#4CAF50' }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#3d9140'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#4CAF50'; }}
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PROJECT SELECTION MODAL ==================== */}
      {showProjectModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowProjectModal(false)}
        >
          <div
            className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col overflow-hidden shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-6 pt-6 pb-2 flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-[#1e3a5f]">Select the projects</h3>
                <p className="text-sm text-gray-500 mt-1">
                  Select the projects you are interested in. You can then rank them in order of preference.
                </p>
              </div>
              <button
                onClick={() => setShowProjectModal(false)}
                className="text-gray-400 hover:text-gray-600 ml-4 mt-0.5"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search bar */}
            <div className="px-6 py-3">
              <div className="flex items-center gap-2 bg-gray-300 rounded-lg px-3 py-2 w-60">
                <Search size={16} className="text-gray-700 shrink-0" />
                <input
                  type="text"
                  placeholder="Search Project"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent flex-1 text-sm text-gray-700 placeholder-gray-700 focus:outline-none"
                />
              </div>
            </div>

            {/* Selected count display */}
            <div className="px-6 pb-3">
              <div
                className="w-full rounded-lg px-4 py-2 text-sm font-medium"
                style={{ backgroundColor: '#E8F4FD', color: '#193962' }}
              >
                {selectedInModal.length} Project{selectedInModal.length !== 1 ? 's' : ''} selected
              </div>
            </div>

            {/* List of available projects */}
            <div className="flex-1 overflow-auto px-6 pb-2">
              {filteredAvailable.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">All projects have been selected</p>
              ) : (
                <div className="space-y-3">
                  {filteredAvailable.map(project => {
                    const isSelected   = selectedInModal.some(p => p.id === project.id);
                    const supervisorName = project.teacher_name || project.external_supervisor_name || '—';
                    return (
                      <div
                        key={project.id}
                        onClick={() => toggleModalSelection(project)}
                        className="border border-gray-200 rounded-xl p-4 cursor-pointer transition-colors hover:bg-gray-50"
                        style={isSelected ? { borderColor: '#2D8FBF', backgroundColor: '#f0f8ff' } : {}}
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <div
                            className="w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center"
                            style={{
                              borderColor:     isSelected ? '#2D8FBF' : '#d1d5db',
                              backgroundColor: isSelected ? '#2D8FBF' : 'white',
                            }}
                          >
                            {isSelected && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm">{project.title}</h4>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                              {project.description || 'Summary about the project'}
                            </p>
                            <div className="mt-4 space-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <User size={13} className="text-gray-400" />
                                <span>Sent by : {supervisorName}</span>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                <Calendar size={13} className="text-gray-400" />
                                <span>
                                  {project.created_at
                                    ? new Date(project.created_at).toLocaleDateString('en-GB')
                                    : 'N/A'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Modal actions */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                onClick={() => { setShowProjectModal(false); setSelectedInModal([]); setSearchQuery(''); }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={confirmModalSelection}
                disabled={selectedInModal.length === 0}
                className="px-6 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#1e3a5f' }}
                onMouseEnter={(e) => { if (selectedInModal.length > 0) e.currentTarget.style.backgroundColor = '#152a4d'; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#1e3a5f'; }}
              >
                Confirm selection
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default PreferenceList;