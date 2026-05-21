import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar.jsx";
import { ProfileDropdown } from '../supervisor/HomePage';
import AddJuryMemberModal from "../../layout/AddJuryMemberModal.jsx";
import DeleteJuryMemberModal from "../../layout/DeleteJuryMemberModal.jsx";
import ScheduleDefenseModal from "../../layout/ScheduleDefenseModal.jsx";
import AddNotesModal from "../../layout/AddNotesModal.jsx";
import {
  Search,
  Clock,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  FileText,
  Code,
  Presentation,
  MessageSquare,
  Download,
  Users,
  Shield,
  Plus,
  X,
  MapPin,
  Edit2,
  Eye,
  ClipboardList,
} from "lucide-react";

const DefenseManagement = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("defense-requests");
  const [supervisorComment, setSupervisorComment] = useState("");
  const [isAddJuryModalOpen, setIsAddJuryModalOpen] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedScheduleTeamId, setSelectedScheduleTeamId] = useState(null);
  const [importedNotedCount, setImportedNotedCount] = useState(0);
  const [scheduleTab, setScheduleTab] = useState("to-schedule");
  const [isEditMode, setIsEditMode] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [selectedGradeTeamId, setSelectedGradeTeamId] = useState(null);
  // User actuel
  const [currentUser] = useState({
    id: 1,
    firstName: "Admin",
    lastName: "Principal",
    email: "admin@esi-sba.dz",
    role: "Super Admin",
  });

  // Configuration des onglets pour éviter la répétition
  const tabConfig = {
    "defense-requests": {
      icon: <Users size={32} className="text-[#193962]" />,
      title: "Defense Requests",
      description: "Approve defense requests from teams",
    },
    "jury-assignment": {
      icon: <User size={32} className="text-[#193962]" />,
      title: "Jury Assignment",
      description: "Assign jury members to teams for defense evaluation",
    },
    "defense-schedule": {
      icon: <Calendar size={32} className="text-[#193962]" />,
      title: "Defense Schedule",
      description: "Organize and schedule defense sessions",
    },
    "grades-results": {
      icon: <FileText size={32} className="text-[#193962]" />,
      title: "Grades & Results",
      description: "Manage grades and view defense results",
    },
  };
const [gradesStats, setGradesStats] = useState({ pending: 0, noted: 0, published: 0 });
  const [gradesTeams, setGradesTeams] = useState([]);
  const [loadingGrades, setLoadingGrades] = useState(false);

  const fetchGradesData = async () => {
    setLoadingGrades(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };
      const res  = await fetch("http://localhost:3000/api/soutenance", { headers });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      const all = data.soutenances || [];

      // Build gradesTeams list
      const mapped = all.map(s => ({
        soutenanceId:    s.id,
        id:              `TEAM${s.team_id}`,
        teamId:          s.team_id,
        projectTitle:    s.project_title || "—",
        teamMembers:     s.members || "Team members",
        defenseDate:     s.date   ? new Date(s.date).toLocaleDateString("en-GB") : "—",
        defenseTime:     s.time   || "—",
        supervisorId:    s.supervisor_id || null,
        status:          s.grade_status === "PENDING"   ? "Pending"
                       : s.grade_status === "NOTED"     ? "Noted"
                       : s.grade_status === "PUBLISHED" ? "Published"
                       : "Pending",
        notes: (s.grade_oral !== null && s.grade_oral !== undefined) ? {
  oralPresentation:    s.grade_oral,
  deliverablesQuality: s.grade_deliverables,
  demoApplication:     s.grade_demo,
  qaResponses:         s.grade_qa,
  coefOral:            s.coef_oral,
  coefDeliverables:    s.coef_deliverables,
  coefDemo:            s.coef_demo,
  coefQa:              s.coef_qa,
} : null,
        juryObservations: s.jury_observations || "",
        finalGrade:       s.final_grade || null,
      }));

      setGradesTeams(mapped);
      setGradesStats({
        pending:   mapped.filter(t => t.status === "Pending").length,
        noted:     mapped.filter(t => t.status === "Noted").length,
        published: mapped.filter(t => t.status === "Published").length,
      });
    } catch (err) {
      console.error("fetchGradesData error:", err);
    } finally {
      setLoadingGrades(false);
    }
  };

const [unscheduledTeams, setUnscheduledTeams] = useState([]);
const [scheduledDefenses, setScheduledDefenses] = useState([]);

const fetchScheduleData = async () => {
  try {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };
    const res  = await fetch("http://localhost:3000/api/soutenance", { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load schedule");

    const all = data.soutenances || [];

    // Split by whether date is set: no date = pending schedule, date = scheduled
    const unscheduled = all
      .filter(s => !s.date)
      .map(s => ({
        id:           `TEAM${s.team_id}`,
        soutenanceId: s.id,          // ← real DB id used for PUT call
        teamId:       s.team_id,
        leader:       s.leader_name || "—",
        projectTitle: s.project_title || "—",
        juryMembers:  [],            // enriched below
      }));

    const scheduled = all
      .filter(s => s.date)
      .map(s => ({
        id:           `TEAM${s.team_id}`,
        soutenanceId: s.id,
        teamId:       s.team_id,
        leader:       s.leader_name || "—",
        projectTitle: s.project_title || "—",
        defenseDate:  s.date,
        defenseTime:  s.time,
        room:         s.room_name,
        supervisor:   s.supervisor_name || "—",
        juryMembers:  [],
      }));

    // Enrich each with jury members
    const enrich = async (list) =>
      Promise.all(list.map(async (item) => {
        const jr = await fetch(
          `http://localhost:3000/api/jury/${item.soutenanceId}/members`,
          { headers }
        );
        const jd = jr.ok ? await jr.json() : { jury: [] };
        return {
          ...item,
          juryMembers: (jd.jury || []).map(m => ({
            name: m.full_name,
            role: m.role.charAt(0) + m.role.slice(1).toLowerCase(),
          })),
        };
      }));

    const [enrichedUnscheduled, enrichedScheduled] = await Promise.all([
      enrich(unscheduled),
      enrich(scheduled),
    ]);

    setUnscheduledTeams(enrichedUnscheduled);
    setScheduledDefenses(enrichedScheduled);
  } catch (err) {
    console.error("fetchScheduleData error:", err);
  }
};

  // Jury Assignment — real data from backend
const [teams, setTeams] = useState([]);
const [loadingJury, setLoadingJury] = useState(false);
const [juryError, setJuryError] = useState(null);
// ADD after line 175:
const [selectedSoutenanceId, setSelectedSoutenanceId] = useState(null);
const [loadingSchedule, setLoadingSchedule] = useState(false);
const fetchApprovedSoutenances = async () => {
  setLoadingJury(true);
  setJuryError(null);
  try {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch all soutenances (auto-created when request was approved)
    const res = await fetch("http://localhost:3000/api/soutenance", { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to load soutenances");

    // For each soutenance, also fetch its jury members
    const enriched = await Promise.all(
      data.soutenances.map(async (s) => {
        const juryRes = await fetch(`http://localhost:3000/api/jury/${s.id}/members`, { headers });
        const juryData = await juryRes.json();
        const jury = juryRes.ok ? juryData.jury : [];

        return {
          soutenanceId: s.id,          // real soutenance_id — used for all jury API calls
          id: `TEAM${s.team_id}`,      // display label
          teamId: s.team_id,
          projectTitle: s.project_title || "—",
          leader: s.leader_name || "—",
          juryNotified: s.jury_notified === 1,
          juryMembers: jury.map((m) => ({
            id: m.id,
            name: m.full_name,
            email: m.email,
            role: m.role.charAt(0) + m.role.slice(1).toLowerCase(), // "PRESIDENT" → "President"
            avatar: m.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2),
          })),
        };
      })
    );

    // ✅ REPLACE with:
    setTeams(enriched.filter(t => !t.juryNotified));
  } catch (err) {
    setJuryError(err.message);
  } finally {
    setLoadingJury(false);
  }
};

  // Équipes en attente d'approbation (Defense Requests)
const [pendingTeams, setPendingTeams] = useState([]);
const [loadingRequests, setLoadingRequests] = useState(false);
const [requestError, setRequestError] = useState(null);
const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0 });

useEffect(() => {
  fetchPendingRequests();
  fetchGradesData(); 
}, []); // runs once on mount

useEffect(() => {
  if (activeTab === "defense-requests") {
    fetchPendingRequests();
  }
  if (activeTab === "jury-assignment") {
    fetchApprovedSoutenances();
  }
  if (activeTab === "defense-schedule") {   // ← ADD THIS
    fetchScheduleData();
  }
}, [activeTab]);

const fetchPendingRequests = async () => {
  setLoadingRequests(true);
  setRequestError(null);
  try {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    // Fetch all 3 statuses in parallel
    const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
      fetch("http://localhost:3000/api/soutenance/requests?status=PENDING",  { headers }),
      fetch("http://localhost:3000/api/soutenance/requests?status=APPROVED", { headers }),
      fetch("http://localhost:3000/api/soutenance/requests?status=REJECTED", { headers }),
    ]);

    const [pendingData, approvedData, rejectedData] = await Promise.all([
      pendingRes.json(),
      approvedRes.json(),
      rejectedRes.json(),
    ]);

    if (!pendingRes.ok)  throw new Error(pendingData.message  || "Failed to load PENDING requests");
    if (!approvedRes.ok) throw new Error(approvedData.message || "Failed to load APPROVED requests");
    if (!rejectedRes.ok) throw new Error(rejectedData.message || "Failed to load REJECTED requests");

    const mapRequest = (r) => ({
  id: r.id,
  teamId: r.team_id,
  projectTitle: r.project_title,
  supervisor: r.teacher_name,
  requestedDate: new Date(r.requested_at).toLocaleDateString(),
  members: r.members || [],
  deliverables: {
    finalReport:  r.deliverables?.some(d => d.title === "Final Report"),
    sourceCode:   r.deliverables?.some(d => d.title === "Source Code Repository"),
    presentation: r.deliverables?.some(d => d.title === "Defense Presentation"),
  },
  // file_path URLs keyed by deliverable title
  deliverableUrls: {
    finalReport:  r.deliverables?.find(d => d.title === "Final Report")?.file_path  || null,
    sourceCode:   r.deliverables?.find(d => d.title === "Source Code Repository")?.file_path || null,
    presentation: r.deliverables?.find(d => d.title === "Defense Presentation")?.file_path  || null,
  },
  meetings: {
    completed: r.completed_meetings,
    required: 3,
    status: r.completed_meetings >= 3 ? "Done" : "In progress",
  },
});

    const pendingMapped = pendingData.requests.map(mapRequest);
    setPendingTeams(pendingMapped);

    // Now stats are real counts from the DB
    setStats({
      pending:  pendingData.requests.length,
      approved: approvedData.requests.length,
      rejected: rejectedData.requests.length,
    });

  } catch (err) {
    setRequestError(err.message);
  } finally {
    setLoadingRequests(false);
  }
};
    

  // Handlers
  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleChangePassword = (formData) => {
    console.log("🔐 Changement de mot de passe:", formData);
  };


  

  const handleApprove = async (requestId) => {
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`http://localhost:3000/api/soutenance/requests/${requestId}/approve`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Approval failed");

    alert(`✅ Request approved! Soutenance created (ID: ${data.soutenanceId})`);
    fetchPendingRequests(); // ← re-fetch everything so stats are always accurate
  } catch (err) {
    alert(`❌ Error: ${err.message}`);
  }
};

