import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../layout/Sidebar.jsx";
import { ProfileDropdown } from '../supervisor/HomePage';
import useCurrentUser from '../../hooks/useCurrentUser';
import { Clock, ArrowLeft, Sparkles } from "lucide-react";

const ComingSoon = ({ 
  title = "Feature Coming Soon", 
  description = "We're working hard to bring you something amazing. Stay tuned!" 
}) => {
  const navigate = useNavigate();

  const { currentUser } = useCurrentUser();

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.clear();
    navigate("/login");
  };

  const handleChangePassword = (formData) => {
    console.log("🔐 Changement de mot de passe:", formData);
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">
                We're working on something great
              </p>
              <h1 className="text-2xl font-bold text-[#1e3a5f]">
                Coming Soon
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
        <main className="flex-1 flex items-center justify-center relative overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            {/* Floating Circles */}
            <div className="absolute top-20 left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob" />
            <div className="absolute top-40 right-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000" />
            <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000" />
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20" />
          </div>

          {/* Main Content Card */}
          <div className="relative z-10 text-center px-8 max-w-2xl mx-auto">
            {/* Animated Icon */}
            <div className="mb-8 relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full blur-lg opacity-50 animate-pulse" />
              <div className="relative w-32 h-32 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce-slow">
                <Clock className="w-16 h-16 text-white" />
              </div>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="w-8 h-8 text-yellow-400 animate-sparkle" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-5xl font-bold text-[#1e3a5f] mb-4 animate-fade-in">
              Coming Soon
            </h2>

            {/* Subtitle */}
            <p className="text-2xl text-gray-600 mb-2 animate-fade-in animation-delay-500">
              {title}
            </p>
            <p className="text-gray-500 mb-8 animate-fade-in animation-delay-700">
              {description}
            </p>

            {/* Animated Dots */}
            <div className="flex justify-center gap-2 mb-8">
              <div className="w-3 h-3 bg-purple-600 rounded-full animate-bounce" />
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce animation-delay-200" />
              <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce animation-delay-400" />
            </div>

            {/* Progress Bar */}
            <div className="mb-8 animate-fade-in animation-delay-1000">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden max-w-md mx-auto">
                <div className="h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-progress" />
              </div>
              <p className="text-sm text-gray-500 mt-2">We're working on it...</p>
            </div>

            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#1e3a5f] text-white rounded-lg hover:bg-[#152a4d] transition-all font-medium group animate-fade-in animation-delay-1000"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>

            {/* Feature Cards Preview */}
            <div className="mt-12 grid grid-cols-3 gap-4 animate-fade-in animation-delay-1500">
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 opacity-60">
                <div className="w-10 h-10 bg-purple-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <div className="w-5 h-5 bg-purple-300 rounded animate-pulse" />
                </div>
                <p className="text-xs text-gray-500">Feature 1</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 opacity-60">
                <div className="w-10 h-10 bg-blue-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <div className="w-5 h-5 bg-blue-300 rounded animate-pulse" />
                </div>
                <p className="text-xs text-gray-500">Feature 2</p>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 opacity-60">
                <div className="w-10 h-10 bg-pink-100 rounded-lg mx-auto mb-2 flex items-center justify-center">
                  <div className="w-5 h-5 bg-pink-300 rounded animate-pulse" />
                </div>
                <p className="text-xs text-gray-500">Feature 3</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Custom CSS for animations */}
      <style>{`
        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }
        
        @keyframes sparkle {
          0%, 100% {
            opacity: 1;
            transform: scale(1) rotate(0deg);
          }
          50% {
            opacity: 0.5;
            transform: scale(1.2) rotate(180deg);
          }
        }
        
        @keyframes bounce-slow {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes progress {
          0% {
            width: 0%;
          }
          100% {
            width: 100%;
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animate-sparkle {
          animation: sparkle 2s infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 3s infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out forwards;
          opacity: 0;
        }
        
        .animate-progress {
          animation: progress 2s ease-out infinite;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        
        .animation-delay-500 {
          animation-delay: 0.5s;
        }
        
        .animation-delay-700 {
          animation-delay: 0.7s;
        }
        
        .animation-delay-1000 {
          animation-delay: 1s;
        }
        
        .animation-delay-1500 {
          animation-delay: 1.5s;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default ComingSoon;