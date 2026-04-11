import React, { useState } from "react";
import { X, Clock, Save } from "lucide-react";

const DeadlineSettingsModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    sendReminder: false,
    sendUrgent: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (field) => {
    setFormData((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handleSubmit = () => {
    if (!formData.date || !formData.time) {
      alert("Please fill in both date and time");
      return;
    }

    const deadlineData = {
      date: formData.date,
      time: formData.time,
      sendReminder: formData.sendReminder,
      sendUrgent: formData.sendUrgent,
    };

    onSave(deadlineData);
    handleClose();
  };

  const handleClose = () => {
    setFormData({
      date: "",
      time: "",
      sendReminder: false,
      sendUrgent: false,
    });
    onClose();
  };

  // Format the preview date
  const getPreviewDate = () => {
    if (!formData.date) return null;
    
    const dateObj = new Date(formData.date);
    const options = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return dateObj.toLocaleDateString('en-US', options);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#1e3a5f]">
            Deadline Settings
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="px-6 py-5 space-y-6">
          {/* Student Preference Submission Deadline Section */}
          <div>
            <h3 className="text-base font-semibold text-[#1e3a5f] mb-2">
              Student Preference Submission Deadline
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Set the deadline for students to submit their project preference lists. 
              After this deadline, students will no longer be able to modify their preferences.
            </p>

            {/* Deadline Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline date
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            {/* Deadline Time */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline time
              </label>
              <div className="relative">
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            {/* Deadline Preview */}
            {(formData.date || formData.time) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Deadline Preview:</span>{" "}
                  {getPreviewDate()}
                </p>
              </div>
            )}

            {/* Save Button */}
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium"
            >
              <Save size={18} />
              Save Deadline
            </button>
          </div>

          {/* Divider */}
          <hr className="border-gray-200" />

          {/* Additional Options Section */}
          <div>
            <h3 className="text-base font-semibold text-[#1e3a5f] mb-4">
              Additional Options
            </h3>
            
            <div className="space-y-4">
              {/* Send Reminder Notifications */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="sendReminder"
                  checked={formData.sendReminder}
                  onChange={() => handleCheckboxChange("sendReminder")}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div>
                  <label htmlFor="sendReminder" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Send Reminder notifications
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically send reminders to students 24 hours before the deadline
                  </p>
                </div>
              </div>

              {/* Send Urgent Notifications */}
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="sendUrgent"
                  checked={formData.sendUrgent}
                  onChange={() => handleCheckboxChange("sendUrgent")}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <div>
                  <label htmlFor="sendUrgent" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Send Urgent notifications
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically send urgent to students 2 hours before the deadline
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeadlineSettingsModal;