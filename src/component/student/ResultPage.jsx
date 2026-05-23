import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StudentSidebar from "../../layout/StudentSidebar";
import { ProfileDropdown } from "../supervisor/HomePage";
import useCurrentUser from "../../hooks/useCurrentUser";
import {
  Trophy,
  Star,
  Users,
  BookOpen,
  Calendar,
  User,
  MessageSquare,
  Award,
  ChevronRight,
  Loader2,
  Lock,
  CheckCircle,
  Mic,
  Monitor,
  HelpCircle,
  TrendingUp,
} from "lucide-react";

// ── Sidebar icon (export so your sidebar can import it) ──────────────────────
export const ResultIcon = ({ active }) => (
  <Trophy
    size={20}
    strokeWidth={active ? 2.5 : 1.8}
    style={{ color: active ? "#2D8FBF" : "#94a3b8" }}
  />
);

// ── Grade ring ───────────────────────────────────────────────────────────────
const GradeRing = ({ value, max = 20, label, icon: Icon, color }) => {
  const pct = value != null ? Math.min((value / max) * 100, 100) : 0;
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  const getColor = () => {
    if (value == null) return "#cbd5e1";
    if (value >= 16) return "#22c55e";
    if (value >= 12) return color || "#2D8FBF";
    if (value >= 10) return "#f59e0b";
    return "#ef4444";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
      <div style={{ position: "relative", width: 96, height: 96 }}>
        <svg width="96" height="96" viewBox="0 0 96 96">
          <circle cx="48" cy="48" r={r} fill="none" stroke="#e2e8f0" strokeWidth="7" />
          <circle
            cx="48" cy="48" r={r}
            fill="none"
            stroke={getColor()}
            strokeWidth="7"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            transform="rotate(-90 48 48)"
            style={{ transition: "stroke-dasharray 1s ease" }}
          />
        </svg>
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
        }}>
          {Icon && <Icon size={14} color={getColor()} style={{ marginBottom: 1 }} />}
          <span style={{ fontSize: 15, fontWeight: 700, color: getColor(), lineHeight: 1 }}>
            {value != null ? value.toFixed(1) : "–"}
          </span>
          <span style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500 }}>/{max}</span>
        </div>
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "center" }}>
        {label}
      </span>
    </div>
  );
};

// ── Member avatar ────────────────────────────────────────────────────────────
const MemberBadge = ({ name, isCurrentUser }) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase();
  const colors = ["#193962", "#2D8FBF", "#0e7490", "#6d28d9", "#059669"];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "10px 14px",
      background: isCurrentUser ? "#eff6ff" : "#f8fafc",
      borderRadius: 10,
      border: isCurrentUser ? "1.5px solid #bfdbfe" : "1.5px solid #e2e8f0",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%",
        background: color, display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0,
      }}>{initials}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b" }}>{name}</div>
        {isCurrentUser && (
          <div style={{ fontSize: 10, color: "#2D8FBF", fontWeight: 600, marginTop: 1 }}>You</div>
        )}
      </div>
      {isCurrentUser && <CheckCircle size={15} color="#2D8FBF" style={{ marginLeft: "auto" }} />}
    </div>
  );
};

// ── Final grade badge ────────────────────────────────────────────────────────
const FinalGradeBadge = ({ grade }) => {
  const getMention = (g) => {
    if (g >= 18) return { text: "Très Honorable", color: "#22c55e", bg: "#f0fdf4", border: "#bbf7d0" };
    if (g >= 16) return { text: "Honorable", color: "#16a34a", bg: "#f0fdf4", border: "#bbf7d0" };
    if (g >= 14) return { text: "Bien", color: "#2D8FBF", bg: "#eff6ff", border: "#bfdbfe" };
    if (g >= 12) return { text: "Assez Bien", color: "#0891b2", bg: "#ecfeff", border: "#a5f3fc" };
    if (g >= 10) return { text: "Passable", color: "#d97706", bg: "#fffbeb", border: "#fde68a" };
    return { text: "Ajourné", color: "#dc2626", bg: "#fef2f2", border: "#fecaca" };
  };
  const mention = getMention(grade);
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "6px 14px",
      background: mention.bg,
      border: `1.5px solid ${mention.border}`,
      borderRadius: 20,
      fontSize: 12, fontWeight: 700, color: mention.color,
    }}>
      <Star size={12} fill={mention.color} stroke="none" />
      {mention.text}
    </div>
  );
};

