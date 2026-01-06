import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

interface FormData {
  userType: string;
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    userType: "administrator",
    username: "",
    password: "",
  });
  const [remember, setRemember] = useState<boolean>(true);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (formData.username && formData.password) {
      sessionStorage.setItem("isAuthenticated", "true");
      sessionStorage.setItem("userType", formData.userType);
      sessionStorage.setItem("username", formData.username);

      // Redirect based on user type
      if (formData.userType === "staff") {
        navigate("/teacher-dashboard");
      } else if (formData.userType === "student") {
        navigate("/student-dashboard");
      } else {
        navigate("/");
      }
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    // Redirect if already authenticated
    if (sessionStorage.getItem("isAuthenticated") === "true") {
      const userType = sessionStorage.getItem("userType");
      if (userType === "staff") {
        navigate("/teacher-dashboard");
      } else if (userType === "student") {
        navigate("/student-dashboard");
      } else if (userType === "administrator") {
        navigate("/");
      } else {
        navigate("/login");
      }
    }
  }, [navigate]);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-b from-primary-50 to-white md:bg-white">
      {/* Mobile Primary Color Header Bar - Shown only on mobile */}
      <div className="block md:hidden w-full bg-primary-600 h-1"></div>

      {/* Left Side - Background - Hidden on mobile, shown on tablet+ */}
      <div
        className="hidden md:flex flex-1 relative flex-col justify-between p-8 lg:p-12 text-white overflow-hidden login-bg-container"
        // Inline style required to avoid webpack module resolution for public folder images
        style={
          {
            backgroundImage: "url('/images/classroom.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          } as React.CSSProperties
        }
      >
        {/* Classroom Background Image Overlay */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-10"></div>
        <div className="relative z-20">
          <div className="text-3xl lg:text-4xl font-extrabold mb-5 drop-shadow-lg tracking-tight">
            Brainhub School Management System
          </div>
          <div className="text-xl lg:text-2xl font-semibold opacity-95 drop-shadow-md">
            International College Academy
          </div>
        </div>
      </div>

      {/* Mobile School Image - Shown only on mobile, above login card */}
      <div className="block md:hidden w-full relative h-32 sm:h-40 overflow-hidden">
        <img
          src="/images/classroom.jpg"
          alt="International College Academy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-600/30 to-primary-600/50"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-4 text-center z-10">
          <div className="text-base sm:text-lg font-extrabold mb-1 drop-shadow-lg">
            Brainhub School Management System
          </div>
          <div className="text-xs sm:text-sm font-semibold opacity-95 drop-shadow-md">
            International College Academy
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:flex-[0_0_40%] lg:flex-[0_0_45%] xl:flex-[0_0_42%] bg-white flex flex-col p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 justify-start md:justify-center md:shadow-[-4px_0_20px_rgba(0,0,0,0.1)]">
        {/* Mobile Primary Color Accent Bar */}
        <div className="block md:hidden w-20 h-1 bg-primary-600 rounded-full mx-auto mb-3"></div>

        <div className="flex justify-between items-center mb-3 sm:mb-4 md:mb-8 flex-wrap gap-3">
          <h2 className="text-primary-600 text-lg sm:text-xl md:text-2xl font-semibold">
            Login
          </h2>
          <div className="flex gap-2.5">
            <a
              href="#facebook"
              className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 text-sm transition-all duration-300 border border-slate-200 hover:bg-primary-600 hover:text-white hover:-translate-y-1 hover:rotate-6 hover:shadow-md"
              aria-label="Facebook"
              onClick={(e) => e.preventDefault()}
            >
              <i className="fab fa-facebook-f"></i>
            </a>
            <a
              href="#twitter"
              className="w-9 h-9 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 text-sm transition-all duration-300 border border-slate-200 hover:bg-primary-600 hover:text-white hover:-translate-y-1 hover:rotate-6 hover:shadow-md"
              aria-label="Twitter"
              onClick={(e) => e.preventDefault()}
            >
              <i className="fab fa-twitter"></i>
            </a>
          </div>
        </div>

        <div className="text-center mb-4 sm:mb-5 md:mb-8">
          {/* School Crest Logo */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-44 md:h-44 lg:w-52 lg:h-52 mx-auto mb-2 sm:mb-3 md:mb-6 flex items-center justify-center shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl rounded-lg overflow-hidden bg-white p-2 sm:p-2.5 md:p-3">
            <img
              src="/images/crest.png"
              alt="International College Academy Crest"
              className="w-full h-full object-contain max-w-full max-h-full"
            />
          </div>
        </div>

        <form
          id="loginForm"
          onSubmit={handleSubmit}
          className="space-y-5 sm:space-y-6 md:space-y-5"
        >
          <div>
            <label className="block mb-3 sm:mb-3.5 font-semibold text-slate-900 text-base sm:text-lg md:text-sm">
              Select User Type
            </label>
            <div className="relative">
              <i className="fas fa-user absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-primary-600 z-10 transition-all duration-300 text-lg sm:text-xl"></i>
              <select
                className="w-full pl-12 sm:pl-14 pr-12 sm:pr-14 py-4 sm:py-4.5 md:py-3 border-2 border-primary-300 rounded-xl text-lg sm:text-xl md:text-sm transition-all duration-300 bg-white hover:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-600 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.15)] min-h-[60px] sm:min-h-[64px] md:min-h-[48px] appearance-none cursor-pointer font-semibold text-slate-900 active:bg-primary-50"
                name="userType"
                value={formData.userType}
                title="Select User Type"
                aria-label="Select User Type"
                aria-required="true"
                onChange={handleChange}
                required
              >
                <option value="administrator">Administrator</option>
                <option value="staff">Staff</option>
                <option value="student">Student</option>
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute right-4 sm:right-5 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                <i className="fas fa-chevron-down text-primary-600 text-lg sm:text-xl"></i>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-3 sm:mb-3.5 font-semibold text-slate-900 text-base sm:text-lg md:text-sm">
              Username
            </label>
            <div className="relative">
              <i className="fas fa-user absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-primary-600 z-10 transition-all duration-300 text-lg sm:text-xl"></i>
              <input
                type="text"
                className="w-full pl-12 sm:pl-14 pr-4 py-4 sm:py-4.5 md:py-3 border-2 border-primary-200 rounded-xl text-lg sm:text-xl md:text-sm transition-all duration-300 bg-white hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-600 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.15)] min-h-[52px] sm:min-h-[56px] md:min-h-[48px]"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-3 sm:mb-3.5 font-semibold text-slate-900 text-base sm:text-lg md:text-sm">
              Password
            </label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-primary-600 z-10 transition-all duration-300 text-lg sm:text-xl"></i>
              <input
                type="password"
                className="w-full pl-12 sm:pl-14 pr-4 py-4 sm:py-4.5 md:py-3 border-2 border-primary-200 rounded-xl text-lg sm:text-xl md:text-sm transition-all duration-300 bg-white hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-600 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.15)] min-h-[52px] sm:min-h-[56px] md:min-h-[48px]"
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
            className="w-full py-4.5 sm:py-5 md:py-4 bg-primary-600 text-white rounded-xl text-lg sm:text-xl md:text-base font-bold cursor-pointer transition-all duration-300 mt-3 sm:mt-4 shadow-lg tracking-wide uppercase hover:bg-primary-700 hover:-translate-y-1 hover:shadow-xl active:-translate-y-0.5 active:bg-primary-800 min-h-[56px] sm:min-h-[60px] md:min-h-[48px]"
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
              <label
                htmlFor="remember"
                className="font-normal cursor-pointer text-sm"
              >
                Remember Me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-primary-500 no-underline hover:text-primary-400 hover:underline text-sm transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
        </form>

        <div className="text-center mt-6 md:mt-8 pt-4 md:pt-5 border-t border-slate-300 text-slate-600 text-sm md:text-base font-semibold">
          Brainhub School Management System
        </div>
      </div>
    </div>
  );
};

export default Login;
