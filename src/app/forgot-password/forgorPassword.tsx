'use client';

import { useState } from "react";
import { createClient } from "../../utils/supabase/client";


const ForgotPasswordForm = () => {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "emailsent">("email");
  const [error, setError] = useState<string | null>(null);


  const handleEmailsubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Here you would send the OTP to the email
    const supabase = createClient();
    const {error} = await supabase.auth.resetPasswordForEmail(email, {
     redirectTo: `${process.env.NEXT_PUBLIC_URL}reset-password`,
    });
    if(error){
      setError("Failed to send reset link. Please try again.");
      console.error("Error sending reset link:", error);
      setStep("email");
      return;
    }
    setStep("emailsent");
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col justify-center items-center bg-white rounded-xl shadow-sm max-w-xl mx-auto p-6 sm:p-10 my-10">
        <div className="slide-container">
          {/* Email Step */}
          <div
            className={`slide${
              step === "email"
                ? " active"
                : step === "emailsent" 
                ? " left"
                : ""
            }`}
          >
            <h1 className="text-center text-neutral-800 font-semibold text-2xl sm:text-4xl mb-4">
              Reset Password
            </h1>
            <p className="text-center text-neutral-500 mb-8">
              Enter your registered email address to receive a password rest link for resetting your password.
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
                  className="w-full border border-neutral-300 rounded-lg py-3 px-4 text-lg outline-hidden focus:border-blue-500 transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-2xl rounded-lg py-3 transition-colors cursor-pointer mt-4"
              >
                Send Reset Link
              </button>
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
              We've sent a password reset link to your registered email address. Please 
              check your inbox and follow the instructions to reset 
              your password.</p>
            <button
              onClick={() => window.open("https://mail.google.com", "_blank")}
              className="w-full bg-[#1E5CDC] hover:bg-blue-700 text-white font-medium text-2xl rounded-lg py-3 transition-colors cursor-pointer mt-4"
            >
              Open MailBox
            </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm; 