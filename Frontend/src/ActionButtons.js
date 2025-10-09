import React, { useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function ActionButtons({ item, onEdit, onDelete, programs = [], colleges = [], onFetchSingle }) {
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...item });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Detect type based on fields
  const isStudent = item.firstName !== undefined;
  const isCollege = item.code?.startsWith("C") && item.name !== undefined && !item.collegeCode;
  const isProgram = item.collegeCode !== undefined;

  const validateStudentIdFormat = (id) => {
    const regex = /^\d{4}-\d{4}$/;
    return regex.test(id);
  };

  // Fetch fresh data before editing
  const handleEditClick = async () => {
    if ((isStudent || isCollege) && onFetchSingle) {
      try {
        setLoading(true);
        const freshData = await onFetchSingle(isStudent ? item.id : item.code);
        setEditedItem(freshData);
        setShowEditPopup(true);
        setErrors({});
      } catch (err) {
        alert(`Error fetching data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      // For programs, ensure collegeCode is set
      const itemData = { ...item };
      if (isProgram && !itemData.collegeCode && item.college) {
        itemData.collegeCode = item.college;
      }
      setEditedItem(itemData);
      setShowEditPopup(true);
      setErrors({});
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "yearLevel") {
      const num = parseInt(value, 10);
      if (num > 5 || num < 1) return;
    }

    if (name === "id" && isStudent) {
      let formatted = value.replace(/[^\d-]/g, "");
      if (formatted.length === 4 && !formatted.includes("-")) formatted += "-";
      if (formatted.length > 9) formatted = formatted.slice(0, 9);
      setEditedItem({ ...editedItem, [name]: formatted });
    } else if (name === "code" && (isCollege || isProgram)) {
      setEditedItem({ ...editedItem, [name]: value.toUpperCase() });
    } else {
      setEditedItem({ ...editedItem, [name]: value });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isStudent) {
      if (!editedItem.id || !editedItem.id.trim()) newErrors.id = "Student ID is required";
      else if (!validateStudentIdFormat(editedItem.id)) newErrors.id = "Format must be YYYY-NNNN";

      if (!editedItem.firstName || editedItem.firstName.trim().length < 2)
        newErrors.firstName = "First name must be at least 2 characters";
      if (!editedItem.lastName || editedItem.lastName.trim().length < 2)
        newErrors.lastName = "Last name must be at least 2 characters";
      if (!editedItem.gender) newErrors.gender = "Gender is required";
      if (!editedItem.course) newErrors.course = "Program is required";
      if (!editedItem.yearLevel) newErrors.yearLevel = "Year level is required";
    }

    if (isCollege) {
      if (!editedItem.code || !editedItem.code.trim())
        newErrors.code = "College code is required";
      else if (editedItem.code.length < 2)
        newErrors.code = "College code must be at least 2 characters";

      if (!editedItem.name || editedItem.name.trim().length < 3)
        newErrors.name = "College name must be at least 3 characters";
    }

    if (isProgram) {
      if (!editedItem.code || !editedItem.code.trim())
        newErrors.code = "Program code is required";
      else if (editedItem.code.length < 2)
        newErrors.code = "Program code must be at least 2 characters";

      if (!editedItem.name || editedItem.name.trim().length < 3)
        newErrors.name = "Program name must be at least 3 characters";

      if (!editedItem.collegeCode)
        newErrors.collegeCode = "College is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    // For programs, we need to convert collegeCode to college for the backend
    if (isProgram) {
      const programData = {
        code: editedItem.code,
        name: editedItem.name,
        college: editedItem.collegeCode
      };
      onEdit(programData, item.code);
    } else {
      onEdit(editedItem, item.code);
    }
    setShowEditPopup(false);
  };

  return (
    <>
      <div className="action-buttons">
        <button className="btn edit-btn" onClick={handleEditClick} disabled={loading}>
          {loading ? "Loading..." : "Edit"}
        </button>
        <button className="btn delete-btn" onClick={() => setShowDeletePopup(true)}>
          Delete
        </button>
      </div>

      {showEditPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>
              Edit {isStudent ? "Student" : isCollege ? "College" : isProgram ? "Program" : "Record"}
            </h3>

            <form onSubmit={handleEditSubmit}>
              {isStudent && (
                <>
                  <label>
                    Student ID:
                    <input
                      type="text"
                      name="id"
                      value={editedItem.id || ""}
                      onChange={handleChange}
                      maxLength="9"
                      placeholder="2024-0001"
                      className={errors.id ? "input-error" : ""}
                      required
                    />
                    {errors.id && <span className="error-text">{errors.id}</span>}
                    <small style={{ display: "block", marginTop: "4px", color: "#666" }}>
                      Format: YYYY-NNNN
                    </small>
                  </label>

                  <label>
                    First Name:
                    <input
                      type="text"
                      name="firstName"
                      value={editedItem.firstName || ""}
                      onChange={handleChange}
                      className={errors.firstName ? "input-error" : ""}
                      required
                    />
                    {errors.firstName && <span className="error-text">{errors.firstName}</span>}
                  </label>

                  <label>
                    Last Name:
                    <input
                      type="text"
                      name="lastName"
                      value={editedItem.lastName || ""}
                      onChange={handleChange}
                      className={errors.lastName ? "input-error" : ""}
                      required
                    />
                    {errors.lastName && <span className="error-text">{errors.lastName}</span>}
                  </label>

                  <label>
                    Gender:
                    <select
                      name="gender"
                      value={editedItem.gender || ""}
                      onChange={handleChange}
                      className={errors.gender ? "input-error" : ""}
                      required
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="Others">Others</option>
                    </select>
                    {errors.gender && <span className="error-text">{errors.gender}</span>}
                  </label>

                  <label>
                    Program:
                    <select
                      name="course"
                      value={editedItem.course || ""}
                      onChange={handleChange}
                      className={errors.course ? "input-error" : ""}
                      required
                    >
                      <option value="">-- Select Program --</option>
                      {programs.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                    </select>
                    {errors.course && <span className="error-text">{errors.course}</span>}
                  </label>

                  <label>
                    Year Level:
                    <select
                      name="yearLevel"
                      value={editedItem.yearLevel || ""}
                      onChange={handleChange}
                      className={errors.yearLevel ? "input-error" : ""}
                      required
                    >
                      <option value="">-- Select Year Level --</option>
                      {[1, 2, 3, 4, 5].map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                    {errors.yearLevel && <span className="error-text">{errors.yearLevel}</span>}
                  </label>
                </>
              )}

              {isCollege && (
                <>
                  <label>
                    College Code:
                    <input
                      type="text"
                      name="code"
                      value={editedItem.code || ""}
                      onChange={handleChange}
                      maxLength="10"
                      placeholder="e.g., CCS"
                      className={errors.code ? "input-error" : ""}
                      required
                    />
                    {errors.code && <span className="error-text">{errors.code}</span>}
                    <small style={{ display: "block", marginTop: "4px", color: "#666" }}>
                      Letters will be automatically capitalized
                    </small>
                  </label>

                  <label>
                    College Name:
                    <input
                      type="text"
                      name="name"
                      value={editedItem.name || ""}
                      onChange={handleChange}
                      className={errors.name ? "input-error" : ""}
                      required
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </label>
                </>
              )}

              {isProgram && (
                <>
                  <label>
                    Program Code:
                    <input
                      type="text"
                      name="code"
                      value={editedItem.code || ""}
                      onChange={handleChange}
                      maxLength="10"
                      placeholder="e.g., BSCS"
                      className={errors.code ? "input-error" : ""}
                      required
                    />
                    {errors.code && <span className="error-text">{errors.code}</span>}
                    <small style={{ display: "block", marginTop: "4px", color: "#666" }}>
                      Letters will be automatically capitalized
                    </small>
                  </label>

                  <label>
                    Program Name:
                    <input
                      type="text"
                      name="name"
                      value={editedItem.name || ""}
                      onChange={handleChange}
                      className={errors.name ? "input-error" : ""}
                      required
                    />
                    {errors.name && <span className="error-text">{errors.name}</span>}
                  </label>

                  <label>
                    College:
                    <select
                      name="collegeCode"
                      value={editedItem.collegeCode || ""}
                      onChange={handleChange}
                      className={errors.collegeCode ? "input-error" : ""}
                      required
                    >
                      <option value="">-- Select College --</option>
                      {colleges.map((college) => (
                        <option key={college.code} value={college.code}>
                          {college.code} - {college.name}
                        </option>
                      ))}
                    </select>
                    {errors.collegeCode && <span className="error-text">{errors.collegeCode}</span>}
                  </label>
                </>
              )}

              <div className="popup-actions">
                <button type="submit" className="btn btn-success">
                  Save
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowEditPopup(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h4>Are you sure you want to delete this record?</h4>
            <div className="popup-actions">
              <button
                className="btn btn-danger"
                onClick={() => {
                  onDelete(item);
                  setShowDeletePopup(false);
                }}
              >
                Yes, Delete
              </button>
              <button className="btn btn-secondary" onClick={() => setShowDeletePopup(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}