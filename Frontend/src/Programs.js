import React, { useState } from "react";
import { ReactComponent as SearchIcon } from "./assests/search-svgrepo-com.svg";
import ActionButtons from "./ActionButtons";
import AddProgram from "./AddProgram";

// Generate programs
const programs = Array.from({ length: 100 }, (_, i) => ({
  code: `P${String(i + 1).padStart(3, "0")}`,
  name: `Program ${i + 1}`,
  college: `College ${((i % 50) + 1)}`,
}));

// Colleges Component
const colleges = Array.from({ length: 50 }, (_, i) => ({
  code: `C${String(i + 1).padStart(3, "0")}`,
  name: `College ${i + 1}`,
}));


function Programs() {
  const handleEdit = (college) => {
    console.log("Edit college:", college);
  };
  const handleDelete = (college) => {
    console.log("Delete college:", college);
  };
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [programsList, setProgramsList] = useState(programs);
  const [showAddPopup, setShowAddPopup] = useState(false);

  const handleAddProgarm = (newProgram) => {
    setProgramsList((prev) => [...prev, newProgram]);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrograms = programsList.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(programsList.length / itemsPerPage);

  return (
    <div className="content">
      <div className="content-header">
        <h2>Programs</h2>
        <div className="search-container">
          <input type="text" className="search-bar" placeholder="Search" />
          <SearchIcon className="search-icon"/>
        </div>
        <button className="btn btn-primary add-program-btn" onClick={() => setShowAddPopup(true)}>
          + Add Program
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Program Code</th>
              <th>Program Name</th>
              <th>College</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedPrograms.map((program) => (
              <tr key={program.code}>
                <td>{program.code}</td>
                <td>{program.name}</td>
                <td>{program.college}</td>
                <td>
                  <ActionButtons
                    item={program}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="pagination">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
            Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage((p) => p + 1)}>
            Next
          </button>
        </div>
      </div>
      {showAddPopup && (
        <AddProgram
          colleges={colleges}
          onAdd={handleAddProgarm}
          onClose={() => setShowAddPopup(false)}
        />
      )}
    </div>
  );
}

export default Programs;
