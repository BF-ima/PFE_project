import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from 'react-hot-toast';
import StudentSidebar from "../../layout/StudentSidebar";
import { ProfileDropdown } from "./FirstPage";
import { 
  Bell, Info, AlertCircle, AlertTriangle, Clock, Check, 
  MessageCircle, Trophy, Facebook, Linkedin, 
  Megaphone, UserPlus, Calendar, Users, Wrench, X, Mail, CheckCircle, XCircle, Clock as ClockIcon
} from "lucide-react";
import NotificationsPanel from "../../layout/NotificationsPanel";
import AnnouncementsPanel from "../../layout/AnnouncementsPanel";
import InvitationsPanel from "../../layout/InvitationsPanel";
import AnnouncementDetailModal from "../../layout/AnnouncementDetailModal";

const Notifications = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notifications");
  const [activeFilter, setActiveFilter] = useState("all");
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [inviteFilter, setInviteFilter] = useState("all");
  const [announcementFilter, setAnnouncementFilter] = useState("all");
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const [currentUser] = useState({
    id: 1,
    firstName: "Student",
    lastName: "",
    email: "student@esi-sba.dz",
    role: "Student",
  });

  // Mock notifications data
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "info",
      title: "New message",
      description: "You have a new message from John willson",
      date: "Mar 24, 2026 - 10:15",
      read: false,
      icon: MessageCircle,
    },
    {
      id: 2,
      type: "urgent",
      title: "System maintenance",
      description: "The platform will undergo scheduled maintenance on March 25th from 10 PM to 2 AM. All services will be temporarily unavailable during this period. Please plan accordingly and save your work before this time.",
      date: "Mar 24, 2026 - 10:15",
      read: false,
      icon: AlertTriangle,
      audience: "All users"
    },
    {
      id: 3,
      type: "alert",
      title: "Results Published",
      description: "Your project selection results have been published",
      date: "Mar 24, 2026 - 12:00",
      read: true,
      icon: Trophy,
    },
    {
      id: 4,
      type: "reminder",
      title: "Deadline Reminder",
      description: "The deadline is in 24 hours",
      date: "Mar 24, 2026 - 12:00",
      read: true,
      icon: Clock,
    },
  ]);

  // Mock announcements data
  const [announcements] = useState([
    {
      id: 1,
      title: "System maintenance",
      description: "The platform will undergo scheduled maintenance on March 25th from 10 PM to 2 AM. All services will be temporarily unavailable during this period. Please plan accordingly and save your work before this time.",
      audience: "All users",
      date: "Mar 24, 2026 - 10:15",
      icon: Wrench,
      type: "urgent"
    },
    {
      id: 2,
      title: "Project Allocation Results Published",
      description: "The results of the project allocation have been published. You can now view your assigned project on the platform. If any team wishes to request a change of project, please contact the administration directly.",
      audience: "Students",
      date: "Mar 24, 2026 - 10:15",
      icon: Trophy,
      type: "important"
    },
    {
      id: 3,
      title: "Welcome New Students",
      description: "A warm welcome to all new students joining the platform this semester. We hope you have a great experience working on your projects.",
      audience: "Students",
      date: "Mar 31, 2026 - 08:00",
      icon: Bell,
      type: "normal"
    },
  ]);

  // Load invitations: static data + incoming from TeamManagementPage via localStorage
  const [invitations, setInvitations] = useState(() => {
    const base = [
      {
        id: 1,
        senderName: "John Leader",
        senderEmail: "john.leader@esi-sba.dz",
        status: "pending",
        timeAgo: "2 days ago",
        teamId: "12453",
      },
      {
        id: 2,
        senderName: "John Leader",
        senderEmail: "john.leader@esi-sba.dz",
        status: "accepted",
        timeAgo: "7 days ago",
        teamId: "12568",
      },
      {
        id: 3,
        senderName: "John Leader",
        senderEmail: "john.leader@esi-sba.dz",
        status: "declined",
        timeAgo: "2 days ago",
        teamId: "12453",
      },
    ];
    const stored = JSON.parse(localStorage.getItem("pendingInvitations") || "[]");
    return [...base, ...stored];
  });

  // Listen for new invitations from TeamManagementPage
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = JSON.parse(localStorage.getItem("pendingInvitations") || "[]");
      setInvitations(prev => {
        const existingIds = prev.map(i => i.id);
        const newOnes = stored.filter(s => !existingIds.includes(s.id));
        if (newOnes.length === 0) return prev;
        return [...prev, ...newOnes];
      });
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleChangePassword = (formData) => {
    console.log("🔐 Password change:", formData);
  };

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })));
  };

  const handleMarkAsRead = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const handleMarkAsUnread = (id) => {
    setNotifications(
      notifications.map((notif) =>
        notif.id === id ? { ...notif, read: false } : notif
      )
    );
  };

  const handleAcceptInvite = (id) => {
    const inv = invitations.find(i => i.id === id);

    setInvitations(
      invitations.map((i) => i.id === id ? { ...i, status: "accepted" } : i)
    );

    if (inv) {
      const accepted = JSON.parse(localStorage.getItem("acceptedInvitations") || "[]");
      if (!accepted.some(a => a.id === inv.id)) {
        accepted.push(inv);
        localStorage.setItem("acceptedInvitations", JSON.stringify(accepted));
      }

      const pending = JSON.parse(localStorage.getItem("pendingInvitations") || "[]");
      const updated = pending.filter(i => i.id !== id);
      localStorage.setItem("pendingInvitations", JSON.stringify(updated));

      window.dispatchEvent(new Event("storage"));
      toast.success(`You have joined the team!`);
    }
  };

  const handleDeclineInvite = (id) => {
    setInvitations(
      invitations.map((inv) =>
        inv.id === id ? { ...inv, status: "declined" } : inv
      )
    );

    const pending = JSON.parse(localStorage.getItem("pendingInvitations") || "[]");
    const updated = pending.filter(i => i.id !== id);
    localStorage.setItem("pendingInvitations", JSON.stringify(updated));
    toast.success(`Invitation declined`);
  };

  const handleAnnouncementClick = (announcement) => {
    setSelectedNotification({
      ...announcement,
      type: announcement.type,
      title: announcement.title,
      description: announcement.description,
      date: announcement.date,
      audience: announcement.audience
    });
    setShowDetailModal(true);
  };

  const closeModal = () => {
    setShowDetailModal(false);
    setSelectedNotification(null);
  };

  const getTypeConfig = (type) => {
    const configs = {
      info: { 
        icon: Info, 
        color: { bg: "#DBEAFE", text: "#2563EB" },
        label: "Info" 
      },
      alert: { 
        icon: AlertCircle, 
        color: { bg: "#FEF3C7", text: "#D97706" },
        label: "Alert" 
      },
      urgent: { 
        icon: AlertTriangle, 
        color: { bg: "#FEE2E2", text: "#DC2626" },
        label: "Urgent" 
      },
      reminder: { 
        icon: Clock, 
        color: { bg: "#F3E8FF", text: "#9333EA" },
        label: "Reminder" 
      },
    };
    return configs[type] || configs.info;
  };

  const pendingCount = invitations.filter((inv) => inv.status === "pending").length;
  const unreadCount = notifications.filter((n) => !n.read).length;

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
              <a href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v" target="_blank" rel="noopener noreferrer" className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm" title="Facebook">
                <Facebook size={14} className="sm:w-5 sm:h-5" />
              </a>
              <a href="https://www.linkedin.com/in/https%3A%2F%2Fwww.linkedin.com%2Fschool%2Fesisba" target="_blank" rel="noopener noreferrer" className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm" title="LinkedIn">
                <Linkedin size={14} className="sm:w-5 sm:h-5" />
              </a>
              <ProfileDropdown user={currentUser} onLogout={handleLogout} onChangePassword={handleChangePassword} />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
          <div className="max-w-5xl mx-auto">
            {/* Tabs navigation */}
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setActiveTab("notifications")} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "notifications" ? "bg-[#1e3a5f] text-white shadow-sm" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                <Bell size={18} /> Notifications
              </button>
              <button onClick={() => setActiveTab("announcements")} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "announcements" ? "bg-[#1e3a5f] text-white shadow-sm" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                <Megaphone size={18} /> Announcements
              </button>
              <button onClick={() => setActiveTab("invites")} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${activeTab === "invites" ? "bg-[#1e3a5f] text-white shadow-sm" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                <UserPlus size={18} /> Invites
                {pendingCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{pendingCount}</span>
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

      {/* Detail Modal */}
      <AnnouncementDetailModal
        isOpen={showDetailModal}
        notification={selectedNotification}
        onClose={closeModal}
      />
    </div>
  );
};

export default Notifications;