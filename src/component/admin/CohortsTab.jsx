import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";

const CohortsTab = () => {
  const [cohorts, setCohorts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    year: "",
    startDate: "",
    endDate: "",
    status: "active",
  });
  const [editingId, setEditingId] = useState(null);
  const [openModalId, setOpenModalId] = useState(null);   
  const [newEndDate, setNewEndDate]   = useState("");      

  useEffect(() => {
    fetchCohorts();
  }, []);

  const fetchCohorts = async () => {
    setLoading(true);                                         
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/api/promos", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch");
      const normalized = data.map(p => ({
        _id:          p.id,
        name:         p.name,
        year:         p.year,
        startDate:    p.start_date,
        endDate:      p.end_date,
        studentCount: p.student_count ?? 0,
        // compute status from end_date vs today
        status: new Date(p.end_date) < new Date() ? "closed" : "active",
      }));
      setCohorts(normalized);
    } catch (err) {
      console.error("fetchCohorts error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
    try {
      const url    = editingId
        ? `http://localhost:3000/api/promos/${editingId}`
        : `http://localhost:3000/api/promos`;
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers,
        body: JSON.stringify({
          name:       formData.name,
          year:       formData.year,
          start_date: formData.startDate,
          end_date:   formData.endDate,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to save");
      await fetchCohorts();
      setShowModal(false);
      resetForm();
    } catch (err) {
      console.error("Error saving:", err);
      alert(`❌ ${err.message}`);
    }
  };

  const handleEdit = (cohort) => {
    setFormData({
      name: cohort.name,
      year: cohort.year,
      startDate: cohort.startDate?.split("T")[0] || "",
      endDate: cohort.endDate?.split("T")[0] || "",
      status: cohort.status,
    });
    setEditingId(cohort._id);
    setShowModal(true);
  };

 const handleCloseCohort = async (id) => {
    if (!window.confirm("Are you sure you want to close this cohort?")) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/api/promos/${id}/close`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to close");
      await fetchCohorts();
    } catch (err) {
      console.error("Error closing:", err);
      alert(`❌ ${err.message}`);
    }
  };

  const handleOpenCohort = async () => {
  if (!newEndDate) return alert("Please select a new end date");
  const token = localStorage.getItem("token");
  try {
    const res = await fetch(`http://localhost:3000/api/promos/${openModalId}/open`, {
      method:  "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ end_date: newEndDate }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed to reopen");
    setOpenModalId(null);
    setNewEndDate("");
    await fetchCohorts();
  } catch (err) {
    console.error("Error reopening:", err);
    alert(`❌ ${err.message}`);
  }
};

  const resetForm = () => {
    setFormData({
      name: "",
      year: "",
      startDate: "",
      endDate: "",
      status: "active",
    });
    setEditingId(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: "bg-green-100 text-green-700 border-green-200",
      closed: "bg-red-100 text-red-700 border-red-200",
      upcoming: "bg-blue-100 text-blue-700 border-blue-200",
    };
    const labels = {
      active: "Active",
      closed: "Closed",
      upcoming: "Upcoming",
    };
    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${badges[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const filteredCohorts = cohorts.filter(
    (cohort) =>
      cohort.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(cohort.year ?? "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1e3a5f]"></div>
        <span className="ml-3 text-gray-600">Loading cohorts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
        <p className="text-red-700">Error: {error}</p>
        <button
          onClick={fetchCohorts}
          className="mt-2 text-sm text-red-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Action Bar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1e3a5f]">
            Cohorts List
          </h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search Cohort"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
              />
            </div>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-full text-sm hover:from-[#152a4d] hover:to-[#2575a0] transition-colors"
            >
              <Plus size={16} /> Add a Cohort
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Year
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Start Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  End Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCohorts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    No cohort found
                  </td>
                </tr>
              ) : (
                filteredCohorts.map((cohort) => (
                  <tr key={cohort._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{cohort._id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {cohort.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">{cohort.year}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {new Date(cohort.startDate).toLocaleDateString("en-GB")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {new Date(cohort.endDate).toLocaleDateString("en-GB")}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(cohort.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {cohort.studentCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(cohort)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        {cohort.status === "active" && (
                          <button
                            onClick={() => handleCloseCohort(cohort._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
                          >
                            Close
                          </button>
                        )}
                        {cohort.status === "closed" && (
  <button
    onClick={() => { setOpenModalId(cohort._id); setNewEndDate(""); }}
    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors text-sm font-medium"
  >
    Open
  </button>
)}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {openModalId && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl w-full max-w-sm">
      <div className="bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
        <h3 className="text-lg font-semibold">Reopen Cohort</h3>
        <button onClick={() => setOpenModalId(null)} className="text-white hover:text-gray-200">×</button>
      </div>
      <div className="p-6 space-y-4">
        <p className="text-sm text-gray-600">Set a new end date to reopen this cohort:</p>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New End Date *</label>
          <input
            type="date"
            value={newEndDate}
            onChange={(e) => setNewEndDate(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
          />
        </div>
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => setOpenModalId(null)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleOpenCohort}
            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600"
          >
            Reopen
          </button>
        </div>
      </div>
    </div>
  </div>
)}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md">
            <div className="bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-lg font-semibold">
                {editingId ? "Edit Cohort" : "Add a Cohort"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-white hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Engineering 2025-2026"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: 2025-2026"
                  value={formData.year}
                  onChange={(e) =>
                    setFormData({ ...formData, year: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2D8FBF]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-lg hover:from-[#152a4d] hover:to-[#2575a0] transition-colors"
                >
                  {editingId ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CohortsTab;