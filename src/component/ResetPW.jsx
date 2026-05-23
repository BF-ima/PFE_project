import React, { useState } from "react";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.jpg";

function ResetPW() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (err) setErr(null);
    if (success) setSuccess(null);
  };

  const handleResetPw = async (e) => {
    e.preventDefault();

    if (err) setErr(null);
    if (success) setSuccess(null);

    if (!email) {
      setErr("Email field is required");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data;
      try {
        data = await res.json();
      } catch {
        setErr("Server did not return valid JSON");
        return;
      }

      if (!res.ok) {
        setErr(data.message || "Something went wrong");
        return;
      }

      setSuccess("Reset link sent! Please check your email.");
      setEmail("");
    } catch (err) {
      console.error(err);
      setErr("Server error, try again later");
    }
  };

  return (
    <div className="bg-gradient-to-r from-[#162A55] to-[#31A3D5] min-h-screen w-full flex items-center justify-center p-4 md:p-6 relative overflow-hidden">
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
            background: "linear-gradient(160deg, #31A3D5 0%, #162A55 100%)",
            borderRight: "1px solid rgba(49,163,213,0.10)",
          }}
        >
          {/* Decorative circles */}
          <div
            className="absolute -top-16 -right-16 w-56 h-56 rounded-full pointer-events-none"
            style={{
              border: "1px solid rgba(49,163,213,0.08)",
              background: "radial-gradient(circle, rgba(49,163,213,0.07) 0%, transparent 70%)",
            }}
          />
          <div
            className="absolute -bottom-12 -left-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ border: "1px solid rgba(49,163,213,0.06)" }}
          />

          {/* Logo */}
          <div className="relative z-10 flex flex-col items-center">
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
          </div>

          {/* Social links */}
          <div className="relative z-10">
            <div className="flex items-center gap-2">
              {[
                { href: "https://www.facebook.com/esisba.edu", label: "Facebook", icon: "f" },
                { href: "https://www.linkedin.com/school/esisba/", label: "LinkedIn", icon: "in" },
                { href: "https://elearn.esi-sba.dz/", label: "eLearning", icon: "e" },
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
              <div className="w-px h-4 mx-1" style={{ background: "rgba(255,255,255,0.08)" }} />
              <span className="text-[10px] text-white/60">ESI-SBA · Sidi Bel Abbès</span>
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
            Reset your password
          </h1>
          <p className="text-[12px] text-slate-400 mb-7 leading-relaxed">
            Enter your institutional email to receive a reset link
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

          {/* Success box */}
          {success && (
            <div
              className="flex items-start gap-2 text-[11.5px] text-emerald-400 rounded-[10px] px-3 py-[9px] mb-4"
              style={{
                background: "rgba(52,211,153,0.07)",
                border: "1px solid rgba(52,211,153,0.18)",
              }}
            >
              <span className="mt-px">✓</span>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleResetPw} noValidate>
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
                  value={email}
                  onChange={handleChange}
                  placeholder="firstname.lastname@esi-sba.dz"
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-slate-700 py-[11px] placeholder-slate-300"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Back to login */}
            <div className="flex items-center justify-between mt-3 mb-5">
              <Link
                to="/login"
                className="text-[11.5px] text-[#31a3d5] font-medium hover:text-[#6dd0f0] transition-colors duration-200"
              >
                ← Back to sign in
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-3 rounded-[11px] text-[13px] font-bold text-white uppercase tracking-[0.08em] transition-all duration-200 hover:opacity-86 hover:-translate-y-px active:scale-[0.99]"
              style={{
                background: "linear-gradient(135deg, #162a55 0%, #1c5585 45%, #31a3d5 100%)",
                border: "1px solid rgba(49,163,213,0.25)",
              }}
            >
              Send reset link
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />
            <span className="text-[10px] text-slate-300 whitespace-nowrap">Access by role</span>
            <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.08)" }} />
          </div>

          {/* Role badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {["Student", "Teacher", "Admin", "Jury", "Super admin"].map((r) => (
              <span
                key={r}
                className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-3 py-1"
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResetPW;
