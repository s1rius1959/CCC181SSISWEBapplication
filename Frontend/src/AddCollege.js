import React, { useState } from "react";

export default function AddCollege({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

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
        <h3>Add College</h3>
        <form onSubmit={handleSubmit}>
          <label>
            College Code:
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              required
            />
          </label>

          <label>
            College Name:
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
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
