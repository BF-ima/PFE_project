import React, { useState } from "react";
import { Mail } from "lucide-react";
import elearn from "../assets/elearn.png";
import logo from "../assets/logo.jpg";

function ResetPW() {
  const [email, setEmail] = useState("");
  const [err, setErr] = useState(null);
  const [success, setSuccess] = useState(null);

  // Clear error as user types
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
        body: JSON.stringify({ email }), // <-- send as object
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

      // Success
      setSuccess("Reset link sent to your email! please verify your email");
      setEmail(""); //clear input


    } catch (err) {
      console.error(err);
      setErr("Server error, try again later");
    }
  };

return (
    <div
      className="bg-linear-to-r from-[#162A55] to-[#31A3D5] min-h-screen min-w-screen flex items-center justify-center p-6"
    >
      
      
          {/* Card */}
      <div className="bg-white rounded-lg flex w-full max-w-3xl shadow-2xl relative">
        {/* Decorative tabs */}
        <div className="hidden lg:block lg:absolute lg:rounded-l-xl lg:shadow-xl z-20 bg-linear-to-r from-[#1b4a72] to-[#1c446d] w-10 h-4 -left-8 top-13" />
        <div className="hidden lg:block lg:absolute lg:rounded-r-xl z-20 bg-linear-to-r from-[#1b4470] to-[#1B3f70] w-8 h-4 top-9" />
        <div className="hidden lg:block lg:absolute lg:rounded-l-xl lg:shadow-xl z-20 bg-linear-to-r from-[#1b4a72] to-[#1D4976] w-20 h-4 -left-14 top-5" />

        <div className="hidden lg:block lg:absolute lg:rounded-2xl w-10 h-4 bg-white -right-6 bottom-13" />
        <div className="hidden lg:block lg:absolute lg:rounded-2xl w-10 h-4 bg-[#2c85ab] -right-5 bottom-9" />
        <div className="hidden lg:block lg:absolute lg:rounded-2xl w-20 h-4 bg-white -right-10 bottom-5" />
        {/* ── LEFT PANEL ── */}
        <div
          className="hidden md:w-5/12 md:flex md:flex-col md:justify-between md:p-10 md:relative md:overflow-hidden md:bg-white md:rounded-lg"
          
        >
          {/* Circle decoration */}
          <div className="absolute -top-16 -left-16 w-80 h-80 rounded-full bg-linear-to-r from-[#162A55] to-[#31A3D5] "/>

            {/* PFE Letters with 3D effect */}
            
              <div className="flex font-display">
                <span
                  className="text-9xl font-black text-white"
                  style={{ 
                    transform: "rotate(-20deg)",
                    textShadow: "3px 5px 10px rgba(0,0,0,0.3)"
                  }}
                >P</span>
                <span
                  className="mt-10 mr-4 text-8xl font-black text-white/95 mb-2"
                  style={{ 
                    transform: "rotate(10deg)",
                    textShadow: "3px 5px 10px rgba(0,0,0,0.3)"
                  }}
                >F</span>
                <span
                  className="text-7xl font-black text-white/90 mb-4"
                  style={{ 
                    transform: "rotate(-14deg)",
                    textShadow: "3px 5px 10px rgba(0,0,0,0.3)"
                  }}
                >E</span>
              </div>
            
          {/* Footer */}
          <div className="relative z-10 mt-28">
            <h3 className="whitespace-nowrap text-gray-500 text-sm mb-1 font-bold">
              Welcome to the PFE management system
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Access your account using your institutional credentials
            </p>
            <div className="flex flex-row space-x-2">
              <img src={logo} className="mt-8 w-10 h-10 rounded-full"/>
              <a href='https://elearn.esi-sba.dz/'><img src={elearn} className="mt-7 w-12 h-12"/></a>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex-1 flex flex-col justify-center px-12 py-14">
          <div className="md:hidden flex mb-6 flex-row space-x-2">
            <img src={logo} className="w-16 h-16 rounded-full" />
            <a href="https://elearn.esi-sba.dz/"><img src={elearn} className="mb-4 w-18 h-18" /></a>
          </div>
          <h2 className="text-xl font-semibold text-slate-800 mb-8 tracking-tight">
            To reset your password submit your email address below
          </h2>
          <form onSubmit={handleResetPw}>
            {err && <p className="text-red-500 mb-2">{err}</p>}
            {success && <p className="text-green-500 mb-2">{success}</p>}

            <div className="relative mb-4">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                <Mail className="w-4 h-4 text-gray-500" />
              </span>
              <input
                type="email"
                placeholder="e-mail"
                value={email}
                onChange={handleChange}
                className="shadow-md w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <button
              className="bg-linear-to-r from-[#162A55] to-[#31A3D5] w-full py-3.5 rounded-xl text-white text-sm font-semibold shadow-lg shadow-blue-400/40 tracking-widest transition-all hover:-translate-y-0.5 active:translate-y-0 active:scale-95 hover:shadow-xl hover:shadow-blue-500"
              type="submit"
            >
              Send reset link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPW;