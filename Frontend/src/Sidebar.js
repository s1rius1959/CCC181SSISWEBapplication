import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">Class.io</div>
      <ul className="sidebar-menu">
        <li>
          <NavLink 
            to="/students" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Students
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/colleges" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Colleges
          </NavLink>
        </li>
        <li>
          <NavLink 
            to="/programs" 
            className={({ isActive }) => (isActive ? "active" : "")}
          >
            Programs
          </NavLink>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
