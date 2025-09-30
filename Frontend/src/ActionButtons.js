import React, { useState } from "react";

export default function ActionButtons({ item, onEdit, onDelete, programs = [] }) {
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...item });

  // Detect type based on fields
  const isStudent = item.firstName !== undefined;
  const isCollege = item.code?.startsWith("C");
  const isProgram = item.code?.startsWith("P");

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    // for Year Level
    if (name === "yearLevel") {
        const num = parseInt(value, 10);
        if (num > 5) return; // max Year Level is 5
        if (num < 1) return; // min Year Level is 1
    }
    setEditedItem({ ...editedItem, [name]: value });
  };

  // Handle edit submission
  const handleEditSubmit = (e) => {
    e.preventDefault();
    onEdit(editedItem);
    setShowEditPopup(false);
  };

  return (
    <>
      {/* --- Action Buttons --- */}
      <div className="action-buttons">
        <button className="btn edit-btn" onClick={() => setShowEditPopup(true)}>
          Edit
        </button>
        <button className="btn delete-btn" onClick={() => setShowDeletePopup(true)}>
          Delete
        </button>
      </div>

      {/* --- Edit Popup --- */}
      {showEditPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>
              Edit {isStudent ? "Student" : isCollege ? "College" : isProgram ? "Program" : "Record"}
            </h3>

            <form onSubmit={handleEditSubmit}>
              {/* Student fields */}
              {isStudent && (
                <>
                  <label>
                    Student ID:
                    <input
                      type="text"
                      name="id"
                      value={editedItem.id || ""}
                      onChange={handleChange}
                    />
                  </label>

                  <label>
                    First Name:
                    <input
                      type="text"
                      name="firstName"
                      value={editedItem.firstName || ""}
                      onChange={handleChange}
                    />
                  </label>

                  <label>
                    Last Name:
                    <input
                      type="text"
                      name="lastName"
                      value={editedItem.lastName || ""}
                      onChange={handleChange}
                    />
                  </label>

                  <label>
                    Gender:
                    <select
                      name="gender"
                      value={editedItem.gender || ""}
                      onChange={handleChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="M">Male</option>
                      <option value="F">Female</option>
                      <option value="Others">Others</option>
                    </select>
                  </label>

                  <label>
                    Program:
                    <select
                      name="course"
                      value={editedItem.course || ""}
                      onChange={handleChange}
                    >
                        <option value="">Select Program</option>
                        {programs.map((p) => (
                            <option key={p.code} value={p.code}>
                                {p.code} - {p.name}
                            </option>
                        ))}
                    </select>
                  </label>

                  <label>
                    Year Level:
                    <select
                        name="yearLevel"
                        value={editedItem.yearLevel || ""}
                        onChange={handleChange}
                    >
                        <option value="">-- Select Year Level --</option>
                        {[1, 2, 3, 4, 5].map((level) => (
                        <option key={level} value={level}>
                            {level}
                        </option>
                        ))}
                    </select>
                    </label>
                </>
              )}

              {/* College fields */}
              {isCollege && (
                <>
                  <label>
                    Code:
                    <input
                      type="text"
                      name="name"
                      value={editedItem.name || ""}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    Name:
                    <input
                      type="text"
                      name="name"
                      value={editedItem.name || ""}
                      onChange={handleChange}
                    />
                  </label>
                </>
              )}

              {/* Program fields */}
              {isProgram && (
                <>
                  <label>
                    Program Code:
                    <input
                      type="text"
                      name="code"
                      value={editedItem.code || ""}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    Program Name:
                    <input
                      type="text"
                      name="name"
                      value={editedItem.name || ""}
                      onChange={handleChange}
                    />
                  </label>
                  <label>
                    College Code:
                    <input
                      type="text"
                      name="college"
                      value={editedItem.college || ""}
                      onChange={handleChange}
                      disabled   // cannot be changed
                    />
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

      {/* --- Delete Confirmation Popup --- */}
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
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeletePopup(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
