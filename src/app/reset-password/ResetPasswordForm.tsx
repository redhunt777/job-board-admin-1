"use client";

import { useState, useEffect } from "react";
import { IoMdEye, IoMdEyeOff, IoMdCheckmark } from "react-icons/io";
import { IoAlertCircleOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface PasswordStrength {
  score: number;
  feedback: string[];
  isValid: boolean;
  color: string;
  label: string;
}

// Define the form schema using zod
const resetPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "Password is required")
    .min(6, "Password must be at least 6 characters long")
    .refine((val) => {
      // Password strength validation
      const hasUpperCase = /[A-Z]/.test(val);
      const hasLowerCase = /[a-z]/.test(val);
      const hasNumbers = /\d/.test(val);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(val);
      return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
    }, "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface CustomFormState {
  success: boolean;
  message?: string;
  error?: string;
}

const ResetPasswordForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formState, setFormState] = useState<CustomFormState | null>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
    trigger,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onBlur",
  });

  // Watch password for validation
  const password = watch("password");

  // Password strength calculation
  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (!password) {
      return {
        score: 0,
        feedback: [],
        isValid: false,
        color: "bg-neutral-200",
        label: "Enter a password",
      };
    }

    const feedback: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push("Password should be at least 8 characters long");
    }

    // Character type checks
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasUpperCase) score += 1;
    else feedback.push("Add an uppercase letter");
    if (hasLowerCase) score += 1;
    else feedback.push("Add a lowercase letter");
    if (hasNumbers) score += 1;
    else feedback.push("Add a number");
    if (hasSpecialChar) score += 1;
    else feedback.push("Add a special character");

    // Determine color and label based on score
    let color = "bg-red-500";
    let label = "Weak";
    let isValid = false;

    if (score >= 4) {
      color = "bg-green-500";
      label = "Strong";
      isValid = true;
    } else if (score >= 3) {
      color = "bg-yellow-500";
      label = "Medium";
    } else if (score >= 2) {
      color = "bg-orange-500";
      label = "Fair";
    }

    return {
      score,
      feedback,
      isValid,
      color,
      label,
    };
  };

  const passwordStrength = calculatePasswordStrength(password);

  // Clear form state when user starts typing
  useEffect(() => {
    if (formState) {
      setFormState(null);
    }
  }, [password, formState]);

  const onSubmit = async (data: ResetPasswordFormData) => {
    // Reset form state
    setFormState(null);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });

      if (error) {
        setFormState({
          success: false,
          error: error.message || "Failed to reset password. Please try again.",
        });
        setError("password", { message: error.message });
      } else {
        setFormState({
          success: true,
          message:
            "Password has been reset successfully. Redirecting to login...",
        });
        // Redirect to login after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
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
      <div className="flex flex-col justify-center items-center bg-white rounded-xl shadow-sm max-w-xl mx-auto p-6 sm:py-12 sm:px-18 my-10">
        <div className="slide-container">
          {/* New Password Step */}
          <div className="slide active">
            <h1 className="text-center text-neutral-800 font-semibold text-2xl sm:text-3xl mb-8">
              Set a New Password
            </h1>
            <p className="text-center text-neutral-500 mb-8">
              Set a new password for your account. Make sure it&apos;s strong
              and easy to remember.
            </p>

            <form
              onSubmit={handleSubmit(onSubmit)}
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
                    {...register("password")}
                    placeholder="Enter your new password"
                    className={`w-full border rounded-lg py-3 px-4 pr-12 text-sm outline-hidden focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                      errors.password
                        ? "border-red-300 focus:border-red-500"
                        : "border-neutral-300"
                    }`}
                    disabled={isSubmitting}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-neutral-500 hover:text-neutral-700"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <IoMdEyeOff size={20} />
                    ) : (
                      <IoMdEye size={20} />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <span className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </span>
                )}

                {/* Password Strength Indicator */}
                {password && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-neutral-700">
                        Password Strength
                      </span>
                      <span
                        className={`text-sm font-medium ${passwordStrength.color.replace(
                          "bg-",
                          "text-"
                        )}`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${passwordStrength.color}`}
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(passwordStrength.score / 4) * 100}%`,
                        }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    {passwordStrength.feedback.length > 0 && (
                      <ul className="mt-2 space-y-1">
                        {passwordStrength.feedback.map((feedback, index) => (
                          <li
                            key={index}
                            className="flex items-center text-sm text-neutral-600"
                          >
                            <IoAlertCircleOutline className="mr-2 flex-shrink-0" />
                            {feedback}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>

              {/* Form state messages */}
              {formState && (
                <div
                  className={`font-medium text-lg p-3 rounded-lg border ${
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
                disabled={isSubmitting || !passwordStrength.isValid}
                className={`w-full p-4 text-lg font-medium text-white rounded-lg transition-colors ${
                  !isSubmitting && passwordStrength.isValid
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-blue-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordForm;
