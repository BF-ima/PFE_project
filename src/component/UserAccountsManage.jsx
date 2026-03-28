import React, { useState, useMemo, useRef, useEffect } from "react";
import AddUserModal from "../layout/AddUserModal";
import { useNavigate } from "react-router-dom";
import ImportModal from "../layout/ImportModal.jsx";
import Sidebar from "../layout/Sidebar.jsx";
import ProfileDropdown from "./ProfileDropDown.jsx";
import DeleteConfirmModal from "../layout/DeleteConfirmModal.jsx";
import { createPortal } from "react-dom";
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
} from "lucide-react";

// ==================== COMPOSANTS OPTIMISÉS ====================

const ActionMenu = ({ user, onView, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef(null);

  const toggleMenu = () => {
    if (!isOpen) {
      const rect = buttonRef.current.getBoundingClientRect();

      const spaceBelow = window.innerHeight - rect.bottom;
      const menuHeight = 150;

      const top =
        spaceBelow > menuHeight
          ? rect.bottom + window.scrollY
          : rect.top + window.scrollY - menuHeight;

      setPosition({
        top,
        left: rect.right - 180, // largeur menu
      });
    }

    setIsOpen(!isOpen);
  };

  // 🔒 fermer si clic ailleurs
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!buttonRef.current?.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
      >
        <MoreVertical size={18} />
      </button>

      {isOpen &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: position.top,
              left: position.left,
            }}
            className="w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-[9999] py-1 animate-fadeIn"
          >
            <button
              onClick={() => {
                onView(user);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Eye size={16} /> More Information
            </button>

            <button
              onClick={() => {
                onEdit(user);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
            >
              <Edit2 size={16} /> Modify
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
          </div>,
          document.body
        )}
    </>
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
              : userType === "teacher"
                ? "Teacher Information"
                : userType === "externalSupervisor"
                  ? "External Supervisor Information"
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
            {(userType === "teacher") && (
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Specialization
                </label>
                <p className="mt-1 text-gray-900">
                  {user?.specialization || "N/A"}
                </p>
              </div>
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

    // ✅ Validation email : @esi-sba.dz requis SAUF pour superviseur externe
    const isExternalSupervisor = userType === "externalSupervisor";
    if (!isExternalSupervisor && !formData.email.endsWith("@esi-sba.dz")) {
      alert("L'email doit se terminer par @esi-sba.dz ");
      return;
    }

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
              : userType === "teacher"
                ? "Teacher"
                : userType === "externalSupervisor"
                  ? "External Supervisor"
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
                  <option value="Gestion Des Comptes Supervisor Et Student">
                    Gestion Des Comptes Supervisor Et Student
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
            {(userType === "teacher" ) && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specialization
                </label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) =>
                    setFormData({ ...formData, specialization: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                />
              </div>
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
            : userType === "teacher"
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
      case "teacher":
        return (
          <>
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
      case "teacher":
        return (
          <td className="px-6 py-4 whitespace-nowrap">
            <span className="text-sm text-gray-600">
              {item?.specialization}
            </span>
          </td>
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
      teacher: "enseignant",
      externalSupervisor: "superviseur externe",
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
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">
                      {formatDate(item?.lastActive)}
                    </span>
                    <div className="ml-4">
                      <ActionMenu
                        user={item}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  </div>
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
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [currentUser] = useState({
    id: 1,
    firstName: "Admin",
    lastName: "Principal",
    email: "admin@esi-sba.dz",
    role: "Super Admin",
  });

  const [admins, setAdmins] = useState([
    {
      id: 1,
      name: "Sara Benali",
      firstName: "Sara",
      lastName: "Benali",
      email: "sara.admin@esi-sba.dz",
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
      email: "marie.admin@esi-sba.dz",
      role: "Gestion des Attibutions",
      status: "Active",
      lastActive: "2024-01-14",
      phoneNumber: "+1234567891",
      username: "marie.dupont",
    },
  ]);
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      name: "Dr. Marie Dupont",
      firstName: "Marie",
      lastName: "Dupont",
      email: "marie.dupont@esi-sba.dz",
      specialization: "Quantum Computing",
      status: "Active",
      lastActive: "2024-01-15",
      phoneNumber: "+1234567892",
      username: "m.dupont",
    },
  ]);

  // ✅ NOUVEAU : Tableau pour les superviseurs externes
  const [externalSupervisors, setExternalSupervisors] = useState([
    {
      id: 1,
      name: "Prof. Ahmed Benali",
      firstName: "Ahmed",
      lastName: "Benali",
      email: "ahmed.benali@external-univ.edu",
      status: "Active",
      lastActive: "2024-01-15",
      phoneNumber: "+33612345678",
      username: "a.benali",
    },
  ]);
  const [students, setStudents] = useState([
    {
      id: 1,
      name: "Alice Johnson",
      firstName: "Alice",
      lastName: "Johnson",
      email: "alice.johnson@esi-sba.dz",
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
      setCurrentView("teacher");
      setCurrentPage(1);
    } else if (currentView === "teacher") {
      setCurrentView("externalSupervisor");
      setCurrentPage(1);
    } else if (currentView === "externalSupervisor") {
      setCurrentView("student");
      setCurrentPage(1);
    } else if (currentView === "student") {
      setCurrentView("admin");
      setCurrentPage(1);
    }
  };

  const handlePrevView = () => {
    if (currentView === "student") {
      setCurrentView("externalSupervisor");
      setCurrentPage(1);
    } else if (currentView === "externalSupervisor") {
      setCurrentView("teacher");
      setCurrentPage(1);
    } else if (currentView === "teacher") {
      setCurrentView("admin");
      setCurrentPage(1);
    } else if (currentView === "admin") {
      setCurrentView("student");
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

      // ✅ Validation email : @esi-sba.dz requis SAUF pour superviseur externe
      const isExternalSupervisor = currentUserType === "externalSupervisor";
      if (!isExternalSupervisor && !newUser.email.endsWith("@esi-sba.dz")) {
        alert("L'email doit se terminer par @esi-sba.dz");
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
      else if (currentView === "teacher")
        setTeachers((prev) => [...prev, userWithDefaults]);
      else if (currentView === "externalSupervisor")
        setExternalSupervisors((prev) => [...prev, userWithDefaults]);
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
    setUserToDelete(user);
    setShowDeleteModal(true);
  };
  // pour confirmer la suppression
  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    if (currentView === "admin")
      setAdmins((prev) => prev.filter((u) => u.id !== userToDelete.id));
    else if (currentView === "teacher")
      setTeachers((prev) => prev.filter((u) => u.id !== userToDelete.id));
    else if (currentView === "externalSupervisor")
      setExternalSupervisors((prev) =>
        prev.filter((u) => u.id !== userToDelete.id),
      );
    else setStudents((prev) => prev.filter((u) => u.id !== userToDelete.id));

    setShowDeleteModal(false);
    setUserToDelete(null);
  };

  const handleSaveUser = (updatedUser) => {
    // ✅ Validation email : @esi-sba.dz requis SAUF pour superviseur externe
    const isExternalSupervisor = currentView === "externalSupervisor";
    if (!isExternalSupervisor && !updatedUser.email.endsWith("@esi-sba.dz")) {
      alert(
        "L'email doit se terminer par @esi-sba.dz (sauf pour les superviseurs externes)",
      );
      return;
    }

    const updatedData = {
      ...updatedUser,
      name: `${updatedUser.firstName} ${updatedUser.lastName}`.trim(),
    };
    if (currentView === "admin")
      setAdmins((prev) =>
        prev.map((u) => (u.id === updatedData.id ? updatedData : u)),
      );
    else if (currentView === "teacher")
      setTeachers((prev) =>
        prev.map((u) => (u.id === updatedData.id ? updatedData : u)),
      );
    else if (currentView === "externalSupervisor")
      setExternalSupervisors((prev) =>
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
      else if (currentView === "teacher")
        setTeachers((prev) => [...prev, ...users]);
      else if (currentView === "externalSupervisor")
        setExternalSupervisors((prev) => [...prev, ...users]);
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
      teacher: "Add Teacher",
      externalSupervisor: "Add External Supervisor",
      student: "Add a Student",
    })[currentView] || "Add User";

  const getSectionTitle = () =>
    ({
      admin: "Admins :",
      teacher: "Teachers :",
      externalSupervisor: "External Supervisors :",
      student: "Students :",
    })[currentView] || "Users management :";

  const getCurrentData = () =>
    ({
      admin: admins,
      teacher: teachers,
      externalSupervisor: externalSupervisors,
      student: students,
    })[currentView] || [];

  // ✅ Navigation clavier : flèches gauche/droite
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorer si l'utilisateur tape dans un input/textarea
      if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "TEXTAREA" ||
        e.target.isContentEditable
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNextView();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        handlePrevView();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentView, handleNextView, handlePrevView]);

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
              className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-[#1e3a5f] hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-colors"border-gray-300 text-[#1e3a5f] hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5"}`}
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
              className={`shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-[#1e3a5f] hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-colors`}
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

      {showDeleteModal && (
        <DeleteConfirmModal
          user={userToDelete}
          userType={currentView}
          onClose={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          onConfirm={confirmDeleteUser}
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
