// src/components/users/ImportModal.jsx
import React, { useState, useRef } from "react";
import * as XLSX from "xlsx";
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  Download,
} from "lucide-react";

const ImportModal = ({ isOpen, onClose, userType, onImport }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [importedCount, setImportedCount] = useState(0);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // ✅ Champs requis par type d'utilisateur (identiques à AddUserModal)
  const getRequiredFields = () => {
    const common = [
      { key: "firstName", label: "First Name", required: true },
      { key: "lastName", label: "Last Name", required: true },
      { key: "email", label: "E-mail", required: true, type: "email" },
      { key: "username", label: "Username", required: true },
      { key: "phoneNumber", label: "Phone Number", required: false },
      { key: "password", label: "Password", required: true, type: "password" },
      { key: "status", label: "Status", required: false, default: "Pending" },
    ];

    const specific = {
      admin: [
        {
          key: "role",
          label: "Permission Given",
          required: true,
          type: "select",
          options: ["Gestion des Projets PFE", "Gestion des Attibutions", "Gestion des Soutenances", "Gestion des Notes et Résultats", "Configuration Système et Communication"],
        },
      ],
      supervisor: [
        {
          key: "specialization",
          label: "Specialization",
          required: true,
          type: "text",
        },
        {
          key: "type",
          label: "Type",
          required: true,
          type: "select",
          options: ["Interne", "Externe"],
        },
      ],
      student: [
        { key: "major", label: "Major", required: true, type: "text" },
        {
          key: "annualAverage",
          label: "Annual Average",
          required: false,
          type: "number",
          min: 0,
          max: 20,
          step: 0.01,
        },
      ],
    };

    return [...common, ...(specific[userType] || [])];
  };

  // Normaliser les en-têtes Excel (accepte différentes variations)
  const normalizeKey = (key) => {
    const normalized = key
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "") // Supprime TOUS les espaces
      .replace(/[-_]/g, "") // Supprime tirets et underscores
      .replace(/[^a-z0-9]/g, ""); // Supprime autres caractères spéciaux

    // Mappings complets et précis
    const mappings = {
      firstname: "firstName",
      fname: "firstName",
      first: "firstName",
      lastname: "lastName",
      lname: "lastName",
      last: "lastName",
      email: "email",
      "e-mail": "email",
      mail: "email",
      username: "username",
      user: "username",
      phonenumber: "phoneNumber",
      phone: "phoneNumber",
      tel: "phoneNumber",
      mobile: "phoneNumber",
      password: "password",
      pass: "password",
      pwd: "password",
      status: "status",
      role: "role",
      permission: "role",
      permissiongiven: "role",
      specialization: "specialization",
      speciality: "specialization",
      type: "type",
      major: "major",
      field: "major",
      annualaverage: "annualAverage",
      average: "annualAverage",
      avg: "annualAverage",
      grade: "annualAverage",
      gpa: "annualAverage",
    };

    return mappings[normalized] || normalized;
  };

  // Parser le fichier Excel/CSV
  const parseFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
          resolve(jsonData);
        } catch (err) {
          reject(new Error("Erreur lors de la lecture du fichier"));
        }
      };
      reader.onerror = () => reject(new Error("Erreur de lecture"));
      reader.readAsArrayBuffer(file);
    });
  };

  // Valider une ligne de données
  const validateRow = (row, rowIndex) => {
    const errors = [];
    const fields = getRequiredFields();

    fields.forEach((field) => {
      const value = row[normalizeKey(field.key)];

      if (field.required && (!value || value.toString().trim() === "")) {
        errors.push(`Ligne ${rowIndex + 2}: "${field.label}" est requis`);
      }

      // Validation email
      if (
        field.type === "email" &&
        value &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {
        errors.push(`Ligne ${rowIndex + 2}: Email invalide "${value}"`);
      }

      // Validation password (minimum 6 caractères)
      if (field.type === "password" && value && value.toString().length < 6) {
        errors.push(
          `Ligne ${rowIndex + 2}: Mot de passe trop court (min. 6 caractères)`,
        );
      }

      // Validation annualAverage
      if (field.key === "annualAverage" && value) {
        const avg = parseFloat(value);
        if (isNaN(avg) || avg < 0 || avg > 20) {
          errors.push(`Ligne ${rowIndex + 2}: Moyenne invalide (0-20)`);
        }
      }
    });

    return errors;
  };

  // Gérer la sélection du fichier
  const handleFileSelect = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const validExtensions = [".xlsx", ".xls", ".csv"];
    const fileExt = selectedFile.name
      .toLowerCase()
      .substring(selectedFile.name.lastIndexOf("."));

    if (!validExtensions.includes(fileExt)) {
      setError("Format non supporté. Utilisez .xlsx, .xls ou .csv");
      return;
    }

    setFile(selectedFile);
    setError("");
    setIsProcessing(true);

    try {
      const rawData = await parseFile(selectedFile);

      if (rawData.length === 0) {
        setError("Le fichier est vide");
        setPreview([]);
        setIsProcessing(false);
        return;
      }

      // Normaliser les données
      const normalizedData = rawData.map((row) => {
        const normalized = {};
        Object.keys(row).forEach((key) => {
          const normKey = normalizeKey(key);
          normalized[normKey] = row[key]?.toString().trim() || "";
        });
        return normalized;
      });

      // Valider toutes les lignes
      const allErrors = [];
      normalizedData.forEach((row, idx) => {
        const rowErrors = validateRow(row, idx);
        allErrors.push(...rowErrors);
      });

      if (allErrors.length > 0) {
        setError(
          allErrors.slice(0, 10).join("\n") +
            (allErrors.length > 10
              ? `\n...et ${allErrors.length - 10} autres erreurs`
              : ""),
        );
        setPreview([]);
      } else {
        setPreview(normalizedData.slice(0, 5));
        setError("");
      }
    } catch (err) {
      setError(err.message);
      setPreview([]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Exécuter l'import
  const handleImport = async () => {
    if (!file || preview.length === 0) return;

    setIsProcessing(true);
    try {
      const rawData = await parseFile(file);
      const fields = getRequiredFields();
      const today = new Date().toISOString().split("T")[0];

      const usersToImport = rawData.map((row, index) => {
        // 🔍 Créer un mapping des clés normalisées vers les valeurs
        const normalizedRow = {};
        Object.keys(row).forEach((originalKey) => {
          const normalizedKey = normalizeKey(originalKey);
          normalizedRow[normalizedKey] =
            row[originalKey]?.toString().trim() || "";
        });

        console.log("🔧 Ligne normalisée:", normalizedRow); // Debug

        // Récupérer les valeurs avec les champs attendus
        const getValue = (fieldKey, defaultValue = "") => {
          return normalizedRow[fieldKey] || defaultValue;
        };

        return {
          id: Date.now() + index,
          firstName: getValue("firstName"),
          lastName: getValue("lastName"),
          name: `${getValue("firstName")} ${getValue("lastName")}`.trim(),
          email: getValue("email").toLowerCase(),
          username: getValue("username"),
          phoneNumber: getValue("phoneNumber"),
          password: getValue("password"),
          status: getValue("status", "Pending"),
          lastActive: today,
          // Champs spécifiques
          ...(userType === "admin" && { role: getValue("role") }),
          ...(userType === "supervisor" && {
            specialization: getValue("specialization"),
            type: getValue("type"),
          }),
          ...(userType === "student" && {
            major: getValue("major"),
            annualAverage: getValue("annualAverage")
              ? parseFloat(getValue("annualAverage"))
              : "",
          }),
        };
      });

      onImport(usersToImport);
      setImportedCount(usersToImport.length);
      setFile(null);
      setPreview([]);
    } catch (err) {
      setError("Erreur lors de l'import: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Télécharger le modèle Excel
  const downloadTemplate = () => {
    const fields = getRequiredFields();
    const template = [
      // En-têtes
      Object.fromEntries(
        fields.map((f) => [f.label, f.required ? "*Obligatoire" : ""]),
      ),
      // Exemple de donnée
      Object.fromEntries(
        fields.map((f) => {
          if (f.key === "firstName") return [f.label, "Jean"];
          if (f.key === "lastName") return [f.label, "Dupont"];
          if (f.key === "email") return [f.label, "jean.dupont@univ.edu"];
          if (f.key === "username") return [f.label, "j.dupont"];
          if (f.key === "password") return [f.label, "MotDePasse123"];
          if (f.key === "status") return [f.label, "Pending"];
          if (f.key === "phoneNumber") return [f.label, "+33612345678"];
          if (userType === "admin" && f.key === "role")
            return [f.label, "Admin"];
          if (userType === "supervisor" && f.key === "specialization")
            return [f.label, "Computer Science"];
          if (userType === "supervisor" && f.key === "type")
            return [f.label, "Senior"];
          if (userType === "student" && f.key === "major")
            return [f.label, "Computer Science"];
          if (userType === "student" && f.key === "annualAverage")
            return [f.label, "15.5"];
          return [f.label, ""];
        }),
      ),
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);

    // Ajuster la largeur des colonnes
    const colWidths = fields.map((f) => ({
      wch: Math.max(f.label.length, 15),
    }));
    worksheet["!cols"] = colWidths;

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, `template_import_${userType}.xlsx`);
  };

  const userTypeLabel =
    {
      admin: "Admin",
      supervisor: "Supervisor",
      student: "Student",
    }[userType] || "User";

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white px-6 py-4 flex items-center justify-between rounded-t-lg sticky top-0">
          <div className="flex items-center gap-3">
            <Upload size={24} />
            <h2 className="text-xl font-semibold">
              Import Excel - {userTypeLabel}s
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Zone d'upload */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-[#2D8FBF] transition-colors cursor-pointer bg-gray-50"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Upload size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-700 font-medium mb-1">
              {file ? file.name : "Cliquez ou glissez un fichier ici"}
            </p>
            <p className="text-sm text-gray-500">Formats: .xlsx, .xls, .csv</p>
          </div>

          {/* Bouton modèle */}
          <div className="flex justify-center">
            <button
              onClick={downloadTemplate}
              className="flex items-center gap-2 text-sm text-[#2D8FBF] hover:text-[#18335E] transition-colors font-medium"
            >
              <Download size={16} />
              Télécharger le modèle Excel avec tous les champs requis
            </button>
          </div>

          {/* Liste des champs requis */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">
              📋 Champs requis pour l'import :
            </h4>
            <div className="flex flex-wrap gap-2">
              {getRequiredFields()
                .filter((f) => f.required)
                .map((field) => (
                  <span
                    key={field.key}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {field.label} *
                  </span>
                ))}
            </div>
            <p className="text-xs text-blue-600 mt-2">
              💡 Les noms de colonnes peuvent varier (ex: "First Name",
              "firstname", "first_name")
            </p>
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle size={20} className="shrink-0 mt-0.5" />
              <pre className="whitespace-pre-wrap font-sans">{error}</pre>
            </div>
          )}

          {/* Message de succès */}
          {importedCount > 0 && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700">
              <CheckCircle size={20} className="shrink-0" />
              <span className="font-medium">
                {importedCount} {userTypeLabel}(s) importé(s) avec succès !
              </span>
            </div>
          )}

          {/* Aperçu des données */}
          {preview.length > 0 && !error && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText size={16} />
                Aperçu ({preview.length} premières lignes)
              </h3>
              <div className="overflow-x-auto border border-gray-200 rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100">
                    <tr>
                      {getRequiredFields().map((field) => (
                        <th
                          key={field.key}
                          className="px-3 py-2 text-left font-semibold text-gray-700 uppercase text-xs border-b"
                        >
                          {field.label}{" "}
                          {field.required && (
                            <span className="text-red-500">*</span>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50">
                        {getRequiredFields().map((field) => {
                          const value = row[field.key] || "-";
                          return (
                            <td
                              key={field.key}
                              className="px-3 py-2 text-gray-700"
                            >
                              {field.type === "password" && value
                                ? "••••••••"
                                : value}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 sticky bottom-0 bg-white py-3">
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setPreview([]);
                setError("");
                setImportedCount(0);
                onClose();
              }}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors font-medium"
              disabled={isProcessing}
            >
              {importedCount > 0 ? "Fermer" : "Annuler"}
            </button>
            <button
              onClick={handleImport}
              disabled={
                !file || preview.length === 0 || isProcessing || !!error
              }
              className="px-6 py-2 bg-linear-to-r from-[#18335E] to-[#2D8FBF] text-white rounded-md hover:from-[#152a4d] hover:to-[#2575a0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-medium"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Import en cours...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Importer{" "}
                  {preview.length > 0 &&
                    `(${preview.length}+ ${userTypeLabel}s)`}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportModal;
