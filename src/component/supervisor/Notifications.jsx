import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import SupervisorSidebar from "../../layout/SupervisorSidebar";
import { ProfileDropdown } from "./HomePage";
import { fetchAnnouncements, createAnnouncement, getReadIds, markAnnouncementRead } from "../../api/announcements";
import {
  Bell, Info, AlertCircle, AlertTriangle, Clock, Check,
  MessageCircle, Trophy, Facebook, Linkedin,
  Megaphone, Calendar, Users, X, Plus,
} from "lucide-react";
import AnnouncementDetailModal from "../../layout/AnnouncementDetailModal";

// ==================== CREATE ANNOUNCEMENT MODAL ====================
const CreateAnnouncementModal = ({ isOpen, onClose, onAdd }) => {
  const [title,    setTitle]    = useState('');
  const [content,  setContent]  = useState('');
  const [priority, setPriority] = useState('normal');
  const [errors,   setErrors]   = useState({});

  const validate = () => {
    const newErrors = {};
    if (!title.trim())   newErrors.title   = 'Title is required';
    if (!content.trim()) newErrors.content = 'Content is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onAdd({
      id:          Date.now(),
      title:       title.trim(),
      description: content.trim(),
      type:        priority,
      audience:    'All users',
      date:        new Date().toLocaleString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
      }),
    });
    setTitle(''); setContent(''); setPriority('normal');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-100 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-2 flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#1e3a5f]">Create Announcement</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Title</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] bg-gray-200 ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Announcement title" />
            {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1e3a5f] mb-1">Content</label>
            <textarea rows="4" value={content} onChange={e => setContent(e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2D8FBF] bg-gray-200 ${errors.content ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="Announcement content" />
            {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1e3a5f] mb-2">Priority</label>
            <div className="flex flex-wrap gap-4">
              {['normal', 'important', 'urgent'].map(p => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="priority" value={p} checked={priority === p}
                    onChange={e => setPriority(e.target.value)}
                    className="w-4 h-4" style={{ accentColor: '#7C3AED' }} />
                  <span className="text-sm text-gray-700">{p.charAt(0).toUpperCase() + p.slice(1)}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-xl hover:bg-gray-50 text-sm font-medium">
              Cancel
            </button>
            <button type="submit"
              className="px-6 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 text-sm font-medium">
              Publish announcement
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== MAIN ====================
const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab,            setActiveTab]            = useState("notifications");
  const [activeFilter,         setActiveFilter]         = useState("all");
  const [unreadOnly,           setUnreadOnly]           = useState(false);
  const [announcementFilter,   setAnnouncementFilter]   = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal,      setShowDetailModal]      = useState(false);
  const [showCreateModal,      setShowCreateModal]      = useState(false);
  const [readAnnouncementIds,  setReadAnnouncementIds]  = useState(() => getReadIds());

  const [notifications, setNotifications] = useState([
    { id: 1, type: "info",     title: "New message",         description: "You have a new message from John willson",                    date: "Mar 24, 2026 - 10:15", read: false, icon: MessageCircle },
    { id: 2, type: "urgent",   title: "System maintenance",  description: "The platform will undergo scheduled maintenance on March 25th.", date: "Mar 24, 2026 - 10:15", read: false, icon: AlertTriangle, audience: "All users" },
    { id: 3, type: "alert",    title: "Results Published",   description: "Your project selection results have been published",             date: "Mar 24, 2026 - 12:00", read: true,  icon: Trophy },
    { id: 4, type: "reminder", title: "Deadline Reminder",   description: "The deadline is in 24 hours",                                    date: "Mar 24, 2026 - 12:00", read: true,  icon: Clock },
  ]);

  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    fetchAnnouncements()
      .then(setAnnouncements)
      .catch(() => toast.error("Failed to load announcements"));
  }, []);

  const handleLogout = () => { localStorage.removeItem('token'); sessionStorage.clear(); navigate('/login'); };

  const handleMarkAllRead  = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const handleMarkAsRead   = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true  } : n));
  const handleMarkAsUnread = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));

  const handleAnnouncementClick = (announcement) => {
    markAnnouncementRead(announcement.id);
    setReadAnnouncementIds(getReadIds());
    setSelectedNotification({ ...announcement });
    setShowDetailModal(true);
  };

  const closeModal = () => { setShowDetailModal(false); setSelectedNotification(null); };

  const handleAddAnnouncement = async (newAnnouncement) => {
    try {
      await createAnnouncement({
        title:       newAnnouncement.title,
        description: newAnnouncement.description,
        type:        newAnnouncement.type,
        audience:    "Students",
      });
      const updated = await fetchAnnouncements();
      setAnnouncements(updated);
      toast.success("Announcement published for students!");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredNotifications = notifications.filter(n => {
    const matchesFilter = activeFilter === "all" || n.type === activeFilter;
    const matchesUnread = !unreadOnly || !n.read;
    return matchesFilter && matchesUnread;
  });

  const filteredAnnouncements = announcements.filter(a =>
    announcementFilter === "all" ? true : a.type === announcementFilter
  );

  const unreadCount          = notifications.filter(n => !n.read).length;
  const announcementUnread   = announcements.filter(a => !readAnnouncementIds.has(a.id)).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const getTypeConfig = (type) => ({
    info:     { icon: Info,          color: { bg: "#DBEAFE", text: "#2563EB" } },
    alert:    { icon: AlertCircle,   color: { bg: "#FEF3C7", text: "#D97706" } },
    urgent:   { icon: AlertTriangle, color: { bg: "#FEE2E2", text: "#DC2626" } },
    reminder: { icon: Clock,         color: { bg: "#F3E8FF", text: "#9333EA" } },
  }[type] || { icon: Info, color: { bg: "#DBEAFE", text: "#2563EB" } });

  const getAnnouncementTypeBadge = (type) => ({
    urgent:    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Urgent</span>,
    important: <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Important</span>,
    normal:    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Normal</span>,
  }[type] || null);

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <Toaster position="top-center" />
      <SupervisorSidebar />

      <div className="flex-1 flex flex-col ml-16 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track your projects</p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <a href="https://www.facebook.com/esisba.edu" target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg shadow-sm">
                <Facebook size={14} />
              </a>
              <a href="https://www.linkedin.com/school/esisba" target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg shadow-sm">
                <Linkedin size={14} />
              </a>
              <ProfileDropdown user={{ id: 1, firstName: "Supervisor", lastName: "", email: "supervisor@esi-sba.dz", role: "Supervisor" }}
                onLogout={handleLogout} onChangePassword={() => {}} />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">

            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setActiveTab("notifications")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "notifications" ? "bg-[#1e3a5f] text-white shadow-sm" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                <Bell size={18} /> Notifications
                {unreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{unreadCount}</span>
                )}
              </button>
              <button onClick={() => setActiveTab("announcements")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "announcements" ? "bg-[#1e3a5f] text-white shadow-sm" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                <Megaphone size={18} /> Announcements
                {announcementUnread > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{announcementUnread}</span>
                )}
              </button>
            </div>

            {/* Notifications Panel */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bell size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-[#1e3a5f]">Notifications</h2>
                      <p className="text-sm text-gray-500">{unreadCount} unread notifications</p>
                    </div>
                  </div>
                  <button onClick={handleMarkAllRead}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a4d] text-sm font-medium">
                    <Check size={14} /> Mark all read
                  </button>
                </div>

                <div className="px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200">
                  <div className="flex flex-wrap items-center gap-2">
                    {["all", "info", "alert", "reminder", "urgent"].map(f => (
                      <button key={f} onClick={() => setActiveFilter(f)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeFilter === f ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                        {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setUnreadOnly(!unreadOnly)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${unreadOnly ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    Unread only
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {filteredNotifications.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">
                      <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No notifications</p>
                    </div>
                  ) : filteredNotifications.map(notification => {
                    const IconComponent = notification.icon;
                    const typeConfig    = getTypeConfig(notification.type);
                    const isUnread      = !notification.read;
                    return (
                      <div key={notification.id}
                        className={`px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors ${isUnread ? "bg-blue-50/30" : ""}`}>
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: typeConfig.color.bg, color: typeConfig.color.text }}>
                            <IconComponent size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900">{notification.title}</h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-400">{notification.date}</p>
                              <div className="flex flex-col items-end gap-1">
                                {isUnread ? (
                                  <>
                                    <div className="w-2 h-2 rounded-full bg-[#2D8FBF]" />
                                    <button onClick={e => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                                      className="text-xs text-[#1e3a5f] hover:text-[#152a4d] font-medium">
                                      Mark as read
                                    </button>
                                  </>
                                ) : (
                                  <button onClick={e => { e.stopPropagation(); handleMarkAsUnread(notification.id); }}
                                    className="text-xs text-gray-400 hover:text-gray-600">
                                    Mark as unread
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Announcements Panel */}
            {activeTab === "announcements" && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#EEC9FE" }}>
                      <Megaphone size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-[#1e3a5f]">Announcements</h2>
                      <p className="text-sm text-gray-500">
                        {announcements.length} total
                        {announcementUnread > 0 && (
                          <span className="ml-2 inline-flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-[#2D8FBF] inline-block" />
                            <span className="text-[#2D8FBF] font-medium">{announcementUnread} unread</span>
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium">
                    <Plus size={16} /> Make a new announcement
                  </button>
                </div>

                <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex flex-wrap items-center gap-2">
                  {["all", "normal", "important", "urgent"].map(f => (
                    <button key={f} onClick={() => setAnnouncementFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${announcementFilter === f ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>

                <div className="divide-y divide-gray-100">
                  {filteredAnnouncements.length === 0 ? (
                    <div className="px-6 py-12 text-center text-gray-500">
                      <Megaphone size={48} className="mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No announcements</p>
                    </div>
                  ) : filteredAnnouncements.map(announcement => {
                    const isUnread = !readAnnouncementIds.has(announcement.id);
                    return (
                      <div key={announcement.id}
                        className={`px-4 sm:px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer relative ${isUnread ? 'bg-blue-50/30' : ''}`}
                        onClick={() => handleAnnouncementClick(announcement)}>
                        {isUnread && (
                          <span className="absolute top-5 right-4 w-2 h-2 rounded-full bg-[#2D8FBF]" />
                        )}
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between mb-1 pr-5">
                            <h3 className={`text-lg font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
                              {announcement.title}
                            </h3>
                            <div className="flex items-center gap-2">{getAnnouncementTypeBadge(announcement.type)}</div>
                          </div>
                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{announcement.description}</p>
                          <div className="mt-4 space-y-2">
                            <div className="flex items-center gap-1">
                              <Users size={14} className="text-gray-400" />
                              <span className="text-xs text-gray-500 font-medium">{announcement.audience}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar size={14} className="text-gray-400" />
                              <span className="text-xs text-gray-500">{formatDate(announcement.created_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      <AnnouncementDetailModal
        isOpen={showDetailModal}
        notification={selectedNotification}
        onClose={closeModal}
      />
      <CreateAnnouncementModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onAdd={handleAddAnnouncement}
      />
    </div>
  );
};

export default Notifications;