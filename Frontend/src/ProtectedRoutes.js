import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) {
      setIsValid(false);
      return;
    }
    axios.get("http://localhost:5000/api/auth/verify", {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => setIsValid(true))
      .catch(() => {
        localStorage.removeItem("token");
        alert("Your session has expired, please log in again.");
        setIsValid(false);
      });
  }, [token]);

  if (isValid === null) return <div>Loading...</div>;
  return isValid ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
