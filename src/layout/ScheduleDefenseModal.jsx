import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const ScheduleDefenseModal = ({
  isOpen,
  onClose,
  onConfirm,
  teamId,
  initialData = null,
}) => {
  const [formData, setFormData] = useState({
    date: "",
    time: "",
    room: "",
  });

  // Liste des salles disponibles
  const availableRooms = [
    "Room A101",
    "Room A102",
    "Room A103",
    "Room B201",
    "Room B202",
    "Room C301",
    "Amphitheater 1",
    "Amphitheater 2",
  ];

  // ✅ Pré-remplir le formulaire quand initialData change OU quand le modal s'ouvre
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";

    // Si la date est déjà au format YYYY-MM-DD, la retourner telle quelle
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // Sinon, convertir depuis le format "April 15, 2026"
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return ""; // Date invalide

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // ✅ Fonction pour convertir "09:00" → "09:00" (déjà bon format)
  const formatTimeForInput = (timeString) => {
    if (!timeString) return "";
    return timeString;
  };

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Mode modification : pré-remplir avec les données existantes
        setFormData({
          date: formatDateForInput(initialData.defenseDate),
          time: formatTimeForInput(initialData.defenseTime),
          room: initialData.room || "",
        });
      } else {
        // Mode ajout : reset du formulaire
        setFormData({
          date: "",
          time: "",
          room: "",
        });
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({
      ...formData,
      teamId,
      isEdit: !!initialData, // Indique si c'est une modification
      originalId: initialData?.id, // ID de la défense originale (pour modification)
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[#193962]">
            {initialData ? "Modify Defense" : "Schedule New Defense"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#193962] focus:border-transparent transition-all cursor-pointer"
            />
          </div>

          {/* Time */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Time <span className="text-red-500">*</span>
            </label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
              step="900"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#193962] focus:border-transparent transition-all cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">
              Format: HH:MM (ex: 09:00)
            </p>
          </div>

          {/* Room - Combo Box */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Room <span className="text-red-500">*</span>
            </label>
            <select
              name="room"
              value={formData.room}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#193962] focus:border-transparent transition-all bg-white cursor-pointer"
            >
              <option value="" disabled>
                Select a room
              </option>
              {availableRooms.map((room) => (
                <option key={room} value={room}>
                  {room}
                </option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#193962] to-[#2D8FBF] hover:from-[#152f4d] hover:to-[#2575a0] text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg"
            >
              {initialData ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleDefenseModal;