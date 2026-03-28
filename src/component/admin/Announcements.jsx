import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar.jsx";
import ProfileDropdown from "../ProfileDropDown.jsx";
import CreateAnnouncementModal from "../../layout/CreateAnnouncementModal.jsx";
import {
  Bell,
  Megaphone,
  Plus,
  Clock,
  AlertCircle,
  Info,
  AlertTriangle,
  Check,
} from "lucide-react";

const Announcements = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("announcements");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // User actuel
  const [currentUser] = useState({
    id: 1,
    firstName: "Admin",
    lastName: "Principal",
    email: "admin@esi-sba.dz",
    role: "Super Admin",
  });

  // Données mockées des annonces
  const [announcements, setAnnouncements] = useState([
    {
      id: 1,
      type: "urgent",
      title: "System maintenance",
      description:
        "The platform will undergo scheduled maintenance on March 25th from 10 PM to 2 AM.",
      date: "Mar 24, 2026 - 10:15",
      audience: "All users",
      icon: AlertTriangle,
    },
    {
      id: 2,
      type: "info",
      title: "Project Allocation Results Published",
      description:
        "The results of the project allocation have been published. You can now view your assigned project.",
      date: "Mar 24, 2026 - 10:00",
      audience: "Students",
      icon: Info,
    },
    {
      id: 3,
      type: "alert",
      title: "New Feature: Team Collaboration Tools",
      description:
        "We've added new collaboration tools to help teams work together more effectively.",
      date: "Mar 23, 2026 - 16:30",
      audience: "All users",
      icon: AlertCircle,
    },
    {
      id: 4,
      type: "reminder",
      title: "Workshop: Project Management Best Practices",
      description:
        "Join us for a workshop on project management best practices scheduled for next week.",
      date: "Mar 23, 2026 - 14:20",
      audience: "Students",
      icon: Clock,
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

  const handleCreateAnnouncement = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleMarkAllRead = () => {
    console.log("✓ Toutes les annonces marquées comme lues");
  };

  const handlePublishAnnouncement = (announcementData) => {
    const newAnnouncement = {
      id: announcements.length + 1,
      type: announcementData.priority,
      title: announcementData.title,
      description: announcementData.content,
      date: new Date().toLocaleString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      audience: announcementData.audience,
      icon: getIconForPriority(announcementData.priority),
    };

    setAnnouncements([newAnnouncement, ...announcements]);
  };

  const getIconForPriority = (priority) => {
    switch (priority) {
      case "urgent":
        return AlertTriangle;
      case "important":
        return AlertCircle;
      case "normal":
      default:
        return Info;
    }
  };

  // Filtrer les annonces
  const filteredAnnouncements = announcements.filter((announcement) => {
    return activeFilter === "all" || announcement.type === activeFilter;
  });

  const totalCount = announcements.length;

  // Obtenir l'icône et la couleur selon le type
  const getTypeConfig = (type) => {
    const configs = {
      info: { icon: Info, color: "bg-blue-100 text-blue-600", label: "Info" },
      alert: {
        icon: AlertCircle,
        color: "bg-orange-100 text-orange-600",
        label: "Alert",
      },
      urgent: {
        icon: AlertTriangle,
        color: "bg-red-100 text-red-600",
        label: "Urgent",
      },
      reminder: {
        icon: Clock,
        color: "bg-yellow-100 text-yellow-600",
        label: "Reminder",
      },
      normal: {
        icon: Info,
        color: "bg-gray-100 text-gray-600",
        label: "Normal",
      },
      important: {
        icon: AlertCircle,
        color: "bg-yellow-100 text-yellow-700",
        label: "Important",
      },
    };
    return configs[type] || configs.info;
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
                Stay informed with important updates
              </p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                Announcements
              </h1>
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
          <div className="max-w-5xl mx-auto">
            {/* Tabs - IDENTIQUE À NOTIFICATIONS */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => navigate("/notifications")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "notifications"
                    ? "bg-[#1e3a5f] text-white shadow-sm"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Bell size={18} />
                Notifications
              </button>

              <button
                onClick={() => setActiveTab("announcements")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === "announcements"
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <Megaphone size={18} />
                Announcements
              </button>
            </div>

            {/* Announcements Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Megaphone size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1e3a5f]">
                      Announcements
                    </h2>
                    <p className="text-sm text-gray-500">
                      {totalCount} total announcements
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCreateAnnouncement}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600  text-white rounded-lg hover:bg-purple-400 transition-colors text-sm font-medium"
                >
                  <Plus size={16} />
                  Make a new announcement
                </button>
              </div>

              {/* Filters */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {["all", "info", "alert", "urgent", "reminder"].map(
                    (filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          activeFilter === filter
                            ? "bg-purple-600 text-white"
                            : "bg-gray-100 text-[#1E3A5F] hover:bg-gray-200"
                        }`}
                      >
                        {filter.charAt(0).toUpperCase() + filter.slice(1)}
                      </button>
                    ),
                  )}
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 shadow-sm text-white rounded-lg hover:bg-purple-400 hover:cursor-pointer transition-colors text-sm font-medium"
                >
                  <Check size={16} />
                  Mark all read
                </button>
              </div>

              {/* Announcements List */}
              <div className="divide-y divide-gray-100">
                {filteredAnnouncements.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <Megaphone
                      size={48}
                      className="mx-auto mb-4 text-gray-300"
                    />
                    <p className="text-lg font-medium">No announcements</p>
                    <p className="text-sm mt-2">
                      No announcements match your filters
                    </p>
                  </div>
                ) : (
                  filteredAnnouncements.map((announcement) => {
                    const IconComponent = announcement.icon;
                    const typeConfig = getTypeConfig(announcement.type);

                    return (
                      <div
                        key={announcement.id}
                        className="px-6 py-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          {/* Icon */}
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeConfig.color}`}
                          >
                            <IconComponent size={20} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-[#1e3a5f]">
                                  {announcement.title}
                                </h3>
                                <p className="text-sm text-gray-600 mt-1">
                                  {announcement.description}
                                </p>
                                <p className="text-xs text-gray-400 mt-2">
                                  {announcement.date}
                                </p>
                              </div>

                              {/* Badge audience */}
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                  {announcement.audience}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modal Component */}
      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handlePublishAnnouncement}
      />
    </div>
  );
};

export default Announcements;
