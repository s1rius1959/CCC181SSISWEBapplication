import React, { useState } from "react";

const API_URL = "http://localhost:5000/api";

export default function ActionButtons({ item, onEdit, onDelete, programs = [], onFetchSingle }) {
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [editedItem, setEditedItem] = useState({ ...item });
  const [loading, setLoading] = useState(false);

  // Detect type based on fields
  const isStudent = item.firstName !== undefined;
  const isCollege = item.code?.startsWith("C");
  const isProgram = item.code?.startsWith("P");

  // Handle Edit button click - fetch fresh data for students
  const handleEditClick = async () => {
    if (isStudent && onFetchSingle) {
      try {
        setLoading(true);
        const freshData = await onFetchSingle(item.id);
        setEditedItem(freshData);
        setShowEditPopup(true);
      } catch (err) {
        alert(`Error fetching student data: ${err.message}`);
      } finally {
        setLoading(false);
      }
    } else {
      setEditedItem({ ...item });
      setShowEditPopup(true);
    }
  };

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
        <button 
          className="btn edit-btn" 
          onClick={handleEditClick}
          disabled={loading}
        >
          {loading ? "Loading..." : "Edit"}
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
                      disabled
                      style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                    />
                  </label>

                  <label>
                    First Name:
                    <input
                      type="text"
                      name="firstName"
                      value={editedItem.firstName || ""}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Last Name:
                    <input
                      type="text"
                      name="lastName"
                      value={editedItem.lastName || ""}
                      onChange={handleChange}
                      required
                    />
                  </label>

                  <label>
                    Gender:
                    <select
                      name="gender"
                      value={editedItem.gender || ""}
                      onChange={handleChange}
                      required
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
                      required
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
                        required
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
                    College Code:
                    <input
                      type="text"
                      name="code"
                      value={editedItem.code || ""}
                      disabled
                      style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                    />
                  </label>
                  <label>
                    College Name:
                    <input
                      type="text"
                      name="name"
                      value={editedItem.name || ""}
                      onChange={handleChange}
                      required
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
                      disabled
                      style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
                    />
                  </label>
                  <label>
                    Program Name:
                    <input
                      type="text"
                      name="name"
                      value={editedItem.name || ""}
                      onChange={handleChange}
                      required
                    />
                  </label>
                  <label>
                    College Code:
                    <input
                      type="text"
                      name="college"
                      value={editedItem.college || ""}
                      onChange={handleChange}
                      disabled
                      style={{ backgroundColor: '#e9ecef', cursor: 'not-allowed' }}
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