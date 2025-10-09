import React, { useState, useEffect } from "react";
import { ReactComponent as SearchIcon } from "./assests/search-svgrepo-com.svg";
import ActionButtons from "./ActionButtons";
import AddCollege from "./AddCollege";
import SortButtons from "./SortButtons";
import Notification from "./Notifications";

const API_URL = "http://localhost:5000/api";

function Colleges() {
  const [colleges, setColleges] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [notification, setNotification] = useState(null);
  const itemsPerPage = 10;

  // Show notification helper
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const closeNotification = () => setNotification(null);

  // Fetch colleges
  useEffect(() => {
    fetchColleges();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      fetchColleges(sortOrder, false, searchQuery);
    }, 300);
    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [searchQuery]);

  const fetchColleges = async (sortOrder = "default", showLoading = true, search = "") => {
    try {
      if (showLoading) setLoading(true);

      let url = `${API_URL}/colleges`;
      const params = new URLSearchParams();

      if (sortOrder !== "default") params.append("sort", sortOrder);
      if (search.trim()) params.append("search", search.trim());

      const queryString = params.toString();
      if (queryString) url += `?${queryString}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch colleges");
      const data = await response.json();
      setColleges(data);
      setError(null);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching colleges:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchSingleCollege = async (collegeCode) => {
    try {
      const response = await fetch(`${API_URL}/colleges/${collegeCode}`);
      if (!response.ok) throw new Error("Failed to fetch college");
      const data = await response.json();
      return data;
    } catch (err) {
      console.error("Error fetching single college:", err);
      throw err;
    }
  };

  const handleAddCollege = async (newCollege) => {
    try {
      const response = await fetch(`${API_URL}/colleges`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCollege),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add college");
      }

      await fetchColleges(sortOrder, false, searchQuery);
      setShowAddPopup(false);
      showNotification("College Added Successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
      console.error("Error adding college:", err);
    }
  };

  // ✅ FIXED: handleEdit now takes both editedCollege and oldCode
  const handleEdit = async (editedCollege, oldCode) => {
    try {
      const response = await fetch(`${API_URL}/colleges/${oldCode}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editedCollege),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update college");
      }

      await fetchColleges(sortOrder, false, searchQuery);
      showNotification("College Updated Successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
      console.error("Error updating college:", err);
    }
  };

  const handleDelete = async (college) => {
    try {
      const response = await fetch(`${API_URL}/colleges/${college.code}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete college");
      }

      await fetchColleges(sortOrder, false, searchQuery);
      showNotification("College Deleted Successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
      console.error("Error deleting college:", err);
    }
  };

  const handleSort = (order) => {
    setSortOrder(order);
    fetchColleges(order, false, searchQuery);
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedColleges = colleges.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(colleges.length / itemsPerPage);

  if (loading) {
    return (
      <div className="content">
        <h2>Loading colleges...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <h2>Error: {error}</h2>
        <button onClick={() => fetchColleges()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="content">
      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={closeNotification}
        />
      )}

      <div className="content-header">
        <h2>Colleges</h2>
        <div className="search-container">
          <input
            type="text"
            className="search-bar"
            placeholder="Search colleges..."
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <SearchIcon className="search-icon" />
        </div>
        <button className="btn btn-success add-college-btn" onClick={() => setShowAddPopup(true)}>
          + Add College
        </button>
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
            {paginatedColleges.length > 0 ? (
              paginatedColleges.map((college) => (
                <tr key={college.code}>
                  <td>{college.code}</td>
                  <td>{college.name}</td>
                  <td>
                    {/* ✅ Send old code to onEdit */}
                    <ActionButtons
                      item={college}
                      onEdit={(editedCollege) => handleEdit(editedCollege, college.code)}
                      onDelete={handleDelete}
                      onFetchSingle={fetchSingleCollege}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center", padding: "20px" }}>
                  {searchQuery
                    ? `No colleges found matching "${searchQuery}"`
                    : "No colleges found"}
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="pagination">
          <SortButtons onSort={handleSort} currentSort={sortOrder} />

          <span>
            Page {totalPages > 0 ? currentPage : 0} of {totalPages}
            {searchQuery &&
              colleges.length > 0 &&
              ` (${colleges.length} result${colleges.length !== 1 ? "s" : ""})`}
          </span>

          <div className="pagination-nav">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage((p) => p - 1)}>
              Prev
            </button>
            <button
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {showAddPopup && (
        <AddCollege onClose={() => setShowAddPopup(false)} onAdd={handleAddCollege} />
      )}
    </div>
  );
}

export default Colleges;
