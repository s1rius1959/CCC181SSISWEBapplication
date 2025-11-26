import React, { useState } from "react";

export default function AddCollege({ onAdd, onClose }) {
  const [formData, setFormData] = useState({
    code: "",
    name: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Auto-capitalize college code
    if (name === "code") {
      setFormData((prev) => ({ ...prev, [name]: value.toUpperCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // College Code validation
    if (!formData.code.trim()) {
      newErrors.code = "College code is required";
    } else if (formData.code.length < 2) {
      newErrors.code = "College code must be at least 2 characters";
    }

    // College Name validation
    if (!formData.name.trim()) {
      newErrors.name = "College name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "College name must be at least 3 characters";
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
      });
      setErrors({});
    } catch (error) {
      console.error("Error adding college:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      code: "",
      name: "",
    });
    setErrors({});
  };

  return (
    <div className="add-student-overlay">
      <div className="add-student-modal">
        <div className="add-student-header">
          <h3>Add New College</h3>
        </div>

        <form onSubmit={handleSubmit} className="add-student-form">
          {/* College Code */}
          <div className="form-group">
            <label className="form-label">
              College Code <span className="required">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              placeholder="e.g., CCS"
              className={`form-input ${errors.code ? "error" : ""}`}
              maxLength="10"
            />
            <div className="note-area">
              {errors.code ? (
                <p className="note error-note">{errors.code}</p>
              ) : (
                <p className="note hint-note">
                  Letters will be automatically capitalized
                </p>
              )}
            </div>
          </div>

          {/* College Name */}
          <div className="form-group">
            <label className="form-label">
              College Name <span className="required">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., College of Computer Studies"
              className={`form-input ${errors.name ? "error" : ""}`}
            />
            <div className="note-area">
              {errors.name ? (
                <p className="note error-note">{errors.name}</p>
              ) : (
                <p className="note hint-note">
                  Enter the full official college name
                </p>
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
                  <span>✓</span> Add College
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
