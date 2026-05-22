import React from 'react';
import { UserPlus, Check, X, Clock as ClockIcon, CheckCircle, XCircle } from 'lucide-react';

const InvitationsPanel = ({
  invitations,
  pendingCount,
  inviteFilter,
  setInviteFilter,
  onAcceptInvite,
  onDeclineInvite
}) => {
  const filteredInvitations = invitations.filter((inv) => {
    if (inviteFilter === "all") return true;
    return inv.status === inviteFilter;
  });

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  // Status values now match DB: PENDING, ACCEPTED, REJECTED
  const getInviteStatusStyle = (status) => {
    switch (status) {
      case "PENDING":
        return { bg: "bg-yellow-100", text: "text-yellow-700", icon: ClockIcon,    cardBg: "#F5F0FF" };
      case "ACCEPTED":
        return { bg: "bg-green-100",  text: "text-green-700",  icon: CheckCircle,  cardBg: "#f0fdf4" };
      case "REJECTED":
        return { bg: "bg-gray-100",   text: "text-gray-700",   icon: XCircle,      cardBg: "#f3f4f6" };
      default:
        return { bg: "bg-blue-100",   text: "text-blue-600",   icon: ClockIcon,    cardBg: "#FFFFFF" };
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: "#EEC9FE" }}>
            <UserPlus size={20} className="text-purple-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#1e3a5f]">Team invitations</h2>
            <p className="text-sm text-gray-500">{pendingCount} pending invitation{pendingCount !== 1 ? 's' : ''}</p>
          </div>
        </div>
      </div>

      {/* Filters — uppercase to match DB */}
      <div className="px-4 sm:px-6 py-3 border-b border-gray-200 flex flex-wrap items-center gap-2">
        {[
          { value: "all",      label: "All"      },
          { value: "PENDING",  label: "Pending"  },
          { value: "ACCEPTED", label: "Accepted" },
          { value: "REJECTED", label: "Declined" },
        ].map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setInviteFilter(value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              inviteFilter === value ? "bg-[#1e3a5f] text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {filteredInvitations.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            <UserPlus size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No invitations</p>
          </div>
        ) : (
          <div className="p-4 flex flex-col gap-3">
            {filteredInvitations.map((invitation) => {
              const statusStyle = getInviteStatusStyle(invitation.status);
              const StatusIcon  = statusStyle.icon;

              return (
                <div
                  key={invitation.id}
                  className="rounded-xl p-4"
                  style={{ backgroundColor: statusStyle.cardBg }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      {/* sender_name from DB */}
                      <h3 className="font-semibold text-gray-800">
                        {invitation.sender_name || "Team Leader"}
                      </h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                        {invitation.status.charAt(0) + invitation.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <ClockIcon size={13} />
                      {/* joined_at from DB */}
                      <span>{formatDate(invitation.joined_at)}</span>
                    </div>
                  </div>

                  {/* sender_email from DB */}
                  <p className="text-xs text-gray-500 mb-1">{invitation.sender_email || "No email"}</p>
                  <p className="text-xs text-gray-500 mb-3">
                    <span className="font-medium text-gray-600">Team ID : </span>
                    {invitation.team_id}
                  </p>

                  {invitation.status === "PENDING" && (
                    <div className="flex gap-3 mt-2">
                      <button
                        onClick={() => onAcceptInvite(invitation.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg"
                        style={{ backgroundColor: "#54B03B" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#3a8a2a"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#54B03B"}
                      >
                        <Check size={15} /> Accept
                      </button>
                      <button
                        onClick={() => onDeclineInvite(invitation.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-2 text-white rounded-lg text-sm font-medium shadow-md hover:shadow-lg"
                        style={{ backgroundColor: "#787878" }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#5a5a5a"}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#787878"}
                      >
                        <X size={15} /> Decline
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default InvitationsPanel;