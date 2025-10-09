import React, { useState, useEffect } from "react";
import { ReactComponent as SearchIcon } from "./assests/search-svgrepo-com.svg";
import ActionButtons from "./ActionButtons";
import AddStudent from "./AddStudent";
import SortButtons from "./SortButtons";
import Notification from "./Notifications";

const API_URL = "http://localhost:5000/api";

function Students() {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState('default');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [notification, setNotification] = useState(null);
  const itemsPerPage = 10;

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  // Close notification
  const closeNotification = () => {
    setNotification(null);
  };

  // Fetch students from backend
  useEffect(() => {
    fetchStudents();
    fetchPrograms();
  }, []);

  // Debounced search - wait for user to stop typing
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchStudents(sortOrder, false, searchQuery);
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery]);

  const fetchStudents = async (sortOrder = 'default', showLoading = true, search = '') => {
    try {
      if (showLoading) setLoading(true);
      
      let url = `${API_URL}/students`;
      const params = new URLSearchParams();
      
      if (sortOrder !== 'default') {
        params.append('sort', sortOrder);
      }
      
      if (search.trim()) {
        params.append('search', search.trim());
      }
      
      const queryString = params.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch students");
      const data = await response.json();
      setStudents(data);
      setError(null);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching students:", err);
    } finally {
      if (showLoading) setLoading(false);
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

  const fetchSingleStudent = async (studentId) => {
    try {
      const response = await fetch(`${API_URL}/students/${studentId}`);
      if (!response.ok) throw new Error("Failed to fetch student");
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching single student:", err);
      throw err;
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

      await fetchStudents(sortOrder, false, searchQuery);
      setShowAddPopup(false);
      showNotification("Student Added Successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
      console.error("Error adding student:", err);
      throw err;
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

      await fetchStudents(sortOrder, false, searchQuery);
      showNotification("Student Updated Successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
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

      await fetchStudents(sortOrder, false, searchQuery);
      showNotification("Student Deleted Successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
      console.error("Error deleting student:", err);
    }
  };

  // Handle sorting
  const handleSort = (order) => {
    setSortOrder(order);
    fetchStudents(order, false, searchQuery);
  };

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
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
        <button onClick={() => fetchStudents()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="content">
      {/* Custom Notification */}
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <div className="content-header">
        <h2>Students</h2>
        <div className="search-container">
          <input 
            type="text" 
            className="search-bar" 
            placeholder="Search students..." 
            value={searchQuery}
            onChange={handleSearchChange}
          />
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
            {paginatedStudents.length > 0 ? (
              paginatedStudents.map((student) => (
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
                      onFetchSingle={fetchSingleStudent}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  {searchQuery ? `No students found matching "${searchQuery}"` : 'No students found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        {/* Pagination with Sort Buttons */}
        <div className="pagination">
          <SortButtons onSort={handleSort} currentSort={sortOrder} />
          
          <span>
            Page {totalPages > 0 ? currentPage : 0} of {totalPages}
            {searchQuery && students.length > 0 && ` (${students.length} result${students.length !== 1 ? 's' : ''})`}
          </span>
          
          <div className="pagination-nav">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              Prev
            </button>
            <button disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => p + 1)}>
              Next
            </button>
          </div>
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