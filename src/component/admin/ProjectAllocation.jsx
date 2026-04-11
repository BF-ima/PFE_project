import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar.jsx";
import ProfileDropdown from "../supervisor/HomePage";
import RunAllocationModal from "../../layout/RunAllocationModal.jsx";
import {
  Search,
  Users,
  Download,
  Play,
  Award,
  Star,
  Calendar,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

const ProjectAllocation = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("teams");
  const [showAllocationModal, setShowAllocationModal] = useState(false);

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
      members: 2,
      leader: "Alice Johnson",
      submittedDate: "March 8, 2026",
      academicAverage: 16.2,
      preferences: [
        { priority: 1, projectName: "Système de Gestion des PFE" },
        { priority: 2, projectName: "Application Mobile E-commerce" },
        { priority: 3, projectName: "Plateforme E-learning" },
        { priority: 4, projectName: "Réseau Social Professionnel" },
      ],
    },
    {
      id: "TEAM002",
      members: 4,
      leader: "Mohamed Benali",
      submittedDate: "March 8, 2026",
      academicAverage: 14.2,
      preferences: [
        { priority: 1, projectName: "Application de Gestion de Stock" },
        { priority: 2, projectName: "Système de Recommandation IA" },
        { priority: 3, projectName: "Plateforme E-learning" },
        { priority: 4, projectName: "Application Mobile E-commerce" },
      ],
    },
    {
      id: "TEAM003",
      members: 3,
      leader: "Sarah Martinez",
      submittedDate: "March 7, 2026",
      academicAverage: 15.8,
      preferences: [
        { priority: 1, projectName: "Réseau Social Professionnel" },
        { priority: 2, projectName: "Système de Gestion des PFE" },
        { priority: 3, projectName: "Application de Gestion de Stock" },
        { priority: 4, projectName: "Plateforme E-learning" },
      ],
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

  const handleRunAutomaticAllocation = () => {
    setShowAllocationModal(true); // ✅ Ouvre juste le modal
  };

  // ✅ AJOUTEZ cette nouvelle fonction :
  const handleConfirmAllocation = () => {
    console.log("🚀 Allocation automatique confirmée");
    setShowAllocationModal(false);
    navigate("/allocationresults");
  };

  const handleExportReport = () => {
    alert("Rapport exporté avec succès !");
    // Logique d'export à implémenter
  };

  const getPriorityColor = (priority) => {
    const colors = {
      1: "bg-yellow-100 text-yellow-700 border-yellow-300",
      2: "bg-gray-100 text-gray-700 border-gray-300",
      3: "bg-orange-100 text-orange-700 border-orange-300",
      4: "bg-blue-100 text-blue-700 border-blue-300",
    };
    return colors[priority] || colors[2];
  };

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
                Manage automatic and manual project allocation to teams
              </p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                Project Allocation
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


          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleRunAutomaticAllocation}
              className="flex items-center gap-2 bg-gradient-to-r from-[#18335E] to-[#2D8FBF] hover:from-[#152a4d] hover:to-[#2575a0] text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
            >
              <Play size={18} />
              Run automatic allocation
            </button>
            <button
              onClick={handleExportReport}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-lg font-medium transition-all"
            >
              <Download size={18} />
              Export report
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("teams")}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === "teams"
                  ? "border-[#1e3a5f] text-[#1e3a5f]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Users size={16} />
              Teams
            </button>
            <button
              onClick={() => setActiveTab("unassigned")}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === "unassigned"
                  ? "border-[#1e3a5f] text-[#1e3a5f]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <AlertCircle size={16} />
              Unassigned (0)
            </button>
            <button
              onClick={() => setActiveTab("statistics")}
              className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                activeTab === "statistics"
                  ? "border-[#1e3a5f] text-[#1e3a5f]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <TrendingUp size={16} />
              Statistics
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === "teams" && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">
                  List of Teams and Their Preferences
                </h3>
                <p className="text-gray-600 text-sm mb-6">
                  View the preferences submitted by teams
                </p>

                {/* Teams List */}
                <div className="space-y-6">
                  {teams.map((team) => (
                    <div
                      key={team.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Team Header */}
                      <div className="flex items-start gap-6 mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-4 mb-2">
                            <h4 className="text-lg font-semibold text-[#1e3a5f]">
                              {team.id}
                            </h4>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Users size={16} />
                              <span>{team.members} members</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Star size={16} />
                              <span>leader's name</span>
                            </div>
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Calendar size={16} />
                              <span>Submitted on {team.submittedDate}</span>
                            </div>
                          </div>

                          {/* Academic Average */}
                          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
                            <Award size={16} className="text-blue-600" />
                            <span className="text-blue-700 font-medium">
                              Academic average: {team.academicAverage} / 20
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Preferences */}
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-3">
                          Preferences in order of priority:
                        </p>
                        <div className="space-y-2">
                          {team.preferences.map((pref) => (
                            <div
                              key={pref.priority}
                              className="flex items-center gap-3"
                            >
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border font-semibold text-xs ${getPriorityColor(
                                  pref.priority,
                                )}`}
                              >
                                #{pref.priority}
                              </span>
                              <div className="flex-1 bg-gray-50 rounded-lg px-4 py-2">
                                <span className="text-gray-700">
                                  {pref.projectName}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "unassigned" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <AlertCircle size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                No Unassigned Teams
              </h3>
              <p className="text-gray-500">
                All teams have been assigned to projects or are waiting for
                allocation.
              </p>
            </div>
          )}

          {activeTab === "statistics" && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
              <TrendingUp size={64} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Statistics Dashboard
              </h3>
              <p className="text-gray-500">
                Detailed statistics about project allocation will be displayed
                here.
              </p>
            </div>
          )}
        </main>
      </div>
      <RunAllocationModal
        isOpen={showAllocationModal}
        onClose={() => setShowAllocationModal(false)}
        onConfirm={handleConfirmAllocation}
        teamsCount={teams.length}
        projectsCount={18} // À remplacer par le vrai nombre de projets
      />
    </div>
  );
};

export default ProjectAllocation;