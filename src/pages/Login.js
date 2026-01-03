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
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Side - Background - Hidden on mobile, shown on tablet+ */}
      <div className="hidden md:flex flex-1 relative flex-col justify-between p-8 lg:p-12 text-white overflow-hidden">
        {/* Classroom Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/images/classroom.jpg)',
          }}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"></div>
        </div>
        <div className="relative z-10">
          <div className="text-3xl lg:text-4xl font-extrabold mb-5 drop-shadow-lg tracking-tight">
            Brainhub School Management System
          </div>
          <div className="text-xl lg:text-2xl font-semibold opacity-95 drop-shadow-md">
            International College Academy
          </div>
        </div>
      </div>

      {/* Mobile School Image - Shown only on mobile, above login card */}
      <div className="block md:hidden w-full relative h-48 sm:h-64 overflow-hidden">
        <img 
          src="/images/classroom.jpg" 
          alt="International College Academy" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-4 text-center z-10">
          <div className="text-xl sm:text-2xl font-extrabold mb-2 drop-shadow-lg">Brainhub School Management System</div>
          <div className="text-base sm:text-lg font-semibold opacity-95 drop-shadow-md">International College Academy</div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:flex-[0_0_40%] lg:flex-[0_0_45%] xl:flex-[0_0_42%] bg-white flex flex-col p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 justify-center md:shadow-[-4px_0_20px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center mb-5 sm:mb-6 md:mb-8 flex-wrap gap-3">
          <h2 className="text-primary-600 text-lg sm:text-xl md:text-2xl font-semibold">Administrator</h2>
          <div className="flex gap-2.5">
            <a 
              href="#facebook" 
              className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 text-sm transition-all duration-300 border border-gray-200 hover:bg-primary-500 hover:text-white hover:-translate-y-1 hover:rotate-6 hover:shadow-md"
              aria-label="Facebook" 
              onClick={(e) => e.preventDefault()}
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a 
              href="#twitter" 
              className="w-9 h-9 rounded-full bg-gray-50 flex items-center justify-center text-gray-600 text-sm transition-all duration-300 border border-gray-200 hover:bg-primary-500 hover:text-white hover:-translate-y-1 hover:rotate-6 hover:shadow-md"
              aria-label="Twitter" 
              onClick={(e) => e.preventDefault()}
            >
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>

        <div className="text-center mb-6 md:mb-8">
          {/* School Crest Logo */}
          <div className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 lg:w-52 lg:h-52 mx-auto mb-4 sm:mb-5 md:mb-6 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl rounded-lg overflow-hidden bg-white p-2 sm:p-2.5 md:p-3">
            <img 
              src="/images/crest.png" 
              alt="International College Academy Crest" 
              className="w-full h-full object-contain"
              style={{ maxWidth: '100%', maxHeight: '100%' }}
            />
          </div>
        </div>

        <form id="loginForm" onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          <div>
            <label className="block mb-2 font-semibold text-gray-900 text-sm">Select User Type</label>
            <div className="relative">
              <i className="fas fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 z-10 transition-all duration-300"></i>
              <select
                className="w-full pl-10 pr-4 py-3 md:py-3 border-2 border-gray-300 rounded-md text-base md:text-sm transition-all duration-300 bg-white hover:border-gray-400 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5"
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
                className="w-full pl-10 pr-4 py-3 md:py-3 border-2 border-gray-300 rounded-md text-base md:text-sm transition-all duration-300 bg-white hover:border-gray-400 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5"
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
                className="w-full pl-10 pr-4 py-3 md:py-3 border-2 border-gray-300 rounded-md text-base md:text-sm transition-all duration-300 bg-white hover:border-gray-400 focus:outline-none focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(16,185,129,0.1)] focus:-translate-y-0.5"
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
            className="w-full py-4 bg-primary-500 text-white rounded-lg text-base font-bold cursor-pointer transition-all duration-300 mt-2.5 shadow-md tracking-wide uppercase hover:bg-primary-700 hover:-translate-y-1 hover:shadow-lg active:-translate-y-0.5"
          >
            Login
          </button>

          <div className="flex flex-row justify-between items-center mt-4 text-sm">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="cursor-pointer w-4 h-4"
              />
              <label htmlFor="remember" className="font-normal cursor-pointer text-sm">
                Remember Me
              </label>
            </div>
            <a 
              href="#forgot" 
              className="text-primary-500 no-underline hover:text-primary-400 hover:underline text-sm"
              onClick={(e) => e.preventDefault()}
            >
              Forgot Password?
            </a>
          </div>
        </form>

        <div className="text-center mt-6 md:mt-8 pt-4 md:pt-5 border-t border-gray-300 text-gray-600 text-sm md:text-base font-semibold">
          Brainhub School Management System
        </div>
      </div>
    </div>
  );
};

export default Login;

