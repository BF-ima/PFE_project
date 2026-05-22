import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const CRITERIA = [
  { key: "oralPresentation",    label: "Oral Presentation"    },
  { key: "deliverablesQuality", label: "Deliverables Quality" },
  { key: "demoApplication",     label: "Demo / Application"   },
  { key: "qaResponses",         label: "Q&A Responses"        },
];

const defaultRow = () => ({ note: "", coef: "" });

const AddNotesModal = ({ isOpen, onClose, onConfirm, teamData }) => {
  const [rows, setRows] = useState({
    oralPresentation:    defaultRow(),
    deliverablesQuality: defaultRow(),
    demoApplication:     defaultRow(),
    qaResponses:         defaultRow(),
  });
  const [juryObservations, setJuryObservations] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    if (teamData?.notes) {
   setRows({
  oralPresentation:    { note: String(teamData.notes.oralPresentation    ?? ""), coef: String(teamData.coefOral        ?? "") },
  deliverablesQuality: { note: String(teamData.notes.deliverablesQuality ?? ""), coef: String(teamData.coefDeliverables ?? "") },
  demoApplication:     { note: String(teamData.notes.demoApplication     ?? ""), coef: String(teamData.coefDemo         ?? "") },
  qaResponses:         { note: String(teamData.notes.qaResponses         ?? ""), coef: String(teamData.coefQa           ?? "") },
});
      setJuryObservations(teamData.juryObservations || "");
    } else {
      setRows({
        oralPresentation:    defaultRow(),
        deliverablesQuality: defaultRow(),
        demoApplication:     defaultRow(),
        qaResponses:         defaultRow(),
      });
      setJuryObservations("");
    }
  }, [isOpen, teamData]);

  const handleChange = (key, field, value) => {
    setRows(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  // Weighted average preview: sum(note * coef) / sum(coef)
  const computePreview = () => {
    let weightedSum = 0;
    let totalCoef   = 0;
    for (const { key } of CRITERIA) {
      const note = parseFloat(rows[key].note);
      const coef = parseFloat(rows[key].coef);
      if (!isNaN(note) && !isNaN(coef) && coef > 0) {
        weightedSum += note * coef;
        totalCoef   += coef;
      }
    }
    if (totalCoef === 0) return null;
    return (weightedSum / totalCoef).toFixed(2);
  };

  const preview = computePreview();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validate
    for (const { key, label } of CRITERIA) {
      const note = parseFloat(rows[key].note);
      const coef = parseFloat(rows[key].coef);
      if (rows[key].note !== "" && (isNaN(note) || note < 0 || note > 20)) {
        alert(`${label}: note must be between 0 and 20.`);
        return;
      }
      if (rows[key].coef !== "" && (isNaN(coef) || coef < 0 || coef > 10)) {
        alert(`${label}: coefficient must be between 0 and 10.`);
        return;
      }
    }
    onConfirm({
      oralPresentation:    rows.oralPresentation.note    !== "" ? parseFloat(rows.oralPresentation.note)    : undefined,
      deliverablesQuality: rows.deliverablesQuality.note !== "" ? parseFloat(rows.deliverablesQuality.note) : undefined,
      demoApplication:     rows.demoApplication.note     !== "" ? parseFloat(rows.demoApplication.note)     : undefined,
      qaResponses:         rows.qaResponses.note         !== "" ? parseFloat(rows.qaResponses.note)         : undefined,
      coefOral:         rows.oralPresentation.coef    !== "" ? parseFloat(rows.oralPresentation.coef)    : undefined,
      coefDeliverables: rows.deliverablesQuality.coef !== "" ? parseFloat(rows.deliverablesQuality.coef) : undefined,
      coefDemo:         rows.demoApplication.coef     !== "" ? parseFloat(rows.demoApplication.coef)     : undefined,
      coefQa:           rows.qaResponses.coef         !== "" ? parseFloat(rows.qaResponses.coef)         : undefined,
      juryObservations,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 overflow-hidden max-h-[90vh] flex flex-col">

        {/* Header */}
       <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
  <div>
    <h2 className="text-xl font-bold text-[#193962]">Grade and defense report entry</h2>
  </div>
  <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
    <X size={20} className="text-gray-500" />
  </button>
</div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">

          {/* Project Info */}
          <div className="bg-gray-100 rounded-lg p-4">
  <p className="text-sm text-gray-700">
    <span className="font-semibold">Team:</span> {teamData?.id || "—"}
  </p>
  <p className="text-sm text-gray-700 mt-1">
    <span className="font-semibold">Project:</span> {teamData?.projectTitle || "—"}
  </p>
  <p className="text-sm text-gray-700 mt-1">
    <span className="font-semibold">Defense:</span> {teamData?.defenseDate || "dd/mm/yyyy"} at {teamData?.defenseTime || "--:--"}
  </p>
</div>

          {/* Column headers */}
          <div className="grid grid-cols-[1fr_100px_100px] gap-3 px-1">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Criteria</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Note /20</span>
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide text-center">Coef /10</span>
          </div>

          {/* Grade rows */}
          <div className="space-y-3">
            {CRITERIA.map(({ key, label }) => (
              <div key={key} className="grid grid-cols-[1fr_100px_100px] gap-3 items-center">
                <span className="text-sm text-gray-700 font-medium">{label}</span>

                <input
                  type="number"
                  min="0"
                  max="20"
                  step="0.5"
                  placeholder="0–20"
                  value={rows[key].note}
                  onInput={e => { if(e.target.value > 20) e.target.value = 20; if(e.target.value < 0) e.target.value = 0; }}
                  onChange={e => handleChange(key, "note", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193962] focus:border-transparent text-center text-sm"
                />

                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  placeholder="0–10"
                  value={rows[key].coef}
                  onInput={e => { if(e.target.value > 10) e.target.value = 10; if(e.target.value < 0) e.target.value = 0; }}
                  onChange={e => handleChange(key, "coef", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193962] focus:border-transparent text-center text-sm"
                />
              </div>
            ))}
          </div>

          {/* Weighted average preview */}
          <div className={`rounded-lg px-4 py-3 flex items-center justify-between ${preview !== null ? "bg-blue-50 border border-blue-200" : "bg-gray-50 border border-gray-200"}`}>
            <span className="text-sm font-semibold text-gray-600">Weighted average</span>
            <span className={`text-lg font-bold ${preview !== null ? "text-[#193962]" : "text-gray-400"}`}>
              {preview !== null ? `${preview} / 20` : "—"}
            </span>
          </div>

          {/* Jury Observations */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Jury observations:</label>
            <textarea
              value={juryObservations}
              onChange={e => setJuryObservations(e.target.value)}
              placeholder="Write here jury's observation ..."
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193962] focus:border-transparent resize-none bg-gray-100 text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-all">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 px-4 py-2.5 bg-gradient-to-r from-[#193962] to-[#2D8FBF] hover:from-[#152f4d] hover:to-[#2575a0] text-white font-medium rounded-lg transition-all shadow-md hover:shadow-lg">
              {teamData?.notes ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNotesModal;