import React, { useState, useEffect } from "react";
import { X, Clock, Save } from "lucide-react";

const DeadlineSettingsModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    sendReminder: false,
    sendUrgent: false,
  });
  const [scheduledInfo, setScheduledInfo] = useState(null);

  // ── Load existing deadline when modal opens ──
  useEffect(() => {
    if (!isOpen) return;
    const token = localStorage.getItem("token");
    fetch("http://localhost:3000/api/deadline", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.deadline) {
          const dt   = new Date(data.deadline.deadline_at);
          const date = dt.toISOString().split("T")[0];
          const time = dt.toTimeString().slice(0, 5);
          setFormData({
            date,
            time,
            sendReminder: !!data.deadline.send_reminder,
            sendUrgent:   !!data.deadline.send_urgent,
          });
          setScheduledInfo({ date, time });
        }
      })
      .catch(console.error);
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (field) => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  // ── Broadcast helper ──
  const broadcast = async (token, type, title, message) => {
    try {
      console.log("Calling broadcast with:", { type, title });
      const r = await fetch("http://localhost:3000/api/notifications/broadcast", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({ type, title, message, role: "etudiant" }),
      });
      const d = await r.json();
      console.log("broadcast status:", r.status, "body:", d);
      if (!r.ok) alert(`Broadcast failed: ${d.message}`);
    } catch (err) {
      console.error("broadcast fetch error:", err);
      alert(`Network error: ${err.message}`);
    }
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.time) {
      alert("Please fill in both date and time");
      return;
    }
    try {
      const token = localStorage.getItem("token");

      // ── Capture ALL values before any state reset or async gaps ──
      const capturedDate     = formData.date;
      const capturedTime     = formData.time;
      const capturedReminder = formData.sendReminder;
      const capturedUrgent   = formData.sendUrgent;

      console.log("Captured values:", { capturedDate, capturedTime, capturedReminder, capturedUrgent });

      // 1 — Save the deadline
      const res = await fetch("http://localhost:3000/api/deadline", {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:  `Bearer ${token}`,
        },
        body: JSON.stringify({
          date:         capturedDate,
          time:         capturedTime,
          sendReminder: capturedReminder,
          sendUrgent:   capturedUrgent,
        }),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Failed to save deadline"); return; }

      const deadlineAt = new Date(`${capturedDate}T${capturedTime}:00`);
      const now        = Date.now();

      console.log("deadlineAt:", deadlineAt);
      console.log("now:", new Date(now));

      // 2 — Reminder notification (24h before)
      if (capturedReminder) {
        const delayReminder = deadlineAt.getTime() - 24 * 60 * 60 * 1000 - now;

        console.log(`⏰ Reminder delay: ${Math.round(delayReminder / 1000)}s (${Math.round(delayReminder / 1000 / 60)} min)`);

        if (delayReminder > 0) {
          console.log("⏰ Reminder: scheduling setTimeout");
          setTimeout(() => {
            console.log("⏰ Reminder setTimeout FIRED");
            broadcast(
              token,
              "REMINDER",
              "⏰ Deadline Reminder",
              `The project preference submission deadline is tomorrow at ${capturedTime}. Make sure to submit your preferences before it's too late!`
            );
          }, delayReminder);
        } else {
          console.log("⏰ Reminder: delay passed, sending immediately");
          await broadcast(
            token,
            "REMINDER",
            "⏰ Deadline Reminder",
            `The project preference submission deadline is on ${capturedDate} at ${capturedTime}. Make sure to submit your preferences before it's too late!`
          );
        }
      }

      // 3 — Urgent notification (2h before)
      if (capturedUrgent) {
        const delayUrgent = deadlineAt.getTime() - 2 * 60 * 60 * 1000 - now;

        console.log(`🚨 Urgent delay: ${Math.round(delayUrgent / 1000)}s (${Math.round(delayUrgent / 1000 / 60)} min)`);

        if (delayUrgent > 0) {
          console.log("🚨 Urgent: scheduling setTimeout");
          setTimeout(() => {
            console.log("🚨 Urgent setTimeout FIRED");
            broadcast(
              token,
              "ALERT",
              "🚨 Urgent: Deadline in 2 Hours!",
              `The project preference submission deadline is in 2 hours (at ${capturedTime}). Submit your preferences immediately!`
            );
          }, delayUrgent);
        } else {
          console.log("🚨 Urgent: delay passed, sending immediately");
          await broadcast(
            token,
            "ALERT",
            "🚨 Urgent: Deadline Very Soon!",
            `The project preference submission deadline is at ${capturedTime} today. Submit your preferences immediately!`
          );
        }
      }

      setScheduledInfo({ date: capturedDate, time: capturedTime });
      onSave({ date: capturedDate, time: capturedTime, sendReminder: capturedReminder, sendUrgent: capturedUrgent });

      // ── Call onClose() directly, NOT handleClose() ──
      // handleClose() resets formData which could interfere with setTimeout closures
      onClose();

    } catch (err) {
      console.error("setDeadline error:", err);
      alert("Server error");
    }
  };

  const handleClose = () => {
    setFormData({ date: "", time: "", sendReminder: false, sendUrgent: false });
    setScheduledInfo(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-[#1e3a5f]">Deadline Settings</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-6">
          <div>
            <h3 className="text-base font-semibold text-[#1e3a5f] mb-2">
              Student Preference Submission Deadline
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Set the deadline for students to submit their project preference lists.
              After this deadline, students will no longer be able to modify their preferences.
            </p>

            {/* Currently active deadline */}
            {scheduledInfo && (
              <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-green-800">
                  <span className="font-medium">✅ Active Deadline:</span>{" "}
                  {scheduledInfo.date} at {scheduledInfo.time}
                </p>
              </div>
            )}

            {/* Date */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Deadline date</label>
              <div className="relative">
                <input type="date" name="date" value={formData.date} onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            {/* Time */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Deadline time</label>
              <div className="relative">
                <input type="time" name="time" value={formData.time} onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              </div>
            </div>

            {/* Preview */}
            {(formData.date || formData.time) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Deadline Preview:</span>{" "}
                  {formData.date} at {formData.time}
                </p>
              </div>
            )}

            <button onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors font-medium">
              <Save size={18} /> Save Deadline
            </button>
          </div>

          <hr className="border-gray-200" />

          {/* Additional Options */}
          <div>
            <h3 className="text-base font-semibold text-[#1e3a5f] mb-4">Additional Options</h3>
            <div className="space-y-4">

              {/* Reminder */}
              <div className="flex items-start gap-3">
                <input type="checkbox" id="sendReminder" checked={formData.sendReminder}
                  onChange={() => handleCheckboxChange("sendReminder")}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                <div>
                  <label htmlFor="sendReminder" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Send Reminder notifications
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically send reminders to students 24 hours before the deadline
                  </p>
                </div>
              </div>

              {/* Urgent */}
              <div className="flex items-start gap-3">
                <input type="checkbox" id="sendUrgent" checked={formData.sendUrgent}
                  onChange={() => handleCheckboxChange("sendUrgent")}
                  className="mt-1 w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500" />
                <div>
                  <label htmlFor="sendUrgent" className="text-sm font-medium text-gray-700 cursor-pointer">
                    Send Urgent notifications
                  </label>
                  <p className="text-xs text-gray-500 mt-1">
                    Automatically send urgent notifications to students 2 hours before the deadline
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