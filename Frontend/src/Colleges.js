import React, { useState, useEffect } from "react";
import ActionButtons from "./ActionButtons";
import AddCollege from "./AddCollege";
import Notification from "./Notifications";
import SearchFilter from "./SearchFilter";
import JumpToPage from "./JumptoPage";

const API_URL = "http://localhost:5000/api";

function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");

  const [sortConfig, setSortConfig] = useState({
    key: "college_code",
    direction: "asc",
  });

  const itemsPerPage = 10;

  const filterOptions = [
    { value: "all", label: "All Fields" },
    { value: "code", label: "College Code" },
    { value: "name", label: "College Name" },
  ];

  const showNotification = (message, type = "success") =>
    setNotification({ message, type });
  const closeNotification = () => setNotification(null);

  useEffect(() => {
    fetchColleges(sortConfig.direction, sortConfig.key);
  }, []);

  const fetchColleges = async (sort = "asc", sortBy = "college_code") => {
    try {
      setLoading(true);
      let url = `${API_URL}/colleges?sort=${sort}&sort_by=${sortBy}`;
      if (searchQuery.trim()) {
        url += `&search=${encodeURIComponent(searchQuery.trim())}&search_field=${searchField}`;
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch colleges");
      const data = await response.json();
      setColleges(data);
    } catch (err) {
      console.error("Error fetching colleges:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCollege = async (newCollege) => {
    try {
      const response = await fetch(`${API_URL}/colleges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCollege),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to add college");

      await fetchColleges(sortConfig.direction, sortConfig.key);
      setShowAddPopup(false);
      showNotification("College added successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleEditCollege = async (editedCollege, originalCode) => {
    try {
      const response = await fetch(`${API_URL}/colleges/${originalCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedCollege),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to edit college");

      await fetchColleges(sortConfig.direction, sortConfig.key);
      showNotification("College updated successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleDeleteCollege = async (college) => {
    try {
      const response = await fetch(`${API_URL}/colleges/${college.code}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to delete college");

      await fetchColleges(sortConfig.direction, sortConfig.key);
      showNotification("College deleted successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
    }
  };

  const handleHeaderClick = (columnKey) => {
    let direction = "asc";
    if (sortConfig.key === columnKey && sortConfig.direction === "asc") direction = "desc";
    setSortConfig({ key: columnKey, direction });
    fetchColleges(direction, columnKey);
  };

  const handleResetSort = () => {
    const defaultSort = { key: "college_code", direction: "asc" };
    setSortConfig(defaultSort);
    setSearchQuery("");
    setSearchField("all");
    fetchColleges(defaultSort.direction, defaultSort.key);
  };

  const handleSearch = () => fetchColleges(sortConfig.direction, sortConfig.key);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedColleges = colleges.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(colleges.length / itemsPerPage);

  return (
    <div className="content">
      {notification && <Notification {...notification} onClose={closeNotification} />}
      <div className="content-header">
        <h2>Colleges</h2>
        <div className="search-area">
          <input
            type="text"
            placeholder="Search colleges..."
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
          + Add College
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th onClick={() => handleHeaderClick("college_code")}>
                College Code {sortConfig.key === "college_code" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th onClick={() => handleHeaderClick("college_name")}>
                College Name {sortConfig.key === "college_name" && (sortConfig.direction === "asc" ? "↑" : "↓")}
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="3" style={{ textAlign: "center" }}>Loading...</td></tr>
            ) : paginatedColleges.length > 0 ? (
              paginatedColleges.map((college) => (
                <tr key={college.code}>
                  <td>{college.code}</td>
                  <td>{college.name}</td>
                  <td><ActionButtons item={college} onEdit={handleEditCollege} onDelete={handleDeleteCollege} /></td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="3" style={{ textAlign: "center" }}>No colleges found</td></tr>
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

      {showAddPopup && <AddCollege onAdd={handleAddCollege} onClose={() => setShowAddPopup(false)} />}
    </div>
  );
}

export default Colleges;
