import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { LockKeyhole, Mail, Eye, EyeOff } from "lucide-react";
import logo from "../assets/logo.jpg";



/* ─────────────────────────────────────────
   Inline SVG: PFEFLOW shark-fin logo
   (dark-navy fin + 3 cyan wave lines)
───────────────────────────────────────── */
const PfeflowLogo = ({ size = 32 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 60 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Shark fin */}
    <path
      d="M30 6 C30 6 33 10 36 15 C38 13 41 13.5 42 14.5
         C42 14.5 37 23 33 29 C32 28 31 27 30 26
         C29 27 28 28 27 29
         C23 23 18 14.5 18 14.5
         C19 13.5 22 13 24 15
         C27 10 30 6 30 6 Z"
      fill="white"
      opacity="0.92"
    />
    {/* Wave 1 */}
    <path
      d="M13 38 Q18 34.5 24 36 Q27 37 30 38.5 Q33 37 36 36 Q42 34.5 47 38"
      stroke="#85c9e8"
      strokeWidth="2.8"
      strokeLinecap="round"
      fill="none"
    />
    {/* Wave 2 */}
    <path
      d="M10 46 Q18 42.5 24 44 Q27 45 30 46.5 Q33 45 36 44 Q42 42.5 50 46"
      stroke="#6ab8d4"
      strokeWidth="2.2"
      strokeLinecap="round"
      fill="none"
      opacity="0.7"
    />
    {/* Wave 3 */}
    <path
      d="M8 53 Q18 49.5 24 51 Q27 52 30 53.5 Q33 52 36 51 Q42 49.5 52 53"
      stroke="#4fa5c0"
      strokeWidth="1.6"
      strokeLinecap="round"
      fill="none"
      opacity="0.45"
    />
  </svg>
);

/* ─────────────────────────────────────────
   Feature list item
───────────────────────────────────────── */
const Feature = ({ text }) => (
  <div className="flex items-center gap-3">
    <div className="w-4 h-px bg-gradient-to-r from-[#31a3d5] to-transparent flex-shrink-0" />
    <span className="text-[11px] text-white/40 leading-relaxed">{text}</span>
  </div>
);

/* ─────────────────────────────────────────
   Role badge
───────────────────────────────────────── */
const RoleBadge = ({ label }) => (
  <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
    {label}
  </span>
);

