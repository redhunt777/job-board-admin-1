"use client";
import { useState, useEffect } from "react";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import Link from "next/link";
import Image from "next/image";
import PhoneInput from "react-phone-number-input";
import { parsePhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { createClient } from "@/utils/supabase/client";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import type { RootState } from "@/store/store";
import { FiEdit3 } from "react-icons/fi";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { refreshUserData, updateProfile } from "@/store/features/userSlice";
import { updateUserProfileAction } from "@/app/login/actions";

export default function Profile() {
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state: RootState) => state.ui.sidebar.collapsed);
  const { profile, user, loading: userLoading } = useAppSelector((state) => state.user);
  
  // Local state for form inputs
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateSuccess, setUpdateSuccess] = useState<string | null>(null);

  // Helper function to normalize phone number to E.164 format
  const normalizePhoneNumber = (phoneNumber: string | null | undefined): string | undefined => {
    if (!phoneNumber) return undefined;
    
    try {
      // Remove all spaces and non-digit characters except + 
      const cleaned = phoneNumber.replace(/\s+/g, '');
      
      // Try to parse the phone number
      const parsed = parsePhoneNumber(cleaned);
      if (parsed && parsed.isValid()) {
        return parsed.number; // Returns E.164 format
      }
      
      // If parsing fails, return the cleaned version
      return cleaned;
    } catch (error) {
      console.warn('Phone number parsing error:', error);
      return phoneNumber.replace(/\s+/g, '');
    }
  };

  // Initialize form with user data
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setEmail(profile.email || "");
      setPhone(normalizePhoneNumber(profile.phone));
    } else if (user) {
      // Fallback to user email if no profile
    }
  }, [profile, user]);

  // Load user data on component mount if not already loaded
  useEffect(() => {
    if (!profile && !userLoading) {
      dispatch(refreshUserData());
    }
  }, [dispatch, profile, userLoading]);

  // Clear messages after timeout
  useEffect(() => {
    if (updateError || updateSuccess) {
      const timer = setTimeout(() => {
        setUpdateError(null);
        setUpdateSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [updateError, updateSuccess]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setUpdateError(null);
    setUpdateSuccess(null);

    try {
      const supabase = createClient();

      // Validate required fields
      if (!name.trim()) {
        setUpdateError("Name is required");
        setLoading(false);
        return;
      }

      // Validate password fields if provided
      if (currentPassword && !newPassword) {
        setUpdateError("Please enter a new password");
        setLoading(false);
        return;
      }

      if (!currentPassword && newPassword) {
        setUpdateError("Please enter your current password");
        setLoading(false);
        return;
      }

      if (newPassword && newPassword.length < 6) {
        setUpdateError("New password must be at least 6 characters long");
        setLoading(false);
        return;
      }

      // Update profile data
      if (profile) {
        const profileUpdateData = {
          full_name: name.trim(),
          phone: phone || null, // This will be in E.164 format from react-phone-number-input
        };

        const profileResult = await updateUserProfileAction(profileUpdateData);

        if (!profileResult.success) {
          setUpdateError(profileResult.error || "Failed to update profile");
          setLoading(false);
          return;
        }

        // Update Redux state with new profile data
        dispatch(updateProfile(profileUpdateData));
      }

      // Update password if provided
      if (currentPassword && newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({
          password: newPassword
        });

        if (passwordError) {
          setUpdateError(`Password update failed: ${passwordError.message}`);
          setLoading(false);
          return;
        }
      }

      // Clear password fields on success
      setCurrentPassword("");
      setNewPassword("");
      setUpdateSuccess("Profile updated successfully!");

    } catch (error) {
      console.error("Profile update error:", error);
      setUpdateError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching user data
  if (userLoading && !profile) {
    return (
      <div
        className={`transition-all duration-300 min-h-full md:pb-0 px-4 ${
          collapsed ? "md:ml-20" : "md:ml-60"
        } md:pt-0 pt-4`}
      >
        <div className="mt-4 px-2 md:px-4 py-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-neutral-600">Loading profile...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-300 min-h-full md:pb-0 px-4 ${
        collapsed ? "md:ml-20" : "md:ml-60"
      } md:pt-0 pt-4`}
    >
      <div className="mt-4 px-2 md:px-4 py-4 ">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center text-neutral-500 hover:text-neutral-700 font-medium text-base"
          >
            <HiOutlineArrowCircleLeft className="w-6 h-6 mr-1" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-base text-neutral-500 font-light">/</span>
          <span className="text-base font-medium text-neutral-900">
            Edit Profile
          </span>
        </div>
        
        {/* Title & Description */}
        <div className="mb-4">
          <h1 className="text-3xl font-semibold text-neutral-900 mb-2">
            Edit Profile
          </h1>
          <p className="text-neutral-600 text-base max-w-2xl">
            Update your personal information, contact details, and password to
            keep your profile up to date.
          </p>
        </div>

        {/* Success/Error Messages */}
        {updateSuccess && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 font-medium">{updateSuccess}</p>
          </div>
        )}
        
        {updateError && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">{updateError}</p>
          </div>
        )}
        
        {/* Profile Form */}
        <form
          className="max-w-6xl p-4 flex flex-col gap-8"
          onSubmit={handleSave}
        >
          {/* Profile Picture */}
          <div className="flex justify-center md:justify-start">
            <div className="relative w-36 h-36 flex-shrink-0">
              <div className="rounded-full overflow-hidden w-36 h-36 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <Image
                    src={profile.avatar_url}
                    alt="Profile Avatar"
                    fill
                    className="object-cover rounded-full"
                    sizes="9rem"
                    draggable={false}
                  />
                ) : (
                  <Image
                    src={"/logomark-white.svg"}
                    alt="Profile Avatar"
                    fill
                    className="object-contain bg-gradient-to-b from-blue-800 to-blue-900 rounded-full p-5"
                    sizes="9rem"
                    draggable={false}
                  />
                )}
              </div>
              <button
                type="button"
                className="absolute bottom-2 right-2 bg-neutral-200 rounded-full p-2 shadow hover:bg-neutral-300 transition cursor-pointer"
                title="Edit Avatar"
                tabIndex={-1}
              >
                <FiEdit3 className="w-5 h-5 text-neutral-700" />
              </button>
            </div>
          </div>
          
          {/* Name & Email Row */}
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-neutral-700 font-medium">Name</label>
              <input
                type="text"
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-neutral-200"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-neutral-700 font-medium">Email</label>
              <input
                type="email"
                className="rounded-lg border border-neutral-200 bg-neutral-100 px-4 py-3 text-base focus:outline-none cursor-not-allowed"
                value={email}
                readOnly
                title="Email cannot be changed"
              />
            </div>
          </div>
          
          {/* Phone Row */}
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="md:w-1/2 flex flex-col gap-2 pr-3">
              <label className="text-neutral-700 font-medium">Phone</label>
              <PhoneInput
                international
                defaultCountry="IN"
                value={phone}
                onChange={setPhone}
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-neutral-200"
                placeholder="Enter phone number"
                disabled={loading}
              />
            </div>
          </div>
          
          {/* Password Section */}
          <div className="flex flex-col md:flex-row gap-6 w-full">
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-neutral-700 font-medium">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-base w-full focus:outline-none focus:ring-1 focus:ring-neutral-200 pr-12"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 disabled:cursor-not-allowed"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showCurrentPassword ? (
                    <IoMdEye className="w-6 h-6" />
                  ) : (
                    <IoMdEyeOff className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-neutral-700 font-medium">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-base w-full focus:outline-none focus:ring-1 focus:ring-neutral-200 pr-12"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 disabled:cursor-not-allowed"
                  onClick={() => setShowNewPassword((v) => !v)}
                  tabIndex={-1}
                  disabled={loading}
                >
                  {showNewPassword ? (
                    <IoMdEye className="w-6 h-6" />
                  ) : (
                    <IoMdEyeOff className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>
          </div>
          
          {/* Save Button Row */}
          <div className="flex justify-center md:justify-start mt-4">
            <button
              type="submit"
              className="bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg px-6 py-3 text-lg shadow transition disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
