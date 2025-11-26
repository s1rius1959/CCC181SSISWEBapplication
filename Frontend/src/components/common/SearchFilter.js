import React from "react";

export default function SearchFilter({ onFilterChange, currentFilter, filterOptions = [] }) {
    return (
      <div className="search-filter">
        <label htmlFor="search-filter" style={{ marginRight: "8px", fontWeight: "500" }}>
          Search by:
        </label>
        <select
          id="search-filter"
          value={currentFilter}
          onChange={(e) => onFilterChange(e.target.value)}
          className="filter-select"
        >
          {filterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    );
  }