import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import staffService from "../services/staffService";
import studentsService from "../services/studentsService";

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
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    
    if (!formData.username || !formData.password) {
      setError("Please enter both username and password");
      return;
    }

    setLoading(true);

    try {
      // For administrator, allow login without validation (backward compatibility)
      if (formData.userType === "administrator") {
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("userType", "administrator");
        sessionStorage.setItem("username", formData.username);
        if (remember) {
          localStorage.setItem("username", formData.username);
          localStorage.setItem("userType", "administrator");
        }
        setLoading(false);
        setShowSuccessModal(true);
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate("/");
        }, 3000);
        return;
      }

      // For staff, validate against stored credentials
      if (formData.userType === "staff") {
        const allStaff = await staffService.getAll();
        const staff = allStaff.find(s => 
          s.staffId === formData.username ||
          s.email === formData.username ||
          `${s.firstName} ${s.surname}`.toLowerCase() === formData.username.toLowerCase()
        );

        if (!staff) {
          setError("Staff member not found");
          setLoading(false);
          return;
        }

        // Check password
        if (staff.password !== formData.password) {
          setError("Invalid password");
          setLoading(false);
          return;
        }

        // Set authentication and user type from staff record
        const userType = staff.userType || "staff";
        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("userType", userType);
        sessionStorage.setItem("username", staff.staffId || formData.username);
        if (remember) {
          localStorage.setItem("username", staff.staffId || formData.username);
          localStorage.setItem("userType", userType);
        }
        setLoading(false);
        setShowSuccessModal(true);
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate("/teacher-dashboard");
        }, 3000);
        return;
      }

      // For students, validate against stored credentials
      if (formData.userType === "student") {
        const allStudents = await studentsService.getAll();
        const student = allStudents.find(s => 
          s.studentId === formData.username ||
          s.id === formData.username ||
          `${s.firstName} ${s.surname}`.toLowerCase() === formData.username.toLowerCase()
        );

        if (!student) {
          setError("Student not found");
          setLoading(false);
          return;
        }

        // Check password
        if (student.password && student.password !== formData.password) {
          setError("Invalid password");
          setLoading(false);
          return;
        }

        sessionStorage.setItem("isAuthenticated", "true");
        sessionStorage.setItem("userType", "student");
        sessionStorage.setItem("username", student.studentId || student.id || formData.username);
        if (remember) {
          localStorage.setItem("username", student.studentId || student.id || formData.username);
          localStorage.setItem("userType", "student");
        }
        setLoading(false);
        setShowSuccessModal(true);
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          navigate("/student-dashboard");
        }, 3000);
        return;
      }
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "An error occurred during login. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
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
        <div className="relative z-20 flex flex-col justify-between h-full">
          <div className="text-3xl lg:text-4xl font-extrabold mb-5 drop-shadow-lg tracking-tight">
            Brainhub School Management System
          </div>
          <div className="text-xl lg:text-2xl font-semibold opacity-95 drop-shadow-md">
            Excelz International School
          </div>
        </div>
      </div>

      {/* Mobile School Image - Shown only on mobile, above login card */}
      <div className="block md:hidden w-full relative h-32 sm:h-40 overflow-hidden">
        <img
          src="/images/classroom.jpg"
          alt="Excelz International School"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-600/30 to-primary-600/50"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-4 text-center z-10">
          <div className="text-base sm:text-lg font-extrabold mb-1 drop-shadow-lg">
            Brainhub School Management System
          </div>
          <div className="text-xs sm:text-sm font-semibold opacity-95 drop-shadow-md">
            Excelz International School
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full md:flex-[0_0_40%] lg:flex-[0_0_45%] xl:flex-[0_0_42%] bg-white flex flex-col p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 justify-start md:justify-center md:shadow-[-4px_0_20px_rgba(0,0,0,0.1)]">
        {/* Mobile Primary Color Accent Bar */}
        <div className="block md:hidden w-20 h-1 bg-primary-600 rounded-full mx-auto mb-3"></div>

        <div className="flex justify-between items-center mb-3 sm:mb-4 md:mb-8 flex-wrap gap-3">
          <h2 className="text-green-600 text-lg sm:text-xl md:text-2xl font-semibold">
            {formData.userType === 'administrator' ? 'Administrator' : formData.userType === 'staff' ? 'Staff Login' : 'Student Login'}
          </h2>
          <div className="flex gap-2.5">
            <a
              href="#facebook"
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm transition-all duration-300 hover:bg-gray-200"
              aria-label="Facebook"
              onClick={(e) => e.preventDefault()}
            >
              <span className="text-xs font-bold">f</span>
            </a>
            <a
              href="#twitter"
              className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm transition-all duration-300 hover:bg-gray-200"
              aria-label="Twitter"
              onClick={(e) => e.preventDefault()}
            >
              <i className="fab fa-twitter text-xs"></i>
            </a>
          </div>
        </div>

        <div className="text-center mb-4 sm:mb-5 md:mb-8">
          {/* School Logo - Circular with green border */}
          <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 lg:w-44 lg:h-44 mx-auto mb-2 sm:mb-3 md:mb-6 flex items-center justify-center shadow-lg rounded-full overflow-hidden bg-white p-3 sm:p-3.5 md:p-4 border-4 border-green-500">
            <div className="w-full h-full flex flex-col items-center justify-center text-center">
              <div className="text-[8px] sm:text-[9px] md:text-[10px] font-semibold text-gray-700 mb-1">
                YOUR SCHOOL NAME HERE
              </div>
              <div className="flex-1 flex items-center justify-center">
                <img
                  src="/images/crest.png"
                  alt="Excelz International School Logo"
                  className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                />
              </div>
              <div className="text-[7px] sm:text-[8px] md:text-[9px] font-medium text-gray-600 mt-1">
                SCHOOL SLOGAN HERE
              </div>
              <div className="text-[6px] sm:text-[7px] md:text-[8px] font-medium text-gray-500 mt-0.5">
                ESTABLISHED: 2000
              </div>
            </div>
          </div>
        </div>

        <form
          id="loginForm"
          onSubmit={handleSubmit}
          className="space-y-5 sm:space-y-6 md:space-y-5"
        >
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              <i className="fas fa-exclamation-circle mr-2"></i>
              {error}
            </div>
          )}
          
          <div>
            <label className="block mb-3 sm:mb-3.5 font-semibold text-slate-900 text-base sm:text-lg md:text-sm">
              Role
            </label>
            <div className="relative">
              <i className="fas fa-user absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-gray-500 z-10 transition-all duration-300 text-base sm:text-lg"></i>
              <select
                className="login-select-dropdown w-full pl-10 sm:pl-11 pr-10 sm:pr-11 md:pr-10 py-2.5 sm:py-3 md:py-2.5 border-2 border-gray-200 rounded-xl text-base sm:text-lg md:text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 focus:shadow-[0_0_0_4px_rgba(0,0,0,0.1)] min-h-[44px] sm:min-h-[48px] md:min-h-[44px] appearance-none cursor-pointer font-medium text-slate-900 active:bg-gray-50"
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
              {/* Custom dropdown arrow - Visible to differentiate from text inputs */}
              <div className="absolute right-2.5 sm:right-3 md:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none z-30">
                <div className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-full border-2 border-gray-300 shadow-sm">
                  <i className="fas fa-chevron-down text-gray-600 text-xs sm:text-sm font-extrabold"></i>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block mb-3 sm:mb-3.5 font-semibold text-slate-900 text-base sm:text-lg md:text-sm">
              Username/ID
            </label>
            <div className="relative">
              <i className="fas fa-user absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gray-400 z-10 transition-all duration-300 text-lg sm:text-xl"></i>
              <input
                type="text"
                className="w-full pl-12 sm:pl-14 pr-4 py-4 sm:py-4.5 md:py-3 border-2 border-gray-200 rounded-xl text-lg sm:text-xl md:text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 focus:shadow-[0_0_0_4px_rgba(0,0,0,0.1)] min-h-[52px] sm:min-h-[56px] md:min-h-[48px]"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter username/ID"
                required
              />
            </div>
          </div>

          <div>
            <label className="block mb-3 sm:mb-3.5 font-semibold text-slate-900 text-base sm:text-lg md:text-sm">
              Password
            </label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 text-gray-400 z-10 transition-all duration-300 text-lg sm:text-xl"></i>
              <input
                type="password"
                className="w-full pl-12 sm:pl-14 pr-4 py-4 sm:py-4.5 md:py-3 border-2 border-gray-200 rounded-xl text-lg sm:text-xl md:text-sm transition-all duration-300 bg-white hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 focus:shadow-[0_0_0_4px_rgba(0,0,0,0.1)] min-h-[52px] sm:min-h-[56px] md:min-h-[48px]"
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
            disabled={loading}
            className="w-full py-4.5 sm:py-5 md:py-4 bg-amber-600 text-white rounded-xl text-lg sm:text-xl md:text-base font-bold cursor-pointer transition-all duration-300 mt-3 sm:mt-4 shadow-lg tracking-wide hover:bg-amber-700 hover:-translate-y-1 hover:shadow-xl active:-translate-y-0.5 active:bg-amber-800 min-h-[56px] sm:min-h-[60px] md:min-h-[48px] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i> Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>

          <div className="flex flex-row justify-between items-center mt-4 text-sm">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="cursor-pointer w-4 h-4 accent-orange-500"
                style={{ accentColor: '#f97316' }}
              />
              <label
                htmlFor="remember"
                className="font-normal cursor-pointer text-sm text-gray-700"
              >
                Remember Me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-orange-500 no-underline hover:text-orange-600 hover:underline text-sm transition-colors font-medium"
            >
              Forgot Password?
            </Link>
          </div>
        </form>

        <div className="text-center mt-6 md:mt-8 pt-4 md:pt-5 border-t border-slate-300 text-slate-600 text-sm md:text-base font-semibold">
          Brainhub School Management System
        </div>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => {
              setShowSuccessModal(false);
              // Navigate based on user type
              const userType = sessionStorage.getItem("userType");
              if (userType === "staff") {
                navigate("/teacher-dashboard");
              } else if (userType === "student") {
                navigate("/student-dashboard");
              } else {
                navigate("/");
              }
            }}
          ></div>
          
          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-2xl p-6 sm:p-8 max-w-md w-full mx-4 z-10">
            {/* Success Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center">
                <i className="fas fa-check text-green-600 text-3xl sm:text-4xl"></i>
              </div>
            </div>
            
            {/* Message */}
            <div className="text-center mb-6">
              <p className="text-blue-600 text-base sm:text-lg font-medium">
                Success... You'll be redirected in some few seconds
              </p>
            </div>
            
            {/* Ok Button */}
            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  // Navigate based on user type
                  const userType = sessionStorage.getItem("userType");
                  if (userType === "staff") {
                    navigate("/teacher-dashboard");
                  } else if (userType === "student") {
                    navigate("/student-dashboard");
                  } else {
                    navigate("/");
                  }
                }}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors duration-300 shadow-md hover:shadow-lg"
              >
                Ok
              </button>
            </div>
            
            {/* Footer Text */}
            <div className="text-center">
              <p className="text-red-600 text-sm font-medium">
                Sign in successful
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
