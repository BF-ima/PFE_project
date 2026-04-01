import React from 'react';
import { X } from 'lucide-react';

const AnnouncementDetailModal = ({ isOpen, notification, onClose }) => {
  if (!isOpen || !notification) return null;

  const getTypeBadge = () => {
    const badges = {
      urgent: <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">Urgent</span>,
      alert: <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700">Alert</span>,
      important: <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Important</span>,
      reminder: <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">Reminder</span>,
      info: <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Info</span>,
      normal: <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">Normal</span>,
    };
    return badges[notification.type] || badges.info;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-xl relative" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          title="Close"
        >
          <X size={20} />
        </button>
        
        <div className="px-6 pt-6 pb-6">
          <div className="mb-4">{getTypeBadge()}</div>
          
          <h3 className="text-2xl font-bold text-[#1e3a5f] mb-2">{notification.title}</h3>
          <p className="text-sm text-gray-500 mb-4">{notification.date}</p>
          <p className="text-gray-600 text-sm leading-relaxed mb-6">{notification.description}</p>
          
          <div className="border-t border-gray-200 my-4"></div>
          
          <div className="mt-2">
            <p className="text-xs text-gray-500 font-medium mb-2">Target audience</p>
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
              {notification.audience || "All users"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementDetailModal;