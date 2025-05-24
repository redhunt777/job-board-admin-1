'use client';

import { useRef, useState } from "react";
import { IoMdEye, IoMdEyeOff, IoMdCheckmark } from "react-icons/io";
import { motion } from "framer-motion";

const OTP_LENGTH = 6;

const ResetPasswordForm = () => {
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [step, setStep] = useState<"email" | "otp" | "password" | "success">("email");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const isPreviousFieldsFilled = otp
      .slice(0, idx)
      .every((value) => value !== "");
    if (!isPreviousFieldsFilled) {
      return;
    }

    const value = e.target.value.replace(/[^0-9]/g, "");
    if (!value) return;
    const newOtp = [...otp];
    newOtp[idx] = value[0];
    setOtp(newOtp);
    if (idx < OTP_LENGTH - 1 && value) {
      inputs.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      if (otp[idx]) {
        const newOtp = [...otp];
        newOtp[idx] = "";
        setOtp(newOtp);
      } else if (idx > 0) {
        const isPreviousFieldsFilled = otp
          .slice(0, idx)
          .every((value) => value !== "");
        if (isPreviousFieldsFilled) {
          inputs.current[idx - 1]?.focus();
        }
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData
      .getData("text")
      .slice(0, OTP_LENGTH)
      .split("");
    setOtp((prev) => prev.map((_, i) => paste[i] || ""));
    if (paste.length === OTP_LENGTH) {
      inputs.current[OTP_LENGTH - 1]?.focus();
    }
  };

  const handleEmailsubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would send the OTP to the email
    setEmailSent(true);
    setStep("otp");
  };

  const handleResend = () => {
    // Resend OTP logic here
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would verify the OTP
    setStep("password");
  };

  const handlePasswordSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would handle password reset logic
    setStep("success");
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col justify-center items-center bg-white rounded-xl shadow max-w-xl mx-auto p-6 sm:p-10 mt-10">
        <div className="slide-container">
          {/* Email Step */}
          <div
            className={`slide${
              step === "email"
                ? " active"
                : step === "otp" || step === "password"
                ? " left"
                : ""
            }`}
          >
            <h1 className="text-center text-neutral-800 font-semibold text-2xl sm:text-4xl mb-4">
              Reset Password
            </h1>
            <p className="text-center text-neutral-500 mb-8">
              Enter your registered email address to receive a one-time password
              (OTP) for resetting your password.
            </p>
            <form
              onSubmit={handleEmailsubmit}
              className="w-full flex flex-col items-center gap-4"
            >
              <div className="w-full">
                <label
                  className="block text-neutral-700 font-medium mb-2"
                  htmlFor="email"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg py-3 px-4 text-lg outline-none focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-2xl rounded-lg py-3 transition-colors cursor-pointer mt-4"
              >
                Send OTP
              </button>
            </form>
            {emailSent && (
              <p className="text-center text-green-500 mt-4">
                OTP sent to {email}. Please check your inbox.
              </p>
            )}
          </div>
          {/* OTP Step */}
          <div
            className={`slide${
              step === "otp"
                ? " active"
                : step === "password" || step === "success"
                ? " left"
                : ""
            }`}
          >
            <h1 className="text-center text-neutral-800 font-semibold text-2xl sm:text-4xl mb-4">
              Reset your Password
            </h1>
            <p className="text-center text-xs sm:text-base text-neutral-500 mb-8">
              We've sent a one-time password (OTP) to your registered email
              address. Please check your mail and enter the 6-digit code below
              to reset your password and continue.
            </p>
            <form
              onSubmit={handleSubmit}
              className="w-full flex flex-col items-center gap-4"
            >
              <div className="flex justify-center gap-2 sm:gap-4 mb-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(e, idx)}
                    onKeyDown={(e) => handleKeyDown(e, idx)}
                    onPaste={handlePaste}
                    ref={(el) => (inputs.current[idx] = el)}
                    className="w-11 h-11 sm:w-16 sm:h-16 text-3xl text-center border border-gray-300 rounded-lg outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={handleResend}
                className="text-blue-600 font-light hover:underline mb-4 cursor-pointer"
              >
                Resend OTP
              </button>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-2xl rounded-lg py-3 transition-colors cursor-pointer"
              >
                Reset
              </button>
            </form>
          </div>

          {/* New Password Step */}
          <div
            className={`slide${
              step === "password"
                ? " active"
                : step === "success"
                ? " left"
                : step === "otp"
                ? ""
                : " left"
            }`}
          >
            <h1 className="text-center text-neutral-800 font-semibold text-2xl sm:text-4xl mb-4">
              Set a New Password
            </h1>
            <p className="text-center text-neutral-500 mb-8">
              Set a new password for your account. Make sure it's strong and
              easy to remember.
            </p>
            <form
              onSubmit={handlePasswordSubmit}
              className="w-full flex flex-col items-center gap-4"
            >
              <div className="w-full">
                <label
                  className="block text-neutral-700 font-medium mb-2"
                  htmlFor="new-password"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your new password"
                    className="w-full border border-gray-300 rounded-lg py-3 px-4 text-lg outline-none focus:border-blue-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <IoMdEye size={24} className="text-neutral-500" />
                    ) : (
                      <IoMdEyeOff size={24} className="text-neutral-500" />
                    )}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-2xl rounded-lg py-3 transition-colors cursor-pointer mt-4"
              >
                Change Password
              </button>
            </form>
          </div>

          {/* Success Step */}
          <div className={`slide${step === "success" ? " active" : ""}`}>
            <div className="flex flex-col items-center justify-center h-full">
              {step === "success" && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  <IoMdCheckmark className="h-24 w-24 sm:h-32 sm:w-32 text-white bg-green-500 rounded-full p-2 mt-8 mb-12" />
                </motion.div>
              )}
              <h1 className="text-center text-neutral-800 font-semibold text-2xl sm:text-4xl mb-2">
                Password Changed!
              </h1>
              <p className="text-center text-neutral-500 mb-8">
                Your password has been changed successfully.
              </p>
              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-2xl rounded-lg py-3 transition-colors cursor-pointer"
                onClick={() => (window.location.href = "/login")}
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm; 