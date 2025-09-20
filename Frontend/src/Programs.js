import React from "react";

function Programs() {
  const programs = []; // placeholder

  return (
    <div className="content">
      <div className="content-header">
        <h2>Programs</h2>
        <button className="btn-primary">+ Add Program</button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Program Code</th>
              <th>Program Name</th>
              <th>College</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {programs.length > 0 ? (
              programs.map((program, index) => (
                <tr key={index}>
                  <td>{program.code}</td>
                  <td>{program.name}</td>
                  <td>{program.college}</td>
                  <td>
                    <button className="btn-edit">Edit</button>
                    <button className="btn-delete">Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>
                  No program data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Programs;
