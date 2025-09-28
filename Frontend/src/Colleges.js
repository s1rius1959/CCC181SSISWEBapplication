import React, { useState } from "react";
import { ReactComponent as SearchIcon } from "./assests/search-svgrepo-com.svg";
import ActionButtons from "./ActionButtons";

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

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedColleges = colleges.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(colleges.length / itemsPerPage);

  return (
    <div className="content">
      <div className="content-header">
        <h2>Colleges</h2>
        <div className="search-container">
          <input type="text" className="search-bar" placeholder="Search" />
          <SearchIcon className="search-icon"/>
        </div>
      </div>

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
    </div>
  );
}

export default Colleges;
