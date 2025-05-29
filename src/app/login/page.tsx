"use client";
import { useEffect, useState } from "react";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { admin_email_login } from "./actions";
import { createClient } from "@/utils/supabase/client";

const AdminLogin = () => {
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const supabase = createClient();
  // Check if the user is already logged in
  useEffect(() => {
    const checkLoginStatus = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        // Redirect to the dashboard if already logged in
        console.log("User is already logged in:", data.user);
        window.location.href = "/dashboard";
      }
    };
    checkLoginStatus();
  }, []);


  return (
    <div className="container mx-auto px-4">
      <div className="flex flex-col justify-center items-center bg-white rounded-xl shadow max-w-xl mx-auto p-6 sm:p-10 my-12">
        <form className="w-full flex flex-col gap-2">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 text-lg border border-neutral-300 rounded-lg mb-2 outline-hidden focus:border-blue-500"
            required
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
          <Link
            href="/forgot-password"
            className="text-blue-600 font-medium text-base text-center mb-8 hover:underline"
          >
            Forgot Password?
          </Link>
          {
          searchParams.get('error') && (
            <div className="text-red-500 font-medium text-lg">
              {searchParams.get('error')}
            </div>
          )
          }
          {
          searchParams.get('message') && (
            <div className="text-green-500 font-medium text-lg">
              {searchParams.get('message')}
            </div>
          )
          }
          <button
            formAction={admin_email_login}
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

export default AdminLogin;
