import React, { useState } from "react";
import StudentImageUpload from "./StudentImageUpload";

export default function ActionButtons({
  item,
  onEdit,
  onDelete,
  programs = [],
  colleges = [],
}) {
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...item });
  const [errors, setErrors] = useState({});

  const isStudent = item.firstName !== undefined;
  const isCollege = item.collegeCode === undefined && item.name && item.code;
  const isProgram = item.collegeCode !== undefined;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "code" && (isCollege || isProgram)) {
      setEditedItem((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setEditedItem((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (isStudent) {
      if (!editedItem.id?.trim()) newErrors.id = "Student ID is required";
      if (!editedItem.firstName?.trim()) newErrors.firstName = "First name required";
      if (!editedItem.lastName?.trim()) newErrors.lastName = "Last name required";
      if (!editedItem.gender) newErrors.gender = "Gender required";
      if (!editedItem.course) newErrors.course = "Program required";
      if (!editedItem.yearLevel) newErrors.yearLevel = "Year level required";
    }

    if (isCollege) {
      if (!editedItem.code?.trim()) newErrors.code = "College code required";
      if (!editedItem.name?.trim()) newErrors.name = "College name required";
    }

    if (isProgram) {
      if (!editedItem.code?.trim()) newErrors.code = "Program code required";
      if (!editedItem.name?.trim()) newErrors.name = "Program name required";
      if (!editedItem.collegeCode) newErrors.collegeCode = "College required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (isProgram) {
      const programData = {
        code: editedItem.code,
        name: editedItem.name,
        college: editedItem.collegeCode,
      };
      onEdit(programData, item.code); 
    } else if (isCollege) {
      const collegeData = {
        code: editedItem.code,
        name: editedItem.name,
      };
      onEdit(collegeData, item.code);
    } else if (isStudent) {
      onEdit(editedItem, item.id);
    }

    setShowEditPopup(false);
  };

  const handleDeleteConfirm = () => {
    onDelete(item);
    setShowDeletePopup(false);
  };

  return (
    <>
      {/* ===== Action Buttons ===== */}
      <div className="action-buttons">
        <button className="btn edit-btn" onClick={() => setShowEditPopup(true)}>
          Edit
        </button>
        <button className="btn delete-btn" onClick={() => setShowDeletePopup(true)}>
          Delete
        </button>
      </div>

      {/* ===== Edit Popup ===== */}
      {showEditPopup && (
        <div className="add-student-overlay">
          <div className="add-student-modal">
            <div className="add-student-header">
              <h3>
                Edit {isStudent ? "Student" : isCollege ? "College" : "Program"}
              </h3>
            </div>

            <form onSubmit={handleEditSubmit} className="add-student-form">
              {/* STUDENT FIELDS */}
              {isStudent && (
                <>
                  {/* Profile Picture */}
                  <div className="form-group">
                    <label className="form-label">Profile Picture</label>
                    <StudentImageUpload 
                      studentId={editedItem.id}
                      currentImageUrl={editedItem.profileImage}
                      onUploadSuccess={(url) => setEditedItem(prev => ({ ...prev, profileImage: url }))}
                    />
                  </div>

                  {/* Student ID */}
                  <div className="form-group">
                    <label className="form-label">
                      Student ID <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="id"
                      value={editedItem.id || ""}
                      onChange={handleChange}
                      className={`form-input ${errors.id ? "error" : ""}`}
                      required
                    />
                    <div className="note-area">
                      {errors.id && <p className="note error-note">{errors.id}</p>}
                    </div>
                  </div>

                  {/* First Name */}
                  <div className="form-group">
                    <label className="form-label">
                      First Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={editedItem.firstName || ""}
                      onChange={handleChange}
                      placeholder="Enter first name"
                      className={`form-input ${errors.firstName ? "error" : ""}`}
                      required
                    />
                    <div className="note-area">
                      {errors.firstName && <p className="note error-note">{errors.firstName}</p>}
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="form-group">
                    <label className="form-label">
                      Last Name <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={editedItem.lastName || ""}
                      onChange={handleChange}
                      placeholder="Enter last name"
                      className={`form-input ${errors.lastName ? "error" : ""}`}
                      required
                    />
                    <div className="note-area">
                      {errors.lastName && <p className="note error-note">{errors.lastName}</p>}
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="form-group">
                    <label className="form-label">
                      Gender <span className="required">*</span>
                    </label>
                    <select
                      name="gender"
                      value={editedItem.gender || ""}
                      onChange={handleChange}
                      className={`form-input ${errors.gender ? "error" : ""}`}
                      required
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="Others">Others</option>
                    </select>
                    <div className="note-area">
                      {errors.gender && <p className="note error-note">{errors.gender}</p>}
                    </div>
                  </div>

                  {/* Program */}
                  <div className="form-group">
                    <label className="form-label">
                      Program <span className="required">*</span>
                    </label>
                    <select
                      name="course"
                      value={editedItem.course || ""}
                      onChange={handleChange}
                      className={`form-input ${errors.course ? "error" : ""}`}
                      required
                    >
                      <option value="">-- Select Program --</option>
                      {programs.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                    </select>
                    <div className="note-area">
                      {errors.course && <p className="note error-note">{errors.course}</p>}
                    </div>
                  </div>

                  {/* Year Level */}
                  <div className="form-group">
                    <label className="form-label">
                      Year Level <span className="required">*</span>
                    </label>
                    <select
                      name="yearLevel"
                      value={editedItem.yearLevel || ""}
                      onChange={handleChange}
                      className={`form-input ${errors.yearLevel ? "error" : ""}`}
                      required
                    >
                      <option value="">-- Select Year Level --</option>
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                    <div className="note-area">
                      {errors.yearLevel && <p className="note error-note">{errors.yearLevel}</p>}
                    </div>
                  </div>
                </>
              )}

              {/* COLLEGE FIELDS */}
              {isCollege && (
                <>
                  <label>
                    College Code:
                    <input
                      name="code"
                      value={editedItem.code || ""}
                      onChange={handleChange}
                      required
                    />
                    {errors.code && <p className="error-text">{errors.code}</p>}
                  </label>

                  <label>
                    College Name:
                    <input
                      name="name"
                      value={editedItem.name || ""}
                      onChange={handleChange}
                      required
                    />
                    {errors.name && <p className="error-text">{errors.name}</p>}
                  </label>
                </>
              )}

              {/* PROGRAM FIELDS */}
              {isProgram && (
                <>
                  <label>
                    Program Code:
                    <input
                      name="code"
                      value={editedItem.code || ""}
                      onChange={handleChange}
                      required
                    />
                    {errors.code && <p className="error-text">{errors.code}</p>}
                  </label>

                  <label>
                    Program Name:
                    <input
                      name="name"
                      value={editedItem.name || ""}
                      onChange={handleChange}
                      required
                    />
                    {errors.name && <p className="error-text">{errors.name}</p>}
                  </label>

                  <label>
                    College:
                    <select
                      name="collegeCode"
                      value={editedItem.collegeCode || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select College --</option>
                      {colleges.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                    {errors.collegeCode && <p className="error-text">{errors.collegeCode}</p>}
                  </label>
                </>
              )}

              {/* Action Buttons */}
              <div className="form-actions">
                <button type="submit" className="btn btn-submit">
                  <span>✓</span> Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditPopup(false)}
                  className="btn btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== Delete Confirmation ===== */}
      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Confirm Delete</h3>
            <p>
              Are you sure you want to delete{" "}
              <strong>
                {isStudent
                  ? `${item.firstName} ${item.lastName}`
                  : `${item.name} (${item.code})`}
              </strong>
              ?
            </p>
            <div className="popup-actions">
              <button className="btn" onClick={() => setShowDeletePopup(false)}>
                Cancel
              </button>
              <button className="btn btn-danger" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
