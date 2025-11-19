import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Students from "./Students";
import Colleges from "./Colleges";
import Programs from "./Programs";
import Profile from "./Profile";
import Login from "./Login";
import Signup from "./Signup";
import ProtectedRoute from "./ProtectedRoutes";
import "./App.css";

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
