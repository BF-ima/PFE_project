import React, { useState , useEffect } from 'react';
import SupervisorSidebar from '../../layout/SupervisorSidebar';
import { Facebook, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileDropdown } from './HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';

function AddProjectPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title:       '',
    maxStudents: '',
    description: '',
    specialityId: '',
  });

  const [error,       setError]       = useState('');
  const [isLoading,   setIsLoading]   = useState(false);

const [specialities, setSpecialities] = useState([]);




  // ==================== DONNÉES UTILISATEUR ====================
const { currentUser } = useCurrentUser();

  // ==================== GESTION DES CHANGEMENTS ====================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // ==================== SOUMISSION ====================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.maxStudents || !formData.description || !formData.specialityId) {
  setError('Please fill in all required fields (*)');
  return;
}

    if (parseInt(formData.maxStudents) < 1 || parseInt(formData.maxStudents) > 10) {
      setError('Max students must be between 1 and 10');
      return;
    }

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');

      const res = await fetch('http://localhost:3000/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title:        formData.title,
          max_students: parseInt(formData.maxStudents),
          description:  formData.description,
          speciality_id: parseInt(formData.specialityId),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Erreur lors de la création du projet');
        return;
      }

      alert('Project created successfully!');
      navigate('/supervisor/projectspage');

    } catch (err) {
      console.error('createProject error:', err);
      setError('Server error, please try again');
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== ANNULATION ====================
  const handleCancel = () => {
    navigate('/supervisor/projectspage');
  };

  // ==================== DÉCONNEXION ====================
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };


useEffect(() => {
  const token = localStorage.getItem('token');
  fetch('http://localhost:3000/api/specialities', {
    headers: { Authorization: `Bearer ${token}` },
  })
    .then(r => r.json())
    .then(d => setSpecialities(d || []))
    .catch(console.error);
}, []);



  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <SupervisorSidebar />
      <div className="flex-1 flex flex-col ml-16 overflow-hidden">

        {/* ==================== HEADER ==================== */}
        <header className="bg-white border-b border-gray-200 px-8 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs mb-1">
                Manage and track your projects
              </p>
              <h1 className="text-xl font-bold text-[#1e3a5f]">
                Project Dashboard
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <a
              
                href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="Facebook"
              >
                <Facebook size={18} />
              </a>

              <a
                href="https://www.linkedin.com/school/esisba"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>

              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
              />
            </div>
          </div>
        </header>

        {/* ==================== CONTENU PRINCIPAL ==================== */}
        <main className="flex-1 overflow-hidden">
          <div className="h-full flex items-start justify-center pt-2">
            <div className="w-full max-w-5xl px-4">

              <h2 className="text-xl font-semibold text-[#1e3a5f] mt-1 mb-3 pb-1 border-b border-[#1e3a5f] inline-block">
                Add a new Project :
              </h2>

              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 pb-8">
                <div className="mb-5 text-center">
                  <h3 className="text-lg font-semibold text-[#1e3a5f]">Project Details</h3>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>

                  {/* TITRE */}
                  <div className="flex items-center mb-4">
                    <label className="w-32 text-xs font-medium text-[#1e3a5f]">
                      Title: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      required
                      className="flex-1 max-w-xs px-3 py-1.5 text-sm bg-[#f5f6f8] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] focus:border-transparent"
                      placeholder="Enter project title"
                    />
                  </div>

                  {/* MAX STUDENTS */}
                  <div className="flex items-center mb-4">
                    <label className="w-32 text-xs font-medium text-[#1e3a5f]">
                      Max Teams: <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="maxStudents"
                      value={formData.maxStudents}
                      onChange={handleChange}
                      required
                      min="1"
                      max="10"
                      className="flex-1 max-w-xs px-3 py-1.5 text-sm bg-[#f5f6f8] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] focus:border-transparent"
                      placeholder="Enter maximum number of students"
                    />
                  </div>

                                    {/* SPECIALITY */}
<div className="flex items-center mb-4">
  <label className="w-32 text-xs font-medium text-[#1e3a5f]">
    Speciality: <span className="text-red-500">*</span>
  </label>
  <select
    name="specialityId"
    value={formData.specialityId}
    onChange={handleChange}
    required
    className="flex-1 max-w-xs px-3 py-1.5 text-sm bg-[#f5f6f8] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] focus:border-transparent"
  >
    
    <option value="" className='text-gray-500'>Select a speciality...</option>
    
    {specialities.map(s => (
      <option key={s.id} value={s.id}>
        {s.name}
      </option>
    ))}
  </select>
</div>


                  {/* DESCRIPTION */}
                  <div className="flex mb-5">
                    <label className="w-32 text-xs font-medium text-[#1e3a5f] pt-2">
                      Description: <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="flex-1 px-3 py-2 text-sm bg-[#f5f6f8] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] focus:border-transparent resize-none"
                      placeholder="Enter project description"
                    />
                  </div>

                  {/* BUTTONS */}
                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isLoading}
                      className="px-7 py-1.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-7 py-1.5 bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-xl hover:from-[#152a4d] hover:to-[#2575a0] transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Adding...
                        </>
                      ) : (
                        'Add'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AddProjectPage;