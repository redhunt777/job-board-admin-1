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

const AdminRegister = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const searchParams = useSearchParams();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const router = useRouter();


  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col justify-center items-center bg-white rounded-xl shadow-sm max-w-4xl mx-auto p-6 sm:p-10 my-10">
        <form className="w-full flex flex-col gap-2">
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
                className="w-full p-4 text-lg border border-neutral-300 rounded-lg mb-2 outline-hidden focus:border-blue-500"
                required
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
                className="w-full p-4 text-lg border border-neutral-300 rounded-lg mb-2 outline-hidden focus:border-blue-500"
                required
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
                  className="w-full p-4 text-lg"
                  placeholder="Enter phone number"
                  required
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
                  className="w-full p-4 text-lg border border-neutral-300 rounded-lg pr-12 outline-hidden focus:border-blue-500"
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
            </div>
          </div>
          {
            searchParams.get('error') && (
              <div className="text-red-500 font-medium text-lg">
                {searchParams.get('error')}
              </div>
            )
          }
          <button
            formAction={admin_email_signup}
            type="submit"
            disabled={!name || !email || !phoneNumber || !password}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white sm:font-medium text- sm:text-2xl rounded-lg py-3 mt-6 mb-2 transition-colors cursor-pointer"
          >
            Register
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
