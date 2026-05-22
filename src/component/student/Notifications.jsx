import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import StudentSidebar from "../../layout/StudentSidebar";
import { ProfileDropdown } from '../supervisor/HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';
import {
  Bell, Info, AlertCircle, Clock,
  MessageCircle, Trophy, 
  Megaphone, UserPlus,
} from "lucide-react";
import NotificationsPanel from "../../layout/NotificationsPanel";
import AnnouncementsPanel from "../../layout/AnnouncementsPanel";
import InvitationsPanel from "../../layout/InvitationsPanel";
import AnnouncementDetailModal from "../../layout/AnnouncementDetailModal";
import { getReadIds, markAnnouncementRead } from "../../api/announcements";

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab,             setActiveTab]             = useState("notifications");
  const [activeFilter,          setActiveFilter]          = useState("all");
  const [unreadOnly,            setUnreadOnly]            = useState(false);
  const [inviteFilter,          setInviteFilter]          = useState("all");
  const [announcementFilter,    setAnnouncementFilter]    = useState("all");
  const [selectedNotification,  setSelectedNotification]  = useState(null);
  const [showDetailModal,       setShowDetailModal]       = useState(false);
  const [readAnnouncementIds,   setReadAnnouncementIds]   = useState(() => getReadIds());

  const { currentUser } = useCurrentUser();

  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [invitations,   setInvitations]   = useState([]);

  // ── Fetch all three on mount ──────────────────────────────────────────────
  useEffect(() => {
    const token   = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("http://localhost:3000/api/notifications", { headers }).then(r => r.json()),
      fetch("http://localhost:3000/api/announcements", { headers }).then(r => r.json()),
      fetch("http://localhost:3000/api/invitations",   { headers }).then(r => r.json()),
    ])
      .then(([notifData, announceData, inviteData]) => {
        setNotifications(notifData.notifications    || []);
        setAnnouncements(announceData.announcements || []);
        setInvitations(inviteData.invitations       || []);
      })
      .catch(() => toast.error("Failed to load data"));
  }, []);

  // ── Notification handlers ─────────────────────────────────────────────────
  const handleMarkAsRead = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3000/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleMarkAsUnread = async (id) => {
    const token = localStorage.getItem("token");
    await fetch(`http://localhost:3000/api/notifications/${id}/unread`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: false } : n));
  };

  const handleMarkAllRead = async () => {
    const token = localStorage.getItem("token");
    await fetch("http://localhost:3000/api/notifications/read-all", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  // ── Announcement click — mark as read immediately ─────────────────────────
  const handleAnnouncementClick = (announcement) => {
    markAnnouncementRead(announcement.id);
    setReadAnnouncementIds(getReadIds());
    setSelectedNotification(announcement);
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
  };

  // ── Invitation handlers ───────────────────────────────────────────────────
  const handleAcceptInvite = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`http://localhost:3000/api/invitations/${id}/accept`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setInvitations(prev => prev.map(i => i.id === id ? { ...i, status: "ACCEPTED" } : i));
        toast.success("You have joined the team!");
      } else {
        setInvitations(prev => prev.map(i => i.id === id ? { ...i, status: "REJECTED" } : i));
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Network error. Please try again.");
    }
  };

  const handleDeclineInvite = async (id) => {
    const token = localStorage.getItem("token");
    const res   = await fetch(`http://localhost:3000/api/invitations/${id}/decline`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) { toast.error(data.message); return; }
    setInvitations(prev => prev.map(i => i.id === id ? { ...i, status: "REJECTED" } : i));
    toast.success("Invitation declined");
  };

  // ── Type config ───────────────────────────────────────────────────────────
  const getTypeConfig = (type) => {
    const configs = {
      INFO:     { icon: Info,         color: { bg: "#DBEAFE", text: "#2563EB" }, label: "Info"     },
      ALERT:    { icon: AlertCircle,  color: { bg: "#FEE2E2", text: "#DC2626" }, label: "Alert"    },
      REMINDER: { icon: Clock,        color: { bg: "#F3E8FF", text: "#9333EA" }, label: "Reminder" },
    };
    return configs[type] || configs.INFO;
  };

  const pendingCount = invitations.filter(i => i.status === "PENDING").length;
  const unreadCount  = notifications.filter(n => !n.is_read).length;

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <Toaster position="top-center" />
      <StudentSidebar />

      <div className="flex-1 flex flex-col ml-16 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track your projects</p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              
              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={() => {}}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">

            {/* Tabs */}
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setActiveTab("notifications")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "notifications" ? "bg-[#1e3a5f] text-white shadow-sm" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}>
                <Bell size={18} /> Notifications
                {unreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              <button onClick={() => setActiveTab("announcements")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "announcements" ? "bg-[#1e3a5f] text-white shadow-sm" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}>
                <Megaphone size={18} /> Announcements
                {(() => {
                  const unread = announcements.filter(a => !readAnnouncementIds.has(a.id)).length;
                  return unread > 0 ? (
                    <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unread}
                    </span>
                  ) : null;
                })()}
              </button>

              <button onClick={() => setActiveTab("invites")}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "invites" ? "bg-[#1e3a5f] text-white shadow-sm" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}>
                <UserPlus size={18} /> Invites
                {pendingCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>

            {/* Panels */}
            {activeTab === "notifications" && (
              <NotificationsPanel
                notifications={notifications}
                unreadCount={unreadCount}
                activeFilter={activeFilter}
                setActiveFilter={setActiveFilter}
                unreadOnly={unreadOnly}
                setUnreadOnly={setUnreadOnly}
                onMarkAllRead={handleMarkAllRead}
                onMarkAsRead={handleMarkAsRead}
                onMarkAsUnread={handleMarkAsUnread}
                getTypeConfig={getTypeConfig}
              />
            )}
            {activeTab === "announcements" && (
              <AnnouncementsPanel
                announcements={announcements}
                announcementFilter={announcementFilter}
                setAnnouncementFilter={setAnnouncementFilter}
                onAnnouncementClick={handleAnnouncementClick}
                readAnnouncementIds={readAnnouncementIds}
              />
            )}
            {activeTab === "invites" && (
              <InvitationsPanel
                invitations={invitations}
                pendingCount={pendingCount}
                inviteFilter={inviteFilter}
                setInviteFilter={setInviteFilter}
                onAcceptInvite={handleAcceptInvite}
                onDeclineInvite={handleDeclineInvite}
              />
            )}
          </div>
        </main>
      </div>

      <AnnouncementDetailModal
        isOpen={showDetailModal}
        notification={selectedNotification}
        onClose={closeModal}
      />
    </div>
  );
};

export default Notifications;