import React, { useState, useEffect } from "react";
import ActionButtons from "../common/ActionButtons";
import AddProgram from "./AddProgram";
import Notification from "../common/Notifications";
import SearchFilter from "../common/SearchFilter";
import JumpToPage from "../common/JumptoPage";

import { API_URL } from "../../config/api";

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");

  const [sortConfig, setSortConfig] = useState({
    key: "program_code",
    direction: "asc",
  });

  const itemsPerPage = 10;

  const filterOptions = [
    { value: "all", label: "All Fields" },
    { value: "code", label: "Program Code" },
    { value: "name", label: "Program Name" },
    { value: "collegeCode", label: "College Code" },
  ];

  const showNotification = (message, type = "success") =>
    setNotification({ message, type });
  const closeNotification = () => setNotification(null);

  useEffect(() => {
    fetchPrograms(sortConfig.direction, sortConfig.key);
    fetchColleges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPrograms = async (sort = "asc", sortBy = "program_code") => {
    try {
      setLoading(true);
      let url = `${API_URL}/programs?sort=${sort}&sort_by=${sortBy}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}&search_field=${searchField}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch programs");
      const data = await response.json();
      setPrograms(data);
    } catch (err) {
      console.error("Error fetching programs:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await fetch(`${API_URL}/colleges`);
      const data = await response.json();
      setColleges(data);
    } catch (err) {
      console.error("Error fetching colleges:", err);
    }
  };

  const handleAddProgram = async (newProgram) => {
    try {
      const response = await fetch(`${API_URL}/programs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newProgram),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add program");

      await fetchPrograms(sortConfig.direction, sortConfig.key);
      setShowAddPopup(false);
      showNotification("Program added successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleEditProgram = async (editedProgram, originalCode) => {
    try {
      const response = await fetch(`${API_URL}/programs/${originalCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedProgram),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to edit program");

      await fetchPrograms(sortConfig.direction, sortConfig.key);
      showNotification("Program updated successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleDeleteProgram = async (program) => {
    try {
      const response = await fetch(`${API_URL}/programs/${program.code}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete program");

      await fetchPrograms(sortConfig.direction, sortConfig.key);
      showNotification("Program deleted successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleHeaderClick = (columnKey) => {
    let direction = "asc";
    if (sortConfig.key === columnKey && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key: columnKey, direction });
    fetchPrograms(direction, columnKey);
  };

  const handleResetSort = () => {
    const defaultSort = { key: "program_code", direction: "asc" };
    setSortConfig(defaultSort);
    setSearchQuery("");
    setSearchField("all");
    fetchPrograms(defaultSort.direction, defaultSort.key);
  };

  const handleSearch = () => fetchPrograms(sortConfig.direction, sortConfig.key);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrograms = programs.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(programs.length / itemsPerPage);

  return (
    <div className="content">
      {notification && <Notification {...notification} onClose={closeNotification} />}
      <div className="content-header">
        <h2>Programs</h2>
        <div className="search-area">
          <input
            type="text"
            placeholder="Search programs..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <SearchFilter
            currentFilter={searchField}
            onFilterChange={(val) => setSearchField(val)}
            filterOptions={filterOptions}
          />
          <button className="btn search-btn" onClick={handleSearch}>Search</button>
          <button className="btn btn-sort-reset" onClick={handleResetSort}>⟲ Reset</button>
        </div>
        <button className="btn btn-success add-student-btn" onClick={() => setShowAddPopup(true)}>
          + Add Program
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleHeaderClick("program_code")}>
                Program Code {sortConfig.key === "program_code" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleHeaderClick("program_name")}>
                Program Name {sortConfig.key === "program_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleHeaderClick("college_code")}>
                College Code {sortConfig.key === "college_code" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" style={{ textAlign: "center" }}>Loading...</td></tr>
            ) : paginatedPrograms.length > 0 ? (
              paginatedPrograms.map((program) => (
                <tr key={program.code}>
                  <td>{program.code}</td>
                  <td>{program.name}</td>
                  <td>{program.collegeCode}</td>
                  <td>
                    <ActionButtons
                      item={program}
                      onEdit={handleEditProgram}
                      onDelete={handleDeleteProgram}
                      colleges={colleges}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" style={{ textAlign: "center" }}>No programs found</td></tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          <span className="page-info">Page {totalPages > 0 ? currentPage : 0} of {totalPages}</span>
          <JumpToPage currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          <div className="pagination-nav">
            <button className="btn" disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>Prev</button>
            <button className="btn" disabled={currentPage === totalPages || totalPages === 0} onClick={() => setCurrentPage((p) => p + 1)}>Next</button>
          </div>
        </div>
      </div>

      {showAddPopup && <AddProgram onAdd={handleAddProgram} onClose={() => setShowAddPopup(false)} colleges={colleges} />}
    </div>
  );
}

export default Programs;
