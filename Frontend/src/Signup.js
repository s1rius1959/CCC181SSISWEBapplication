import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import "./Auth.css";

function Signup() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm_password: "",
  });
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/signup",
        form,
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,   // ✅ REQUIRED for CORS + OPTIONS passing
        }
      );

      setSuccess(res.data.message || "Signup successful! Please login.");
      setTimeout(() => navigate("/login"), 1500);
      
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Create Account</h2>
        <p>Join us today</p>

        <form onSubmit={handleSubmit}>
          
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              title={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          <div className="password-wrapper">
            <input
              type={showConfirm ? "text" : "password"}
              name="confirm_password"
              placeholder="Confirm Password"
              value={form.confirm_password}
              onChange={handleChange}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowConfirm(!showConfirm)}
              title={showConfirm ? "Hide password" : "Show password"}
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </span>
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <button type="submit">Sign Up</button>
        </form>

        <p className="switch-text">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
