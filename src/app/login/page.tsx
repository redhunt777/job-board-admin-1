'use client';
import { useEffect, useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { selectIsAuthenticated} from '@/store/features/userSlice';
import { loginUser, selectUserError, clearError } from '@/store/features/userSlice';
import { useRouter } from 'next/navigation';
import { IoAlertCircleOutline } from "react-icons/io5";

const AdminLogin = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
      setIsLoaded(true);
  }, []);
  
  // Redux state
  const error = useAppSelector(selectUserError);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
  }>({});  

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000); // Clear error after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  const handleInputChange = (field: 'email' | 'password') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: undefined }));
    }
    
    // Clear Redux error when user starts typing
    if (error) {
      dispatch(clearError());
    }
  };

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await dispatch(loginUser({
        email: formData.email.trim(),
        password: formData.password
      })).unwrap();
  
    } catch (err) {
      console.log("Login failed:", err);
    }
  };

  // Get error message to display
  const getErrorMessage = () => {
    if (validationErrors.email) return validationErrors.email;
    if (validationErrors.password) return validationErrors.password;
    if (error && error !== "Auth session missing!") return error;
    return null;
  };

  const errorMessage = getErrorMessage();

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col justify-center items-center bg-white rounded-xl shadow max-w-xl mx-auto p-6 sm:p-10 my-12">
        <form className="w-full flex flex-col gap-2" onSubmit={handleLogin}>
          <h1 className="text-center text-neutral-800 font-semibold text-2xl sm:text-4xl mb-4">
            Admin Login
          </h1>
          <label className="text-lg mt-4" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange('email')}
            className={`w-full p-4 text-lg border rounded-lg mb-2 outline-hidden focus:border-blue-500 ${validationErrors.email ? 'border-red-300' : 'border-neutral-300'} `}
            required
            autoComplete="email"
          />
          <label className="text-lg mt-4" htmlFor="password">
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
              className={`w-full p-4 text-lg border ${validationErrors.password ? 'border-red-300' : 'border-neutral-300'} rounded-lg pr-12 outline-hidden focus:border-blue-500`}
              autoComplete="current-password"
              required
            />
            <span
              className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
              role="button"
              tabIndex={0}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <IoMdEye size={24} className="text-neutral-500" />
              ) : (
                <IoMdEyeOff size={24} className="text-neutral-500" />
              )}
            </span>
          </div>
          <Link
            href="/forgot-password"
            className="text-blue-600 font-medium text-base text-center mb-8 hover:underline"
          >
            Forgot Password?
          </Link>
          {/* Error Message */}
          {isLoaded && errorMessage && (
            <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-md">
              <IoAlertCircleOutline className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white sm:font-medium text- sm:text-2xl rounded-lg py-3 mb-2 transition-colors cursor-pointer"
          >
            Login
          </button>
        </form>
        <div className="text-center mt-10">
          <Link
            href="/register"
            className="text-black font-medium text-xl underline hover:text-blue-700"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin
