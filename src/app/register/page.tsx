"use client";
import React, { useState, FormEvent, useEffect } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import "react-phone-number-input/style.css"
import PhoneInput from "react-phone-number-input"
import Link from "next/link";
import { admin_email_signup } from "@/app/register/actions";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated } from '@/store/features/userSlice';
import { FormState } from "@/types/custom";

const AdminRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formState, setFormState] = useState<FormState | null>(null);
  
  const searchParams = useSearchParams();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  // Clear form state when user starts typing
  useEffect(() => {
    if (formState) {
      setFormState(null);
    }
  }, [name, email, phoneNumber, password]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Reset form state
    setFormState(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('phone', phoneNumber);
      formData.append('password', password);

      const result = await admin_email_signup(formData);
      
      if (result.success) {
        setFormState({
          success: true,
          message: result.message
        });
        // Optional: Clear form on success
        // setName("");
        // setEmail("");
        // setPhoneNumber("");
        // setPassword("");
      } else {
        setFormState({
          success: false,
          error: result.error || 'Registration failed. Please try again.'
        });
      }
    } catch (error) {
      console.log('Form submission error:', error);
      setFormState({
        success: false,
        error: 'Something went wrong. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const isFormValid = name && email && phoneNumber && password;

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col justify-center items-center bg-white rounded-xl shadow-sm max-w-4xl mx-auto p-6 sm:p-10 my-10">
        <form className="w-full flex flex-col gap-2" onSubmit={handleSubmit}>
          <h1 className="text-center text-neutral-800 font-semibold text-2xl sm:text-4xl mb-4">
            Register
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-lg mt-4" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                name="name"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 text-lg border border-neutral-300 rounded-lg mb-2 outline-hidden focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="text-lg mt-4" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 text-lg border border-neutral-300 rounded-lg mb-2 outline-hidden focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                required
                disabled={isLoading}
              />
            </div>
            
            <div>
              <label className="text-lg mt-4" htmlFor="phone">
                Mobile Number
              </label>
              <div className="focus-within:border-blue-500 focus-within:outline-hidden border border-neutral-300 rounded-lg mb-2">
                <PhoneInput
                  id="phone"
                  name="phone"
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="IN"
                  value={phoneNumber}
                  onChange={(value) => setPhoneNumber(value || "")}
                  className="w-full p-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter phone number"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div>
              <label className="text-lg mt-4" htmlFor="password">
                Password
              </label>
              <div className="relative flex items-center mb-2">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-4 text-lg border border-neutral-300 rounded-lg pr-12 outline-hidden focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                  disabled={isLoading}
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
            </div>
          </div>
          
          {/* Error from URL params (legacy support) */}
          {searchParams.get('error') && !formState && (
            <div className="text-red-500 font-medium text-lg bg-red-50 p-3 rounded-lg border border-red-200">
              {searchParams.get('error')}
            </div>
          )}
          
          {/* Success message */}
          {formState?.success && (
            <div className="text-green-600 font-medium text-lg bg-green-50 p-3 rounded-lg border border-green-200">
              {formState.message}
            </div>
          )}
          
          {/* Error message */}
          {formState?.error && (
            <div className="text-red-500 font-medium text-lg bg-red-50 p-3 rounded-lg border border-red-200">
              {formState.error}
            </div>
          )}
          
          <button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white sm:font-medium text-lg sm:text-2xl rounded-lg py-3 mt-6 mb-2 transition-colors cursor-pointer flex items-center justify-center"
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
                  ></circle>
                  <path 
                    className="opacity-75" 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Registering...
              </>
            ) : (
              'Register'
            )}
          </button>
        </form>
        
        <div className="text-center mt-10">
          <Link
            href="/login"
            className="text-black font-medium text-xl underline hover:text-blue-700"
          >
            Login here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;