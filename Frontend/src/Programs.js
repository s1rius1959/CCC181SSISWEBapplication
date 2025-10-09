import React, { useState, useEffect } from "react";
import { ReactComponent as SearchIcon } from "./assests/search-svgrepo-com.svg";
import ActionButtons from "./ActionButtons";
import AddProgram from "./AddProgram";
import SortButtons from "./SortButtons";
import Notification from "./Notifications";

const API_URL = "http://localhost:5000/api";

function Programs() {
  const [programs, setPrograms] = useState([]);
  const [colleges, setColleges] = useState([]);
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

  const closeNotification = () => setNotification(null);

  // Fetch programs and colleges from backend
  useEffect(() => {
    fetchPrograms();
    fetchColleges();
  }, []);

  // Debounced search
  useEffect(() => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    const timeout = setTimeout(() => {
      fetchPrograms(sortOrder, false, searchQuery);
    }, 300);

    setSearchTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [searchQuery]);

  const fetchPrograms = async (sortOrder = 'default', showLoading = true, search = '') => {
    try {
      if (showLoading) setLoading(true);
      
      let url = `${API_URL}/programs`;
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
      if (!response.ok) throw new Error("Failed to fetch programs");
      const data = await response.json();
      setPrograms(data);
      setError(null);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching programs:", err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchColleges = async () => {
    try {
      const response = await fetch(`${API_URL}/colleges`);
      if (!response.ok) throw new Error("Failed to fetch colleges");
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
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newProgram),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add program");
      }

      await fetchPrograms(sortOrder, false, searchQuery);
      setShowAddPopup(false);
      showNotification("Program Added Successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
      console.error("Error adding program:", err);
    }
  };

  const handleEdit = async (editedProgram, oldCode) => {
    try {
      const response = await fetch(`${API_URL}/programs/${oldCode}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editedProgram),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update program");
      }

      await fetchPrograms(sortOrder, false, searchQuery);
      showNotification("Program Updated Successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
      console.error("Error updating program:", err);
    }
  };

  const handleDelete = async (program) => {
    try {
      const response = await fetch(`${API_URL}/programs/${program.code}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete program");
      }

      await fetchPrograms(sortOrder, false, searchQuery);
      showNotification("Program Deleted Successfully!", "success");
    } catch (err) {
      showNotification(err.message, "error");
      console.error("Error deleting program:", err);
    }
  };

  const handleSort = (order) => {
    setSortOrder(order);
    fetchPrograms(order, false, searchQuery);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPrograms = programs.slice(startIndex, startIndex + itemsPerPage);
  const totalPages = Math.ceil(programs.length / itemsPerPage);

  if (loading) {
    return (
      <div className="content">
        <h2>Loading programs...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="content">
        <h2>Error: {error}</h2>
        <button onClick={() => fetchPrograms()}>Retry</button>
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
        <h2>Programs</h2>
        <div className="search-container">
          <input 
            type="text" 
            className="search-bar" 
            placeholder="Search programs..." 
            value={searchQuery}
            onChange={handleSearchChange}
          />
          <SearchIcon className="search-icon" />
        </div>
        <button 
          className="btn btn-success add-program-btn" 
          onClick={() => setShowAddPopup(true)}
        >
          + Add Program
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Program Code</th>
              <th>Program Name</th>
              <th>College Code</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {paginatedPrograms.length > 0 ? (
              paginatedPrograms.map((program) => (
                <tr key={program.code}>
                  <td>{program.code}</td>
                  <td>{program.name}</td>
                  <td>{program.collegeCode}</td>
                  <td>
                    <ActionButtons
                      item={program}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      colleges={colleges}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                  {searchQuery ? `No programs found matching "${searchQuery}"` : 'No programs found'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        
        <div className="pagination">
          <SortButtons onSort={handleSort} currentSort={sortOrder} />
          
          <span>
            Page {totalPages > 0 ? currentPage : 0} of {totalPages}
            {searchQuery && programs.length > 0 && ` (${programs.length} result${programs.length !== 1 ? 's' : ''})`}
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
        <AddProgram
          onClose={() => setShowAddPopup(false)}
          onAdd={handleAddProgram}
          colleges={colleges}
        />
      )}
    </div>
  );
}

export default Programs;