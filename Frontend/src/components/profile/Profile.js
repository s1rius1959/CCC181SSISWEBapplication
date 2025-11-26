import React, { useState, useEffect } from "react";
import ProfileUpload from "./ProfileUpload";

function Profile() {
  const [userEmail, setUserEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const email = localStorage.getItem("user");
    setUserEmail(email);
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfileImageUrl(data.profile_image_url);
        setFirstName(data.first_name || "");
        setLastName(data.last_name || "");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (newImageUrl) => {
    setProfileImageUrl(newImageUrl);
    // Refresh sidebar
    window.dispatchEvent(new Event("profileUpdated"));
  };

  return (
    <div className="content">
      <div className="content-header">
        <h2>My Profile</h2>
      </div>

      <div className="profile-container">
        {loading ? (
          <p>Loading...</p>
        ) : (
          <>
            <div className="profile-info">
              <h3>Account Information</h3>
              <p><strong>Name:</strong> {firstName} {lastName}</p>
              <p><strong>Email:</strong> {userEmail}</p>
            </div>

            <div className="profile-image-section">
              <h3>Profile Picture</h3>
              <ProfileUpload
                userEmail={userEmail}
                currentImageUrl={profileImageUrl}
                onUploadSuccess={handleUploadSuccess}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Profile;
