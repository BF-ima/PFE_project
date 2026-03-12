// src/component/supervisor/TeamsPage.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProfileDropdown } from './HomePage';
import SupervisorSidebar from '../../layout/SupervisorSidebar';
import { Search, Facebook, Linkedin, MoreVertical, Eye, Edit2, Trash2 } from 'lucide-react';

function TeamsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  // Données du superviseur connecté
  const [currentUser] = useState({
    id: 1,
    firstName: "Supervisor",
    lastName: "",
    email: "supervisor@esi-sba.dz",
    role: "Supervisor",
  });

  // Données des équipes - sans exemples réels
  const [teams] = useState([
    {
      id: 1,
      members: "member",
      teamNumber: "number",
      role: "role",
      project: "project",
      academicYear: "yy",
    },
    {
      id: 2,
      members: "member",
      teamNumber: "number",
      role: "role",
      project: "project",
      academicYear: "yy",
    },
    {
      id: 3,
      members: "member",
      teamNumber: "number",
      role: "role",
      project: "project",
      academicYear: "yy",
    },
    {
      id: 4,
      members: "member",
      teamNumber: "number",
      role: "role",
      project: "project",
      academicYear: "yy",
    },
    {
      id: 5,
      members: "member",
      teamNumber: "number",
      role: "role",
      project: "project",
      academicYear: "yy",
    },
    {
      id: 6,
      members: "member",
      teamNumber: "number",
      role: "role",
      project: "project",
      academicYear: "yy",
    },
  ]);

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openMenuId && 
          menuRef.current && 
          !menuRef.current.contains(event.target) &&
          buttonRef.current && 
          !buttonRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openMenuId]);

  // Filtrer les équipes
  const filteredTeams = teams.filter(team =>
    team.members.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.teamNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Actions du menu
  const handleViewTeam = (team) => {
    console.log('Voir équipe:', team);
    setOpenMenuId(null);
  };

  const handleEditTeam = (team) => {
    console.log('Modifier équipe:', team);
    setOpenMenuId(null);
  };

  const handleDeleteTeam = (team) => {
    console.log('Supprimer équipe:', team);
    setOpenMenuId(null);
  };

  // Ouvrir/fermer le menu
  const toggleMenu = (id, event) => {
    event.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  // Gestion de la déconnexion
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  const handleChangePassword = (formData) => {
    console.log('🔐 Changement de mot de passe:', formData);
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <SupervisorSidebar />
      <div className="flex-1 flex flex-col ml-16 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Manage and track your projects</p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Barre de recherche */}
              <div className="relative">
                <Search 
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                  size={18} 
                />
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 w-72 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent bg-gray-50"
                />
              </div>
              
              {/* Icône Facebook */}
              <a 
                href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-8 h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="Facebook"
              >
                <Facebook size={18} />
              </a>
              
              {/* Icône LinkedIn */}
              <a 
                href="https://www.linkedin.com/in/https%3A%2F%2Fwww.linkedin.com%2Fschool%2Fesisba" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="LinkedIn"
              >
                <Linkedin size={18} />
              </a>

              {/* ProfileDropdown importé de HomePage */}
              <ProfileDropdown 
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 px-6 py-4 overflow-auto">
          {/* Titre "My Teams :" avec soulignement bleu */}
          <h2 className="text-lg font-semibold text-[#1e3a5f] mb-3 pb-1 border-b border-[#1e3a5f] inline-block ml-6">
            My Teams :
          </h2>

          {/* Tableau des équipes - avec placeholders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-visible max-w-6xl ml-6">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Members</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Team number</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider">Project</th>
                  <th className="px-4 py-2.5 text-left text-xs font-semibold text-[#1e3a5f] uppercase tracking-wider" colSpan="2">Academic Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredTeams.map((team) => (
                  <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-700">{team.members}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-700">{team.teamNumber}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-700">{team.role}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-700">{team.project}</td>
                    <td className="px-4 py-2.5 whitespace-nowrap text-xs text-gray-600">{team.academicYear}</td>
                    <td className="px-3 py-2.5 whitespace-nowrap text-center relative w-6 pl-1">
                      {/* Bouton des trois points */}
                      <button
                        ref={openMenuId === team.id ? buttonRef : null}
                        onClick={(e) => toggleMenu(team.id, e)}
                        className="p-0.5 text-[#1e3a5f] hover:bg-gray-100 rounded-full transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>
                      
                      {/* Menu déroulant */}
                      {openMenuId === team.id && (
                        <div 
                          ref={menuRef}
                          className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-9999 py-1"
                        >
                          <button
                            onClick={() => handleViewTeam(team)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Eye size={16} className="text-gray-500" /> View
                          </button>
                          <button
                            onClick={() => handleEditTeam(team)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Edit2 size={16} className="text-gray-500" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteTeam(team)}
                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Trash2 size={16} className="text-gray-500" /> Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredTeams.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                No teams found
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default TeamsPage;