import React, { useState, useEffect } from "react";
import ActionButtons from "./ActionButtons";
import AddStudent from "./AddStudent";
import Notification from "./Notifications";
import SearchFilter from "./SearchFilter";
import JumpToPage from "./JumptoPage";

const API_URL = "http://localhost:5000/api";

function Students() {
  const [students, setStudents] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");

  const [sortConfig, setSortConfig] = useState({
    key: "id",
    direction: "asc",
  });

  const itemsPerPage = 10;

  const filterOptions = [
    { value: "all", label: "All Fields" },
    { value: "id", label: "Student ID" },
    { value: "first_name", label: "First Name" },
    { value: "last_name", label: "Last Name" },
    { value: "gender", label: "Gender" },
    { value: "course", label: "Program" },
    { value: "year_level", label: "Year Level" },
  ];

  const showNotification = (message, type = "success") =>
    setNotification({ message, type });
  const closeNotification = () => setNotification(null);

  useEffect(() => {
    fetchStudents(sortConfig.direction, sortConfig.key);
    fetchPrograms();
  }, []);

  const fetchStudents = async (sort = "asc", sortBy = "id") => {
    try {
      setLoading(true);
      let url = `${API_URL}/students?sort=${sort}&sort_by=${sortBy}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}&search_field=${searchField}`;
      }
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch students");
      const data = await res.json();
      setStudents(data);
    } catch (err) {
      showNotification("Error loading students", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrograms = async () => {
    try {
      const res = await fetch(`${API_URL}/programs`);
      const data = await res.json();
      setPrograms(data);
    } catch (err) {
      console.error("Error fetching programs:", err);
    }
  };

  const handleAddStudent = async (student) => {
    try {
      const res = await fetch(`${API_URL}/students`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to add student");
      await fetchStudents(sortConfig.direction, sortConfig.key);
      showNotification("Student added successfully!");
      setShowAddPopup(false);
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleEdit = async (student) => {
    try {
      const res = await fetch(`${API_URL}/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(student),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to edit student");
      await fetchStudents(sortConfig.direction, sortConfig.key);
      showNotification("Student updated successfully!");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleDelete = async (student) => {
    try {
      const res = await fetch(`${API_URL}/students/${student.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete student");
      await fetchStudents(sortConfig.direction, sortConfig.key);
      showNotification("Student deleted successfully!");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleHeaderClick = (key) => {
    const direction =
      sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
    setSortConfig({ key, direction });
    fetchStudents(direction, key);
  };

  const handleSearch = () => fetchStudents(sortConfig.direction, sortConfig.key);

  const handleReset = () => {
    setSearchQuery("");
    setSearchField("all");
    const defaultSort = { key: "id", direction: "asc" };
    setSortConfig(defaultSort);
    fetchStudents(defaultSort.direction, defaultSort.key);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginated = students.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  return (
    <div className="content">
      {notification && (
        <Notification {...notification} onClose={closeNotification} />
      )}

      <div className="content-header">
        <h2>Students</h2>

        {/* ✅ Search Bar Styled Like Colleges.js */}
        <div className="search-area">
          <input
            type="text"
            placeholder="Search students..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchFilter
            currentFilter={searchField}
            onFilterChange={(val) => setSearchField(val)}
            filterOptions={filterOptions}
          />
          <button className="btn search-btn" onClick={handleSearch}>
            Search
          </button>
          <button className="btn btn-sort-reset" onClick={handleReset}>
            ⟲ Reset
          </button>
        </div>

        <button
          className="btn btn-success add-student-btn"
          onClick={() => setShowAddPopup(true)}
        >
          + Add Student
        </button>
      </div>

      {/* ✅ Table Section */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleHeaderClick("id")}>
                Student ID {sortConfig.key === "id" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleHeaderClick("first_name")}>
                First Name {sortConfig.key === "first_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleHeaderClick("last_name")}>
                Last Name {sortConfig.key === "last_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleHeaderClick("gender")}>
                Gender {sortConfig.key === "gender" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleHeaderClick("course")}>
                Program {sortConfig.key === "course" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleHeaderClick("year_level")}>
                Year Level {sortConfig.key === "year_level" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>Loading...</td>
              </tr>
            ) : paginated.length > 0 ? (
              paginated.map((s) => (
                <tr key={s.id}>
                  <td>{s.id}</td>
                  <td>{s.firstName}</td>
                  <td>{s.lastName}</td>
                  <td>{s.gender}</td>
                  <td>{s.course}</td>
                  <td>{s.yearLevel}</td>
                  <td>
                    <ActionButtons
                      item={s}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      programs={programs}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ✅ Pagination */}
        <div className="pagination">
          <span className="page-info">
            Page {totalPages > 0 ? currentPage : 0} of {totalPages}
          </span>
          <JumpToPage
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
          <div className="pagination-nav">
            <button
              className="btn"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              Prev
            </button>
            <button
              className="btn"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showAddPopup && (
        <AddStudent
          onAdd={handleAddStudent}
          onClose={() => setShowAddPopup(false)}
          programs={programs}
        />
      )}
    </div>
  );
}

export default Students;
