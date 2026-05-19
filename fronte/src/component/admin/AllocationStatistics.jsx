import React from "react";
import { TrendingUp, Users, Award, CheckCircle, XCircle, AlertCircle } from "lucide-react";

const AllocationStatistics = ({ teams, projects = [], statistics }) => {

  const assignedCount     = statistics?.assigned_teams    ?? teams.filter(t => t.status === "assigned").length;
  const unassignedCount   = statistics?.unassigned_teams  ?? teams.filter(t => t.status === "unassigned").length;
  const totalCount        = statistics?.total_teams       ?? teams.length;
  const allocationRate    = statistics?.allocation_rate   ?? 0;
  const satisfactionRate  = statistics?.satisfaction_rate ?? 0;
  const firstChoiceCount  = statistics?.first_choice      ?? 0;
  const secondChoiceCount = statistics?.second_choice     ?? 0;
  const thirdChoiceCount  = statistics?.third_choice_plus ?? 0;
  const projectDistribution = statistics?.project_distribution ?? [];
  return (
    <div className="space-y-6">
      {/* Stats Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Teams */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Total Teams</p>
              <p className="text-3xl font-bold text-[#1e3a5f]">{totalCount}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Assigned */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Assigned</p>
              <p className="text-3xl font-bold text-green-600">{assignedCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Unassigned */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-1">Unassigned</p>
              <p className="text-3xl font-bold text-red-600">{unassignedCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Allocation Rate & Satisfaction Rate */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Allocation Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1e3a5f]">{allocationRate}%</p>
                <p className="text-sm text-gray-600">Allocation rate</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${allocationRate}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {assignedCount} / {totalCount} teams assigned
          </p>
        </div>

        {/* Satisfaction Rate */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <Award size={24} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#1e3a5f]">{satisfactionRate}%</p>
                <p className="text-sm text-gray-600">Satisfaction rate</p>
              </div>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all"
              style={{ width: `${satisfactionRate}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            1st choice obtained ({firstChoiceCount} teams)
          </p>
        </div>
      </div>

      {/* Satisfaction Rate of Preferences */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
          <TrendingUp size={20} />
          Satisfaction rate of Preferences
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <div>
              <p className="font-semibold text-gray-800">#1 First choice</p>
              <p className="text-sm text-gray-600">Maximum satisfaction</p>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {totalCount > 0 ? Math.round((firstChoiceCount / totalCount) * 100) : 0}%
            </p>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div>
              <p className="font-semibold text-gray-800">#2 Second choice</p>
              <p className="text-sm text-gray-600">High satisfaction</p>
            </div>
            <p className="text-2xl font-bold text-gray-600">
              {totalCount > 0 ? Math.round((secondChoiceCount / totalCount) * 100) : 0}%
            </p>
          </div>
          <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div>
              <p className="font-semibold text-gray-800">#3+ Third choice or lower</p>
              <p className="text-sm text-gray-600">Moderate satisfaction</p>
            </div>
            <p className="text-2xl font-bold text-orange-600">
              {totalCount > 0 ? Math.round((thirdChoiceCount / totalCount) * 100) : 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Project Distribution Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-4 flex items-center gap-2">
          <Users size={20} />
          Project Distribution
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
  <tr>
    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Project</th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Teams Assigned</th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Max Capacity</th>
    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
  </tr>
</thead>
            <tbody className="divide-y divide-gray-100">
  {projectDistribution.length > 0 ? (
    projectDistribution.map((p) => (
      <tr key={p.project_id}>
        <td className="px-6 py-4 text-sm font-medium text-gray-800">{p.project_title}</td>
        <td className="px-6 py-4 text-sm text-gray-600">{p.assigned_teams}</td>
        <td className="px-6 py-4 text-sm text-gray-600">{p.max_students}</td>
        <td className="px-6 py-4">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            p.assigned_teams >= p.max_students
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}>
            {p.assigned_teams >= p.max_students ? "Full" : "Available"}
          </span>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="4" className="px-6 py-8 text-center text-gray-400">
        No data available
      </td>
    </tr>
  )}
</tbody>
          </table>
        </div>
      </div>

      {/* Allocation Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-[#1e3a5f] mb-3 flex items-center gap-2">
          <Award size={20} />
          Allocation Summary
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• {totalCount} total teams</li>
          <li>• {assignedCount} teams assigned ({allocationRate}%)</li>
          <li>• {unassignedCount} unassigned teams</li>
          <li>• {satisfactionRate}% satisfaction rate</li>
          <li>• {firstChoiceCount} teams got their first choice</li>
        </ul>
      </div>
    </div>
  );
};

export default AllocationStatistics;