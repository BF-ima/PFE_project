import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import StudentSidebar from '../../layout/StudentSidebar';
import { Facebook, Linkedin, Users, UserPlus, X, Crown, Calendar, Mail, TriangleAlert } from 'lucide-react';
import { ProfileDropdown } from './FirstPage';
import CreateTeamModal from '../../layout/CreateTeamModal';
import AddMemberModal from '../../layout/AddMemberModal';
import DisbandConfirmModal from '../../layout/DisbandConfirmModal';
import DeleteMemberConfirmModal from '../../layout/DeleteMemberConfirmModal';

// ==================== EMPTY STATE ====================
const EmptyTeamState = ({ onCreateTeam }) => (
  <div className="flex flex-col items-center justify-start pt-8 px-4">
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 max-w-2xl w-full">
      <div className="bg-linear-to-r from-[#18335E] to-[#2D8FBF] rounded-full p-7 mb-6 w-fit mx-auto shadow-md">
        <Users size={52} className="text-white" />
      </div>
      <h2 className="text-2xl font-bold text-[#1e3a5f] mb-3 text-center">
        Create your team
      </h2>
      <p className="text-gray-500 text-center mb-8">
        Start by creating your project team. You can then add members and select your favorite projects.
      </p>
      <div className="flex justify-center">
        <button
          onClick={onCreateTeam}
          className="px-9 py-3 bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-xl hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-md font-medium"
        >
          Create your team
        </button>
      </div>
    </div>
  </div>
);