const handleReject = async (requestId) => {
  const token = localStorage.getItem("token");
  const comment = supervisorComment.trim() || null;
  try {
    const res = await fetch(`http://localhost:3000/api/soutenance/requests/${requestId}/reject`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ comment }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Rejection failed");

    setSupervisorComment("");
    alert(`❌ Request rejected.`);
    fetchPendingRequests(); // ← re-fetch everything so stats are always accurate
  } catch (err) {
    alert(`❌ Error: ${err.message}`);
  }
};

  const handleAddJuryMember = (soutenanceId) => {
  setSelectedTeamId(soutenanceId);   // we store soutenanceId here now
  setIsAddJuryModalOpen(true);
  };

  const handleRemoveJuryMember = (teamId, memberId, memberName) => {
    setMemberToDelete({ teamId, memberId, memberName });
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDeleteJuryMember = async () => {
  if (!memberToDelete) return;
  const token = localStorage.getItem("token");
  // memberToDelete.teamId now holds soutenanceId
  try {
    const res = await fetch(
      `http://localhost:3000/api/jury/${memberToDelete.teamId}/members/${memberToDelete.memberId}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to remove jury member");

    setMemberToDelete(null);
    setIsDeleteModalOpen(false);
    fetchApprovedSoutenances(); // refresh from DB
  } catch (err) {
    alert(`❌ Error: ${err.message}`);
    setIsDeleteModalOpen(false);
  }
};

  const handleConfirmAddJuryMember = async (juryData) => {
  const token = localStorage.getItem("token");
  const soutenanceId = juryData.teamId;

  const body = juryData.type === "inviteur"
    ? { email: juryData.email, inviteur_name: juryData.inviteur_name, role: "INVITEUR" }
    : { email: juryData.email, role: juryData.role.toUpperCase() };

  try {
    const res = await fetch(`http://localhost:3000/api/jury/${soutenanceId}/members`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to add jury member");

    // Don't close if it was an inviteur batch (modal handles its own close)
    if (juryData.type !== "inviteur") {
      setIsAddJuryModalOpen(false);
      setSelectedTeamId(null);
    }
    fetchApprovedSoutenances();
  } catch (err) {
    alert(`❌ Error: ${err.message}`);
  }
};
  const handleScheduleDefense = (teamId) => {
    setSelectedScheduleTeamId(teamId);
    setIsScheduleModalOpen(true);
  };
 // REPLACE lines 450–471 with:
const handleApproveJury = async (teamId) => {
  const team = teams.find(t => t.id === teamId);
  if (!team?.soutenanceId) return;
  const token = localStorage.getItem("token");
  try {
    const res  = await fetch(
      `http://localhost:3000/api/jury/${team.soutenanceId}/notify`,
      { method: "POST", headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to notify jury");

    alert(`✅ Jury approved & notified! Emails sent to jury`);
    setTeams(prev => prev.filter(t => t.id !== teamId)); // immediately remove from UI
    await fetchApprovedSoutenances();
    await fetchScheduleData();
    setActiveTab("defense-schedule");
  } catch (err) {
    alert(`❌ Error: ${err.message}`);
  }
};

  // REPLACE lines 473–514 with:
const handleConfirmScheduleDefense = async (scheduleData) => {
  const token = localStorage.getItem("token");
  setLoadingSchedule(true);

  try {
    // Find the soutenance to update — works for both edit and new schedule
    const source = scheduleData.isEdit
      ? scheduledDefenses.find(d => d.id === scheduleData.originalId)
      : unscheduledTeams.find(t => t.id === scheduleData.teamId);

    if (!source?.soutenanceId) {
      alert("❌ Cannot find soutenance ID.");
      return;
    }

    // NEW — different endpoint based on isEdit flag
const endpoint = scheduleData.isEdit
  ? `http://localhost:3000/api/soutenance/${source.soutenanceId}`          // UPDATE → notifies jury too
  : `http://localhost:3000/api/soutenance/${source.soutenanceId}/schedule`; // ADD → no jury email

const res = await fetch(endpoint, {
  method: "PUT",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    date:      scheduleData.date,
    time:      scheduleData.time,
    room_name: scheduleData.room,
  }),
});

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to save schedule");

    alert(
  scheduleData.isEdit
    ? "✅ Defense updated! Supervisor, team, and jury notified."
    : "✅ Defense scheduled! Supervisor and team notified."
);

    // Refresh schedule data from DB so UI reflects real state
    await fetchScheduleData();
  } catch (err) {
    alert(`❌ Error: ${err.message}`);
  } finally {
    setLoadingSchedule(false);
    setIsScheduleModalOpen(false);
    setSelectedScheduleTeamId(null);
    setIsEditMode(false);
  }
};

  const handleAddNotes = (teamId) => {
    setSelectedGradeTeamId(teamId);
    setIsNotesModalOpen(true);
  };

  const handleModifyNotes = (teamId) => {
    setSelectedGradeTeamId(teamId);
    setIsNotesModalOpen(true);
  };
  const handleConfirmNotes = async (formData) => {
    const team = gradesTeams.find(t => t.id === selectedGradeTeamId);
    if (!team?.soutenanceId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/api/grades/${team.soutenanceId}`, {
        method:  "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({
  grade_oral:          formData.oralPresentation,
  grade_deliverables:  formData.deliverablesQuality,
  grade_demo:          formData.demoApplication,
  grade_qa:            formData.qaResponses,
  coef_oral:           formData.coefOral,
  coef_deliverables:   formData.coefDeliverables,
  coef_demo:           formData.coefDemo,
  coef_qa:             formData.coefQa,
  jury_observations:   formData.juryObservations,
}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save grades");

      alert(`✅ Grades saved! Average: ${data.average}/20`);
      setIsNotesModalOpen(false);
      setSelectedGradeTeamId(null);
      fetchGradesData();   // refresh from DB
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };
 const handlePublishTeam = async (teamId) => {
    const team = gradesTeams.find(t => t.id === teamId);
    if (!team?.soutenanceId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:3000/api/grades/${team.soutenanceId}/publish`,
        { method: "POST", headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to publish");

      alert("✅ Grades published! Supervisor and team members notified.");
      fetchGradesData();   // refresh from DB
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const handleModifyDefense = (defense) => {
    setSelectedScheduleTeamId(defense.id);
    setIsEditMode(true); // Active le mode édition
    setIsScheduleModalOpen(true);
  };

  const handleImportNotes = async () => {
    const input = document.createElement("input");
    input.type   = "file";
    input.accept = ".xlsx,.xls";
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const token    = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      try {
        const res  = await fetch("http://localhost:3000/api/grades/bulk-import", {
          method:  "POST",
          headers: { Authorization: `Bearer ${token}` },
          body:    formData,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Import failed");

        const errMsg = data.errors?.length
          ? `\n⚠️ ${data.errors.length} error(s): ${data.errors.map(er => er.reason).join(", ")}`
          : "";
        alert(`✅ ${data.message}${errMsg}`);
        setImportedNotedCount(data.updated?.length || 0); // ✅ track how many were imported
        fetchGradesData();
      } catch (err) {
        alert(`❌ Import failed: ${err.message}`);
      }
    };
    input.click();
  };

  // ✅ ADD — Publish All Noted grades after import
  const handlePublishAll = async () => {
    const token = localStorage.getItem("token");
    try {
      const res  = await fetch("http://localhost:3000/api/publish-all", {
        method:  "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Publish failed");
      alert(`✅ ${data.message}`);
      setImportedNotedCount(0);
      fetchGradesData();
    } catch (err) {
      alert(`❌ Error: ${err.message}`);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "Noted":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "Published":
        return "bg-green-100 text-green-700 border-green-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };
  const getRoleBadgeColor = (role) => {
    switch (role?.toLowerCase()) {
      case "president":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "inviteur":
        return "bg-amber-100 text-amber-700 border-amber-300";
      case "examiner":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  // Composant Card réutilisable
  const DefenseCard = ({ children, className = "" }) => (
    <div
      className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 ${className}`}
    >
      {children}
    </div>
  );

  // Composant Badge pour les rôles
  const JuryBadge = ({ name, role }) => (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${getRoleBadgeColor(
        role,
      )}`}
    >
      {name} ({role})
    </span>
  );

  return (
    <div className="flex h-screen bg-[#f5f6f8]">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mt-1">
                Assign jury members, organize defenses, and manage grades
              </p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                Defense Management
              </h1>
            </div>

            {/* Profile Dropdown */}
            <div className="ml-4">
              <ProfileDropdown
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {/* Defense Management Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            {/* Header with icon */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-xl">
                  {tabConfig[activeTab].icon}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#193962]">
                    {tabConfig[activeTab].title}
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    {tabConfig[activeTab].description}
                  </p>
                </div>
              </div>

             {/* Export/Import Buttons */}
              <div className="flex gap-3">
                {activeTab === "grades-results" && (
                  <>
                    <button
                      onClick={handleImportNotes}
                      className="flex items-center gap-2 bg-[#193962] hover:bg-[#152f4d] text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
                    >
                      <FileText size={16} />
                      Import Notes
                    </button>
                    {/* ✅ Publish All — only show after import or when there are Noted teams */}
                    {(importedNotedCount > 0 || gradesTeams.some(t => t.status === "Noted")) && (
                      <button
                        onClick={handlePublishAll}
                        className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-all text-sm"
                      >
                        <CheckCircle size={16} />
                        Publish All
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("defense-requests")}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === "defense-requests"
                    ? "border-[#1e3a5f] text-[#1e3a5f]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Users size={16} />
                Defense requests
              </button>
              <button
                onClick={() => setActiveTab("jury-assignment")}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === "jury-assignment"
                    ? "border-[#1e3a5f] text-[#1e3a5f]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <User size={16} />
                Jury assignment
              </button>
              <button
                onClick={() => setActiveTab("defense-schedule")}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === "defense-schedule"
                    ? "border-[#1e3a5f] text-[#1e3a5f]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Calendar size={16} />
                Defense Schedule
              </button>
              <button
                onClick={() => setActiveTab("grades-results")}
                className={`flex items-center gap-2 px-4 py-2 font-medium text-sm transition-colors border-b-2 ${
                  activeTab === "grades-results"
                    ? "border-[#1e3a5f] text-[#1e3a5f]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <FileText size={16} />
                Grades & Results
              </button>
            </div>

            {/* Defense Requests Content */}
            {activeTab === "defense-requests" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Pending */}
                  <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <Clock size={24} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Pending</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {pendingTeams.length}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Approved */}
                  <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <CheckCircle size={24} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Approved</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {stats.approved}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Rejected */}
                  <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-100 rounded-full">
                        <XCircle size={24} className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Rejected</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {stats.rejected}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {loadingRequests && (
  <div className="text-center py-12 text-gray-500">Loading requests...</div>
)}
{requestError && (
  <div className="text-center py-12 text-red-500">Error: {requestError}</div>
)}

                {/* Pending Teams List */}
                {pendingTeams.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                    <CheckCircle
                      size={64}
                      className="mx-auto text-green-400 mb-4"
                    />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      All requests processed!
                    </h3>
                    <p className="text-gray-500">
                      No pending defense requests at the moment.
                    </p>
                  </div>
                ) : (
                  pendingTeams.map((team) => (
                    <div
                      key={team.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                     
                     {/* Team Header */}
                      <div className="mb-4">
                        <div className="flex items-center gap-3 mb-1">
                          <h3 className="text-lg font-semibold text-[#193962]">
                            Team #{team.teamId}
                          </h3>
                        </div>
                        <p className="text-gray-800 font-medium">{team.projectTitle}</p>
                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <User size={15} className="text-[#2D8FBF]" />
                            <span>Supervisor: <strong>{team.supervisor}</strong></span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Calendar size={15} className="text-[#2D8FBF]" />
                            <span>Requested on {team.requestedDate}</span>
                          </div>
                        </div>
                      </div>

                      {/* Team Members */}
                      {team.members?.length > 0 && (
                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Users size={15} className="text-[#2D8FBF]" />
                            <span className="text-sm font-semibold text-gray-700">Team Members</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {team.members.map((name, i) => (
                              <span key={i} className="text-xs bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-full">
                                {name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Deliverables Validation */}
                      <div className="mb-4">
                        <h4 className="font-semibold text-gray-800 mb-2 text-sm">
                          Deliverables validation
                        </h4>
                        <div className="flex flex-wrap gap-3">
                          {team.deliverables.finalReport && (
                            team.deliverableUrls.finalReport
                              ? <a href={team.deliverableUrls.finalReport} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline transition-colors">
                                  <CheckCircle size={17} />
                                  <span className="text-sm font-medium">Final report</span>
                                  <Eye size={14} className="text-green-500" />
                                </a>
                              : <div className="flex items-center gap-2 text-green-600">
                                  <CheckCircle size={17} />
                                  <span className="text-sm">Final report</span>
                                </div>
                          )}
                          {team.deliverables.sourceCode && (
                            team.deliverableUrls.sourceCode
                              ? <a href={team.deliverableUrls.sourceCode} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline transition-colors">
                                  <Code size={17} />
                                  <span className="text-sm font-medium">Source code</span>
                                  <Eye size={14} className="text-green-500" />
                                </a>
                              : <div className="flex items-center gap-2 text-green-600">
                                  <Code size={17} />
                                  <span className="text-sm">Source code</span>
                                </div>
                          )}
                          {team.deliverables.presentation && (
                            team.deliverableUrls.presentation
                              ? <a href={team.deliverableUrls.presentation} target="_blank" rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-green-600 hover:text-green-700 hover:underline transition-colors">
                                  <Presentation size={17} />
                                  <span className="text-sm font-medium">Presentation</span>
                                  <Eye size={14} className="text-green-500" />
                                </a>
                              : <div className="flex items-center gap-2 text-green-600">
                                  <Presentation size={17} />
                                  <span className="text-sm">Presentation</span>
                                </div>
                          )}
                        </div>
                      </div>

                     

                      {/* Supervisor's Comment */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">
                          Supervisor's comment
                        </h4>
                        <textarea
                          value={supervisorComment}
                          onChange={(e) => setSupervisorComment(e.target.value)}
                          placeholder="Write a comment for the admin about the readiness of this team"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#193962] focus:border-transparent resize-none"
                          rows={3}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleApprove(team.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
                        >
                          <CheckCircle size={18} />
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(team.id)}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-medium transition-all"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Jury Assignment Content */}
          {activeTab === "jury-assignment" && (
  <div className="space-y-6">
    {loadingJury && (
      <div className="text-center py-12 text-gray-500">Loading soutenances...</div>
    )}
    {juryError && (
      <div className="text-center py-12 text-red-500">Error: {juryError}</div>
    )}
{!loadingJury && !juryError && teams.length === 0 && (
  <div className="text-center py-12 text-gray-500">
    <CheckCircle size={48} className="mx-auto mb-3 text-green-400" />
    <p className="font-semibold text-gray-700">All requests processed!</p>
    <p className="text-sm mt-1">No pending Jury assignments at the moment.</p>
  </div>
)}
    {/* Teams List */}
    <div className="space-y-6">
      {teams.map((team) => (
                    <div
                      key={team.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Team Header */}
                      <div className="mb-4">
                        <h3 className="text-lg font-semibold text-[#193962] mb-1">
                          {team.id}
                        </h3>
                        <p className="text-gray-600 text-sm">{team.leader}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          {team.projectTitle}
                        </p>
                      </div>

                      {/* Jury Members List */}
                      {team.juryMembers.length > 0 && (
                        <div className="space-y-3 mb-4">
                          {team.juryMembers.map((member) => (
                            <div
                              key={member.id}
                              className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#193962] to-[#2D8FBF] flex items-center justify-center text-white font-semibold text-sm">
                                  {member.avatar}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">
                                    {member.name}
                                  </p>
                                  <p className="text-sm text-gray-500">
                                    {member.email}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(
                                    member.role,
                                  )}`}
                                >
                                  {member.role}
                                </span>
                                <button
                                  onClick={() =>
                                    handleRemoveJuryMember(
                                      team.soutenanceId,
                                      member.id,
                                      member.name,
                                    )
                                  }
                                  className="p-1 hover:bg-red-50 rounded transition-colors"
                                >
                                  <X size={16} className="text-red-500" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                     {/* Buttons Section */}
                      {team.juryNotified ? (
                        /* ── APPROVED STATE ── */
                        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle size={18} className="text-green-600" />
                            <span className="font-semibold text-green-700 text-sm">Jury Approved</span>
                          </div>
                          <p className="text-sm font-semibold text-[#193962] mb-2 truncate">{team.projectTitle}</p>
                          <div className="flex flex-wrap gap-2">
                            {team.juryMembers.map((m) => (
                              <span
                                key={m.id}
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(m.role)}`}
                              >
                                {m.name}
                                <span className="opacity-60">· {m.role}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        /* ── PENDING STATE ── */
                        <>
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={() => handleAddJuryMember(team.soutenanceId)}
                              className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-[#193962] px-4 py-2.5 rounded-lg font-medium transition-all border border-blue-200"
                            >
                              <Plus size={18} />
                              Add Member
                            </button>
{(() => {
  const roles = team.juryMembers.map(m => m.role.toUpperCase());
  const hasPresident   = roles.filter(r => r === "PRESIDENT").length === 1;
  const hasExaminer    = roles.filter(r => r === "EXAMINER").length  === 1;
  const canApprove     = hasPresident && hasExaminer;
  return canApprove ? (
    <button
      onClick={() => handleApproveJury(team.id)}
      className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2.5 rounded-lg font-medium transition-all shadow-sm hover:shadow-md"
    >
      <CheckCircle size={18} />
      Approve Jury
    </button>
  ) : null;
})()}
</div>
{(() => {
  const roles = team.juryMembers.map(m => m.role.toUpperCase());
  const missing = ["PRESIDENT", "EXAMINER"].filter(
  r => roles.filter(x => x === r).length !== 1
);
  return missing.length > 0 ? (
    <p className="text-xs text-orange-600 mt-2 text-center">
      ⚠️ Required: exactly 1 President and 1 Examiner. Missing or duplicate: {missing.join(", ")}
    </p>
  ) : null;
})()}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Defense Schedule Content */}
            {activeTab === "defense-schedule" && (
              <div className="space-y-6">
                {/* Header */}

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gray-200">
                  <button
                    onClick={() => setScheduleTab("to-schedule")}
                    className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm transition-all duration-300 border-b-2 ${
                      scheduleTab === "to-schedule"
                        ? "border-[#193962] text-[#193962]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <Clock size={16} />
                    To Schedule
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        scheduleTab === "to-schedule"
                          ? "bg-[#193962] text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {unscheduledTeams.length}
                    </span>
                  </button>
                  <button
                    onClick={() => setScheduleTab("scheduled")}
                    className={`flex items-center gap-2 px-5 py-2.5 font-medium text-sm transition-all duration-300 border-b-2 ${
                      scheduleTab === "scheduled"
                        ? "border-[#193962] text-[#193962]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <CheckCircle size={16} />
                    Scheduled
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        scheduleTab === "scheduled"
                          ? "bg-[#193962] text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {scheduledDefenses.length}
                    </span>
                  </button>
                </div>

                {/* To Schedule Tab Content */}
                {scheduleTab === "to-schedule" && (
                  <div className="space-y-4 animate-fadeIn">
                    {unscheduledTeams.length === 0 ? (
                      <DefenseCard className="text-center py-12">
                        <div className="p-4 bg-blue-50 rounded-full w-16 h-16 mx-auto mb-4">
                          <Calendar
                            size={32}
                            className="text-[#193962] mx-auto"
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          No defenses to schedule
                        </h3>
                        <p className="text-gray-500">
                          All defense requests have been scheduled.
                        </p>
                      </DefenseCard>
                    ) : (
                      unscheduledTeams.map((team) => (
                        <DefenseCard key={team.id}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-[#193962]">
                                  {team.id}
                                </h3>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-300">
                                  Pending Schedule
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-1">
                                {team.projectTitle}
                              </p>
                              <p className="text-gray-500 text-sm">
                                Team Leader: {team.leader}
                              </p>
                            </div>
                          </div>

                          {/* Jury Members */}
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Jury members:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {team.juryMembers.map((member, index) => (
                                <JuryBadge
                                  key={index}
                                  name={member.name}
                                  role={member.role}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Schedule Button */}
                          <button
                            onClick={() => handleScheduleDefense(team.id)}
                            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#193962] to-[#2D8FBF] hover:from-[#152f4d] hover:to-[#2575a0] text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5"
                          >
                            <Calendar size={18} />
                            Schedule Defense
                          </button>
                        </DefenseCard>
                      ))
                    )}
                  </div>
                )}

                {/* Scheduled Tab Content */}
                {scheduleTab === "scheduled" && (
                  <div className="space-y-4 animate-fadeIn">
                    {scheduledDefenses.length === 0 ? (
                      <DefenseCard className="text-center py-12">
                        <div className="p-4 bg-green-50 rounded-full w-16 h-16 mx-auto mb-4">
                          <CheckCircle
                            size={32}
                            className="text-green-600 mx-auto"
                          />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-800 mb-2">
                          No scheduled defenses
                        </h3>
                        <p className="text-gray-500">
                          Start by scheduling defenses from the "To Schedule"
                          tab.
                        </p>
                      </DefenseCard>
                    ) : (
                      scheduledDefenses.map((defense) => (
                        <DefenseCard key={defense.id}>
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-lg font-semibold text-[#193962]">
                                  {defense.id}
                                </h3>
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-300">
                                  Scheduled
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm mb-1">
                                {defense.projectTitle}
                              </p>
                              <p className="text-gray-500 text-sm">
                                Team Leader: {defense.leader}
                              </p>
                            </div>
                            <button
                              onClick={() => handleModifyDefense(defense)}
                              className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all duration-300"
                            >
                              <Edit2 size={16} />
                              Modify
                            </button>
                          </div>

                          {/* Defense Details */}
                          <div className="grid grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                            <div className="flex items-center gap-2 text-gray-700">
                              <Calendar size={16} className="text-[#193962]" />
                              <span className="text-sm font-medium">
                                {defense.defenseDate}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <Clock size={16} className="text-[#193962]" />
                              <span className="text-sm font-medium">
                                {defense.defenseTime}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <MapPin size={16} className="text-[#193962]" />
                              <span className="text-sm font-medium">
                                {defense.room}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-700">
                              <User size={16} className="text-[#193962]" />
                              <span className="text-sm font-medium">
                                Supervisor: {defense.supervisor}
                              </span>
                            </div>
                          </div>

                          {/* Jury Members */}
                          <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              Jury members:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {defense.juryMembers.map((member, index) => (
                                <JuryBadge
                                  key={index}
                                  name={member.name}
                                  role={member.role}
                                />
                              ))}
                            </div>
                          </div>
                        </DefenseCard>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Grades & Results Content */}
            {activeTab === "grades-results" && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-6 mb-6">
                  {/* Pending */}
                  <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-yellow-100 rounded-full">
                        <Clock size={24} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Pending</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {gradesStats.pending}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Noted */}
                  <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-100 rounded-full">
                        <ClipboardList size={24} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Noted</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {gradesStats.noted}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Published */}
                  <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <CheckCircle size={24} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-gray-500 text-sm">Published</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {gradesStats.published}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teams List */}
                <div className="space-y-6">
                  {gradesTeams.map((team) => (
                    <div
                      key={team.id}
                      className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      {/* Team Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-[#193962]">
                              {team.id}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(
                                team.status,
                              )}`}
                            >
                              {team.status}
                            </span>
                          </div>
                          <p className="text-gray-600 text-sm">
                            {team.projectTitle}
                          </p>
                          <p className="text-gray-500 text-xs mt-1">
                            {team.teamMembers} • Defense on {team.defenseDate}{" "}
                            at {team.defenseTime}
                          </p>
                        </div>
                        {team.status === "Noted" && (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handlePublishTeam(team.id)}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-medium rounded-lg transition-all"
                            >
                              Publish
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Pending Status - Add Notes Button */}
                      {team.status === "Pending" && (
                        <button
                          onClick={() => handleAddNotes(team.id)}
                          className="w-full flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 text-[#193962] px-4 py-2.5 rounded-lg font-medium transition-all border border-blue-200"
                        >
                          <Plus size={18} />
                          Add Notes
                        </button>
                      )}

                      {/* Noted Status - Show Notes */}
                      {team.status === "Noted" && team.notes && (
                        <>
                          {/* Notes Section */}
                          <div className="bg-gray-50 rounded-xl p-4 mb-4">
                            <div className="flex items-center justify-between mb-3">
                              <p className="text-sm font-medium text-gray-700">
                                Notes :
                              </p>
                              <button
                                onClick={() => handleModifyNotes(team.id)}
                                className="flex items-center gap-1 text-[#193962] hover:text-[#152f4d] text-sm font-medium"
                              >
                                <Edit2 size={14} />
                                Modify
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                                <span className="text-sm text-gray-600">
                                  Oral Presentation
                                </span>
                                <span className="font-semibold text-gray-800">
                                  {team.notes.oralPresentation}/20
                                </span>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                                <span className="text-sm text-gray-600">
                                  Deliverables Quality
                                </span>
                                <span className="font-semibold text-gray-800">
                                  {team.notes.deliverablesQuality}/20
                                </span>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                                <span className="text-sm text-gray-600">
                                  Demo / Application
                                </span>
                                <span className="font-semibold text-gray-800">
                                  {team.notes.demoApplication}/20
                                </span>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded-lg px-3 py-2">
                                <span className="text-sm text-gray-600">
                                  Q&A Responses
                                </span>
                                <span className="font-semibold text-gray-800">
                                  {team.notes.qaResponses}/20
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Jury Observations */}
                          {team.juryObservations && (
                            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                              <p className="text-sm font-medium text-[#193962] mb-2">
                                Jury observations:
                              </p>
                              <ul className="list-disc list-inside text-sm text-gray-700">
                                <li>{team.juryObservations}</li>
                              </ul>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
      <AddJuryMemberModal
        isOpen={isAddJuryModalOpen}
        onClose={() => setIsAddJuryModalOpen(false)}
        onConfirm={handleConfirmAddJuryMember}
        teamId={selectedTeamId}
      />
      <DeleteJuryMemberModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDeleteJuryMember}
        memberName={memberToDelete?.memberName}
      />
      <ScheduleDefenseModal
        isOpen={isScheduleModalOpen}
        onClose={() => {
          setIsScheduleModalOpen(false);
          setIsEditMode(false); // ✅ Reset du mode édition
        }}
        onConfirm={handleConfirmScheduleDefense}
        teamId={selectedScheduleTeamId}
        initialData={
          isEditMode
            ? scheduledDefenses.find((d) => d.id === selectedScheduleTeamId)
            : null
        }
      />
      <AddNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => {
          setIsNotesModalOpen(false);
          setSelectedGradeTeamId(null);
        }}
        onConfirm={handleConfirmNotes}
        teamData={gradesTeams.find((t) => t.id === selectedGradeTeamId)}
      />
    </div>
  );
};

export default DefenseManagement;

// Composant Card réutilisable
const DefenseCard = ({ children, className = "" }) => (
  <div
    className={`bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 ${className}`}
  >
    {children}
  </div>
);

// Composant Badge pour les rôles
const JuryBadge = ({ name, role }) => {
  const getRoleColor = (r) => {
    switch (r?.toLowerCase()) {
      case "president":
        return "bg-purple-100 text-purple-700 border-purple-300";
      case "reporter":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "examiner":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium border ${getRoleColor(role)}`}
    >
      {name} ({role})
    </span>
  );
};
