import React, { useState, useRef, useEffect } from "react";

function CheckboxFilter({ title, options, selectedValues, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleCheckboxChange = (value) => {
    const newValues = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onChange(newValues);
  };

  const handleSelectAll = () => {
    if (selectedValues.length === options.length) {
      onChange([]);
    } else {
      onChange(options.map((opt) => opt.value));
    }
  };

  const handleClear = () => {
    onChange([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getButtonText = () => {
    if (selectedValues.length === 0) return title;
    if (selectedValues.length === options.length) return `${title} (All)`;
    return `${title} (${selectedValues.length})`;
  };

  return (
    <div className="checkbox-filter-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="filter-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {getButtonText()}
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="filter-dropdown-menu">
          <div className="filter-dropdown-header">
            <button
              type="button"
              className="filter-action-btn"
              onClick={handleSelectAll}
            >
              {selectedValues.length === options.length ? "Deselect All" : "Select All"}
            </button>
            {selectedValues.length > 0 && (
              <button
                type="button"
                className="filter-action-btn clear-btn"
                onClick={handleClear}
              >
                Clear
              </button>
            )}
          </div>
          <div className="filter-checkbox-list">
            {options.map((option) => (
              <label key={option.value} className="filter-checkbox-item">
                <input
                  type="checkbox"
                  checked={selectedValues.includes(option.value)}
                  onChange={() => handleCheckboxChange(option.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default CheckboxFilter;
