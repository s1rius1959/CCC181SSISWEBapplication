import React, { useState } from "react";
import { ReactComponent as SearchIcon } from "./assests/search-svgrepo-com.svg";
import ActionButtons from "./ActionButtons";
import AddCollege from "./AddCollege";

// Generate colleges
const colleges = Array.from({ length: 50 }, (_, i) => ({
  code: `C${String(i + 1).padStart(3, "0")}`,
  name: `College ${i + 1}`,
}));

function Colleges() {
  const handleEdit = (college) => {
    console.log("Edit college:", college);
  };
  const handleDelete = (college) => {
    console.log("Delete college:", college);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [collegesList, setCollegesList] = useState(colleges);
  const [showAddPopup, setShowAddPopup] = useState(false);

  const handleAddCollege = (newCollege) => {
    setCollegesList((prev) => [...prev, newCollege]);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedColleges = collegesList.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(collegesList.length / itemsPerPage);

  return (
    <div className="content">
      <div className="content-header">
        <h2>Colleges</h2>
        <div className="search-container">
          <input type="text" className="search-bar" placeholder="Search" />
          <SearchIcon className="search-icon" />
        </div>
        <button
          className="btn btn-primary add-college-btn"
          onClick={() => setShowAddPopup(true)}
        >
          + Add College
        </button>
      </div>

      {/* College Table */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>College Code</th>
              <th>College Name</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedColleges.map((college) => (
              <tr key={college.code}>
                <td>{college.code}</td>
                <td>{college.name}</td>
                <td>
                  <ActionButtons
                    item={college}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Prev
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>

      {/* Add College Popup */}
      {showAddPopup && (
        <AddCollege
          onAdd={handleAddCollege}
          onClose={() => setShowAddPopup(false)}
        />
      )}
    </div>
  );
}

export default Colleges;
