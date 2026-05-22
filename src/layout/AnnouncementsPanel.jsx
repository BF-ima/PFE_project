import React from 'react';
import { Megaphone, Users, Calendar } from 'lucide-react';

const AnnouncementsPanel = ({
  announcements,
  announcementFilter,
  setAnnouncementFilter,
  onAnnouncementClick,
  readAnnouncementIds = new Set(),
}) => {
  const filteredAnnouncements = announcements.filter((a) => {
    if (announcementFilter === "all") return true;
    return a.type === announcementFilter;
  });

  const unreadCount = announcements.filter(a => !readAnnouncementIds.has(a.id)).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">Urgent</span>;
      case 'important':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Important</span>;
      case 'normal':
        return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Normal</span>;
      default:
        return null;
    }
  };

  return (
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
              {unreadCount > 0 && (
                <span className="ml-2 inline-flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#2D8FBF] inline-block" />
                  <span className="text-[#2D8FBF] font-medium">{unreadCount} unread</span>
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex flex-wrap items-center gap-2">
        {["all", "normal", "important", "urgent"].map((filter) => (
          <button
            key={filter}
            onClick={() => setAnnouncementFilter(filter)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              announcementFilter === filter ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {filter === "all" ? "All" : filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {filteredAnnouncements.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Megaphone size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No announcements</p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => {
            const isUnread = !readAnnouncementIds.has(announcement.id);
            return (
              <div
                key={announcement.id}
                className={`px-4 sm:px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer relative ${
                  isUnread ? 'bg-blue-50/30' : ''
                }`}
                onClick={() => onAnnouncementClick(announcement)}
              >
                {/* Unread dot inside the row */}
                {isUnread && (
                  <span className="absolute top-5 right-4 w-2 h-2 rounded-full bg-[#2D8FBF]" />
                )}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-1 pr-5">
                    <h3 className={`text-lg font-semibold ${isUnread ? 'text-gray-900' : 'text-gray-600'}`}>
                      {announcement.title}
                    </h3>
                    <div className="flex items-center gap-2">{getTypeBadge(announcement.type)}</div>
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
          })
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPanel;