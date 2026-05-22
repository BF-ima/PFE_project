import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import Sidebar from "../../layout/Sidebar.jsx";
import { ProfileDropdown } from "../supervisor/HomePage";
import useCurrentUser from "../../hooks/useCurrentUser";
import CreateAnnouncementModal from "../../layout/CreateAnnouncementModal.jsx";
import { fetchAnnouncements, createAnnouncement } from "../../api/announcements"; // ← CHANGED
import {
  Bell, Megaphone, Plus, Clock,
  AlertCircle, Info, AlertTriangle, Check,
} from "lucide-react";

const Announcements = () => {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("announcements");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true); // ← CHANGED
  const { currentUser } = useCurrentUser();

  const [announcements, setAnnouncements] = useState([]);

  // ← CHANGED: load from API on mount
  useEffect(() => {
    fetchAnnouncements()
      .then(setAnnouncements)
      .catch(() => toast.error("Failed to load announcements"))
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  // ← CHANGED: POST to API then update local state
  const handlePublishAnnouncement = async (announcementData) => {
    try {
      await createAnnouncement({
        title: announcementData.title,
        description: announcementData.content,
        type: announcementData.priority,
        audience: announcementData.audience,
      });
      // Reload the list so the new item has a real DB id and created_at
      const updated = await fetchAnnouncements();
      setAnnouncements(updated);
      toast.success("Announcement published!");
      setIsModalOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const getTypeConfig = (type) => {
    const configs = {
  
      urgent:    { icon: AlertTriangle, color: "bg-red-100 text-red-600"     },
      normal:    { icon: Info,          color: "bg-gray-100 text-gray-600"   },
      important: { icon: AlertCircle,   color: "bg-yellow-100 text-yellow-700" },
    };
    return configs[type] || configs.info;
  };

  const filteredAnnouncements = announcements.filter(
    (a) => activeFilter === "all" || a.type === activeFilter
  );

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <Toaster position="top-center" />
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Stay informed with important updates</p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">Announcements</h1>
            </div>
            <ProfileDropdown user={currentUser} onLogout={handleLogout} />
          </div>
        </header>

        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => navigate("/notifications")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors">
                <Bell size={18} /> Notifications
              </button>
              <button onClick={() => setActiveTab("announcements")}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium bg-purple-600 text-white shadow-sm transition-colors">
                <Megaphone size={18} /> Announcements
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Megaphone size={20} className="text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-[#1e3a5f]">Announcements</h2>
                    <p className="text-sm text-gray-500">{announcements.length} total announcements</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium">
                  <Plus size={16} /> Make a new announcement
                </button>
              </div>

              {/* Filters */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center gap-2 flex-wrap">
                {["all", "urgent", "normal", "important"].map((filter) => (
                  <button key={filter} onClick={() => setActiveFilter(filter)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      activeFilter === filter
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-[#1E3A5F] hover:bg-gray-200"
                    }`}>
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="px-6 py-12 text-center text-gray-400">Loading…</div>
                ) : filteredAnnouncements.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <Megaphone size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No announcements</p>
                  </div>
                ) : (
                  filteredAnnouncements.map((announcement) => {
                    const { icon: IconComponent, color } = getTypeConfig(announcement.type);
                    return (
                      <div key={announcement.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${color}`}>
                            <IconComponent size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-semibold text-[#1e3a5f]">{announcement.title}</h3>
                                <p className="text-sm text-gray-600 mt-1">{announcement.description}</p>
                                <p className="text-xs text-gray-400 mt-2">{announcement.created_at || announcement.date}</p>
                              </div>
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium shrink-0">
                                {announcement.audience}
                              </span>
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

      <CreateAnnouncementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handlePublishAnnouncement}
      />
    </div>
  );
};

export default Announcements;