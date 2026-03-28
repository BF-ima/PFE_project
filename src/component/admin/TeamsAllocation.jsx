import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar.jsx";
import ProfileDropdown from "../ProfileDropDown.jsx";
import DeadlineSettingsModal from "../../layout/DeadlineSettingsModal.jsx";
import {
  Search,
  Users,
  GitBranch,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
} from "lucide-react";

const TeamsAllocation = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDeadlineModalOpen, setIsDeadlineModalOpen] = useState(false);

  // User actuel
  const [currentUser] = useState({
    id: 1,
    firstName: "Admin",
    lastName: "Principal",
    email: "admin@esi-sba.dz",
    role: "Super Admin",
  });

  // Données mockées pour les statistiques
  const [stats] = useState({
    totalTeams: 24,
    projectsAllocated: 18,
    pendingAllocations: 6,
  });

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleChangePassword = (formData) => {
    console.log("🔐 Changement de mot de passe:", formData);
  };

  const handleManageAllocation = () => {
    navigate("/project-allocation");
  };

  const handleSeeAllTeams = () => {
    navigate("/teams-list");
  };

  const handleManageDeadline = () => {
    setIsDeadlineModalOpen(true);
  };

  const handleCloseDeadlineModal = () => {
    setIsDeadlineModalOpen(false);
  };

  const handleSaveDeadline = (deadlineData) => {
    console.log("💾 Deadline saved:", deadlineData);
    // Ici vous pouvez faire un appel API pour sauvegarder
    alert("Deadline saved successfully!");
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
                Manage and track your projects
              </p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                Manage Teams & Project Choices
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
          {/* Main Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-8">
            {/* Project Allocation Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-400 rounded-full flex items-center justify-center mb-4">
                  <GitBranch className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-[#1e3a5f] mb-2">
                  Project allocation
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 max-w-sm">
                  Manage automatic and manual project allocation, view team
                  preferences, and publish results.
                </p>

                {/* Button */}
                <button
                  onClick={handleManageAllocation}
                  className="w-full max-w-xs bg-gradient-to-r from-purple-700 to-purple-400 hover:from-purple-800 hover:to-purple-500 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group"
                >
                  Manage allocation
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* See All Teams Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-[#1e3a5f] mb-2">
                  See all Teams
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 max-w-sm">
                  Click here to access the complete list of all registered
                  teams, where you can view detailed information about each
                  team, including their members, leader and more.
                </p>

                {/* Button */}
                <button
                  onClick={handleSeeAllTeams}
                  className="w-full max-w-xs bg-gradient-to-r from-blue-700 to-cyan-500 hover:from-blue-800 hover:to-cyan-600 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group"
                >
                  Click here to see
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Deadline Settings Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                {/* Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-400 rounded-full flex items-center justify-center mb-4">
                  <Clock className="w-8 h-8 text-white" />
                </div>

                {/* Title */}
                <h2 className="text-xl font-semibold text-[#1e3a5f] mb-2">
                  Deadline Settings
                </h2>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-6 max-w-sm">
                  Set and manage deadlines for student preference list
                  submissions. Control when students can submit their project
                  preferences.
                </p>

                {/* Button */}
                <button
                  onClick={handleManageDeadline}
                  className="w-full max-w-xs bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 group"
                >
                  Manage Deadline
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="max-w-6xl mx-auto">
            <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4">
              Quick Overview
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Total Teams */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">Total Teams</p>
                    <p className="text-3xl font-bold text-[#1e3a5f]">
                      {stats.totalTeams}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Projects Allocated */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">
                      Projects Allocated
                    </p>
                    <p className="text-3xl font-bold text-[#1e3a5f]">
                      {stats.projectsAllocated}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              {/* Pending Allocations */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm mb-1">
                      Pending Allocations
                    </p>
                    <p className="text-3xl font-bold text-[#1e3a5f]">
                      {stats.pendingAllocations}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Deadline Settings Modal */}
      <DeadlineSettingsModal
        isOpen={isDeadlineModalOpen}
        onClose={handleCloseDeadlineModal}
        onSave={handleSaveDeadline}
      />
    </div>
  );
};

export default TeamsAllocation;