// ── Main ResultPage component ─────────────────────────────────────────────────
export default function ResultPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animIn, setAnimIn] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useCurrentUser();

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  // ── Fetch the student's result from the API ──────────────────────────────
  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token =
          localStorage.getItem("token") ||
          document.cookie.split("; ").find(r => r.startsWith("token="))?.split("=")[1];

        const res = await fetch("http://localhost:3000/api/soutenance/my-result", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 404) {
          setResult(null);
          setLoading(false);
          return;
        }
        if (!res.ok) throw new Error("Failed to fetch result");

        const data = await res.json();
        setResult(data.result);
        setLoading(false);
        setTimeout(() => setAnimIn(true), 50);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchResult();
  }, []);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.centerBox}>
          <Loader2 size={36} color="#2D8FBF" style={{ animation: "spin 1s linear infinite" }} />
          <p style={{ color: "#64748b", marginTop: 12, fontSize: 14 }}>Loading your results…</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.centerBox}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>⚠️</div>
          <p style={{ color: "#ef4444", fontWeight: 600 }}>{error}</p>
        </div>
      </div>
    );
  }

  // ── Not published yet ────────────────────────────────────────────────────
  if (!result || result.grade_status !== "PUBLISHED") {
   return (
      <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
        <StudentSidebar />
        <div className="flex-1 flex flex-col ml-16 overflow-hidden">

          <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track your projects</p>
                <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                
                <ProfileDropdown user={currentUser} onLogout={handleLogout} onChangePassword={() => {}} />
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div style={styles.pageWrapper}>
              <div style={styles.pageInner}>

                {/* Pending card */}
                <div style={{
                  background: "#fff", borderRadius: 16,
                  border: "1.5px dashed #cbd5e1",
                  padding: "60px 40px",
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 16, textAlign: "center",
                }}>
                  <div style={{
                    width: 72, height: 72, borderRadius: "50%",
                    background: "linear-gradient(135deg, #f1f5f9, #e2e8f0)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Lock size={28} color="#94a3b8" />
                  </div>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>
                    Results Not Yet Published
                  </h2>
                  <p style={{ color: "#64748b", fontSize: 14, maxWidth: 400, margin: 0, lineHeight: 1.7 }}>
                    Your defense results are pending review. You will receive a notification
                    as soon as the administration publishes your final evaluation.
                  </p>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 18px", background: "#eff6ff",
                    borderRadius: 20, marginTop: 8,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#f59e0b", animation: "pulse 2s infinite" }} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#2D8FBF" }}>
                      {result ? `Status: ${result.grade_status}` : "No defense scheduled yet"}
                    </span>
                  </div>
                </div>
              </div>
              <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }`}</style>
            </div>
          </main>

        </div>
      </div>
    );
  }

  // ── Compute final average ────────────────────────────────────────────────
  const grades = [result.grade_oral, result.grade_demo, result.grade_qa].filter(g => g != null);
  const average = grades.length > 0
    ? (grades.reduce((a, b) => a + parseFloat(b), 0) / grades.length).toFixed(2)
    : null;

  const finalGrade = result.final_grade ?? (average ? parseFloat(average) : null);

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <StudentSidebar />
      <div className="flex-1 flex flex-col ml-16 overflow-hidden">

        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track your projects</p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <a href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v" target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm">
                <Facebook size={14} className="sm:w-5 sm:h-5" />
              </a>
              <a href="https://www.linkedin.com/in/https%3A%2F%2Fwww.linkedin.com%2Fschool%2Fesisba" target="_blank" rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm">
                <Linkedin size={14} className="sm:w-5 sm:h-5" />
              </a>
              <ProfileDropdown user={currentUser} onLogout={handleLogout} onChangePassword={() => {}} />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
        <div style={styles.pageWrapper}>

      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to   { opacity: 1; transform: scale(1); }
        }
        .result-card { animation: fadeSlideUp 0.5s ease both; }
        .grade-ring-wrap { animation: scaleIn 0.6s ease both; }
      `}</style>

      <div style={styles.pageInner}>
        {/* ── Hero: Project title + Final grade ───────────────────────── */}
        <div className="result-card" style={{
          ...styles.card,
          background: "linear-gradient(135deg, #193962 0%, #1e4d80 50%, #2D8FBF 100%)",
          color: "#fff", animationDelay: "0.05s",
          position: "relative", overflow: "hidden",
        }}>
          {/* decorative blob */}
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 200, height: 200, borderRadius: "50%",
            background: "rgba(255,255,255,0.06)",
          }} />
          <div style={{
            position: "absolute", bottom: -40, left: 200,
            width: 140, height: 140, borderRadius: "50%",
            background: "rgba(255,255,255,0.04)",
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24, position: "relative" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(255,255,255,0.15)", borderRadius: 6,
                padding: "3px 10px", fontSize: 11, fontWeight: 600,
                letterSpacing: "0.08em", marginBottom: 12, color: "#bfdbfe",
              }}>
                <BookOpen size={11} /> PROJECT
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 6px", lineHeight: 1.3 }}>
                {result.project_title}
              </h2>
           
            </div>

            {/* Final grade circle */}
            {finalGrade != null && (
              <div className="grade-ring-wrap" style={{
                display: "flex", flexDirection: "column", alignItems: "center",
                animationDelay: "0.3s",
              }}>
                <div style={{ position: "relative", width: 110, height: 110 }}>
                  <svg width="110" height="110" viewBox="0 0 110 110">
                    <circle cx="55" cy="55" r="44" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
                    <circle
                      cx="55" cy="55" r="44"
                      fill="none" stroke="rgba(255,255,255,0.9)" strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${(finalGrade / 20) * 2 * Math.PI * 44} ${2 * Math.PI * 44}`}
                      transform="rotate(-90 55 55)"
                    />
                  </svg>
                  <div style={{
                    position: "absolute", inset: 0,
                    display: "flex", flexDirection: "column",
                    alignItems: "center", justifyContent: "center",
                  }}>
                    <span style={{ fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1 }}>
                      {parseFloat(finalGrade).toFixed(1)}
                    </span>
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>/20</span>
                  </div>
                </div>
                <FinalGradeBadge grade={parseFloat(finalGrade)} />
              </div>
            )}
          </div>
        </div>

        {/* ── Grade breakdown ──────────────────────────────────────────── */}
        <div className="result-card" style={{ ...styles.card, animationDelay: "0.1s" }}>
          <div style={styles.cardHeader}>
            <TrendingUp size={16} color="#2D8FBF" />
            <span style={styles.cardTitle}>Grade Breakdown</span>
          </div>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))",
            gap: 24, paddingTop: 8,
            justifyItems: "center",
          }}>
            <GradeRing value={result.grade_oral != null ? parseFloat(result.grade_oral) : null} label="Oral Defense" icon={Mic} color="#2D8FBF" />
            <GradeRing value={result.grade_demo != null ? parseFloat(result.grade_demo) : null} label="Demo" icon={Monitor} color="#7c3aed" />
            <GradeRing value={result.grade_qa != null ? parseFloat(result.grade_qa) : null} label="Q&A" icon={HelpCircle} color="#0891b2" />
            {result.grade_deliverables != null && (
              <GradeRing value={parseFloat(result.grade_deliverables)} label="Deliverables" icon={BookOpen} color="#059669" />
            )}
          </div>
        </div>

        {/* ── Two-col: team + supervisor ───────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Team members */}
          <div className="result-card" style={{ ...styles.card, animationDelay: "0.15s" }}>
            <div style={styles.cardHeader}>
              <Users size={16} color="#2D8FBF" />
              <span style={styles.cardTitle}>Team Members</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 4 }}>
              {(result.members || []).map((m, i) => (
                <MemberBadge key={i} name={m.full_name} isCurrentUser={m.is_current_user} />
              ))}
              {(!result.members || result.members.length === 0) && (
                <p style={{ color: "#94a3b8", fontSize: 13 }}>—</p>
              )}
            </div>
          </div>

          {/* Supervisor + Defense info */}
          <div className="result-card" style={{ ...styles.card, animationDelay: "0.2s" }}>
            <div style={styles.cardHeader}>
              <User size={16} color="#2D8FBF" />
              <span style={styles.cardTitle}>Defense Info</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 4 }}>
              <InfoRow icon={User} label="Supervisor" value={result.supervisor_name || "—"} />
              <InfoRow icon={Calendar} label="Date" value={
                result.date
                  ? new Date(result.date).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                  : "—"
              } />
              {result.time && <InfoRow icon={ChevronRight} label="Time" value={result.time} />}
              {result.room_name && <InfoRow icon={ChevronRight} label="Room" value={result.room_name} />}
            </div>
          </div>
        </div>

        {/* ── Jury observations ────────────────────────────────────────── */}
        {result.jury_observations && (
          <div className="result-card" style={{ ...styles.card, animationDelay: "0.25s" }}>
            <div style={styles.cardHeader}>
              <MessageSquare size={16} color="#2D8FBF" />
              <span style={styles.cardTitle}>Jury Observations</span>
            </div>
            <div style={{
              marginTop: 10, padding: "16px 20px",
              background: "#f8fafc", borderRadius: 10,
              border: "1px solid #e2e8f0",
              borderLeft: "4px solid #2D8FBF",
            }}>
              <p style={{
                margin: 0, fontSize: 14, color: "#374151",
                lineHeight: 1.75, fontStyle: "italic",
              }}>
                "{result.jury_observations}"
              </p>
            </div>
          </div>
        )}

        {/* ── Jury members ─────────────────────────────────────────────── */}
        {result.jury && result.jury.length > 0 && (
          <div className="result-card" style={{ ...styles.card, animationDelay: "0.3s" }}>
            <div style={styles.cardHeader}>
              <Award size={16} color="#2D8FBF" />
              <span style={styles.cardTitle}>Jury Members</span>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              gap: 10, marginTop: 8,
            }}>
              {result.jury.map((j, i) => {
                const roleColors = {
                  PRESIDENT: { bg: "#eff6ff", border: "#bfdbfe", color: "#1d4ed8" },
                  RAPPORTEUR: { bg: "#f0fdf4", border: "#bbf7d0", color: "#15803d" },
                  EXAMINER: { bg: "#faf5ff", border: "#e9d5ff", color: "#7c3aed" },
                };
                const rc = roleColors[j.role] || roleColors.EXAMINER;
                return (
                  <div key={i} style={{
                    padding: "12px 14px", borderRadius: 10,
                    background: "#f8fafc", border: "1.5px solid #e2e8f0",
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginBottom: 4 }}>
                      {j.full_name}
                    </div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: "2px 8px",
                      borderRadius: 10, background: rc.bg,
                      border: `1px solid ${rc.border}`, color: rc.color,
                      textTransform: "uppercase", letterSpacing: "0.06em",
                    }}>
                      {j.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        </div>
        </div>
        </main>
      </div>
    </div>
  );
}

// ── Small helper ─────────────────────────────────────────────────────────────
const InfoRow = ({ icon: Icon, label, value }) => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
    <div style={{
      width: 30, height: 30, borderRadius: 8,
      background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0,
    }}>
      <Icon size={14} color="#2D8FBF" />
    </div>
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", marginTop: 1 }}>{value}</div>
    </div>
  </div>
);

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  pageWrapper: {
    minHeight: "100vh",
    background: "#f1f5f9",
    padding: "32px 24px",
    fontFamily: "'Segoe UI', system-ui, sans-serif",
  },
  pageInner: {
    maxWidth: 860,
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  pageHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    background: "linear-gradient(135deg, #eff6ff, #dbeafe)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 2px 8px rgba(45,143,191,0.15)",
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#0f172a",
    margin: 0,
    lineHeight: 1.2,
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#64748b",
    margin: 0,
    marginTop: 2,
  },
  card: {
    background: "#ffffff",
    borderRadius: 16,
    padding: "22px 24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)",
    border: "1px solid #f1f5f9",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: "1px solid #f1f5f9",
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#1e293b",
    letterSpacing: "0.01em",
  },
  centerBox: {
    minHeight: "60vh",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
};