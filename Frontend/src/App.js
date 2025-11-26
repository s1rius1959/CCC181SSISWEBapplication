import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/common/Sidebar";
import Students from "./components/students/Students";
import Colleges from "./components/colleges/Colleges";
import Programs from "./components/programs/Programs";
import Profile from "./components/profile/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ProtectedRoute from "./components/auth/ProtectedRoutes";
import "./styles/App.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <div className="app-container">
                <Sidebar />
                <div className="main-content">
                  <Routes>
                    <Route path="/" element={<Navigate to="/students" />} />
                    <Route path="/students" element={<Students />} />
                    <Route path="/colleges" element={<Colleges />} />
                    <Route path="/programs" element={<Programs />} />
                    <Route path="/profile" element={<Profile />} />
                  </Routes>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
