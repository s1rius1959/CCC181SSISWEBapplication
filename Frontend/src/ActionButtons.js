import React, { useState } from "react";

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
        <div className="popup-overlay">
          <div className="popup">
            <h3>
              Edit {isStudent ? "Student" : isCollege ? "College" : "Program"}
            </h3>

            <form onSubmit={handleEditSubmit}>
              {/* STUDENT FIELDS */}
              {isStudent && (
                <>
                  <label>
                    Student ID:
                    <input
                      name="id"
                      value={editedItem.id || ""}
                      onChange={handleChange}
                      required
                    />
                    {errors.id && <p className="error-text">{errors.id}</p>}
                  </label>

                  <label>
                    First Name:
                    <input
                      name="firstName"
                      value={editedItem.firstName || ""}
                      onChange={handleChange}
                      required
                    />
                    {errors.firstName && <p className="error-text">{errors.firstName}</p>}
                  </label>

                  <label>
                    Last Name:
                    <input
                      name="lastName"
                      value={editedItem.lastName || ""}
                      onChange={handleChange}
                      required
                    />
                    {errors.lastName && <p className="error-text">{errors.lastName}</p>}
                  </label>

                  <label>
                    Gender:
                    <select
                      name="gender"
                      value={editedItem.gender || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Gender --</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="Others">Others</option>
                    </select>
                    {errors.gender && <p className="error-text">{errors.gender}</p>}
                  </label>

                  <label>
                    Program:
                    <select
                      name="course"
                      value={editedItem.course || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Program --</option>
                      {programs.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                    </select>
                    {errors.course && <p className="error-text">{errors.course}</p>}
                  </label>

                  <label>
                    Year Level:
                    <select
                      name="yearLevel"
                      value={editedItem.yearLevel || ""}
                      onChange={handleChange}
                      required
                    >
                      <option value="">-- Select Year Level --</option>
                      {[1, 2, 3, 4, 5].map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                    {errors.yearLevel && <p className="error-text">{errors.yearLevel}</p>}
                  </label>
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

              <div className="popup-actions">
                <button type="button" className="btn" onClick={() => setShowEditPopup(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Save Changes
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
