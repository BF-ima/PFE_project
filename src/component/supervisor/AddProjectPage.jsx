import React, { useState } from 'react';
import SupervisorSidebar from '../../layout/SupervisorSidebar';
import { Facebook, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ProfileDropdown } from './HomePage';

function AddProjectPage() {
  const navigate = useNavigate();
  
  // title: nom du projet (obligatoire)
  // maxStudents: nombre max d'étudiants (obligatoire)
  // description: description détaillée (obligatoire)
  const [formData, setFormData] = useState({
    title: '',
    maxStudents: '',
    description: '',
  });

  // ==================== DONNÉES UTILISATEUR ====================
  const [currentUser] = useState({
    id: 1,
    firstName: "Supervisor",
    lastName: "",
    email: "supervisor@esi-sba.dz",
    role: "Supervisor",
  });

  // ==================== GESTION DES CHANGEMENTS ====================
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Fonction appelée lors du clic sur "Add"
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!formData.title || !formData.maxStudents || !formData.description) {
      alert('Please fill in all required fields (*)');
      return;
    }
    
    console.log('Projet à ajouter:', formData);
    navigate('/supervisor/projectspage');
  };

  // ==================== ANNULATION ====================
  const handleCancel = () => {
    navigate('/supervisor/projectspage');
  };

  // ==================== GESTION DE LA DÉCONNEXION ====================
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  // ==================== CHANGEMENT DE MOT DE PASSE ====================
  const handleChangePassword = (formData) => {
    console.log('🔐 Changement de mot de passe:', formData);
  };

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
                className="w-9 h-9 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="Facebook"
              >
                <Facebook size={18} />
              </a>
              
              <a 
                href="https://www.linkedin.com/in/https%3A%2F%2Fwww.linkedin.com%2Fschool%2Fesisba" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>

              <ProfileDropdown 
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
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

                <form onSubmit={handleSubmit}>
                  {/* CHAMP TITRE - obligatoire */}
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

                  {/* CHAMP MAX STUDENTS - obligatoire */}
                  <div className="flex items-center mb-4">
                    <label className="w-32 text-xs font-medium text-[#1e3a5f]">
                      Max Students: <span className="text-red-500">*</span>
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

                  {/* CHAMP DESCRIPTION - obligatoire */}
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

                  <div className="flex justify-end gap-4 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-7 py-1.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    
                    <button
                      type="submit"
                      className="px-7 py-1.5 bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-xl hover:from-[#152a4d] hover:to-[#2575a0] transition-colors font-medium"
                    >
                      Add
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