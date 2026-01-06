import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useModal } from "../components/ModalProvider";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [step, setStep] = useState<"email" | "code" | "reset">("email");
  const [code, setCode] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const { toast } = useModal();
  const navigate = useNavigate();

  const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!email) {
      toast.showError("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.showSuccess("Password reset code sent to your email");
      setStep("code");
    } catch (error) {
      toast.showError("Failed to send reset code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.showError("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.showSuccess("Code verified successfully");
      setStep("reset");
    } catch (error) {
      toast.showError("Invalid code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      toast.showError("Please fill in all fields");
      return;
    }

    if (newPassword.length < 8) {
      toast.showError("Password must be at least 8 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.showError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast.showSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      toast.showError("Failed to reset password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left Side - Background */}
      <div 
        className="hidden md:flex flex-1 relative flex-col justify-between p-8 lg:p-12 text-white overflow-hidden login-bg-container"
        // Inline style required to avoid webpack module resolution for public folder images
        style={{
          backgroundImage: "url('/images/classroom.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } as React.CSSProperties}
      >
        {/* Background Overlay */}
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

      {/* Mobile Header */}
      <div className="block md:hidden w-full relative h-48 sm:h-64 overflow-hidden">
        <img
          src="/images/classroom.jpg"
          alt="International College Academy"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white px-4 text-center z-10">
          <div className="text-xl sm:text-2xl font-extrabold mb-2 drop-shadow-lg">
            Brainhub School Management System
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:flex-[0_0_40%] lg:flex-[0_0_45%] xl:flex-[0_0_42%] bg-white flex flex-col p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 justify-center md:shadow-[-4px_0_20px_rgba(0,0,0,0.1)]">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {step === "email" && "Forgot Password?"}
            {step === "code" && "Enter Reset Code"}
            {step === "reset" && "Reset Password"}
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            {step === "email" && "Enter your email address and we'll send you a reset code."}
            {step === "code" && "Enter the 6-digit code sent to your email."}
            {step === "reset" && "Enter your new password."}
          </p>
        </div>

        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label className="block mb-2 font-semibold text-slate-900 text-sm">
                Email Address
              </label>
              <div className="relative">
                <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10"></i>
                <input
                  type="email"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 md:py-3 border-2 border-slate-300 rounded-lg text-sm sm:text-base md:text-sm transition-all duration-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.1)] min-h-[44px] sm:min-h-[48px]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 bg-primary-600 text-white rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-all duration-300 shadow-md tracking-wide uppercase hover:bg-primary-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-[48px]"
            >
              {loading ? "Sending..." : "Send Reset Code"}
            </button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleCodeSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label className="block mb-2 font-semibold text-slate-900 text-sm">
                Reset Code
              </label>
              <div className="relative">
                <i className="fas fa-key absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10"></i>
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 md:py-3 border-2 border-slate-300 rounded-lg text-sm sm:text-base md:text-sm transition-all duration-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.1)] min-h-[44px] sm:min-h-[48px] text-center tracking-widest font-mono"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                Didn't receive the code?{" "}
                <button
                  type="button"
                  onClick={() => handleEmailSubmit({ preventDefault: () => {} } as React.FormEvent<HTMLFormElement>)}
                  className="text-primary-500 hover:underline"
                >
                  Resend
                </button>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3 sm:py-4 bg-primary-600 text-white rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-all duration-300 shadow-md tracking-wide uppercase hover:bg-primary-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-[48px]"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetSubmit} className="space-y-4 md:space-y-5">
            <div>
              <label className="block mb-2 font-semibold text-slate-900 text-sm">
                New Password
              </label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10"></i>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 md:py-3 border-2 border-slate-300 rounded-lg text-sm sm:text-base md:text-sm transition-all duration-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.1)] min-h-[44px] sm:min-h-[48px]"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={8}
                />
              </div>
              <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
            </div>

            <div>
              <label className="block mb-2 font-semibold text-slate-900 text-sm">
                Confirm Password
              </label>
              <div className="relative">
                <i className="fas fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 z-10"></i>
                <input
                  type="password"
                  className="w-full pl-10 pr-4 py-2.5 sm:py-3 md:py-3 border-2 border-slate-300 rounded-lg text-sm sm:text-base md:text-sm transition-all duration-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:shadow-[0_0_0_4px_rgba(37,99,235,0.1)] min-h-[44px] sm:min-h-[48px]"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  required
                  minLength={8}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 sm:py-4 bg-primary-600 text-white rounded-lg text-sm sm:text-base font-bold cursor-pointer transition-all duration-300 shadow-md tracking-wide uppercase hover:bg-primary-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-[48px]"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/login"
            className="text-primary-500 hover:text-primary-400 hover:underline text-sm transition-colors"
          >
            <i className="fas fa-arrow-left mr-2"></i>Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

