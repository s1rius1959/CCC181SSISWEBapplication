import React, { useState } from "react";

export default function AddStudent({ programs, onAdd, onClose }) {
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    gender: "",
    course: "",
    yearLevel: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd(formData);
  };

  return (
    <div className="popup-overlay">
      <div className="popup">
        <h3>Add Student</h3>
        <form onSubmit={handleSubmit}>
          <label>
            Student ID:
            <input type="text" name="id" value={formData.id} onChange={handleChange} required />
          </label>

          <label>
            First Name:
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} required />
          </label>

          <label>
            Last Name:
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} required />
          </label>

          <label>
            Gender:
            <select name="gender" value={formData.gender} onChange={handleChange} required>
              <option value="">-- Select Gender --</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Others">Others</option>
            </select>
          </label>

          <label>
            Program:
            <select name="course" value={formData.course} onChange={handleChange} required>
              <option value="">-- Select Program --</option>
              {programs.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
          </label>

          <label>
            Year Level:
            <select name="yearLevel" value={formData.yearLevel} onChange={handleChange} required>
              <option value="">-- Select Year Level --</option>
              {[1, 2, 3, 4, 5].map(level => (
                <option key={level} value={level}>{level}</option>
              ))}
            </select>
          </label>

          <div className="popup-actions">
            <button type="submit" className="btn btn-success">Add</button>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}