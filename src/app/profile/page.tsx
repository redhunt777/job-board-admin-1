"use client";
import { useState, useEffect } from "react";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import Link from "next/link";
import Image from "next/image";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { createClient } from "@/utils/supabase/client";
import { useAppSelector } from "@/store/hooks";
import { FiEdit3 } from "react-icons/fi";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";

export default function Profile() {
  const collapsed = useAppSelector((state) => state.ui.sidebar.collapsed);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState<string | undefined>("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data, error } = await supabase
          .from("admin")
          .select("name, email, phone")
          .eq("id", user.id)
          .single();
        if (!error && data) {
          setName(data.name || "");
          setEmail(data.email || "");
          setPhone(data.phone || "");
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("admin").update({ name, phone }).eq("id", user.id);
      if (currentPassword && newPassword) {
        await supabase.auth.updateUser({ password: newPassword });
      }
    }
    setCurrentPassword("");
    setNewPassword("");
    setLoading(false);
  };

  return (
    <div
      className={`transition-all duration-300 min-h-full md:pb-0 px-4 ${
        collapsed ? "md:ml-20" : "md:ml-64"
      } md:pt-0 pt-4`}
    >
      <div className="mt-4 px-2 md:px-4 py-4 ">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center text-neutral-500 hover:text-neutral-700 font-semibold text-lg"
          >
            <HiOutlineArrowCircleLeft className="w-8 h-8 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-lg text-neutral-300 font-light">/</span>
          <span className="text-lg font-bold text-neutral-900">
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
        {/* Profile Form */}
        <form
          className="max-w-6xl p-4 flex flex-col gap-8"
          onSubmit={handleSave}
        >
          {/* Profile Picture */}
          <div className="flex justify-center md:justify-start">
            <div className="relative w-36 h-36 flex-shrink-0">
              <div className="rounded-full overflow-hidden w-36 h-36 flex items-center justify-center">
                <Image
                  src={"/logomark-white.svg"}
                  alt="Profile Avatar"
                  fill
                  className="object-contain bg-gradient-to-b from-blue-800 to-blue-900 rounded-full p-5"
                  sizes="9rem"
                  draggable={false}
                />
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
              />
            </div>
            <div className="flex-1 flex flex-col gap-2">
              <label className="text-neutral-700 font-medium">Email</label>
              <input
                type="email"
                className="rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-3 text-base focus:outline-none focus:ring-1 focus:ring-neutral-200"
                value={email}
                readOnly
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
                required
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
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  onClick={() => setShowCurrentPassword((v) => !v)}
                  tabIndex={-1}
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
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                  onClick={() => setShowNewPassword((v) => !v)}
                  tabIndex={-1}
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
              className="bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg px-6 py-3 text-lg shadow transition disabled:opacity-60 cursor-pointer"
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
