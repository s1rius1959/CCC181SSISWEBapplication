import React, { useState } from "react";
import StudentImageUpload from "./StudentImageUpload";

export default function AddStudent({ programs, onAdd, onClose }) {
  const [formData, setFormData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    gender: "",
    course: "",
    yearLevel: "",
    profileImage: null,
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStudentIdFormat = (id) => {
    // Format: YYYY-NNNN (e.g., 2024-0001)
    const regex = /^\d{4}-\d{4}$/;
    return regex.test(id);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear field-specific error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Auto-format Student ID
    if (name === "id") {
      let formatted = value.replace(/[^\d-]/g, ""); // Remove non-digits and dashes
      if (formatted.length === 4 && !formatted.includes("-")) {
        formatted += "-";
      }
      if (formatted.length > 9) {
        formatted = formatted.slice(0, 9);
      }
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Student ID
    if (!formData.id.trim()) {
      newErrors.id = "Student ID is required";
    } else if (!validateStudentIdFormat(formData.id)) {
      newErrors.id = "Student ID must be in format YYYY-NNNN (e.g., 2024-0001)";
    }

    // First Name
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    }

    // Last Name
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    }

    // Gender
    if (!formData.gender) {
      newErrors.gender = "Please select a gender";
    }

    // Program
    if (!formData.course) {
      newErrors.course = "Please select a program";
    }

    // Year Level
    if (!formData.yearLevel) {
      newErrors.yearLevel = "Please select a year level";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await onAdd(formData);
      // Reset form
      setFormData({
        id: "",
        firstName: "",
        lastName: "",
        gender: "",
        course: "",
        yearLevel: "",
        profileImage: null,
      });
      setErrors({});
    } catch (error) {
      console.error("Error adding student:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      id: "",
      firstName: "",
      lastName: "",
      gender: "",
      course: "",
      yearLevel: "",
      profileImage: null,
    });
    setErrors({});
  };

  return (
    <div className="add-student-overlay">
      <div className="add-student-modal">
        <div className="add-student-header">
          <h3>Add New Student</h3>
        </div>

        <form onSubmit={handleSubmit} className="add-student-form">
          {/* Profile Image Upload */}
          <div className="form-group">
            <label className="form-label">Profile Picture</label>
            <StudentImageUpload 
              studentId={formData.id || "temp"}
              currentImageUrl={formData.profileImage}
              onUploadSuccess={(url) => setFormData(prev => ({ ...prev, profileImage: url }))}
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
              value={formData.id}
              onChange={handleChange}
              placeholder="2024-0001"
              className={`form-input ${errors.id ? "error" : ""}`}
              maxLength="9"
            />
            <div className="note-area">
              {errors.id ? (
                <p className="note error-note">{errors.id}</p>
              ) : (
                <p className="note hint-note">
                  Format: YYYY-NNNN (e.g., 2024-0001)
                </p>
              )}
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
              value={formData.firstName}
              onChange={handleChange}
              placeholder="Enter first name"
              className={`form-input ${errors.firstName ? "error" : ""}`}
            />
            <div className="note-area">
              {errors.firstName ? (
                <p className="note error-note">{errors.firstName}</p>
              ) : (
                <p className="note hint-note">Enter the student's given name</p>
              )}
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
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Enter last name"
              className={`form-input ${errors.lastName ? "error" : ""}`}
            />
            <div className="note-area">
              {errors.lastName ? (
                <p className="note error-note">{errors.lastName}</p>
              ) : (
                <p className="note hint-note">Enter the student's surname</p>
              )}
            </div>
          </div>

          {/* Gender */}
          <div className="form-group">
            <label className="form-label">
              Gender <span className="required">*</span>
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`form-input ${errors.gender ? "error" : ""}`}
            >
              <option value="">-- Select Gender --</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="Others">Others</option>
            </select>
            <div className="note-area">
              {errors.gender ? (
                <p className="note error-note">{errors.gender}</p>
              ) : (
                <p className="note hint-note">Choose the student's gender</p>
              )}
            </div>
          </div>

          {/* Program */}
          <div className="form-group">
            <label className="form-label">
              Program <span className="required">*</span>
            </label>
            <select
              name="course"
              value={formData.course}
              onChange={handleChange}
              className={`form-input ${errors.course ? "error" : ""}`}
            >
              <option value="">-- Select Program --</option>
              {programs.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.code} - {p.name}
                </option>
              ))}
            </select>
            <div className="note-area">
              {errors.course ? (
                <p className="note error-note">{errors.course}</p>
              ) : (
                <p className="note hint-note">
                  Select the program the student is enrolled in
                </p>
              )}
            </div>
          </div>

          {/* Year Level */}
          <div className="form-group">
            <label className="form-label">
              Year Level <span className="required">*</span>
            </label>
            <select
              name="yearLevel"
              value={formData.yearLevel}
              onChange={handleChange}
              className={`form-input ${errors.yearLevel ? "error" : ""}`}
            >
              <option value="">-- Select Year Level --</option>
              {[1, 2, 3, 4, 5].map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
            <div className="note-area">
              {errors.yearLevel ? (
                <p className="note error-note">{errors.yearLevel}</p>
              ) : (
                <p className="note hint-note">Choose the student's year level</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-submit"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span>
                  Adding...
                </>
              ) : (
                <>
                  <span>✓</span> Add Student
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleReset}
              disabled={isSubmitting}
              className="btn btn-reset"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="btn btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
