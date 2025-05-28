'use client';

import { useState } from "react";
import { IoMdEye, IoMdEyeOff, IoMdCheckmark } from "react-icons/io";
import { motion } from "framer-motion";
import { createClient } from "../../utils/supabase/client";
import { error } from "console";


const ResetPasswordForm = () => {
  const [step, setStep] = useState<"password" | "success">("password");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would handle password reset logic
    const {error} = await supabase.auth.updateUser({ password: 'new_password' })
    if (error) {
      console.error("Error updating password:", error);
      setError("Failed to update password. Please try again.");
      setStep("password");
      return;
    }
    setStep("success");
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col justify-center items-center bg-white rounded-xl shadow-sm max-w-xl mx-auto p-6 sm:p-10 my-10">
        <div className="slide-container">
          {/* New Password Step */}
          <div
            className={`slide${
              step === "password"
                ? " active"
                : step === "success"
                ? " left"
                : ""
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
                    className="w-full border border-neutral-300 rounded-lg py-3 px-4 text-lg outline-hidden focus:border-blue-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
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
            {error && (
              <p className="text-red-500 text-center mt-4">
                {error}
              </p>
            )}
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