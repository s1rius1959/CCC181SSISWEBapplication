import React, { useState } from "react";

export default function JumpToPage({ currentPage, totalPages, onPageChange }) {
  const [inputValue, setInputValue] = useState("");
  const [showError, setShowError] = useState(false);

  const handleInputChange = (e) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === "" || /^\d+$/.test(value)) {
      setInputValue(value);
      setShowError(false);
    }
  };

  const handleJump = () => {
    const pageNumber = parseInt(inputValue, 10);

    if (!inputValue || isNaN(pageNumber)) {
      setShowError(true);
      return;
    }

    if (pageNumber < 1 || pageNumber > totalPages) {
      setShowError(true);
      return;
    }

    onPageChange(pageNumber);
    setInputValue("");
    setShowError(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleJump();
    }
  };

  return (
    <div className="jump-to-page">
      <span className="jump-label">Jump to:</span>
      <input
        type="text"
        className={`jump-input ${showError ? "jump-input-error" : ""}`}
        placeholder="#"
        value={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        maxLength={totalPages.toString().length}
        disabled={totalPages === 0}
      />
      <button
        className="btn jump-btn"
        onClick={handleJump}
        disabled={totalPages === 0}
      >
        Go
      </button>
      {showError && (
        <span className="jump-error">Enter 1-{totalPages}</span>
      )}
    </div>
  );
}