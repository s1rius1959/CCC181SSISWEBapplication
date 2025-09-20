import React from "react";

function Colleges() {
  const colleges = []; // placeholder

  return (
    <div className="content">
      <div className="content-header">
        <h2>Colleges</h2>
        <button className="btn-primary">+ Add College</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>College Code</th>
              <th>College Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {colleges.length > 0 ? (
              colleges.map((college, index) => (
                <tr key={index}>
                  <td>{college.code}</td>
                  <td>{college.name}</td>
                  <td>
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: "center" }}>
                  No college data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Colleges;
