import React, { useState } from 'react';

function AuthSystem() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    remember: false
  });
  const [errors, setErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!isLogin && formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    const endpoint = isLogin ? '/auth/login' : '/auth/signup';

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          remember: formData.remember
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNotification({
          message: isLogin ? 'Login successful!' : 'Account created! Please login.',
          type: 'success'
        });
        
        if (!isLogin) {
          setIsLogin(true);
          setFormData({ email: '', password: '', confirmPassword: '', remember: false });
        }
      } else {
        setNotification({ message: data.error || 'Something went wrong', type: 'error' });
      }
    } catch (err) {
      setNotification({ message: 'Network error. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setFormData({ email: '', password: '', confirmPassword: '', remember: false });
    setErrors({});
    setNotification(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-5" style={{
      background: 'linear-gradient(135deg, #4a5db8 0%, #5c6bc0 100%)'
    }}>
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .auth-card {
          animation: slideIn 0.4s ease-out;
        }

        .input-field:focus {
          outline: none;
          border-color: #5a67d8;
          box-shadow: 0 0 0 3px rgba(90, 103, 216, 0.1);
        }

        .btn-primary {
          transition: all 0.3s ease;
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(90, 103, 216, 0.5);
        }

        .btn-primary:active {
          transform: translateY(0);
        }

        .link-text:hover {
          color: #434190;
        }
      `}</style>

      <div className="auth-card bg-white rounded-2xl shadow-2xl w-full max-w-md p-10">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#4a5db8' }}>
            Class.io
          </h1>
          <p className="text-gray-600 text-sm">
            {isLogin ? 'Welcome back! Please login to continue.' : 'Create your account to get started.'}
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-5 p-3 rounded-lg text-sm flex items-center gap-2 ${
            notification.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-300' 
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}>
            {notification.type === 'success' ? '✓' : '✕'} {notification.message}
          </div>
        )}

        {/* Email Field */}
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            className={`input-field w-full px-4 py-3 border-2 rounded-lg text-sm transition-all bg-gray-50 ${
              errors.email ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email}</p>
          )}
        </div>

        {/* Password Field */}
        <div className="mb-5">
          <label className="block text-gray-700 text-sm font-semibold mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder={isLogin ? 'Enter your password' : 'Create a password'}
            className={`input-field w-full px-4 py-3 border-2 rounded-lg text-sm transition-all bg-gray-50 ${
              errors.password ? 'border-red-400' : 'border-gray-200'
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password (Signup Only) */}
        {!isLogin && (
          <div className="mb-5">
            <label className="block text-gray-700 text-sm font-semibold mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              className={`input-field w-full px-4 py-3 border-2 rounded-lg text-sm transition-all bg-gray-50 ${
                errors.confirmPassword ? 'border-red-400' : 'border-gray-200'
              }`}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
            )}
          </div>
        )}

        {/* Remember Me & Forgot Password (Login Only) */}
        {isLogin && (
          <div className="flex items-center justify-between mb-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="remember"
                checked={formData.remember}
                onChange={handleChange}
                className="w-4 h-4 accent-indigo-600 cursor-pointer"
              />
              <span className="text-sm text-gray-600">Remember me</span>
            </label>
            <button 
              type="button"
              onClick={() => alert('Forgot password functionality')}
              className="link-text text-sm font-medium transition-colors" 
              style={{ color: '#5a67d8' }}
            >
              Forgot password?
            </button>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary w-full py-3 text-white font-semibold rounded-lg shadow-lg"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            opacity: loading ? 0.7 : 1,
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processing...' : (isLogin ? 'Log In' : 'Sign Up')}
        </button>

        {/* Switch Mode */}
        <div className="text-center mt-6 text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            type="button"
            onClick={switchMode}
            className="link-text font-semibold transition-colors"
            style={{ color: '#5a67d8' }}
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthSystem;