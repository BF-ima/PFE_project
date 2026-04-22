import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
import AddUserModal from "../layout/AddUserModal";
import { useNavigate } from "react-router-dom";
import ImportModal from "../layout/ImportModal.jsx";
import Sidebar from "../layout/Sidebar.jsx";
import useCurrentUser from "../hooks/useCurrentUser";
import { ProfileDropdown } from './supervisor/HomePage'; 
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




// ==================== PERMISSION HELPER ====================

const PERMISSION_LABEL = {
  can_create_admin:      'Gestion des Projets PFE',
  can_create_enseignant: 'Gestion des Attributions',
  can_create_etudiant:   'Gestion des Soutenances',
  can_create_entreprise: 'Gestion des Notes et Résultats',
  config_systeme:        'Configuration Système et Communication',
};

const getPermissionLabel = (permissions) => {
  if (!permissions) return 'N/A';
  try {
    const parsed = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
    const activeKey = Object.keys(parsed).find(k => parsed[k] === true);
    return PERMISSION_LABEL[activeKey] || activeKey || 'N/A';
  } catch {
    return 'N/A';
  }
};



// ==================== ACTION MENU ====================

const ActionMenu = ({ user, onView, onEdit, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false);
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
          <button onClick={() => { onView(user); setIsOpen(false); }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            <Eye size={16} className="text-gray-500" /> More Information
          </button>
          <button onClick={() => { onEdit(user); setIsOpen(false); }}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2">
            <Edit2 size={16} className="text-gray-500" /> Modify
          </button>
          <button onClick={() => { onDelete(user); setIsOpen(false); }}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
            <Trash2 size={16} /> Archive
          </button>
        </div>
      )}
    </div>
  );
};

// ==================== USER INFO MODAL ====================

const UserInfoModal = ({ user, userType, onClose }) => {
  if (!user) return null;
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "N/A";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-semibold">
            {userType === "admin" ? "Admin Information"
              : userType === "teacher" ? "Teacher Information"
              : userType === "externalSupervisor" ? "External Supervisor Information"
              : "Student Information"}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Full Name</label>
              <p className="mt-1 text-gray-900">{user?.display_name || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">E-mail</label>
              <p className="mt-1 text-gray-900">{user?.email || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone Number</label>
              <p className="mt-1 text-gray-900">{user?.phone || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="mt-1"><StatusBadge status={user?.is_active} /></div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Last Active</label>
              <p className="mt-1 text-gray-900">{formatDate(user?.created_at)}</p>
            </div>
            {userType === "admin" && (
              <div>
                <label className="text-sm font-medium text-gray-500">Permission Given</label>
                <p className="mt-1 text-gray-900">{getPermissionLabel(user?.permissions) || "N/A"}</p>
              </div>
            )}
            {userType === "teacher" && (
              <>
              <div>
                <label className="text-sm font-medium text-gray-500">Specialization</label>
                <p className="mt-1 text-gray-900">{user?.specialization || "N/A"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Rank</label>
                <p className="mt-1 text-gray-900">{user?.rank || "N/A"}</p>
              </div>
              </>
            )}
            {userType === "externalSupervisor" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-500">Company</label>
                  <p className="mt-1 text-gray-900">{user?.company_name || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Contact Person</label>
                  <p className="mt-1 text-gray-900">{user?.contact_person || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Department</label>
                  <p className="mt-1 text-gray-900">{user?.department || "N/A"}</p>
                </div>
              </>
            )}
            {userType === "student" && (
              <>
               <div>
                 <label className="text-sm font-medium text-gray-500">Speciality</label>
                 <p className="mt-1 text-gray-900">{user?.speciality_name || "N/A"}</p>
                                  
               </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Promo</label>
                <p className="mt-1 text-gray-900">{user?.promo_name || "N/A"}</p>
                                  
              </div>
              <div>
               <label className="text-sm font-medium text-gray-500">Annual Average</label>
              <p className="mt-1 text-gray-900">{user?.moyenne || "N/A"}</p>
             </div>
          </>
          )}
          </div>
        </div>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end">
          <button onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== MODIFY USER MODAL ====================

const ModifyUserModal = ({ user, userType, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    firstName:      user?.first_name      || "",
    lastName:       user?.last_name       || "",
    phoneNumber:    user?.phone           || "",
    email:          user?.email           || "",
    status:         user?.is_active === 1 ? "Active" : "Inactive",
    role:           user?.role            || "",
    specialization: user?.specialization  || "",
    major:          user?.major           || "",
    annualAverage:  user?.moyenne         || "",
    companyName:    user?.company_name    || "",
    contactPerson:  user?.contact_person  || "",
    department:     user?.department      || "",
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const isExternal = userType === "externalSupervisor";
    if (!isExternal && !formData.email.endsWith("@esi-sba.dz")) {
      alert("L'email doit se terminer par @esi-sba.dz");
      return;
    }
    onSave({ ...user, ...formData });
  };

  const fieldClass = "w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-xl font-semibold">
            Modify {userType === "admin" ? "Admin" : userType === "teacher" ? "Teacher"
              : userType === "externalSupervisor" ? "External Supervisor" : "Student"}
          </h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
              <input type="text" required value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
              <input type="text" required value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail *</label>
              <input type="email" required value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={fieldClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={fieldClass}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Pending">Pending</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
            {userType === "admin" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Permission Given</label>
                <select value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className={fieldClass}>
                  <option value="can_create_admin">Gestion des Projets PFE</option>
                  <option value="can_create_enseignant">Gestion des Attributions</option>
                  <option value="can_create_etudiant">Gestion des Soutenances</option>
                  <option value="can_create_entreprise">Gestion des Notes et Résultats</option>
                  <option value="config_systeme">Configuration Système et Communication</option>
                </select>
              </div>
            )}
            {userType === "teacher" && (
              <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specialization</label>
                <input type="text" value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className={fieldClass} />
              </div>
              <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Rank</label>
      <select value={formData.rank}
        onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
        className={fieldClass}>
        <option value="">Select...</option>
        <option value="A">A</option>
        <option value="B">B</option>
        <option value="C">C</option>
      </select>
    </div>
              </>
            )}
            {userType === "externalSupervisor" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input type="text" value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    className={fieldClass} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                  <input type="text" value={formData.contactPerson}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    className={fieldClass} />
                </div>
              </>
            )}
            {userType === "student" && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Annual Average</label>
                  <input type="number" step="0.01" min="0" max="20" value={formData.annualAverage}
                    onChange={(e) => setFormData({ ...formData, annualAverage: e.target.value })}
                    className={fieldClass} />
                </div>
              </>
            )}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-md hover:from-[#152a4d] hover:to-[#2575a0] transition-colors">
              Save Changenges
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==================== STATUS BADGE ====================

const StatusBadge = ({ status }) => {
  const statusText = status === 1 ? "Active" : "Inactive";
  const styles = {
    Active:    "bg-green-100 text-green-700 border-green-200",
    Inactive:  "bg-red-100 text-red-700 border-red-200",
    Pending:   "bg-yellow-100 text-yellow-700 border-yellow-200",
    Suspended: "bg-gray-100 text-gray-700 border-gray-200",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[statusText] || styles["Inactive"]}`}>
      {statusText}
    </span>
  );
};

// ==================== PAGINATION ====================

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = useMemo(() => {
    const result = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else if (currentPage <= 4) {
      result.push(1, 2, 3, 4, 5, "...", totalPages);
    } else if (currentPage >= totalPages - 3) {
      result.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      result.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
    }
    return result;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}
        className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
        <ChevronLeft size={16} />
      </button>
      {pages.map((page, index) =>
        page === "..." ? (
          <span key={index} className="w-8 h-8 flex items-center justify-center text-gray-500">...</span>
        ) : (
          <button key={index} onClick={() => typeof page === "number" && onPageChange(page)}
            className={`w-8 h-8 flex items-center justify-center rounded border ${
              currentPage === page ? "bg-[#1e3a5f] text-white border-[#1e3a5f]" : "border-gray-300 hover:bg-gray-50"
            }`}>
            {page}
          </button>
        )
      )}
      <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50">
        <ChevronRight size={16} />
      </button>
    </div>
  );
};

// ==================== USER TABLE ====================

const UserTable = ({ data, userType, currentPage, setCurrentPage, searchQuery, onView, onEdit, onDelete }) => {
  const formatDate = (d) => d ? new Date(d).toLocaleDateString("en-GB") : "N/A";

  const filteredData = useMemo(() =>
    (data || []).filter((item) =>
      item?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (userType === "admin"
        ? item?.role?.toLowerCase().includes(searchQuery.toLowerCase())
        : userType === "externalSupervisor" || userType === "teacher"
          ? item?.specialization?.toLowerCase().includes(searchQuery.toLowerCase())
          : item?.major?.toLowerCase().includes(searchQuery.toLowerCase()))
    ),
    [data, searchQuery, userType]
  );

  const itemsPerPage  = 8;
  const totalPages    = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex    = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const extraHeader = {
    admin:              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>,
    teacher:            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Specialization</th>,
    externalSupervisor: <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>,
    student:            <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Speciality</th>,
  };

  const extraCell = (item) => ({
    admin:              <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-600">{getPermissionLabel(item?.permissions)}</span></td>,
    teacher:            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-600">{item?.specialization}</span></td>,
    externalSupervisor: <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-600">{item?.company_name}</span></td>,
    student:            <td className="px-6 py-4 whitespace-nowrap"><span className="text-sm text-gray-600">{item?.speciality_name}</span></td>,
  })[userType];

  const typeLabel = {
    admin: "administrateur", teacher: "enseignant",
    externalSupervisor: "superviseur externe", student: "étudiant",
  }[userType] || "utilisateur";

  return (
    <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">E-mail</th>
              {extraHeader[userType]}
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Last Active day</th>
              <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((user) => (
              <tr key={user?.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-gray-900">{user?.display_name}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{user?.email}</span>
                </td>
                {extraCell(user)}
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={user?.is_active} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600">{formatDate(user?.created_at)}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <ActionMenu user={user} onView={onView} onEdit={onEdit} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredData.length === 0 && (
        <div className="text-center py-12 text-gray-500">Aucun {typeLabel} trouvé</div>
      )}
      {totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      )}
    </div>
  );
};

// ==================== MAIN COMPONENT ====================

function UserAccountsManage() {
  const [searchQuery,       setSearchQuery]       = useState("");
  const [currentPage,       setCurrentPage]       = useState(1);
  const [currentView,       setCurrentView]       = useState("admin");
  const [isModalOpen,       setIsModalOpen]       = useState(false);
  const [currentUserType,   setCurrentUserType]   = useState("admin");
  const [selectedUser,      setSelectedUser]      = useState(null);
  const [showInfoModal,     setShowInfoModal]     = useState(false);
  const [showModifyModal,   setShowModifyModal]   = useState(false);
  const [showImportModal,   setShowImportModal]   = useState(false);
  const navigate = useNavigate();

  const { currentUser } = useCurrentUser();

  const [admins,              setAdmins]              = useState([]);
  const [teachers,            setTeachers]            = useState([]);
  const [students,            setStudents]            = useState([]);
  const [externalSupervisors, setExternalSupervisors] = useState([]);

  // ── Specialities and promos for student form dropdowns ──
  const [specialities, setSpecialities] = useState([]);
  const [promos,       setPromos]       = useState([]);

  const refreshUsers = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch("http://localhost:3000/api/auth/my-users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setAdmins(             data.users.filter((u) => u.role === "admin"));
      setTeachers(           data.users.filter((u) => u.role === "enseignant"));
      setStudents(           data.users.filter((u) => u.role === "etudiant"));
      setExternalSupervisors(data.users.filter((u) => u.role === "entreprise"));
    } catch (error) {
      console.error("fetchUsers error:", error);
    }
  }, []);

  useEffect(() => {
    refreshUsers();
  }, [refreshUsers]);

  // Fetch specialities and promos once on mount
  useEffect(() => {
    const token   = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    fetch("http://localhost:3000/api/specialities", { headers })
      .then((r) => r.json())
      .then((d) => setSpecialities(d || []))
      .catch((e) => console.error("specialities fetch error:", e));

    fetch("http://localhost:3000/api/promos", { headers })
      .then((r) => r.json())
      .then((d) => setPromos(d || []))
      .catch((e) => console.error("promos fetch error:", e));
  }, []);

  // ── View navigation ──
  const VIEWS = ["admin", "teacher", "externalSupervisor", "student"];

  const handleNextView = useCallback(() => {
    setCurrentView((v) => VIEWS[(VIEWS.indexOf(v) + 1) % VIEWS.length]);
    setCurrentPage(1);
  }, []);

  const handlePrevView = useCallback(() => {
    setCurrentView((v) => VIEWS[(VIEWS.indexOf(v) - 1 + VIEWS.length) % VIEWS.length]);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) return;
      if (e.key === "ArrowRight") { e.preventDefault(); handleNextView(); }
      if (e.key === "ArrowLeft")  { e.preventDefault(); handlePrevView(); }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextView, handlePrevView]);

  // ── Add user ──
  const handleAddUserSubmit = async (payload) => {
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch("http://localhost:3000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      console.log("PAYLOAD SENT:", JSON.stringify(payload, null, 2));
      console.log("STATUS:", res.status);
      console.log("RESPONSE:", data);

      if (!res.ok) {
        alert(data.message || "Erreur lors de la création");
        return;
      }
      alert("Utilisateur créé avec succès");
      refreshUsers();
    } catch (error) {
      console.error("register error:", error);
      alert("Erreur lors de la création");
    }
  };

  const handleViewUser   = (user) => { setSelectedUser(user); setShowInfoModal(true); };
  const handleEditUser   = (user) => { setSelectedUser(user); setShowModifyModal(true); };

  // ── Delete ──
  const handleDeleteUser = async (user) => {
    const name = user?.display_name || `id ${user?.id}`;
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${name} ?`)) return;
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`http://localhost:3000/api/auth/delete/${user.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Erreur lors de la suppression"); return; }
      const setter = {
        admin: setAdmins, teacher: setTeachers,
        externalSupervisor: setExternalSupervisors, student: setStudents,
      }[currentView];
      if (setter) setter((prev) => prev.filter((u) => u.id !== user.id));
    } catch (error) {
      console.error("delete error:", error);
      alert("Erreur lors de la suppression");
    }
  };

  // ── Modify ──
  const handleSaveUser = async (updatedUser) => {
    const isExternal = currentView === "externalSupervisor";
    if (!isExternal && !updatedUser.email.endsWith("@esi-sba.dz")) {
      alert("L'email doit se terminer par @esi-sba.dz");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      const payload = {
        first_name:     updatedUser.firstName,
        last_name:      updatedUser.lastName,
        email:          updatedUser.email,
        phone:          updatedUser.phoneNumber  || null,
        is_active:      updatedUser.status === "Active" ? 1 : 0,
        specialization: updatedUser.specialization || null,
        rank:           updatedUser.rank            || null, 
        moyenne:        updatedUser.annualAverage   || null,
        company_name:   updatedUser.companyName     || null,
        contact_person: updatedUser.contactPerson   || null,
      };
      const res  = await fetch(`http://localhost:3000/api/auth/update/${updatedUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { alert(data.message || "Erreur lors de la modification"); return; }
      const setter = {
        admin: setAdmins, teacher: setTeachers,
        externalSupervisor: setExternalSupervisors, student: setStudents,
      }[currentView];
      if (setter) {
        setter((prev) => prev.map((u) =>
          u.id === updatedUser.id
            ? { ...u, ...payload, display_name: `${payload.first_name} ${payload.last_name}` }
            : u
        ));
      }
      setShowModifyModal(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("update error:", error);
      alert("Erreur lors de la modification");
    }
  };

const handleBulkImport = () => {
  refreshUsers();
  setShowImportModal(false);
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleChangePassword = (formData) => {
    console.log("🔐 Changement de mot de passe:", formData);
  };

  const ADD_BUTTON_TEXT = {
    admin: "Add an Admin", teacher: "Add Teacher",
    externalSupervisor: "Add External Supervisor", student: "Add a Student",
  };
  const SECTION_TITLE = {
    admin: "Admins :", teacher: "Teachers :",
    externalSupervisor: "External Supervisors :", student: "Students :",
  };
  const CURRENT_DATA = {
    admin: admins, teacher: teachers,
    externalSupervisor: externalSupervisors, student: students,
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Manage and track your users</p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">User Management</h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setCurrentUserType(currentView); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <UserPlus size={16} /> {ADD_BUTTON_TEXT[currentView]}
              </button>
              <button onClick={() => setShowImportModal(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Upload size={16} /> Import Excel
              </button>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                <Filter size={16} /> Filter
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search User" value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]" />
              </div>
              <div className="ml-auto">
                <ProfileDropdown user={currentUser} onLogout={handleLogout} />
              </div>
            </div>
          </div>
        </header>

        {/* Main */}
        <main className="flex-1 p-8 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-[#1e3a5f]">{SECTION_TITLE[currentView]}</h2>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={handlePrevView}
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-[#1e3a5f] hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-colors">
              <ChevronLeft size={20} />
            </button>
            <UserTable
              data={CURRENT_DATA[currentView]}
              userType={currentView}
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              searchQuery={searchQuery}
              onView={handleViewUser}
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
            />
            <button onClick={handleNextView}
              className="shrink-0 w-10 h-10 flex items-center justify-center rounded-lg border border-gray-300 text-[#1e3a5f] hover:border-[#1e3a5f] hover:bg-[#1e3a5f]/5 transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userType={currentUserType}
        onAdd={handleAddUserSubmit}
        specialities={specialities}
        promos={promos}
      />

      {showImportModal && (
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
          onClose={() => { setShowInfoModal(false); setSelectedUser(null); }}
        />
      )}

      {showModifyModal && (
        <ModifyUserModal
          user={selectedUser}
          userType={currentView}
          onSave={handleSaveUser}
          onClose={() => { setShowModifyModal(false); setSelectedUser(null); }}
        />
      )}
    </div>
  );
}

export default UserAccountsManage;