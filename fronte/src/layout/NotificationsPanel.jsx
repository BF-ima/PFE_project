import React from 'react';
import { Bell, Check, Info, AlertCircle, Clock } from 'lucide-react';

const NotificationsPanel = ({
  notifications,
  unreadCount,
  activeFilter,
  setActiveFilter,
  unreadOnly,
  setUnreadOnly,
  onMarkAllRead,
  onMarkAsRead,
  onMarkAsUnread,
  getTypeConfig
}) => {
  const filteredNotifications = notifications.filter((notif) => {
    const matchesFilter = activeFilter === "all" || notif.type === activeFilter;
    const matchesUnread = !unreadOnly || !notif.is_read; // ← is_read not read
    return matchesFilter && matchesUnread;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Bell size={20} className="text-blue-600" />
          </div>
          <div>
            <h2 style={{ fontSize: "22px", fontWeight: 600 }} className="text-[#1e3a5f]">Notifications</h2>
            <p className="text-sm text-gray-500">{unreadCount} unread notifications</p>
          </div>
        </div>
        <button
          onClick={onMarkAllRead}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a4d] transition-colors text-sm font-medium"
        >
          <Check size={14} /> Mark all read
        </button>
      </div>

      {/* Filters — uppercase to match DB enum */}
      <div className="px-4 sm:px-6 py-2 flex flex-wrap items-center justify-between gap-3 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-2">
          {["all", "INFO", "ALERT", "REMINDER"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFilter === filter ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {filter === "all" ? "All" : filter.charAt(0) + filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <button
          onClick={() => setUnreadOnly(!unreadOnly)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            unreadOnly ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          Unread only
        </button>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {filteredNotifications.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Bell size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No notifications</p>
          </div>
        ) : (
          filteredNotifications.map((notification) => {
            const typeConfig    = getTypeConfig(notification.type);
            const IconComponent = typeConfig.icon;
            const isUnread      = !notification.is_read; // ← is_read

            return (
              <div
                key={notification.id}
                className={`px-4 sm:px-6 py-4 hover:bg-gray-50 transition-colors ${isUnread ? "bg-blue-50/30" : ""}`}
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
                    {/* message not description */}
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{notification.message}</p>

                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-gray-400">{formatDate(notification.created_at)}</p>
                      <div className="flex flex-col items-end gap-1">
                        {isUnread ? (
                          <>
                            <div style={{ width: "8px", height: "8px", backgroundColor: "#2D8FBF", borderRadius: "50%" }} />
                            <button
                              onClick={(e) => { e.stopPropagation(); onMarkAsRead(notification.id); }}
                              className="text-xs text-[#1e3a5f] hover:text-[#152a4d] font-medium"
                            >
                              Mark as read
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={(e) => { e.stopPropagation(); onMarkAsUnread(notification.id); }}
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
  );
};

export default NotificationsPanel;