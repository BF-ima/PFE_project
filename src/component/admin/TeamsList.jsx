import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar.jsx";
import ProfileDropdown from "../ProfileDropDown.jsx";
import { Search, MoreVertical, Users, Eye, Edit2, Trash2 } from "lucide-react";

const TeamsList = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // User actuel
  const [currentUser] = useState({
    id: 1,
    firstName: "Admin",
    lastName: "Principal",
    email: "admin@esi-sba.dz",
    role: "Super Admin",
  });

  // Données mockées des équipes
  const [teams] = useState([
    {
      id: "TEAM001",
      members: ["Alice Johnson", "Bob Smith"],
      role: "Student Team",
      supervisor: "Dr. Marie Dupont",
      project: "Interactive E-Learning Platform",
      academicYear: "2025-2026",
    },
    {
      id: "TEAM002",
      members: ["Mohamed Benali", "Sarah Martinez", "John Doe"],
      role: "Student Team",
      supervisor: "Prof. Ahmed Benali",
      project: "Chatbot Intelligent",
      academicYear: "2025-2026",
    },
    {
      id: "TEAM003",
      members: ["Emma Wilson", "Lucas Martin"],
      role: "Student Team",
      supervisor: "Dr. Sarah Johnson",
      project: "Système de Gestion des PFE",
      academicYear: "2025-2026",
    },
    {
      id: "TEAM004",
      members: ["Pierre Dubois", "Marie Laurent", "Thomas Bernard", "Sophie Petit"],
      role: "Student Team",
      supervisor: "Dr. Mohamed Ali",
      project: "Application Mobile E-commerce",
      academicYear: "2025-2026",
    },
  ]);

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleChangePassword = (formData) => {
    console.log("🔐 Changement de mot de passe:", formData);
  };

  const handleViewTeam = (team) => {
    console.log("View team:", team);
    // Naviguer vers les détails de l'équipe
  };

  const handleEditTeam = (team) => {
    console.log("Edit team:", team);
    // Ouvrir modal d'édition
  };

  const handleDeleteTeam = (team) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer l'équipe ${team.id} ?`)) {
      console.log("Delete team:", team);
      // Logique de suppression
    }
  };

  // Filtrage des équipes
  const filteredTeams = teams.filter(
    (team) =>
      team.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.supervisor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      team.members.some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Manage and track your projects
              </p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                Teams List
              </h1>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search Team"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-2 w-80 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent"
              />
            </div>

            {/* Profile Dropdown */}
            <div className="ml-4">
              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Teams Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Members
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Supervisor
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Academic Year
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredTeams.map((team) => (
                    <tr key={team.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-700">
                            {team.members.length} members
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-gray-900">
                          {team.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">{team.role}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {team.supervisor}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700">
                          {team.project}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-600">
                          {team.academicYear}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <ActionMenu
                          team={team}
                          onView={() => handleViewTeam(team)}
                          onEdit={() => handleEditTeam(team)}
                          onDelete={() => handleDeleteTeam(team)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredTeams.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Users size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No teams found</p>
                <p className="text-sm mt-2">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

// Action Menu Component
const ActionMenu = ({ team, onView, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
          <button
            onClick={() => {
              onView();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Eye size={16} className="text-gray-500" /> View Details
          </button>
          <button
            onClick={() => {
              onEdit();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Edit2 size={16} className="text-gray-500" /> Edit Team
          </button>
          <button
            onClick={() => {
              onDelete();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete Team
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamsList;