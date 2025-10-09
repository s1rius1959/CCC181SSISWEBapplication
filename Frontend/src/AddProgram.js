import React, { useState, useEffect } from "react";

export default function AddProgram({ onAdd, onClose, colleges }) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    college: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Auto-capitalize program code
    if (name === "code") {
      setFormData(prev => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Program Code validation
    if (!formData.code.trim()) {
      newErrors.code = "Program code is required";
    } else if (formData.code.length < 2) {
      newErrors.code = "Program code must be at least 2 characters";
    }

    // Program Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Program name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Program name must be at least 3 characters";
    }

    // College validation
    if (!formData.college) {
      newErrors.college = "Please select a college";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onAdd(formData);
      // Reset form after successful submission
      setFormData({
        code: "",
        name: "",
        college: "",
      });
      setErrors({});
    } catch (error) {
      console.error("Error adding program:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      code: "",
      name: "",
      college: "",
    });
    setErrors({});
  };

  return (
    <div className="add-student-overlay">
      <div className="add-student-modal">
        <div className="add-student-header">
          <h3>Add New Program</h3>
        </div>

        <form onSubmit={handleSubmit} className="add-student-form">
          {/* Program Code */}
          <div className="form-group">
            <label className="form-label">
              Program Code <span className="required">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., BSCS"
              className={`form-input ${errors.code ? 'error' : ''}`}
              maxLength="10"
            />
            {errors.code && (
              <p className="error-message">{errors.code}</p>
            )}
            <small className="input-hint">Letters will be automatically capitalized</small>
          </div>

          {/* Program Name */}
          <div className="form-group">
            <label className="form-label">
              Program Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Bachelor of Science in Computer Science"
              className={`form-input ${errors.name ? 'error' : ''}`}
            />
            {errors.name && (
              <p className="error-message">{errors.name}</p>
            )}
          </div>

          {/* College */}
          <div className="form-group">
            <label className="form-label">
              College <span className="required">*</span>
            </label>
            <select
              name="college"
              value={formData.college}
              onChange={handleChange}
              className={`form-input ${errors.college ? 'error' : ''}`}
            >
              <option value="">-- Select College --</option>
              {colleges.map((college) => (
                <option key={college.code} value={college.code}>
                  {college.code} - {college.name}
                </option>
              ))}
            </select>
            {errors.college && (
              <p className="error-message">{errors.college}</p>
            )}
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
                  <span>✓</span> Add Program
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