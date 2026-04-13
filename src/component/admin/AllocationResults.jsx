import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar.jsx";
import { ProfileDropdown } from '../supervisor/HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';
import ReassignModal from "../../layout/ReassignModal.jsx";
import PublishResultsModal from "../../layout/PublishResultsModal.jsx";
import AllocationStatistics from "./AllocationStatistics.jsx";
import {
  Search,
  Users,
  Download,
  Award,
  Star,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  RotateCcw,
  Eye,
  FileText,
} from "lucide-react";

const AllocationResults = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("teams");
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showPublishModal, setShowPublishModal] = useState(false);

  // User actuel
  const { currentUser } = useCurrentUser();

  // Données mockées des équipes après allocation
  const [teams, setTeams] = useState([
    {
      id: "TEAM001",
      status: "assigned",
      members: 2,
      leader: "Alice Johnson",
      submittedDate: "March 8, 2026",
      academicAverage: 16.2,
      assignedProject: "Interactive E-Learning Platform",
      preferences: [
        {
          priority: 1,
          projectName: "Interactive E-Learning Platform",
          matched: true,
        },
        {
          priority: 2,
          projectName: "Système de Gestion des PFE",
          matched: false,
        },
        { priority: 3, projectName: "Plateforme E-learning", matched: false },
        {
          priority: 4,
          projectName: "Réseau Social Professionnel",
          matched: false,
        },
      ],
    },
    {
      id: "TEAM002",
      status: "assigned",
      members: 2,
      leader: "Mohamed Benali",
      submittedDate: "March 8, 2026",
      academicAverage: 16.3,
      assignedProject: "Chatbot Intelligent",
      preferences: [
        {
          priority: 1,
          projectName: "Système de Recommandation IA",
          matched: false,
        },
        { priority: 2, projectName: "Chatbot Intelligent", matched: true },
        { priority: 3, projectName: "Plateforme E-learning", matched: false },
        {
          priority: 4,
          projectName: "Application Mobile E-commerce",
          matched: false,
        },
      ],
    },
    {
      id: "TEAM003",
      status: "unassigned",
      members: 3,
      leader: "Sarah Martinez",
      submittedDate: "March 7, 2026",
      academicAverage: 15.8,
      assignedProject: null,
      preferences: [
        {
          priority: 1,
          projectName: "Réseau Social Professionnel",
          matched: false,
        },
        {
          priority: 2,
          projectName: "Système de Gestion des PFE",
          matched: false,
        },
        {
          priority: 3,
          projectName: "Application de Gestion de Stock",
          matched: false,
        },
        { priority: 4, projectName: "Plateforme E-learning", matched: false },
      ],
    },
  ]);

  const [projects] = useState([
    { id: 1, name: "Système de Gestion des PFE", maxStudents: 3 },
    { id: 2, name: "Application Mobile E-commerce", maxStudents: 4 },
    { id: 3, name: "Plateforme E-learning", maxStudents: 4 },
    { id: 4, name: "Réseau Social Professionnel", maxStudents: 4 },
    { id: 5, name: "Chatbot Intelligent", maxStudents: 4 },
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

  const handlePublishResults = () => {
    setShowPublishModal(true);
  };
  const handleConfirmPublish = () => {
    console.log("📢 Résultats publiés !");
    alert("Résultats publiés avec succès !");

    // Logique de publication :
    // - Envoyer notifications aux étudiants
    // - Envoyer notifications aux enseignants
    // - Mettre à jour le statut des projets
    // - Générer le PV d'attribution

    setShowPublishModal(false);
  };

  const handleExportReport = () => {
    alert("Rapport d'allocation exporté avec succès !");
    // Logique d'export
  };

  const handleReassign = (team) => {
    // ✅ Recevoir l'objet team complet
    setSelectedTeam(team);
    setShowReassignModal(true);
  };

  const handleAssignProject = (teamId, project) => {
    console.log(`🔄 Réaffectation: Team ${teamId} → Project "${project.name}"`);

    // ✅ METTRE À JOUR L'ÉTAT DES ÉQUIPES
    setTeams((prevTeams) =>
      prevTeams.map((team) => {
        if (team.id === teamId) {
          return {
            ...team,
            status: "assigned",
            assignedProject: project.name,
            // ✅ Mettre à jour les préférences
            preferences: team.preferences.map((pref) => ({
              ...pref,
              matched: pref.projectName === project.name,
            })),
          };
        }
        return team;
      }),
    );

    // Logique de mise à jour (mock)
    alert(`Team ${teamId} assigned to: ${project.name}`);

    // Fermer le modal
    setShowReassignModal(false);
    setSelectedTeam(null);

    // TODO: Appel API pour mettre à jour l'allocation
  };

  const getPriorityColor = (priority, matched) => {
    if (matched) {
      return "bg-green-100 text-green-700 border-green-300";
    }
    const colors = {
      1: "bg-yellow-100 text-yellow-700 border-yellow-300",
      2: "bg-gray-100 text-gray-700 border-gray-300",
      3: "bg-orange-100 text-orange-700 border-orange-300",
      4: "bg-blue-100 text-blue-700 border-blue-300",
    };
    return colors[priority] || colors[2];
  };

  const assignedCount = teams.filter((t) => t.status === "assigned").length;
  const unassignedCount = teams.filter((t) => t.status === "unassigned").length;

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
                Project Allocation : Result
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
              onClick={handlePublishResults}
              className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
            >
              <CheckCircle size={18} />
              Publish results
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
              Unassigned ({unassignedCount})
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
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h4 className="text-lg font-semibold text-[#1e3a5f]">
                              {team.id}
                            </h4>
                            {team.status === "assigned" ? (
                              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium border border-green-200">
                                Assigned
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200">
                                Not Assigned
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                            <div className="flex items-center gap-1">
                              <Users size={16} />
                              <span>{team.members} members</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star size={16} />
                              <span>leader's name</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={16} />
                              <span>Submitted on {team.submittedDate}</span>
                            </div>
                          </div>

                          {/* Academic Average */}
                          <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4">
                            <Award size={16} className="text-blue-600" />
                            <span className="text-blue-700 font-medium">
                              Academic average: {team.academicAverage} / 20
                            </span>
                          </div>
                        </div>

                        {/* Reassign Button */}
                        <button
                          onClick={() => handleReassign(team)}
                          className="flex items-center gap-2 text-[#1e3a5f] hover:text-[#152a4d] font-medium text-sm px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                        >
                          <RotateCcw size={16} />
                          Reassign
                        </button>
                      </div>

                      {/* Assigned Project */}
                      {team.assignedProject && (
                        <div className="mb-4">
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center gap-2 text-green-800 font-medium mb-1">
                              <CheckCircle size={16} />
                              Assigned project:
                            </div>
                            <p className="text-green-900 font-semibold">
                              {team.assignedProject}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Preferences */}
                      <div>
                        <p className="text-sm text-gray-600 mb-3">
                          Preferences in order of priority:
                        </p>
                        <div className="space-y-2">
                          {team.preferences.map((pref) => (
                            <div
                              key={pref.priority}
                              className={`flex items-center gap-3 p-3 rounded-lg border ${
                                pref.matched
                                  ? "bg-green-50 border-green-200"
                                  : "bg-gray-50 border-gray-200"
                              }`}
                            >
                              <span
                                className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border font-semibold text-xs ${getPriorityColor(
                                  pref.priority,
                                  pref.matched,
                                )}`}
                              >
                                #{pref.priority}
                              </span>
                              <div className="flex-1">
                                <span
                                  className={`text-sm ${pref.matched ? "text-green-900 font-medium" : "text-gray-700"}`}
                                >
                                  {pref.projectName}
                                </span>
                              </div>
                              {pref.matched && (
                                <CheckCircle
                                  size={16}
                                  className="text-green-600"
                                />
                              )}
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
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                  <h3 className="text-lg font-semibold text-[#1e3a5f]">
                    Unassigned Teams ({unassignedCount})
                  </h3>
                </div>
                <p className="text-gray-600 text-sm mb-6">
                  These teams could not be automatically assigned. You can
                  manually assign them to projects.
                </p>

                {/* Unassigned Teams List */}
                <div className="space-y-6">
                  {teams
                    .filter((team) => team.status === "unassigned")
                    .map((team) => (
                      <div
                        key={team.id}
                        className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                      >
                        {/* Team Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h4 className="text-lg font-semibold text-[#1e3a5f]">
                                {team.id}
                              </h4>
                              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium border border-red-200">
                                Not Assigned
                              </span>
                            </div>

                            <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                              <div className="flex items-center gap-1">
                                <Users size={16} />
                                <span>{team.members} members</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Star size={16} />
                                <span>{team.leader}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar size={16} />
                                <span>Submitted on {team.submittedDate}</span>
                              </div>
                            </div>

                            {/* Academic Average */}
                            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 mb-4">
                              <Award size={16} className="text-blue-600" />
                              <span className="text-blue-700 font-medium">
                                Academic average: {team.academicAverage} / 20
                              </span>
                            </div>
                          </div>

                          {/* Assign Button */}
                          <button
                            onClick={() => handleReassign(team)}
                            className="flex items-center gap-2 bg-[#1e3a5f] hover:bg-[#152a4d] text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
                          >
                            <RotateCcw size={16} />
                            Assign Project
                          </button>
                        </div>

                        {/* Preferences */}
                        <div>
                          <p className="text-sm text-gray-600 mb-3">
                            Preferences in order of priority:
                          </p>
                          <div className="space-y-2">
                            {team.preferences.map((pref) => (
                              <div
                                key={pref.priority}
                                className="flex items-center gap-3 p-3 rounded-lg border bg-gray-50 border-gray-200"
                              >
                                <span
                                  className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border font-semibold text-xs ${getPriorityColor(
                                    pref.priority,
                                    false,
                                  )}`}
                                >
                                  #{pref.priority}
                                </span>
                                <div className="flex-1">
                                  <span className="text-sm text-gray-700">
                                    {pref.projectName}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}

                  {unassignedCount === 0 && (
                    <div className="text-center py-12">
                      <CheckCircle
                        size={64}
                        className="mx-auto text-green-500 mb-4"
                      />
                      <h3 className="text-lg font-semibold text-gray-700 mb-2">
                        All Teams Assigned!
                      </h3>
                      <p className="text-gray-500">
                        All teams have been successfully assigned to projects.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "statistics" && (
            <AllocationStatistics teams={teams} projects={projects} />
          )}
        </main>
      </div>

      <ReassignModal
        isOpen={showReassignModal}
        onClose={() => {
          setShowReassignModal(false);
          setSelectedTeam(null);
        }}
        team={selectedTeam}
        projects={[
          // Liste des projets disponibles (mock ou API)
          { id: 1, name: "Système de Gestion des PFE", maxStudents: 3 },
          { id: 2, name: "Application Mobile E-commerce", maxStudents: 4 },
          { id: 3, name: "Plateforme E-learning", maxStudents: 4 },
          { id: 4, name: "Réseau Social Professionnel", maxStudents: 4 },
          { id: 5, name: "Chatbot Intelligent", maxStudents: 4 },
        ]}
        onAssign={handleAssignProject}
      />
      {/* Modal de publication */}
      <PublishResultsModal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        onPublish={handleConfirmPublish}
        assignedCount={assignedCount}
        unassignedCount={unassignedCount}
      />
    </div>
  );
};

export default AllocationResults;
