"use client";

import { useState } from "react";
import { createClient } from "../../utils/supabase/client";

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "emailsent">("email");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Added loading state

  const handleEmailsubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); // Start loading
    setError(null); // Clear any previous errors
    
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${process.env.NEXT_PUBLIC_URL}reset-password`,
        }
      );
      
      if (resetError) {
        setError("Failed to send reset link. Please try again.");
        console.log("Error sending reset link:", resetError);
        return;
      }
      
      setStep("emailsent");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.log("Unexpected error:", err);
    } finally {
      setIsLoading(false); // End loading
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col justify-center items-center bg-white rounded-xl shadow-sm max-w-xl mx-auto p-6 sm:p-10 my-10">
        <div className="slide-container">
          {/* Email Step */}
          <div
            className={`slide${
              step === "email" ? " active" : step === "emailsent" ? " left" : ""
            }`}
          >
            <h1 className="text-center text-[#151515] font-semibold text-2xl sm:text-4xl mb-4">
              Forgot Password?
            </h1>
            <p className="text-center text-[#606167] mb-8">
              Please enter your registered email address below. We'll send you a
              password reset link in the next step, so you can securely create a
              new password and regain access to your account.
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
                  className="w-full border border-neutral-300 rounded-lg py-3 px-4 text-lg outline-hidden focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  required
                  disabled={isLoading} // Disable input while loading
                />
              </div>
              
              {/* Enhanced Button with Loading State */}
              <button
                type="submit"
                disabled={isLoading || !email.trim()} // Disable if loading or empty email
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium text-2xl rounded-lg py-3 transition-colors mt-4 flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    {/* Loading Spinner */}
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
                    Sending Reset Link...
                  </>
                ) : (
                  'Send Reset Link'
                )}
              </button>
              
              {/* Error Message */}
              {error && (
                <div className="w-full flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 mt-2">
                  <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium">{error}</span>
                </div>
              )}
            </form>
          </div>

          {/* Email Sent Step */}
          <div
            className={`slide${
              step === "emailsent"
                ? " active"
                : step === "email"
                ? " right"
                : ""
            }`}
          >
            <h1 className="text-center text-[#151515] font-semibold text-2xl sm:text-4xl my-4">
              Check your E-mail
            </h1>
            <p className="text-center text-[#606167] mb-8">
              We've sent a password reset link to <strong>{email}</strong>.
              Please check your inbox and follow the instructions to reset your
              password.
            </p>
            <button
              onClick={() => window.open("https://mail.google.com", "_blank")}
              className="w-full bg-[#1E5CDC] hover:bg-blue-700 text-white font-medium text-2xl rounded-lg py-3 transition-colors cursor-pointer mt-4"
            >
              Open MailBox
            </button>
            
            {/* Back to Login Link */}
            <div className="text-center mt-6">
              <button
                onClick={() => {
                  setStep("email");
                  setEmail("");
                  setError(null);
                }}
                className="text-blue-600 font-medium hover:text-blue-700 hover:underline transition-colors"
              >
                ← Back to reset form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;