/* ═══════════════════════════════════════
   Main Login Component
═══════════════════════════════════════ */
function Login() {
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });
  const [remember, setRemember] = useState(false);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (err) setErr(null);
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      setErr("All fields are required.");
      return;
    }

    setLoading(true);
    setErr(null);

    try {
      const res = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setErr("Server did not return valid JSON.");
        return;
      }

      if (!res.ok) {
        setErr(data.message || "Something went wrong.");
        return;
      }

      localStorage.setItem("token", data.token);

    if (data.role === "super_admin" || data.role === "admin") navigate("/projectsdashboard");
    else if (data.role === "enseignant") navigate("/supervisor/homepage");
    else if (data.role === "entreprise") navigate("/external_supervisor/ChatPage");
    else if (data.role === "etudiant") navigate("/student/firstpage");
    } catch {
      setErr("Server error, please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-gradient-to-r from-[#162A55] to-[#31A3D5] min-h-screen w-full flex items-center justify-center p-4 md:p-6 relative overflow-hidden"
    >
      {/* ── Card ── */}
      <div
        className="relative z-10 w-full max-w-[860px] rounded-[22px] overflow-hidden flex flex-col md:flex-row"
        style={{ border: "1px solid rgba(49,163,213,0.14)" }}
      >

        {/* ════════════════════════
            LEFT PANEL
        ════════════════════════ */}
        <div
          className="hidden md:flex md:flex-col md:justify-center md:items-center w-5/12 p-10 relative overflow-hidden gap-6"
          style={{
            background:
              "linear-gradient(160deg, #31A3D5 0%, #162A55 100%)",
            borderRight: "1px solid rgba(49,163,213,0.10)",
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
            style={{
              border: "1px solid rgba(49,163,213,0.08)",
              background:
                "radial-gradient(circle, rgba(49,163,213,0.07) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ border: "1px solid rgba(49,163,213,0.06)" }}
          />

          {/* Logo */}
          <div className="relative z-10 flex flex-col items-center ">
  <img src={logo} className="w-55 h-50 object-contain" alt="PFEFLOW logo" />
</div>

          {/* Hero text */}
          <div className="relative z-10 text-center">
            <h2 className="text-[23px] font-extrabold text-white leading-snug mb-2">
              Your{" "}
              <span className="text-white/90">PFE journey</span>,<br />
              one platform.
            </h2>
            <p className="text-[14px] text-white/70 leading-[1.75] max-w-[195px]">
              Smart academic project management for ESI Sidi Bel Abbès.
            </p>

            {/* Role pills */}

          </div>

          {/* Feature list + socials */}
          <div className="relative z-10">
            

            {/* Social links */}
            <div className="flex items-center gap-2">
              {[
                {
                  href: "https://www.facebook.com/esisba.edu",
                  label: "Facebook",
                  icon: "f",
                },
                {
                  href: "https://www.linkedin.com/school/esisba/",
                  label: "LinkedIn",
                  icon: "in",
                },
                {
                  href: "https://elearn.esi-sba.dz/",
                  label: "eLearning",
                  icon: "e",
                },
              ].map(({ href, label, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  title={label}
                  aria-label={label}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-bold text-white/65 transition-all duration-200 hover:text-[#31a3d5]"
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {icon}
                </a>
              ))}
              <div
                className="w-px h-4 mx-1"
                style={{ background: "rgba(255,255,255,0.08)" }}
              />
              <span className="text-[10px] text-white/60">
                ESI-SBA · Sidi Bel Abbès
              </span>
            </div>
          </div>
        </div>

        {/* ════════════════════════
            RIGHT PANEL
        ════════════════════════ */}
        <div
          className="flex-1 flex flex-col justify-center px-8 md:px-10 py-12"
          style={{ background: "#ffffff" }}
        >
         

          <h1 className="text-[19px] font-extrabold text-slate-800 mb-1">
            Welcome back
          </h1>
          <p className="text-[12px] text-slate-400 mb-7 leading-relaxed">
            Sign in with your institutional credentials
          </p>

          {/* Error box */}
          {err && (
            <div
              className="flex items-start gap-2 text-[11.5px] text-red-300 rounded-[10px] px-3 py-[9px] mb-4"
              style={{
                background: "rgba(252,165,165,0.07)",
                border: "1px solid rgba(252,165,165,0.18)",
              }}
            >
              <span className="mt-px">⚠</span>
              <span>{err}</span>
            </div>
          )}

          <form onSubmit={handleLogin} noValidate>
            {/* Email */}
            <div className="mb-[13px]">
              <label className="block text-[10px] font-semibold text-slate-400 tracking-[0.09em] uppercase mb-[6px]">
                Institutional email
              </label>
              <div
                className="flex items-center rounded-[11px] px-[13px] transition-all duration-200 focus-within:border-[rgba(49,163,213,0.45)] focus-within:bg-[rgba(49,163,213,0.04)]"
                style={{
                  background: "rgba(0,0,0,0.03)",
                  border: "1px solid rgba(0,0,0,0.10)",
                }}
              >
                <Mail className="w-[14px] h-[14px] text-slate-400 mr-[10px] flex-shrink-0" />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="firstname.lastname@esi-sba.dz"
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-slate-700 py-[11px] placeholder-slate-300"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="mb-[3px]">
              <label className="block text-[10px] font-semibold text-slate-400 tracking-[0.09em] uppercase mb-[6px]">
                Password
              </label>
              <div
                className="flex items-center rounded-[11px] px-[13px] transition-all duration-200 focus-within:border-[rgba(49,163,213,0.45)] focus-within:bg-[rgba(49,163,213,0.04)]"
                style={{
                  background: "rgba(0,0,0,0.03)",
                  border: "1px solid rgba(0,0,0,0.10)",
                }}
              >
                <LockKeyhole className="w-[14px] h-[14px] text-slate-400 mr-[10px] flex-shrink-0" />
                <input
                  type={showPw ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••••"
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-slate-700 py-[11px] placeholder-slate-300"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="text-slate-400 hover:text-slate-600 transition-colors duration-200 ml-2"
                  aria-label="Toggle password visibility"
                >
                  {showPw ? (
                    <Eye className="w-[14px] h-[14px]" />
                  ) : (
                    <EyeOff className="w-[14px] h-[14px]" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between mt-3 mb-5">
              <Link
                to="/resetpw"
                className="text-[11.5px] text-[#31a3d5] font-medium hover:text-[#6dd0f0] transition-colors duration-200"
              >
                Forgot password?
              </Link>
            </div>

            {/* Sign-in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-[11px] text-[13px] font-bold text-white uppercase tracking-[0.08em] transition-all duration-200 hover:opacity-86 hover:-translate-y-px active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
              style={{
                background:
                  "linear-gradient(135deg, #162a55 0%, #1c5585 45%, #31a3d5 100%)",
                border: "1px solid rgba(49,163,213,0.25)",
              }}
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(0,0,0,0.08)" }}
            />
            <span className="text-[10px] text-slate-300 whitespace-nowrap">
              Access by role
            </span>
            <div
              className="flex-1 h-px"
              style={{ background: "rgba(0,0,0,0.08)" }}
            />
          </div>

          {/* Role badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Student", "Teacher", "Admin", "Jury", "Super admin"].map((r) => (
              <RoleBadge key={r} label={r} />
            ))}
          </div>

      
         
        </div>
      </div>
    </div>
  );
}

export default Login;