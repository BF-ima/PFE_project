import React from 'react';
import { Megaphone, Users, Calendar } from 'lucide-react';

const AnnouncementsPanel = ({ 
  announcements, 
  announcementFilter, 
  setAnnouncementFilter, 
  onAnnouncementClick 
}) => {
  const filteredAnnouncements = announcements.filter((announcement) => {
    if (announcementFilter === "all") return true;
    return announcement.type === announcementFilter;
  });

  const getTypeBadge = (type) => {
    switch(type) {
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
            <p className="text-sm text-gray-500">{announcements.length} total Announcements</p>
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

      {/* Announcements List */}
      <div className="divide-y divide-gray-100">
        {filteredAnnouncements.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <Megaphone size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No announcements</p>
            <p className="text-sm mt-2">No announcements match your filters</p>
          </div>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <div
              key={announcement.id}
              className="px-4 sm:px-6 py-5 hover:bg-gray-50 transition-colors cursor-pointer"
              onClick={() => onAnnouncementClick(announcement)}
            >
              <div className="flex flex-col">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-lg font-semibold text-gray-800">{announcement.title}</h3>
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
                    <span className="text-xs text-gray-500">{announcement.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AnnouncementsPanel;