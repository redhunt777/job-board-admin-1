'use client';
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectIsAuthenticated, selectUserLoading } from '@/store/features/userSlice';
import { loginUser, selectUserError, clearError } from '@/store/features/userSlice';
import { useRouter } from 'next/navigation';
import { IoAlertCircleOutline, IoCheckmarkCircleOutline } from "react-icons/io5";

interface FormData {
  email: string;
  password: string;
}

interface ValidationErrors {
  email?: string;
  password?: string;
}

const AdminLogin = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  
  // Redux state
  const error = useAppSelector(selectUserError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectUserLoading);

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Handle URL parameters for messages
  useEffect(() => {
    const emailConfirmed = searchParams.get('email_confirmed');
    const message = searchParams.get('message');
    const registered = searchParams.get('registered');
    
    if (emailConfirmed) {
      setSuccessMessage("Your email has been confirmed! Please log in to continue.");
    } else if (message) {
      setSuccessMessage(decodeURIComponent(message));
    } else if (registered) {
      setSuccessMessage("Registration successful! Please check your email for confirmation link.");
    }

    // Clear message after 8 seconds
    if (emailConfirmed || message || registered) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Auto-clear Redux errors
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Clear success message when user starts typing
  useEffect(() => {
    if (successMessage && (formData.email || formData.password)) {
      setSuccessMessage(null);
    }
  }, [formData.email, formData.password, successMessage]);

  const handleInputChange = (field: keyof FormData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }
    
    // Clear Redux error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const validateField = (field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case 'email':
        if (!value.trim()) {
          return 'Email is required';
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Please enter a valid email address';
        }
        break;
      case 'password':
        if (!value) {
          return 'Password is required';
        }
        if (value.length < 6) {
          return 'Password must be at least 6 characters long';
        }
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};
    
    Object.keys(formData).forEach(key => {
      const field = key as keyof FormData;
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Real-time validation for touched fields
  const handleBlur = (field: keyof FormData) => () => {
    if (hasSubmitted || formData[field]) {
      const error = validateField(field, formData[field]);
      // Better approach:
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setHasSubmitted(true);
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(loginUser({
        email: formData.email.trim().toLowerCase(),
        password: formData.password
      })).unwrap();
      
      // Success is handled by the redirect in useEffect
    } catch (err) {
      console.log("Login failed:", err);
      // Error is handled by Redux state
    }
  };

  // Get the primary error message to display
  const getErrorMessage = (): string | null => {
    // Show validation errors first
    if (validationErrors.email) return validationErrors.email;
    if (validationErrors.password) return validationErrors.password;
    
    // Then show Redux errors
    if (error) return error;
    
    return null;
  };

  const errorMessage = getErrorMessage();
  const isFormValid = formData.email && formData.password && !Object.keys(validationErrors).length;

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col justify-center items-center bg-white rounded-xl shadow-sm max-w-xl mx-auto p-6 sm:p-10 my-12">
        <form className="w-full flex flex-col gap-2" onSubmit={handleLogin}>
          <h1 className="text-center text-neutral-800 font-semibold text-2xl sm:text-4xl mb-4">
            Admin Login
          </h1>
          
          {/* Email Field */}
          <div>
            <label className="text-lg mt-4 block" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange('email')}
              onBlur={handleBlur('email')}
              className={`w-full p-4 text-lg border rounded-lg mb-2 outline-hidden focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                validationErrors.email 
                  ? 'border-red-300 focus:border-red-500' 
                  : 'border-neutral-300'
              }`}
              required
              autoComplete="email"
              disabled={isLoading}
            />
          </div>

          {/* Password Field */}
          <div>
            <label className="text-lg mt-4 block" htmlFor="password">
              Password
            </label>
            <div className="relative flex items-center mb-2">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleInputChange('password')}
                onBlur={handleBlur('password')}
                className={`w-full p-4 text-lg border rounded-lg pr-12 outline-hidden focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${
                  validationErrors.password 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-neutral-300'
                }`}
                autoComplete="current-password"
                required
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer disabled:cursor-not-allowed"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                {showPassword ? (
                  <IoMdEye size={24} className="text-neutral-500" />
                ) : (
                  <IoMdEyeOff size={24} className="text-neutral-500" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot Password Link */}
          <div className="text-center mb-4">
            <Link
              href="/forgot-password"
              className="text-blue-600 font-medium text-base hover:text-blue-700 hover:underline transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="flex items-center space-x-2 text-green-600 bg-green-50 p-3 rounded-lg border border-green-200 mb-4">
              <IoCheckmarkCircleOutline className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 mb-4">
              <IoAlertCircleOutline className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">{errorMessage}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full cursor-pointer bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium text-lg sm:text-2xl rounded-lg py-3 mb-2 transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg 
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" 
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
                Signing in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>

        {/* Register Link */}
        <div className="text-center mt-10">
          <Link
            href="/register"
            className="text-black font-medium text-xl underline hover:text-blue-700 transition-colors"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;