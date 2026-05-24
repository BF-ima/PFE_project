import React, { useState, useEffect } from 'react';
import SupervisorSidebar from '../../layout/SupervisorSidebar';
import { Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileDropdown } from './HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';

function AddProjectPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    external_supervisor: '',
    assigned_student_email: '',
    maxStudents: '',
    description: '',
    specialityId: '',
  });

  const [type,                    setType]                    = useState('without-external-supervisor');
  const [error,                   setError]                   = useState('');
  const [isLoading,               setIsLoading]               = useState(false);
  const [specialities,            setSpecialities]            = useState([]);
  const [extSupError,             setExtSupError]             = useState('');
  const [studentEmailError,       setStudentEmailError]       = useState('');
  const [projectDeadline,         setProjectDeadline]         = useState(null);
  const [isProjectDeadlinePassed, setIsProjectDeadlinePassed] = useState(false);
  const [studentSpecialityId,     setStudentSpecialityId]     = useState(null);
  const [specialityMismatch,      setSpecialityMismatch]      = useState(false);

  const { currentUser } = useCurrentUser();

  // ── Check if assigned_student_email is filled → hide maxStudents ──
  const hasDirectStudent = type === 'with-external-supervisor' &&
    formData.assigned_student_email.trim().length > 0;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'external_supervisor') setExtSupError('');
    if (name === 'assigned_student_email') {
      setStudentEmailError('');
      setStudentSpecialityId(null);
      setSpecialityMismatch(false);
    }
    // Re-check speciality mismatch live when speciality dropdown changes
    if (name === 'specialityId' && studentSpecialityId) {
      setSpecialityMismatch(value && String(studentSpecialityId) !== String(value));
    }
  };

  // ── Validate external supervisor email on blur ──
  const handleExtSupBlur = async () => {
    const email = formData.external_supervisor.trim();
    if (!email) return;
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(
        `http://localhost:3000/api/user/check-email?email=${encodeURIComponent(email)}&role=entreprise`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok || !data.exists) {
        setExtSupError('No external supervisor found with this email.');
      } else {
        setExtSupError('');
      }
    } catch {
      setExtSupError('Could not verify email.');
    }
  };

  // ── Validate student email on blur + fetch their speciality ──
  const handleStudentEmailBlur = async () => {
    const email = formData.assigned_student_email.trim();
    if (!email) {
      setStudentSpecialityId(null);
      setSpecialityMismatch(false);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const res   = await fetch(
        `http://localhost:3000/api/projects/check-student?email=${encodeURIComponent(email)}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!data.exists) {
        setStudentEmailError('No student found with this email.');
        setStudentSpecialityId(null);
        setSpecialityMismatch(false);
      } else {
        setStudentEmailError('');
        setStudentSpecialityId(data.speciality_id);
        // Check immediately if a speciality is already selected
        if (formData.specialityId && data.speciality_id) {
          setSpecialityMismatch(String(data.speciality_id) !== String(formData.specialityId));
        }
      }
    } catch {
      setStudentEmailError('Could not verify email.');
      setStudentSpecialityId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (isProjectDeadlinePassed) {
      setError('The project submission deadline has passed. You can no longer add projects.');
      return;
    }

    if (!formData.title || !formData.description || !formData.specialityId) {
      setError('Please fill in all required fields (*)');
      return;
    }

    // maxStudents required only when no direct student
    if (!hasDirectStudent && !formData.maxStudents) {
      setError('Please fill in all required fields (*)');
      return;
    }

    if (type === 'with-external-supervisor' && !formData.external_supervisor) {
      setError('Please enter the external supervisor email');
      return;
    }

    if (extSupError || studentEmailError) {
      setError('Please fix the email errors before submitting.');
      return;
    }

    if (specialityMismatch) {
      setError("The selected speciality does not match the assigned student's speciality.");
      return;
    }

    if (!hasDirectStudent) {
      const max = parseInt(formData.maxStudents);
      if (max < 1 || max > 10) {
        setError('Max teams must be between 1 and 10');
        return;
      }
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      const body = {
        title:         formData.title,
        max_students:  hasDirectStudent ? 1 : parseInt(formData.maxStudents),
        description:   formData.description,
        speciality_id: parseInt(formData.specialityId),
      };

      if (type === 'with-external-supervisor') {
        body.external_supervisor = formData.external_supervisor;
        if (formData.assigned_student_email.trim()) {
          body.assigned_student_email = formData.assigned_student_email.trim();
        }
      }

      const res  = await fetch('http://localhost:3000/api/projects', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) { setError(data.message || 'Error creating project'); return; }

      alert('Project created successfully!');
      navigate('/supervisor/projectspage');

    } catch (err) {
      console.error('createProject error:', err);
      setError('Server error, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => navigate('/supervisor/projectspage');

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  // ── Fetch specialities ──
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch('http://localhost:3000/api/specialities', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(d => setSpecialities(d || []))
      .catch(console.error);
  }, []);

  // ── Fetch project submission deadline ──
  useEffect(() => {
    fetch('http://localhost:3000/api/deadline?type=project_submission')
      .then(r => r.json())
      .then(data => {
        if (data.deadline) {
          const dl      = data.deadline;
          const dateStr = dl.deadline_date.slice(0, 10);
          const timeStr = (dl.deadline_time || '00:00:00').slice(0, 5);
          setProjectDeadline({ dateStr, timeStr });
          const target = new Date(`${dateStr}T${timeStr}:00`);
          setIsProjectDeadlinePassed(new Date() > target);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <SupervisorSidebar />
      <div className="flex-1 flex flex-col ml-16 overflow-hidden">

        {/* HEADER */}
        <header className="bg-white border-b border-gray-200 px-8 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs mb-1">Manage and track your projects</p>
              <h1 className="text-xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            <div className="flex items-center gap-2">
              <ProfileDropdown user={currentUser} onLogout={handleLogout} />
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 overflow-auto">
          <div className="min-h-full flex items-start justify-center pt-2 pb-8">
            <div className="w-full max-w-5xl px-4">

              <h2 className="text-xl font-semibold text-[#1e3a5f] mt-1 mb-3 pb-1 border-b border-[#1e3a5f] inline-block">
                Add a new Project :
              </h2>

              {/* ── Project submission deadline banner ── */}
              {projectDeadline && (
                <div className={`rounded-xl p-3 mb-4 flex items-center gap-3 border ${
                  isProjectDeadlinePassed
                    ? 'bg-red-50 border-red-200 text-red-600'
                    : 'bg-blue-50 border-blue-200 text-[#2D8FBF]'
                }`}>
                  <Clock size={18} className="shrink-0" />
                  <p className="text-sm font-medium">
                    {isProjectDeadlinePassed
                      ? `Project submission deadline passed: ${projectDeadline.dateStr} at ${projectDeadline.timeStr}. You can no longer add projects.`
                      : `Project submission deadline: ${projectDeadline.dateStr} at ${projectDeadline.timeStr}`
                    }
                  </p>
                </div>
              )}

              {/* ── Blocked overlay message ── */}
              {isProjectDeadlinePassed ? (
                <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-12 text-center">
                  <Clock size={48} className="text-red-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-600 mb-2">Submission Closed</h3>
                  <p className="text-gray-500 text-sm">
                    The project submission deadline has passed. Contact the admin to submit new projects.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 pb-8">
                  <div className="mb-5 text-center">
                    <h3 className="text-lg font-semibold text-[#1e3a5f]">Project Details</h3>
                  </div>

                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                      {error}
                    </div>
                  )}

                  <form onSubmit={handleSubmit}>

                    {/* TITLE */}
                    <div className="flex items-center mb-4">
                      <label className="w-36 text-xs font-medium text-[#1e3a5f]">
                        Title: <span className="text-red-500">*</span>
                      </label>
                      <input type="text" name="title" value={formData.title} onChange={handleChange} required
                        className="flex-1 max-w-xs px-3 py-1.5 text-sm bg-[#f5f6f8] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                        placeholder="Enter project title" />
                    </div>

                    {/* PROJECT TYPE */}
                    <div className="flex items-start mb-4">
                      <label className="w-36 text-xs font-medium text-[#1e3a5f] pt-1">
                        Project Type: <span className="text-red-500">*</span>
                      </label>
                      <div className="flex flex-col gap-3">
                        {[
                          { value: 'with-external-supervisor',    label: 'With external supervisor' },
                          { value: 'without-external-supervisor', label: 'Without external supervisor' },
                        ].map(opt => (
                          <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer"
                            onClick={() => {
                              setType(opt.value);
                              if (opt.value === 'without-external-supervisor') {
                                setFormData(prev => ({ ...prev, external_supervisor: '', assigned_student_email: '' }));
                                setExtSupError('');
                                setStudentEmailError('');
                                setStudentSpecialityId(null);
                                setSpecialityMismatch(false);
                              }
                            }}>
                            <span className={`w-5 h-5 flex items-center justify-center rounded-md border transition-all
                              ${type === opt.value ? 'bg-[#18335E] border-[#18335E]' : 'bg-gray-200 border-gray-400'}`}>
                              {type === opt.value && <Check size={12} className="text-white" />}
                            </span>
                            <span>{opt.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* EXTERNAL SUPERVISOR */}
                    {type === 'with-external-supervisor' && (
                      <>
                        <div className="flex items-start mb-4">
                          <label className="w-36 text-xs font-medium text-[#1e3a5f] pt-1">
                            Ext. Supervisor: <span className="text-red-500">*</span>
                          </label>
                          <div className="flex-1 max-w-xs">
                            <input type="email" name="external_supervisor"
                              value={formData.external_supervisor}
                              onChange={handleChange}
                              onBlur={handleExtSupBlur}
                              required
                              className={`w-full px-3 py-1.5 text-sm bg-[#f5f6f8] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] ${
                                extSupError ? 'border-red-400' : 'border-gray-200'
                              }`}
                              placeholder="supervisor@company.com" />
                            {extSupError && (
                              <p className="text-xs text-red-500 mt-1">{extSupError}</p>
                            )}
                          </div>
                        </div>

                        {/* STUDENT EMAIL */}
                        {formData.external_supervisor.trim() && !extSupError && (
                          <div className="flex items-start mb-4">
                            <label className="w-36 text-xs font-medium text-[#1e3a5f] pt-1">
                              Student Email:
                            </label>
                            <div className="flex-1 max-w-xs">
                              <input type="email" name="assigned_student_email"
                                value={formData.assigned_student_email}
                                onChange={handleChange}
                                onBlur={handleStudentEmailBlur}
                                className={`w-full px-3 py-1.5 text-sm bg-[#f5f6f8] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] ${
                                  studentEmailError ? 'border-red-400' : 'border-gray-200'
                                }`}
                                placeholder="student@esi-sba.dz (optional)" />
                              {studentEmailError ? (
                                <p className="text-xs text-red-500 mt-1">{studentEmailError}</p>
                              ) : (
                                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
                                  If filled, this project will be assigned directly to this student's team
                                  when validated — it won't appear in the public wish list.
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* MAX TEAMS — hidden when direct student assigned */}
                    {!hasDirectStudent && (
                      <div className="flex items-center mb-4">
                        <label className="w-36 text-xs font-medium text-[#1e3a5f]">
                          Max Teams: <span className="text-red-500">*</span>
                        </label>
                        <input type="number" name="maxStudents" value={formData.maxStudents}
                          onChange={handleChange} required min="1" max="10"
                          className="flex-1 max-w-xs px-3 py-1.5 text-sm bg-[#f5f6f8] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                          placeholder="Enter maximum number of teams" />
                      </div>
                    )}

                    {/* SPECIALITY */}
                    <div className="flex items-start mb-4">
                      <label className="w-36 text-xs font-medium text-[#1e3a5f] pt-1">
                        Speciality: <span className="text-red-500">*</span>
                      </label>
                      <div className="flex-1 max-w-xs">
                        <select
                          name="specialityId"
                          value={formData.specialityId}
                          onChange={handleChange}
                          required
                          className={`w-full px-3 py-1.5 text-sm bg-[#f5f6f8] border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] ${
                            specialityMismatch ? 'border-red-400' : 'border-gray-200'
                          }`}
                        >
                          <option value="">Select a speciality...</option>
                          {specialities.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        {specialityMismatch && (
                          <p className="text-xs text-red-500 mt-1">
                            This speciality does not match the assigned student's speciality.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* DESCRIPTION */}
                    <div className="flex mb-5">
                      <label className="w-36 text-xs font-medium text-[#1e3a5f] pt-2">
                        Description: <span className="text-red-500">*</span>
                      </label>
                      <textarea name="description" value={formData.description} onChange={handleChange}
                        required rows={3}
                        className="flex-1 px-3 py-2 text-sm bg-[#f5f6f8] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] resize-none"
                        placeholder="Enter project description" />
                    </div>

                    {/* BUTTONS */}
                    <div className="flex justify-end gap-4 pt-4">
                      <button type="button" onClick={handleCancel} disabled={isLoading}
                        className="px-7 py-1.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50">
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || !!extSupError || !!studentEmailError || specialityMismatch}
                        className="px-7 py-1.5 bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-xl hover:from-[#152a4d] hover:to-[#2575a0] transition-colors font-medium disabled:opacity-50 flex items-center gap-2">
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Adding...
                          </>
                        ) : 'Add'}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AddProjectPage;