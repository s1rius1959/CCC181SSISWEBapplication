import React, { useState } from "react";

export default function AddProgram({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    college: "",
  });

  const colleges = [
    { code: "ENG", name: "College of Engineering" },
    { code: "SCI", name: "College of Science" },
    { code: "BUS", name: "College of Business" },
    { code: "ART", name: "College of Arts" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
    onClose();
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>Add Program</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Program Code:
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            Program Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            College Code:
            <select
              name="college"
              value={formData.college}
              onChange={handleChange}
              required
            >
              <option value="">Select College</option>
              {colleges.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </label>

          <div className="popup-actions">
            <button type="submit" className="btn btn-success">Add</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
