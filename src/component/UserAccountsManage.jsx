import React, { useState, useMemo, useRef, useEffect } from "react";
import AddUserModal from "../layout/AddUserModal";
import { useNavigate } from "react-router-dom";
// ✅ Si ImportModal n'existe pas encore, commente cette ligne temporairement
import ImportModal from "../layout/ImportModal.jsx";
import Sidebar from "../layout/Sidebar.jsx";
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  UserPlus,
  Filter,
  Search,
  X,
  Eye,
  Edit2,
  Trash2,
  Upload,
  Lock,
  LogOut as LogoutIcon,
} from "lucide-react";

const ProfileDropdown = ({ user, onLogout, onChangePassword }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const dropdownRef = useRef(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  // Fermer le dropdown quand on clique à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Gestion du changement de mot de passe
  const handlePasswordChange = (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordForm.newPassword.length < 6) {
      setPasswordError(
        "Le nouveau mot de passe doit contenir au moins 6 caractères",
      );
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }
    onChangePassword(passwordForm);
    setPasswordSuccess("Mot de passe modifié avec succès !");
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setTimeout(() => {
      setShowPasswordModal(false);
      setPasswordSuccess("");
    }, 2000);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Avatar profil */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
      >
        <div className="w-10 h-10 rounded-full bg-linear-to-r from-[#18335E] to-[#2D8FBF] flex items-center justify-center text-white font-semibold shadow-sm">
          {user?.firstName?.[0]}
          {user?.lastName?.[0]}
        </div>
        <span className="text-sm font-medium text-gray-700 hidden md:block">
          {user?.firstName} {user?.lastName}
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 z-50 py-2">
          {/* Infos profil */}
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-gray-500">{user?.email}</p>
            <p className="text-xs text-gray-400 mt-1">Rôle: {user?.role}</p>
          </div>

          {/* Actions */}

          <button
            onClick={() => {
              setShowPasswordModal(true);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
          >
            <Lock size={16} className="text-gray-500" />
            Change Password
          </button>
          <button
            onClick={() => {
              onLogout();
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <LogoutIcon size={16} />
            Logout
          </button>
        </div>
      )}

      {/* Modal Changement de mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-xl">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lock size={20} /> Change Password
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handlePasswordChange} className="p-6 space-y-4">
              {passwordSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  {passwordSuccess}
                </div>
              )}
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {passwordError}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-colors"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ==================== COMPOSANTS OPTIMISÉS ====================

const ActionMenu = ({ user, onView, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <MoreVertical size={18} />
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 py-1">
          <button
            onClick={() => {
              onView(user);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Eye size={16} className="text-gray-500" /> More Information
          </button>
          <button
            onClick={() => {
              onEdit(user);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
          >
            <Edit2 size={16} className="text-gray-500" /> Modify
          </button>
          <button
            onClick={() => {
              onDelete(user);
              setIsOpen(false);
            }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
          >
            <Trash2 size={16} /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

const UserInfoModal = ({ user, userType, onClose }) => {
  if (!user) return null;
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB");
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-semibold">
            {userType === "admin"
              ? "Admin Information"
              : userType === "supervisor"
                ? "Supervisor Information"
                : "Student Information"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">
                First Name
              </label>
              <p className="mt-1 text-gray-900">{user?.firstName || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Last Name
              </label>
              <p className="mt-1 text-gray-900">{user?.lastName || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Phone Number
              </label>
              <p className="mt-1 text-gray-900">{user?.phoneNumber || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                E-mail
              </label>
              <p className="mt-1 text-gray-900">{user?.email || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Username
              </label>
              <p className="mt-1 text-gray-900">{user?.username || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">
                Status
              </label>
              <div className="mt-1">
                <StatusBadge status={user?.status || "Pending"} />
              </div>
            </div>
            {userType === "admin" && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Permission Given
                </label>
                <p className="mt-1 text-gray-900">{user?.role || "N/A"}</p>
              </div>
            )}
            {userType === "supervisor" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Specialization
                  </label>
                  <p className="mt-1 text-gray-900">
                    {user?.specialization || "N/A"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Type
                  </label>
                  <p className="mt-1 text-gray-900">{user?.type || "N/A"}</p>
                </div>
              </>
            )}
            {userType === "student" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Major
                  </label>
                  <p className="mt-1 text-gray-900">{user?.major || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Annual Average
                  </label>
                  <p className="mt-1 text-gray-900">
                    {user?.annualAverage || "N/A"}
                  </p>
                </div>
              </>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">
                Last Active
              </label>
              <p className="mt-1 text-gray-900">
                {formatDate(user?.lastActive)}
              </p>
            </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const ModifyUserModal = ({ user, userType, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phoneNumber: user?.phoneNumber || "",
    email: user?.email || "",
    username: user?.username || "",
    status: user?.status || "Active",
    role: user?.role || "",
    specialization: user?.specialization || "",
    type: user?.type || "",
    major: user?.major || "",
    annualAverage: user?.annualAverage || "",
  });
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, ...formData });
  };
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-semibold">
            Modify{" "}
            {userType === "admin"
              ? "Admin"
              : userType === "supervisor"
                ? "Supervisor"
                : "Student"}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  setFormData({ ...formData, phoneNumber: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            {userType === "admin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Permission Given
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                >
                  <option value="Gestion des Projets PFE">
                    Gestion des Projets PFE
                  </option>
                  <option value="Gestion des Attibutions">
                    Gestion des Attibutions
                  </option>
                  <option value="Gestion des Soutenances">
                    Gestion des Soutenances
                  </option>
                  <option value="Gestion des Notes et Résultats">
                    Gestion des Notes et Résultats
                  </option>
                  <option value="Configuration Système et Communication">
                    Configuration Système et Communication
                  </option>
                </select>
              </div>
            )}
            {userType === "supervisor" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        specialization: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                  >
                    <option value="Interne">Interne</option>
                    <option value="Externe">Externe</option>
                  </select>
                </div>
              </>
            )}
            {userType === "student" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Major
                  </label>
                  <input
                    type="text"
                    value={formData.major}
                    onChange={(e) =>
                      setFormData({ ...formData, major: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Annual Average
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="20"
                    value={formData.annualAverage}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        annualAverage: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                  />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-md hover:from-[#152a4d] hover:to-[#2575a0] transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = useMemo(() => {
    const result = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else if (currentPage <= 4) {
      result.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      result.push(
        1,
        "...",
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      result.push(
        1,
        "...",
        currentPage - 1,
        currentPage,
        currentPage + 1,
        "...",
        totalPages,
      );
    }
    return result;
  }, [currentPage, totalPages]);
  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((page, index) =>
        page === "..." ? (
          <span
            key={index}
            className="w-8 h-8 flex items-center justify-center text-gray-500"
          >
            ...
          </span>
        ) : (
          <button
            key={index}
            onClick={() => typeof page === "number" && onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center rounded border ${currentPage === page ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "border-gray-300 hover:bg-gray-50"}`}
          >
            {page}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Active: "bg-green-100 text-green-700 border-green-200",
    Inactive: "bg-red-100 text-red-700 border-red-200",
    Pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
    Suspended: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status] || statusStyles["Inactive"]}`}
    >
      {status}
    </span>
  );
};

const UserTable = ({
  data,
  userType,
  currentPage,
  setCurrentPage,
  searchQuery,
  onView,
  onEdit,
  onDelete,
}) => {
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-GB");
  const filteredData = useMemo(
    () =>
      (data || []).filter(
        (item) =>
          item?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (userType === "admin"
            ? item?.role?.toLowerCase().includes(searchQuery.toLowerCase())
            : userType === "supervisor"
              ? item?.specialization
                  ?.toLowerCase()
                  .includes(searchQuery.toLowerCase())
              : item?.major?.toLowerCase().includes(searchQuery.toLowerCase())),
      ),
    [data, searchQuery, userType],
  );
  const itemsPerPage = 8,
    totalPages = Math.ceil(filteredData.length / itemsPerPage),
    startIndex = (currentPage - 1) * itemsPerPage,
    paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const getExtraColumns = () => {
    switch (userType) {
      case "admin":
        return (
          <>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Role
            </th>
          </>
        );
      case "supervisor":
        return (
          <>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Type
            </th>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Specialization
            </th>
          </>
        );
      case "student":
        return (
          <>
            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              Major
            </th>
          </>
        );
      default:
        return null;
    }
  };
  const getExtraCells = (item) => {
    switch (userType) {
      case "admin":
        return (
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="text-sm text-gray-600">{item?.role}</span>
          </td>
        );
      case "supervisor":
        return (
          <>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="text-sm text-gray-600">{item?.type}</span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span className="text-sm text-gray-600">
                {item?.specialization}
              </span>
            </td>
          </>
        );
      case "student":
        return (
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="text-sm text-gray-600">{item?.major}</span>
          </td>
        );
      default:
        return null;
    }
  };
  const getTypeLabel = () =>
    ({
      admin: "administrateur",
      supervisor: "superviseur",
      student: "étudiant",
    })[userType] || "utilisateur";
  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                E-mail
              </th>
              {getExtraColumns()}
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Last Active day
              </th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((item) => (
              <tr key={item?.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">
                    {item?.name}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{item?.email}</span>
                </td>
                {getExtraCells(item)}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={item?.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">
                    {formatDate(item?.lastActive)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <ActionMenu
                    user={item}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredData.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          Aucun {getTypeLabel()} trouvé
        </div>
      )}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

// ==================== COMPOSANT PRINCIPAL ====================
function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [currentView, setCurrentView] = useState("admin");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserType, setCurrentUserType] = useState("admin");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const navigate = useNavigate();
  
  const [currentUser] = useState({ id: 1, firstName: 'Admin', lastName: 'Principal', email: 'admin@univ.edu', role: 'Super Admin' });

  const [admins, setAdmins] = useState([
    {
      id: 1,
      name: "Sara Benali",
      firstName: "Sara",
      lastName: "Benali",
      email: "sara.admin@univ.edu",
      role: "Gestion des Projets PFE",
      status: "Active",
      lastActive: "2024-01-15",
      phoneNumber: "+1234567890",
      username: "sara.benali",
    },
    {
      id: 2,
      name: "Marie Dupont",
      firstName: "Marie",
      lastName: "Dupont",
      email: "marie.admin@univ.edu",
      role: "Gestion des Attibutions",
      status: "Active",
      lastActive: "2024-01-14",
      phoneNumber: "+1234567891",
      username: "marie.dupont",
    },
  ]);
  const [supervisors, setSupervisors] = useState([
    {
      id: 1,
      name: "Dr. Marie Dupont",
      firstName: "Marie",
      lastName: "Dupont",
      email: "marie.dupont@univ.edu",
      type: "Interne",
      specialization: "Quantum Computing",
      status: "Active",
      lastActive: "2024-01-15",
      phoneNumber: "+1234567892",
      username: "m.dupont",
    },
  ]);
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice.johnson@student.edu",
      major: "Ai",
      status: "Active",
      lastActive: "2024-01-15",
      phoneNumber: "+1234567893",
      username: "alice.j",
      annualAverage: "16.5",
    },
  ]);

  const handleNextView = () => {
    if (currentView === "admin") {
      setCurrentView("supervisor");
      setCurrentPage(1);
    } else if (currentView === "supervisor") {
      setCurrentView("student");
      setCurrentPage(1);
    }
  };
  const handlePrevView = () => {
    if (currentView === "student") {
      setCurrentView("supervisor");
      setCurrentPage(1);
    } else if (currentView === "supervisor") {
      setCurrentView("admin");
      setCurrentPage(1);
    }
  };
  const handleAddUser = () => {
    setCurrentUserType(currentView);
    setIsModalOpen(true);
  };

  const handleAddUserSubmit = (newUser) => {
    try {
      if (!newUser || !newUser.name) {
        alert("Erreur: Données utilisateur invalides");
        return;
      }
      const today = new Date().toISOString().split("T")[0];
      const userWithDefaults = {
        ...newUser,
        id: newUser.id || Date.now(),
        status: newUser.status || "Pending",
        lastActive: newUser.lastActive || today,
      };
      if (currentView === "admin")
        setAdmins((prev) => [...prev, userWithDefaults]);
      else if (currentView === "supervisor")
        setSupervisors((prev) => [...prev, userWithDefaults]);
      else setStudents((prev) => [...prev, userWithDefaults]);
      setIsModalOpen(false);
    } catch (error) {
      alert("Erreur lors de l'ajout: " + error.message);
    }
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowInfoModal(true);
  };
  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowModifyModal(true);
  };
  const handleDeleteUser = (user) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer ${user.name} ?`)) {
      if (currentView === "admin")
        setAdmins((prev) => prev.filter((u) => u.id !== user.id));
      else if (currentView === "supervisor")
        setSupervisors((prev) => prev.filter((u) => u.id !== user.id));
      else setStudents((prev) => prev.filter((u) => u.id !== user.id));
    }
  };
  const handleSaveUser = (updatedUser) => {
    const updatedData = {
      ...updatedUser,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
    };
    if (currentView === "admin")
      setAdmins((prev) =>
        prev.map((u) => (u.id === updatedData.id ? updatedData : u)),
      );
    else if (currentView === "supervisor")
      setSupervisors((prev) =>
        prev.map((u) => (u.id === updatedData.id ? updatedData : u)),
      );
    else
      setStudents((prev) =>
        prev.map((u) => (u.id === updatedData.id ? updatedData : u)),
      );
    setShowModifyModal(false);
    setSelectedUser(null);
  };

  // ✅ Fonction d'import en masse - Version sécurisée si ImportModal n'existe pas encore
  const handleBulkImport = (users) => {
    try {
      if (currentView === "admin") setAdmins((prev) => [...prev, ...users]);
      else if (currentView === "supervisor")
        setSupervisors((prev) => [...prev, ...users]);
      else setStudents((prev) => [...prev, ...users]);
      setShowImportModal(false);
    } catch (error) {
      alert("Erreur lors de l'import: " + error.message);
    }
  };

  // ✅ Fonctions profil
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };
  const handleChangePassword = (formData) => {
    console.log("🔐 Changement de mot de passe:", formData);
  };

  const getAddButtonText = () =>
    ({
      admin: "Add an Admin",
      supervisor: "Add a Supervisor",
      student: "Add a Student",
    })[currentView] || "Add User";
  const getSectionTitle = () =>
    ({
      admin: "Admin Users management :",
      supervisor: "Supervisor Users management :",
      student: "Student Users management :",
    })[currentView] || "Users management :";
  const getCurrentData = () =>
    ({ admin: admins, supervisor: supervisors, student: students })[
      currentView
    ] || [];

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                Manage and track your users
              </p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                User Management
              </h1>
            </div>
            <div className="flex items-center gap-4">
              
              

              <button
                onClick={handleAddUser}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserPlus size={16} /> {getAddButtonText()}
              </button>

              {/* ✅ Bouton Import Excel  */}
              <button
                onClick={() =>
                  typeof ImportModal !== "undefined" && setShowImportModal(true)
                }
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                disabled={typeof ImportModal === "undefined"}
              >
                <Upload size={16} /> Import Excel
              </button>

              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Filter size={16} /> Filter
              </button>
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search User"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                />
              </div>
              {/* ✅ Profile Dropdown - Pushed to far right with ml-auto */}
              <div className="ml-auto">
                <ProfileDropdown
                  user={currentUser}
                  onLogout={handleLogout}
                  onChangePassword={handleChangePassword}
                />
              </div>
            </div>
          </div>
        </header>
        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#1e3a5f]">
              {getSectionTitle()}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={handlePrevView}
              disabled={currentView === "admin"}
              className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${currentView === "admin" ? "border-gray-300 text-gray-300 cursor-not-allowed" : "border-gray-300 text-[#1e3a5f] hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5"}`}
            >
              <ChevronLeft size={20} />
            </button>
            <UserTable
              data={getCurrentData()}
              userType={currentView}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              searchQuery={searchQuery}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
            <button
              onClick={handleNextView}
              disabled={currentView === "student"}
              className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border transition-colors ${currentView === "student" ? "border-gray-300 text-gray-300 cursor-not-allowed" : "border-gray-300 text-[#1e3a5f] hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5"}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </main>
      </div>

      {/* ✅ TOUS LES MODALS AU MÊME NIVEAU */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userType={currentUserType}
        onAdd={handleAddUserSubmit}
      />

      {/* ✅ Modal Import Excel - Conditionnel pour éviter l'erreur si le fichier n'existe pas */}
      {typeof ImportModal !== "undefined" && showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          userType={currentView}
          onImport={handleBulkImport}
        />
      )}

      {showInfoModal && (
        <UserInfoModal
          user={selectedUser}
          userType={currentView}
          onClose={() => {
            setShowInfoModal(false);
            setSelectedUser(null);
          }}
        />
      )}
      {showModifyModal && (
        <ModifyUserModal
          user={selectedUser}
          userType={currentView}
          onSave={handleSaveUser}
          onClose={() => {
            setShowModifyModal(false);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
}

export default UserManagement;
