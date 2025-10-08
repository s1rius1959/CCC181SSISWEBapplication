import React from "react";

export default function SortButtons({ onSort, currentSort }) {
  return (
    <div className="sort-buttons">
      <button 
        className={`btn btn-sort ${currentSort === 'asc' ? 'active' : ''}`}
        onClick={() => onSort('asc')}
        title="Sort Ascending (A-Z)"
      >
        ↑ A-Z
      </button>
      <button 
        className={`btn btn-sort ${currentSort === 'desc' ? 'active' : ''}`}
        onClick={() => onSort('desc')}
        title="Sort Descending (Z-A)"
      >
        ↓ Z-A
      </button>
      <button 
        className={`btn btn-sort-reset ${currentSort === 'default' ? 'active' : ''}`}
        onClick={() => onSort('default')}
        title="Reset to Default Order"
      >
        ⟲ Reset
      </button>
    </div>
  );
}