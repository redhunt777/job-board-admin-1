"use client";
import Link from "next/link";
import React, { useState, useCallback } from "react";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import { useAppSelector } from "@/store/hooks";
import { FaPlus, FaRegEdit, FaCaretDown, FaCheck } from "react-icons/fa";
import { Overlay } from "@/components/settings-overlay";

// Types for better type safety
interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface NotificationPreferences {
  applications: boolean;
  weeklySummary: boolean;
  productUpdates: boolean;
  industryUpdates: boolean;
  communityEvents: boolean;
  otherNotifications: boolean;
}

const steps = ["Roles", "Notifications"];

export default function Settings() {
  const collapsed = useAppSelector((state) => state.ui.sidebar.collapsed);
  const [step, setStep] = useState(0);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "Rohan Gupta",
      email: "rohangupta@gmail.com",
      role: "admin",
    },
  ]);

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    applications: true,
    weeklySummary: true,
    productUpdates: false,
    industryUpdates: true,
    communityEvents: false,
    otherNotifications: true,
  });

  // Handle opening overlay for new member
  const handleAddMember = useCallback(() => {
    setEditingMember(null);
    setShowOverlay(true);
  }, []);

  // Handle opening overlay for editing existing member
  const handleEditMember = useCallback((member: TeamMember) => {
    setEditingMember(member);
    setShowOverlay(true);
  }, []);

  // Handle saving member (add or update)
  const handleSaveMember = useCallback(
    (memberData: Omit<TeamMember, "id">) => {
      if (editingMember) {
        // Update existing member
        setTeamMembers((prev) =>
          prev.map((member) =>
            member.id === editingMember.id
              ? { ...memberData, id: editingMember.id }
              : member
          )
        );
      } else {
        // Add new member with generated ID
        const newMember: TeamMember = {
          ...memberData,
          id: Date.now().toString(), // Simple ID generation
        };
        setTeamMembers((prev) => [...prev, newMember]);
      }
      setShowOverlay(false);
    },
    [editingMember]
  );

  // Handle role change in table
  const handleRoleChange = useCallback((memberId: string, newRole: string) => {
    setTeamMembers((prev) =>
      prev.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );
  }, []);

  // Handle checkbox change for notifications
  const handleCheckboxChange = useCallback(
    (key: keyof NotificationPreferences) => {
      setPreferences((prev) => ({
        ...prev,
        [key]: !prev[key],
      }));
    },
    []
  );

  // Handle saving changes
  const handleSaveChanges = useCallback(async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (step === 0) {
        console.log("Saving team members:", teamMembers);
        // Here you would typically send team data to your backend
      } else {
        console.log("Saving preferences:", preferences);
        // Here you would typically send preferences to your backend
      }

      // Show success message
      alert(
        `${
          step === 0 ? "Team settings" : "Notification preferences"
        } saved successfully!`
      );
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [step, teamMembers, preferences]);

  // Custom checkbox component
  const CheckboxItem = React.memo(
    ({
      checked,
      onChange,
      children,
    }: {
      checked: boolean;
      onChange: () => void;
      children: React.ReactNode;
    }) => (
      <div className="flex items-start gap-3 p-4 transition-colors">
        <button
          type="button"
          className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 cursor-pointer ${
            checked
              ? "bg-green-600 text-white hover:bg-green-700"
              : "border-neutral-300 hover:border-neutral-400 bg-white"
          }`}
          onClick={onChange}
          aria-checked={checked}
          role="checkbox"
        >
          {checked && <FaCheck size={12} />}
        </button>
        <label
          className="text-neutral-700 cursor-pointer select-none leading-relaxed flex-1"
          onClick={onChange}
        >
          {children}
        </label>
      </div>
    )
  );

  CheckboxItem.displayName = "CheckboxItem";

  return (
    <div
      className={`transition-all duration-300 min-h-full md:pb-0 px-3 md:px-6 ${
        collapsed ? "md:ml-20" : "md:ml-60"
      } md:pt-0 pt-4`}
    >
      <div className="mt-4 px-2 md:px-4 py-4">
        {/* Overlay for modal */}
        {showOverlay && (
          <Overlay
            setShowOverlay={setShowOverlay}
            member={editingMember}
            onSave={handleSaveMember}
          />
        )}

        {/* Header section with back link and title */}
        <div className="flex items-center gap-1 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center text-neutral-500 hover:text-neutral-700 font-medium text-base transition-colors"
          >
            <HiOutlineArrowCircleLeft className="w-6 h-6 mr-1" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-base text-neutral-500 font-light">/</span>
          <span className="text-base font-medium text-neutral-900">
            Settings
          </span>
        </div>

        {/* Main content area with title and description */}
        <div className="flex items-center justify-between mt-6 mb-3">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Settings
            </h1>
            <p className="text-sm text-neutral-500 mt-2">
              Customize your account, notifications, roles and recruitment
              preferences to better suit your workflow.
            </p>
          </div>
        </div>

        {/* Tabs navigation for different settings sections */}
        <div className="flex gap-4 mb-6">
          <div className="flex gap-4 border-b border-neutral-200 w-fit">
            {steps.map((stepName, index) => (
              <button
                key={stepName}
                className={`px-10 py-3 text-center font-medium transition-colors whitespace-nowrap cursor-pointer focus:outline-none ${
                  index === step
                    ? "border-b-4 border-blue-600 text-neutral-800"
                    : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-50"
                }`}
                onClick={() => setStep(index)}
                type="button"
                aria-selected={index === step}
                role="tab"
              >
                {stepName}
              </button>
            ))}
          </div>
        </div>

        {/* Content section */}
        <div className="flex justify-center items-center w-full">
          <div className="max-w-7xl w-full pb-20">
            {step === 0 && (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-center mb-6">
                  <h2 className="font-semibold text-xl mb-4 text-neutral-900">
                    Your Recruitment Team
                  </h2>
                  <p className="text-neutral-500 text-sm mx-auto">
                    To streamline your hiring process, you can collaborate with
                    your team on{" "}
                    <span className="text-neutral-800 font-medium">
                      Recrivio
                    </span>
                    . Simply add team members below and click &apos;Save
                    Changes&apos;. We&apos;ll send an invitation email to any
                    new users you add.
                  </p>
                </div>

                <div className="flex justify-end items-center mb-6">
                  <button
                    className="flex items-center border border-blue-600 justify-center gap-2 px-4 py-2 text-blue-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    onClick={handleAddMember}
                    type="button"
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Add Member</span>
                  </button>
                </div>

                <div className="overflow-x-auto rounded-lg border border-neutral-200">
                  <table className="min-w-full text-left">
                    <thead className="bg-neutral-50 border-b border-neutral-200">
                      <tr>
                        <th className="px-4 py-4 text-sm font-medium text-neutral-900">
                          <input
                            type="checkbox"
                            className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                            aria-label="Select all team members"
                          />
                        </th>
                        <th className="px-4 py-4 text-sm font-medium text-neutral-900">
                          Name
                        </th>
                        <th className="px-4 py-4 text-sm font-medium text-neutral-900">
                          Email
                        </th>
                        <th className="px-4 py-4 text-sm font-medium text-neutral-900">
                          Role
                        </th>
                        <th className="px-4 py-4 text-sm font-medium text-neutral-900 text-right">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-neutral-200 bg-white">
                      {teamMembers.map((member) => (
                        <tr
                          key={member.id}
                          className="hover:bg-neutral-50 transition-colors"
                        >
                          <td className="px-4 py-4">
                            <input
                              type="checkbox"
                              className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                              aria-label={`Select ${member.name}`}
                            />
                          </td>
                          <td className="px-4 py-4 font-medium text-neutral-900">
                            {member.name}
                          </td>
                          <td className="px-4 py-4 text-neutral-700">
                            {member.email}
                          </td>
                          <td className="px-4 py-4 text-neutral-700">
                            <div className="relative inline-block w-full max-w-xs">
                              <select
                                value={member.role}
                                onChange={(e) =>
                                  handleRoleChange(member.id, e.target.value)
                                }
                                className="w-full border border-neutral-300 px-3 pr-8 rounded-md py-2 text-sm text-neutral-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:border-neutral-400 transition-colors"
                              >
                                <option value="admin">Admin</option>
                                <option value="ta">
                                  TCL (Talent Acquisition) Lead
                                </option>
                                <option value="hr">HR Manager</option>
                              </select>
                              <FaCaretDown
                                className="absolute top-1/2 right-3 transform -translate-y-1/2 pointer-events-none text-neutral-400"
                                size={12}
                              />
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => handleEditMember(member)}
                              className="p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md cursor-pointer transition-colors"
                              aria-label={`Edit ${member.name}`}
                            >
                              <FaRegEdit className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <>
                <div className="bg-white rounded-lg shadow px-4 py-2">
                  <div className="mx-auto text-sm">
                    <CheckboxItem
                      checked={preferences.applications}
                      onChange={() => handleCheckboxChange("applications")}
                    >
                      I would like to receive applications via Recrivio.
                    </CheckboxItem>

                    <CheckboxItem
                      checked={preferences.weeklySummary}
                      onChange={() => handleCheckboxChange("weeklySummary")}
                    >
                      I would like to receive a weekly summary of the most
                      popular candidates on Recrivio.
                    </CheckboxItem>

                    <CheckboxItem
                      checked={preferences.productUpdates}
                      onChange={() => handleCheckboxChange("productUpdates")}
                    >
                      I would like to receive notifications about new product
                      updates on Recrivio.
                    </CheckboxItem>

                    <CheckboxItem
                      checked={preferences.industryUpdates}
                      onChange={() => handleCheckboxChange("industryUpdates")}
                    >
                      I would like to receive occasional newsletters featuring
                      industry updates and recruitment tips.
                    </CheckboxItem>

                    <CheckboxItem
                      checked={preferences.communityEvents}
                      onChange={() => handleCheckboxChange("communityEvents")}
                    >
                      I would like to receive notifications about recruitment
                      community events, such as webinars and meetups.
                    </CheckboxItem>

                    <CheckboxItem
                      checked={preferences.otherNotifications}
                      onChange={() =>
                        handleCheckboxChange("otherNotifications")
                      }
                    >
                      I would like to receive other relevant notifications from
                      Recrivio.
                    </CheckboxItem>
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <button
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-lg transition-colors cursor-pointer"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
