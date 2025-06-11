'use client';

import { useState, useEffect } from "react";
import { IoMdEye, IoMdEyeOff, IoMdCheckmark } from "react-icons/io";
import { IoAlertCircleOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
  color: string;
  label: string;
}

const ResetPasswordForm = () => {
  const [step, setStep] = useState<"password" | "success">("password");
  const router = useRouter();  
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const supabase = createClient();

  // Check if user has valid reset session
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (!session || error) {
        setError("Invalid or expired reset link. Please request a new password reset.");
      }
    };
    checkSession();
  }, [supabase.auth]);

  // Password strength checker
  const checkPasswordStrength = (pwd: string): PasswordStrength => {
    const feedback = [];
    let score = 0;

    if (pwd.length < 8) {
      feedback.push("At least 8 characters");
    } else {
      score += 1;
    }

    if (!/[A-Z]/.test(pwd)) {
      feedback.push("One uppercase letter");
    } else {
      score += 1;
    }

    if (!/[a-z]/.test(pwd)) {
      feedback.push("One lowercase letter");
    } else {
      score += 1;
    }

    if (!/\d/.test(pwd)) {
      feedback.push("One number");
    } else {
      score += 1;
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) {
      feedback.push("One special character");
    } else {
      score += 1;
    }

    const isValid = score >= 4;
    let color = "text-red-500";
    let label = "Weak";

    if (score >= 5) {
      color = "text-green-500";
      label = "Strong";
    } else if (score >= 3) {
      color = "text-yellow-500";
      label = "Medium";
    }

    return { score, feedback, isValid, color, label };
  };

  const passwordStrength = checkPasswordStrength(password);

  const handlePasswordSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);
    setError(null);

    // Validation
    if (!passwordStrength.isValid) {
      setError("Please ensure your password meets all requirements.");
      return;
    }

    setIsLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (updateError) {
        throw updateError;
      }

      setStep("success");
    } catch (err: any) {
      console.log("Error updating password:", err);
      
      // Handle specific error types
      if (err.message?.includes("same as the old password")) {
        setError("New password must be different from your current password.");
      } else if (err.message?.includes("weak password")) {
        setError("Password is too weak. Please choose a stronger password.");
      } else if (err.message?.includes("session_not_found")) {
        setError("Your session has expired. Please request a new password reset link.");
      } else {
        setError("Failed to update password. Please try again or request a new reset link.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = passwordStrength.isValid && password;

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
              className="w-full flex flex-col gap-4"
            >
              {/* New Password Field */}
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
                    className={`w-full border rounded-lg py-3 px-4 pr-12 text-lg outline-hidden focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                      password && !passwordStrength.isValid && hasSubmitted
                        ? 'border-red-300 focus:border-red-500'
                        : 'border-neutral-300'
                    }`}
                    required
                    disabled={isLoading}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 disabled:cursor-not-allowed"
                    tabIndex={-1}
                    disabled={isLoading}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <IoMdEye size={24} className="text-neutral-500" />
                    ) : (
                      <IoMdEyeOff size={24} className="text-neutral-500" />
                    )}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-neutral-600">Password strength:</span>
                      <span className={`text-sm font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordStrength.score >= 5
                            ? 'bg-green-500'
                            : passwordStrength.score >= 3
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                      />
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <div className="mt-2">
                        <p className="text-sm text-neutral-600 mb-1">Required:</p>
                        <ul className="text-xs text-neutral-500 space-y-1">
                          {passwordStrength.feedback.map((item, index) => (
                            <li key={index} className="flex items-center">
                              <span className="w-1 h-1 bg-neutral-400 rounded-full mr-2" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                  <IoAlertCircleOutline className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium text-2xl rounded-lg py-3 transition-colors mt-4 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <svg 
                      className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" 
                      xmlns="http://www.w3.org/2000/svg" 
                      fill="none" 
                      viewBox="0 0 24 24"
                    >
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Updating Password...
                  </>
                ) : (
                  'Change Password'
                )}
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
                Your password has been changed successfully. You can now log in with your new password.
              </p>
              <button
                type="button"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-2xl rounded-lg py-3 transition-colors cursor-pointer"
                onClick={() => router.push("/login")}
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