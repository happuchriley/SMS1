import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    userType: 'administrator',
    username: '',
    password: ''
  });
  const [remember, setRemember] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.username && formData.password) {
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('userType', formData.userType);
      sessionStorage.setItem('username', formData.username);
      navigate('/');
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  useEffect(() => {
    // Redirect if already authenticated
    if (sessionStorage.getItem('isAuthenticated') === 'true') {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Background */}
      <div className="flex-1 gradient-login relative flex flex-col justify-between p-12 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
        <div className="relative z-10">
          <div className="text-4xl font-extrabold mb-5 drop-shadow-lg tracking-tight">
            Brainhub School Management System
          </div>
          <div className="text-2xl font-semibold opacity-95 drop-shadow-md">
            Excelz International School
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-[0_0_40%] bg-white flex flex-col p-12 justify-center shadow-[-4px_0_20px_rgba(0,0,0,0.1)]">
        <div className="text-center mb-8">
          <h2 className="text-primary text-2xl mb-5 text-left font-semibold">Administrator</h2>
          <div className="flex justify-end gap-2.5 mb-5">
            <a 
              href="#facebook" 
              className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-600 text-sm transition-all duration-300 border border-gray-200 hover:gradient-primary hover:text-white hover:-translate-y-1 hover:rotate-6 hover:shadow-md"
              aria-label="Facebook" 
              onClick={(e) => e.preventDefault()}
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a 
              href="#twitter" 
              className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-600 text-sm transition-all duration-300 border border-gray-200 hover:gradient-primary hover:text-white hover:-translate-y-1 hover:rotate-6 hover:shadow-md"
              aria-label="Twitter" 
              onClick={(e) => e.preventDefault()}
            >
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="w-30 h-30 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center text-white text-5xl shadow-lg transition-all duration-300 animate-pulse hover:scale-110 hover:rotate-6 hover:shadow-xl">
            <i className="fas fa-graduation-cap"></i>
          </div>
        </div>

        <form id="loginForm" onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">Select User Type</label>
            <div className="relative">
              <i className="fas fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10 transition-all duration-300"></i>
              <select
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] focus:-translate-y-0.5"
                name="userType"
                value={formData.userType}
                onChange={handleChange}
                required
              >
                <option value="administrator">Administrator</option>
                <option value="teacher">Teacher/Staff</option>
                <option value="parent">Parent/Student</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">Username</label>
            <div className="relative">
              <i className="fas fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10 transition-all duration-300"></i>
              <input
                type="text"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] focus:-translate-y-0.5"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">Password</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10 transition-all duration-300"></i>
              <input
                type="password"
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-md text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:border-primary focus:shadow-[0_0_0_4px_rgba(40,167,69,0.1)] focus:-translate-y-0.5"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-4 gradient-warm text-white rounded-lg text-base font-bold cursor-pointer transition-all duration-300 mt-2.5 shadow-md tracking-wide uppercase hover:-translate-y-1 hover:shadow-lg active:-translate-y-0.5"
          >
            Login
          </button>

          <div className="flex justify-between items-center mt-4 text-sm">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="cursor-pointer"
              />
              <label htmlFor="remember" className="font-normal cursor-pointer">
                Remember Me
              </label>
            </div>
            <a 
              href="#forgot" 
              className="text-primary no-underline hover:underline"
              onClick={(e) => e.preventDefault()}
            >
              Forgot Password?
            </a>
          </div>
        </form>

        <div className="text-center mt-8 pt-5 border-t border-gray-200 text-gray-600 text-base font-semibold">
          Brainhub School Management System
        </div>
      </div>
    </div>
  );
};

export default Login;

