import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logoutIcon from "./assests/logout.png";
import profilePlaceholder from "./assests/Profile.png";

function Sidebar() {
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    fetchProfileImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfileImage = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:5000/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setProfileImage(data.profile_image_url);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">Class.io</div>

      <ul className="sidebar-menu">
        <li>
          <NavLink to="/students" className={({ isActive }) => (isActive ? "active" : "")}>
            Students
          </NavLink>
        </li>
        <li>
          <NavLink to="/colleges" className={({ isActive }) => (isActive ? "active" : "")}>
            Colleges
          </NavLink>
        </li>
        <li>
          <NavLink to="/programs" className={({ isActive }) => (isActive ? "active" : "")}>
            Programs
          </NavLink>
        </li>
      </ul>

      {/* Profile Icon at Bottom */}
      <div className="sidebar-profile-bottom">
        <img
          src={logoutIcon}
          alt="Logout"
          className="logout-icon"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
          }}
          title="Logout"
        />
        <NavLink to="/profile" className="profile-icon-link" title="Profile">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="sidebar-profile-icon" />
          ) : (
            <img src={profilePlaceholder} alt="Profile" className="sidebar-profile-icon" />
          )}
        </NavLink>
      </div>
    </div>
  );
}

export default Sidebar;
