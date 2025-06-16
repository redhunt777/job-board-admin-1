"use client";

import { useState, useEffect } from "react";
import { createClient } from "../../utils/supabase/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Link from "next/link";

// Define the form schema using zod
const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface CustomFormState {
  success: boolean;
  message?: string;
  error?: string;
}

const ForgotPasswordForm = () => {
  const [formState, setFormState] = useState<CustomFormState | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    mode: "onBlur",
  });

  // Watch email for clearing form state
  const email = watch("email");

  // Clear form state when user starts typing
  useEffect(() => {
    if (formState) {
      setFormState(null);
    }
  }, [email, formState]);

  const onSubmit = async (data: ForgotPasswordFormData) => {
    // Reset form state
    setFormState(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setFormState({
          success: false,
          error:
            error.message || "Failed to send reset link. Please try again.",
        });
        if (error.message?.includes("email")) {
          setError("email", { message: error.message });
        }
      } else {
        setFormState({
          success: true,
          message: "Password reset link has been sent to your email.",
        });
      }
    } catch (error) {
      console.log("Form submission error:", error);
      setFormState({
        success: false,
        error: "Something went wrong. Please try again.",
      });
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col justify-center items-center bg-white rounded-xl shadow-sm max-w-xl mx-auto p-6 sm:py-12 sm:px-18 my-12">
        <div className="slide-container">
          {/* Email Step */}
          <div className="slide active">
            <h1 className="text-center text-neutral-800 font-semibold text-2xl sm:text-3xl mb-4">
              Forgot Password
            </h1>
            <p className="text-center text-neutral-500 mb-8 text-sm font-medium">
              Enter your email address and we&apos;ll send you a link to reset
              your password.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="w-full flex flex-col items-center gap-8"
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
                  {...register("email")}
                  placeholder="Enter your email"
                  className={`w-full border rounded-lg py-3 px-4 text-sm outline-hidden focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                    errors.email
                      ? "border-red-300 focus:border-red-500"
                      : "border-neutral-300"
                  }`}
                  disabled={isSubmitting}
                />
                {errors.email && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </span>
                )}
              </div>

              {/* Form state messages */}
              {formState && (
                <div
                  className={`w-full font-medium text-lg p-3 rounded-lg border ${
                    formState.success
                      ? "text-green-600 bg-green-50 border-green-200"
                      : "text-red-500 bg-red-50 border-red-200"
                  }`}
                >
                  {formState.success ? formState.message : formState.error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full p-3 text-lg font-semibold text-white rounded-lg transition-colors cursor-pointer ${
                  !isSubmitting
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </button>

              {/* Back to Login Link */}
              <div className="text-center mt-4">
                <Link
                  href="/login"
                  className="text-neutral-900 hover:underline text-lg font-semibold"
                >
                  Back to Login
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
