import React, { useState } from "react";
import { ReactComponent as SearchIcon } from "./assests/search-svgrepo-com.svg";
import ActionButtons from "./ActionButtons";

// Utility: generate ID
function generateId(year, index) {
  return `S${year}${String(index).padStart(4, "0")}`;
}

// Sample courses
const programs = ["BSCS", "BSIT", "BSECE", "BSME", "BSCE"];

// Generate student data
const initialstudents = Array.from({ length: 200 }, (_, i) => {
  const year = 2023 + (i % 3);
  const course = programs[i % programs.length];
  const yearLevel = (i % 4) + 1;

  return {
    id: generateId(year, i + 1),
    firstName: `First${i + 1}`,
    lastName: `Last${i + 1}`,
    course,
    yearLevel,
  };
});

function Students() {
  const [students, setStudents] = useState(initialstudents);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = students.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  // Edit Ps. Functional but not yet in Database
  const handleEdit = (editedStudent) => {
    setStudents(prev =>
      prev.map(s => (s.id === editedStudent.id ? editedStudent : s))
    )
  }

  // Delete Ps. Functional but not yet in Database
  const handleDelete = (student) => {
    setStudents(prev => prev.filter(s => s.id !== student.id))
  }

  // Main Content 
  return (
    <div className="content">
      <div className="content-header">
        <h2>Students</h2>
        <div className="search-container">
          <input type="text" className="search-bar" placeholder="Search" />
          <SearchIcon className="search-icon"/>
        </div>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Course</th>
              <th>Year Level</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedStudents.map((student) => (
              <tr key={student.id}>
                <td>{student.id}</td>
                <td>{student.firstName}</td>
                <td>{student.lastName}</td>
                <td>{student.course}</td>
                <td>{student.yearLevel}</td>
                <td>
                  <ActionButtons
                    item={student}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    programs={programs}
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

export default Students;
