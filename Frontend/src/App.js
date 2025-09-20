import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Students from "./Students";
import Colleges from "./Colleges";
import Programs from "./Programs";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <Routes>
            <Route path="/" element={<Navigate to="/students" />} />
            <Route path="/students" element={<Students />} />
            <Route path="/colleges" element={<Colleges />} />
            <Route path="/programs" element={<Programs />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