// ==================== TEAM EXISTS STATE ====================
const TeamExistsState = ({ team, onSendInvitation, onRemoveMember, onDisbandTeam, isLeader }) => {
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showDisbandModal, setShowDisbandModal] = useState(false);
  const [showDeleteMemberModal, setShowDeleteMemberModal] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);

  const leader = team?.members?.find(member => member.isLeader === true);
  const memberCount = team?.members?.length || 0;
  const maxMembers = team?.maxMembers || 2;

  const getAvatarLetter = (name) => {
    if (!name) return '?';
    return name.charAt(0).toUpperCase();
  };

  const checkLeaderPermission = () => {
    if (!isLeader) {
      toast.error('Only the team leader can perform this action');
      return false;
    }
    return true;
  };

  const handleAddMemberClick = () => {
    if (checkLeaderPermission()) {
      setShowAddMemberModal(true);
    }
  };

  const handleDisbandClick = () => {
    if (checkLeaderPermission()) {
      setShowDisbandModal(true);
    }
  };

  const handleDeleteClick = (member) => {
    if (checkLeaderPermission()) {
      setMemberToDelete(member);
      setShowDeleteMemberModal(true);
    }
  };

  const handleSendInvitation = (newMember) => {
    if (memberCount >= maxMembers) {
      toast.error(`Maximum ${maxMembers} members reached`);
      return;
    }
    onSendInvitation(newMember);
  };

  const handleRemoveMember = (memberId) => {
    onRemoveMember(memberId);
    setShowDeleteMemberModal(false);
    setMemberToDelete(null);
  };

  const confirmDisband = () => {
    onDisbandTeam();
    setShowDisbandModal(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not created yet';
    return dateString;
  };

  return (
    <div className="p-6 pt-0">
      <div className="mb-3">
        <h2 className="text-xl font-semibold text-[#1e3a5f] inline-block border-b-2 border-[#2D8FBF] pb-1">
          Team management :
        </h2>
      </div>

      {/* Team Info Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-[#1e3a5f]">Team number</span>
          <button
            onClick={handleDisbandClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            <X size={14} />
            Disband the team
          </button>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm text-gray-600">Created on: {formatDate(team?.createdAt)}</span>
          </div>
          
          <div className="grid grid-cols-2 gap-3 max-w-md">
            <div className="bg-gray-100 rounded-lg p-2">
              <div className="text-xs text-gray-500 mb-1">Leader</div>
              <div className="flex items-center gap-1">
                <Crown size={14} className="text-yellow-500" />
                <span className="text-gray-900 text-sm font-medium truncate">{leader?.name || team?.members?.[0]?.name || '-'}</span>
              </div>
            </div>
            
            <div className="bg-gray-100 rounded-lg p-2">
              <div className="text-xs text-gray-500 mb-1">Members</div>
              <div className="flex items-center gap-1">
                <span className="text-gray-900 text-sm font-medium">{memberCount}</span>
                <span className="text-gray-500 text-sm">/ {maxMembers}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-[#1e3a5f]">Team members</h3>
          <button
            onClick={handleAddMemberClick}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-colors text-sm"
          >
            <UserPlus size={14} />
            Add members
          </button>
        </div>
        
        <div className="space-y-3">
          {team?.members?.map((member) => (
            <div key={member.id} className="bg-gray-100 rounded-lg p-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-linear-to-r from-[#18335E] to-[#2D8FBF] flex items-center justify-center text-white font-semibold shadow-sm shrink-0">
                  {member.photo ? (
                    <img src={member.photo} alt={member.name} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    getAvatarLetter(member.name)
                  )}
                </div>
                
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-gray-900 text-sm font-medium">{member.name}</span>
                    {member.isLeader ? (
                      <span className="px-1.5 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full flex items-center gap-1">
                        <Crown size={10} /> Leader
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                        Member
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-400" />
                    <span className="text-gray-600 text-sm break-all">{member.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400 text-sm font-medium">#</span>
                    <span className="text-gray-600 text-sm">{member.studentId || 'Not provided'}</span>
                  </div>
                </div>
                {!member.isLeader && (
                  <button
                    onClick={() => handleDeleteClick(member)}
                    className="text-gray-500 hover:text-gray-700 p-1 transition-colors shrink-0"
                    title="Remove member"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>
            </div>
          ))}
          
          {team?.members?.length === 0 && (
            <div className="text-center py-4 text-gray-400 text-sm bg-gray-100 rounded-lg">
              No members yet. Click "Add members" to add team members.
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AddMemberModal
        isOpen={showAddMemberModal}
        onClose={() => setShowAddMemberModal(false)}
        onSendInvitation={handleSendInvitation}
        maxMembers={maxMembers}
        currentMemberCount={memberCount}
      />

      <DisbandConfirmModal
        isOpen={showDisbandModal}
        onClose={() => setShowDisbandModal(false)}
        onConfirm={confirmDisband}
      />

      <DeleteMemberConfirmModal
        isOpen={showDeleteMemberModal}
        onClose={() => setShowDeleteMemberModal(false)}
        onConfirm={() => handleRemoveMember(memberToDelete?.id)}
      />
    </div>
  );
};

// ==================== MAIN PAGE ====================
function TeamManagementPage() {
  const navigate = useNavigate();
  
  const [hasTeam, setHasTeam] = useState(false);
  const [team, setTeam] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [currentUser] = useState({
    id: 1,
    firstName: "Student",
    lastName: "",
    email: "student@esi-sba.dz",
    role: "Student",
  });

  // Listen for accepted invitations from Notifications via localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const accepted = JSON.parse(localStorage.getItem("acceptedInvitations") || "[]");
      if (accepted.length === 0) return;

      const pending = JSON.parse(localStorage.getItem("pendingInvitations") || "[]");
      const updatedPending = pending.filter(
        inv => !accepted.some(acc => acc.email === inv.email)
      );
      localStorage.setItem("pendingInvitations", JSON.stringify(updatedPending));

      setTeam(prev => {
        if (!prev) return prev;
        let updated = { ...prev };
        let newMembers = [...prev.members];
        let anyAdded = false;

        accepted.forEach((inv) => {
          // inv contains: id, name, email, senderName, senderEmail, status, teamId
          // name and email = receiver (invited person)
          const alreadyExists = newMembers.some(m => m.email === inv.email);
          if (!alreadyExists && newMembers.length < prev.maxMembers) {
            newMembers.push({
              id: inv.id,
              name: inv.name,     // Receiver name
              email: inv.email,   // Receiver email
              studentId: "",
              isLeader: false,
            });
            anyAdded = true;
          }
        });

        if (anyAdded) {
          updated.members = newMembers;
          toast.success(`New member has joined the team!`);
        }

        return updated;
      });

      localStorage.removeItem("acceptedInvitations");
    };

    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();

    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleCreateTeam = () => {
    setShowCreateModal(true);
  };

  const confirmCreateTeam = (leaderInfo) => {
    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
    
    const newTeam = {
      id: Date.now(),
      teamNumber: "",
      maxMembers: 2,
      createdAt: formattedDate,
      members: [
        {
          id: Date.now(),
          name: leaderInfo.fullName,
          email: leaderInfo.email,
          studentId: leaderInfo.studentId,
          isLeader: true
        }
      ]
    };
    setTeam(newTeam);
    setHasTeam(true);
    toast.success('Team created successfully!');
  };

  // Send invitation: prevent duplicate invitations
  // senderName / senderEmail = Team Leader (who sends the invitation)
  const handleSendInvitation = (newMember) => {
    if (!team) return;
    
    const alreadyMember = team.members.some(m => m.email === newMember.email);
    if (alreadyMember) {
      toast.error(`${newMember.email} is already a team member`);
      return;
    }
    
    const existingInvitations = JSON.parse(localStorage.getItem("pendingInvitations") || "[]");
    const alreadyInvited = existingInvitations.some(inv => inv.email === newMember.email);
    if (alreadyInvited) {
      toast.error(`An invitation has already been sent to ${newMember.email}`);
      return;
    }
    
    if (team.members.length >= team.maxMembers) {
      toast.error(`Maximum ${team.maxMembers} members reached`);
      return;
    }

    const leader = team.members.find(m => m.isLeader === true);
    const senderName = leader?.name || team.members[0]?.name || "Team Leader";
    const senderEmail = leader?.email || currentUser.email;

    const invitation = {
      id: Date.now(),
      name: newMember.name,           // Receiver name (invited person)
      email: newMember.email,         // Receiver email (invited person)
      senderName: senderName,         // Sender name (Team Leader)
      senderEmail: senderEmail,       // Sender email (Team Leader)
      status: "pending",
      timeAgo: "Just now",
      teamId: String(team.id),
      teamName: `Team of ${leader?.name || "Leader"}`,
    };

    const existing = JSON.parse(localStorage.getItem("pendingInvitations") || "[]");
    existing.push(invitation);
    localStorage.setItem("pendingInvitations", JSON.stringify(existing));

    toast.success(`Invitation sent to ${newMember.name}!`);
  };

  const handleRemoveMember = (memberId) => {
    if (!team) return;
    setTeam({
      ...team,
      members: team.members.filter(member => member.id !== memberId)
    });
  };

  const handleDisbandTeam = () => {
    localStorage.removeItem("pendingInvitations");
    localStorage.removeItem("acceptedInvitations");
    setHasTeam(false);
    setTeam(null);
  };

  const isLeader = team?.members?.some(
    member => member.email === currentUser.email && member.isLeader
  ) || false;

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.clear();
    navigate('/login');
  };

  const handleChangePassword = (formData) => {
    console.log('🔐 Password change:', formData);
  };

  return (
    <div className="flex h-screen bg-[#f5f6f8] overflow-hidden">
      <Toaster position="top-center" />
      <StudentSidebar />
      <div className="flex-1 flex flex-col ml-16 overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-2 sm:py-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs sm:text-sm mb-0">Manage and track your projects</p>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1e3a5f]">Project Dashboard</h1>
            </div>
            
            <div className="flex items-center gap-1 sm:gap-2">
              <a 
                href="https://www.facebook.com/esisba.edu?mibextid=rS40aB7S9Ucbxw6v" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="Facebook"
              >
                <Facebook size={14} className="sm:w-5 sm:h-5" />
              </a>
              
              <a 
                href="https://www.linkedin.com/in/https%3A%2F%2Fwww.linkedin.com%2Fschool%2Fesisba" 
                target="_blank" 
                rel="noopener noreferrer"
                className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-all duration-300 shadow-sm"
                title="LinkedIn"
              >
                <Linkedin size={14} className="sm:w-5 sm:h-5" />
              </a>

              <ProfileDropdown 
                user={currentUser}
                onLogout={handleLogout}
                onChangePassword={handleChangePassword}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
            {!hasTeam ? (
              <EmptyTeamState onCreateTeam={handleCreateTeam} />
            ) : (
              <TeamExistsState 
                team={team}
                onSendInvitation={handleSendInvitation}
                onRemoveMember={handleRemoveMember}
                onDisbandTeam={handleDisbandTeam}
                isLeader={isLeader}
              />
            )}
          </div>
        </main>
      </div>

      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateTeam={confirmCreateTeam}
        currentUser={currentUser}
      />
    </div>
  );
}

export default TeamManagementPage;