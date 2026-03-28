import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar";
import ProfileDropdown from "../ProfileDropDown";
import SpecializationsTab from "./SpecializationsTab";
import CohortsTab from "./CohortsTab";

const AcademicEntityManagement = () => {
  const [activeTab, setActiveTab] = useState("specializations");
  const navigate = useNavigate();

  // User actuel (à remplacer par le contexte d'authentification)
  const [currentUser] = useState({
    id: 1,
    firstName: "Admin",
    lastName: "Principal",
    email: "admin@esi-sba.dz",
    role: "Super Admin",
  });

  // ✅ Handlers pour ProfileDropdown
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleChangePassword = async (formData) => {
    console.log("🔐 Changement de mot de passe:", formData);
    // Appel API à implémenter :
    // await axios.post('/api/auth/change-password', formData);
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      {/* ✅ Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Manage Academic Entity
              </p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                Academic Entity Management
              </h1>
            </div>
            
            {/* ✅ ProfileDropdown Réutilisable */}
            <ProfileDropdown
              user={currentUser}
              onLogout={handleLogout}
              onChangePassword={handleChangePassword}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">

          {/* Tabs Navigation */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("specializations")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "specializations"
                    ? "bg-[#1e3a5f] text-white border-b-2 border-[#1e3a5f]"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Majors
              </button>
              <button
                onClick={() => setActiveTab("cohorts")}
                className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                  activeTab === "cohorts"
                    ? "bg-[#1e3a5f] text-white border-b-2 border-[#1e3a5f]"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
              >
                Cohort
              </button>
              
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "specializations" && <SpecializationsTab />}
              {activeTab === "cohorts" && <CohortsTab />}
              
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AcademicEntityManagement;