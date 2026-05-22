import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import SupervisorSidebar from "../../layout/ExternalSupervisorSidebar";
import { ProfileDropdown } from '../supervisor/HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';
import { 
  Bell, Info, AlertCircle, AlertTriangle, Clock, Check, 
   Loader2
} from "lucide-react";

const BASE = 'http://localhost:3000';

// ==================== MAIN EXTERNAL SUPERVISOR NOTIFICATIONS ====================
const Notifications = () => {
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const [activeFilter,   setActiveFilter]   = useState("all");
  const [unreadOnly,     setUnreadOnly]      = useState(false);
  const [notifications,  setNotifications]  = useState([]);
  const [loading,        setLoading]         = useState(true);

  // ── Fetch from real API ──────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${BASE}/api/notifications`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      const data = await res.json();

      setNotifications(
        (data.notifications || []).map(n => ({
          id:          n.id,
          type:        (n.type || 'INFO').toLowerCase(),
          title:       n.title || 'Notification',
          description: n.message,
          date:        new Date(n.created_at).toLocaleString('en-GB', {
                         day: '2-digit', month: 'short', year: 'numeric',
                         hour: '2-digit', minute: '2-digit',
                       }),
          read:        !!n.is_read,
        }))
      );
    } catch (err) {
      console.error('fetchNotifications error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchNotifications(); }, [fetchNotifications]);

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  const handleMarkAllRead = async () => {
    try {
      await fetch(`${BASE}/api/notifications/read-all`, {
        method:  'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('markAllRead error:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await fetch(`${BASE}/api/notifications/${id}/read`, {
        method:  'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('markAsRead error:', err);
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      await fetch(`${BASE}/api/notifications/${id}/unread`, {
        method:  'PATCH',
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: false } : n));
    } catch (err) {
      console.error('markAsUnread error:', err);
    }
  };

  // ── Filtering ────────────────────────────────────────────────────────────
  const filteredNotifications = notifications.filter((notif) => {
    const matchesFilter = activeFilter === "all" || notif.type === activeFilter;
    const matchesUnread = !unreadOnly || !notif.read;
    return matchesFilter && matchesUnread;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Type config ──────────────────────────────────────────────────────────
  const getTypeConfig = (type) => {
    const configs = {
      info:     { icon: Info,          color: { bg: "#DBEAFE", text: "#2563EB" }, label: "Info"     },
      alert:    { icon: AlertCircle,   color: { bg: "#FEF3C7", text: "#D97706" }, label: "Alert"    },
      urgent:   { icon: AlertTriangle, color: { bg: "#FEE2E2", text: "#DC2626" }, label: "Urgent"   },
      reminder: { icon: Clock,         color: { bg: "#F3E8FF", text: "#9333EA" }, label: "Reminder" },
    };
    return configs[type] || configs.info;
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <Toaster position="top-center" />
      <SupervisorSidebar />

      <div className="flex-1 flex flex-col ml-16 overflow-hidden">

        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">
                Manage and track your projects
              </p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">
                Project Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              
              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={(formData) => console.log('Password change:', formData)}
              />
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

              {/* Panel header */}
              <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bell size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: "22px", fontWeight: 600 }} className="text-[#1e3a5f]">
                      Notifications
                    </h2>
                    <p className="text-sm text-gray-500">
                      {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleMarkAllRead}
                  className="flex items-center gap-2 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a4d] transition-colors text-sm font-medium"
                >
                  <Check size={14} />
                  Mark all read
                </button>
              </div>

              {/* Filters */}
              <div className="px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200">
                <div className="flex flex-wrap items-center gap-2">
                  {["all", "info", "alert", "reminder", "urgent"].map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setActiveFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                        activeFilter === filter
                          ? "bg-[#1e3a5f] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setUnreadOnly(!unreadOnly)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    unreadOnly
                      ? "bg-[#1e3a5f] text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Unread only
                </button>
              </div>

              {/* List */}
              <div className="divide-y divide-gray-100">
                {loading ? (
                  <div className="flex justify-center py-16">
                    <Loader2 size={28} className="animate-spin text-[#2D8FBF]" />
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="px-6 py-12 text-center text-gray-500">
                    <Bell size={48} className="mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No notifications</p>
                  </div>
                ) : (
                  filteredNotifications.map((notification) => {
                    const typeConfig    = getTypeConfig(notification.type);
                    const IconComponent = typeConfig.icon;
                    const isUnread      = !notification.read;

                    return (
                      <div
                        key={notification.id}
                        className={`px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors ${
                          isUnread ? "bg-blue-50/30" : ""
                        }`}
                      >
                        <div className="flex items-start gap-3 sm:gap-4">
                          <div
                            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                            style={{ backgroundColor: typeConfig.color.bg, color: typeConfig.color.text }}
                          >
                            <IconComponent size={20} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 style={{ fontSize: "18px", fontWeight: 600 }} className="text-gray-900">
                              {notification.title}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                              {notification.description}
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs text-gray-400">{notification.date}</p>
                              <div className="flex flex-col items-end gap-1">
                                {isUnread ? (
                                  <>
                                    <div style={{ width: "8px", height: "8px", backgroundColor: "#2D8FBF", borderRadius: "50%" }} />
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleMarkAsRead(notification.id); }}
                                      className="text-xs text-[#1e3a5f] hover:text-[#152a4d] font-medium"
                                    >
                                      Mark as read
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    onClick={(e) => { e.stopPropagation(); handleMarkAsUnread(notification.id); }}
                                    className="text-xs text-gray-400 hover:text-gray-600"
                                  >
                                    Mark as unread
                                  </button>
                                )}
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
    </div>
  );
};

export default Notifications;