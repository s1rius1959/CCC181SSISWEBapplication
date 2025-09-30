import React, { useState, useEffect } from "react";
import { ReactComponent as SearchIcon } from "./assests/search-svgrepo-com.svg";
import ActionButtons from "./ActionButtons";
import AddStudent from "./AddStudent";

const API_URL = "http://localhost:5000/api";

function Students() {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const itemsPerPage = 10;

  // Fetch students from backend
  useEffect(() => {
    fetchStudents();
    fetchPrograms();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/students`);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching students:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const response = await fetch(`${API_URL}/programs`);
      if (!response.ok) throw new Error("Failed to fetch programs");
      const data = await response.json();
      setPrograms(data);
    } catch (err) {
      console.error("Error fetching programs:", err);
    }
  };

  const handleAddStudent = async (newStudent) => {
    try {
      const response = await fetch(`${API_URL}/students`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStudent),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add student");
      }

      // Refresh students list
      await fetchStudents();
      setShowAddPopup(false);
      alert("Student added successfully!");
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error("Error adding student:", err);
    }
  };

  const handleEdit = async (editedStudent) => {
    try {
      const response = await fetch(`${API_URL}/students/${editedStudent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedStudent),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update student");
      }

      // Refresh students list
      await fetchStudents();
      alert("Student updated successfully!");
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error("Error updating student:", err);
    }
  };

  const handleDelete = async (student) => {
    try {
      const response = await fetch(`${API_URL}/students/${student.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete student");
      }

      // Refresh students list
      await fetchStudents();
      alert("Student deleted successfully!");
    } catch (err) {
      alert(`Error: ${err.message}`);
      console.error("Error deleting student:", err);
    }
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = students.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  if (loading) {
    return (
      <div className="content">
        <h2>Loading students...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <h2>Error: {error}</h2>
        <button onClick={fetchStudents}>Retry</button>
      </div>
    );
  }

  return (
    <div className="content">
      <div className="content-header">
        <h2>Students</h2>
        <div className="search-container">
          <input type="text" className="search-bar" placeholder="Search" />
          <SearchIcon className="search-icon"/>
        </div>
        <button className="btn btn-success add-student-btn" onClick={() => setShowAddPopup(true)}>
          + Add Student
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Gender</th>
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
                <td>{student.gender}</td>
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

      {showAddPopup && (
        <AddStudent
          onClose={() => setShowAddPopup(false)}
          onAdd={handleAddStudent}
          programs={programs}
        />
      )}
    </div>
  );
}

export default Students;