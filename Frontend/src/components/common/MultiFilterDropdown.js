import React, { useState, useRef, useEffect } from "react";

function MultiFilterDropdown({ filterGroups, onFiltersChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleCheckboxChange = (groupKey, value) => {
    const group = filterGroups.find((g) => g.key === groupKey);
    const currentValues = group.selectedValues;
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    onFiltersChange(groupKey, newValues);
  };

  const handleSelectAll = (groupKey) => {
    const group = filterGroups.find((g) => g.key === groupKey);
    if (group.selectedValues.length === group.options.length) {
      onFiltersChange(groupKey, []);
    } else {
      onFiltersChange(groupKey, group.options.map((opt) => opt.value));
    }
  };

  const handleClearAll = () => {
    filterGroups.forEach((group) => {
      onFiltersChange(group.key, []);
    });
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

  const getTotalSelectedCount = () => {
    return filterGroups.reduce((total, group) => total + group.selectedValues.length, 0);
  };

  const getButtonText = () => {
    const count = getTotalSelectedCount();
    if (count === 0) return "Filters";
    return `Filters (${count})`;
  };

  return (
    <div className="multi-filter-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="filter-dropdown-btn"
        onClick={() => setIsOpen(!isOpen)}
      >
        {getButtonText()}
        <span className="dropdown-arrow">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="multi-filter-dropdown-menu">
          <div className="multi-filter-header">
            <span className="filter-title">Filter Options</span>
            {getTotalSelectedCount() > 0 && (
              <button
                type="button"
                className="filter-action-btn clear-btn"
                onClick={handleClearAll}
              >
                Clear All
              </button>
            )}
          </div>

          {filterGroups.map((group) => (
            <div key={group.key} className="filter-group">
              <div className="filter-group-header">
                <h4>{group.title}</h4>
                <button
                  type="button"
                  className="filter-action-btn"
                  onClick={() => handleSelectAll(group.key)}
                >
                  {group.selectedValues.length === group.options.length
                    ? "Deselect All"
                    : "Select All"}
                </button>
              </div>
              <div className="filter-checkbox-list">
                {group.options.map((option) => (
                  <label key={option.value} className="filter-checkbox-item">
                    <input
                      type="checkbox"
                      checked={group.selectedValues.includes(option.value)}
                      onChange={() => handleCheckboxChange(group.key, option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MultiFilterDropdown;
