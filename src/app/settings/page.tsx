"use client";
import Link from "next/link";
import React, { useState, useCallback, useEffect } from "react";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { FaPlus, FaRegEdit, FaCaretDown, FaCheck } from "react-icons/fa";
import { Overlay } from "@/components/settings-overlay";
import {
  fetchOrgMembers,
  addMemberRole,
  selectMembers,
  selectOrganisationLoading,
  selectOrganisationError,
  clearError
} from "@/store/features/organisationSlice";
import { initializeAuth } from "@/store/features/userSlice";
import { RootState } from "@/store/store";

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
  const dispatch = useAppDispatch();
  const collapsed = useAppSelector((state) => state.ui.sidebar.collapsed);
  
  // Redux selectors
  const members = useAppSelector(selectMembers);
  const loading = useAppSelector(selectOrganisationLoading);
  const error = useAppSelector(selectOrganisationError);
  
  // Get current user and organization from your auth/user state
  const currentUser = useAppSelector((state: RootState) => state.user?.user);
  const currentOrgId = useAppSelector((state: RootState) => state.user?.organization?.id);
  const isLoading = useAppSelector((state: RootState) => state.user.loading);
  const userError = useAppSelector((state: RootState) => state.user.error);

  // Local state
  const [step, setStep] = useState(0);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [showOverlay, setShowOverlay] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);

  const [preferences, setPreferences] = useState<NotificationPreferences>({
    applications: true,
    weeklySummary: true,
    productUpdates: false,
    industryUpdates: true,
    communityEvents: false,
    otherNotifications: true,
  });

  // Initialize auth if needed
  useEffect(() => {
    if (!currentUser && !isLoading) {
      console.log("User not found, initializing auth...");
      dispatch(initializeAuth());
    }
  }, [currentUser, isLoading, dispatch]);

  // Fetch organization members on component mount
  useEffect(() => {
    if (currentOrgId) {
      dispatch(fetchOrgMembers(currentOrgId));
    }
  }, [dispatch, currentOrgId]);

  // Clear error after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  // Convert Redux members to component format
  const teamMembers: TeamMember[] = members.map(member => ({
    id: member.id,
    name: member.name,
    email: member.email,
    role: member.role
  }));

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
    async (memberData: TeamMember) => {
      if (!currentOrgId || !currentUser?.id) {
        console.error("Missing organization ID or user ID");
        return;
      }

      try {
        setSavingChanges(true);
        
        if (editingMember) {
          // Update existing member role - use email for the thunk
          console.log("Updating member role:", {
            memberEmailId: editingMember.email,
            role: memberData.role,
            organization_id: currentOrgId,
            assigned_by: currentUser.id
          });

          await dispatch(addMemberRole({
            memberEmailId: editingMember.email,
            role: memberData.role,
            organization_id: currentOrgId,
            assigned_by: currentUser.id
          })).unwrap();

        } else {
          // Add new member - use email from memberData
          console.log("Adding new member:", {
            memberEmailId: memberData.email,
            role: memberData.role,
            organization_id: currentOrgId,
            assigned_by: currentUser.id
          });

          await dispatch(addMemberRole({
            memberEmailId: memberData.email,
            role: memberData.role,
            organization_id: currentOrgId,
            assigned_by: currentUser.id
          })).unwrap();
        }
        
        setShowOverlay(false);
        
        // Show success message
        alert(editingMember ? "Member role updated successfully!" : "Member added successfully!");
        
      } catch (error) {
        console.log("Error saving member:", error);
        alert(`Error ${editingMember ? 'updating' : 'adding'} member: ${error}`);
      } finally {
        setSavingChanges(false);
      }
    },
    [editingMember, currentOrgId, currentUser, dispatch]
  );

  // Handle role change in table
  const handleRoleChange = useCallback(async (member: TeamMember, newRole: string) => {
    if (!currentOrgId || !currentUser?.id) {
      console.error("Missing organization ID or user ID");
      return;
    }

    try {
      await dispatch(addMemberRole({
        memberEmailId: member.email,
        role: newRole,
        organization_id: currentOrgId,
        assigned_by: currentUser.id
      })).unwrap();
      
      console.log(`Role updated for ${member.name}: ${newRole}`);
    } catch (error) {
      console.error("Error updating role:", error);
      alert(`Error updating role: ${error}`);
    }
  }, [currentOrgId, currentUser, dispatch]);

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
    try {
      setSavingChanges(true);
      
      if (step === 0) {
        // Team member changes are handled individually, so just show success
        console.log("Team settings are managed individually per member");
        alert("Team settings are saved automatically when you make changes!");
      } else {
        // Save notification preferences
        console.log("Saving preferences:", preferences);
        // Here you would dispatch an action to save notification preferences
        // dispatch(updateNotificationPreferences(preferences));
        
        // Simulate API call for now
        await new Promise((resolve) => setTimeout(resolve, 1000));
        alert("Notification preferences saved successfully!");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Error saving settings. Please try again.");
    } finally {
      setSavingChanges(false);
    }
  }, [step, preferences]);

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
      <div className="flex items-start gap-3 p-4 hover:bg-neutral-50 rounded-md transition-colors">
        <button
          type="button"
          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            checked
              ? "bg-green-500 border-green-500 text-white hover:bg-green-600"
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

  // Handle user authentication error - moved to render section
  if (userError) {
    return (
      <div
        className={`transition-all duration-300 h-full px-3 md:px-0 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        } pt-4`}
      >
        <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-red-800 font-medium">Authentication Error</h3>
            <p className="text-red-700 mt-2">{userError}</p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading if user is still being fetched - moved to render section
  if (isLoading) {
    return (
      <div
        className={`transition-all duration-300 h-full px-3 md:px-0 ${
          collapsed ? "md:ml-20" : "md:ml-64"
        } pt-4`}
      >
        <div className="max-w-8xl mx-auto px-2 md:px-4 py-4 flex justify-center items-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-neutral-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-300 min-h-full md:pb-0 px-0 ${
        collapsed ? "md:ml-20" : "md:ml-64"
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

        {/* Error display */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <div className="-mx-2 -my-1.5 flex">
                    <button
                      type="button"
                      className="bg-red-50 px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                      onClick={() => dispatch(clearError())}
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header section with back link and title */}
        <div className="flex items-center gap-2 mb-4">
          <Link
            href="/dashboard"
            className="flex items-center text-neutral-500 hover:text-neutral-700 font-semibold text-lg transition-colors"
          >
            <HiOutlineArrowCircleLeft className="w-8 h-8 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-lg text-neutral-300">/</span>
          <span className="text-lg font-bold text-neutral-900">Settings</span>
        </div>

        {/* Main content area with title and description */}
        <div className="flex items-center justify-between my-6">
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">
              Settings
            </h1>
            <p className="text-sm text-neutral-500 mt-2 max-w-2xl">
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
                className={`px-4 py-3 text-center font-medium transition-colors whitespace-nowrap cursor-pointer focus:outline-none ${
                  index === step
                    ? "border-b-2 border-blue-600 text-neutral-800"
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
        <div className="flex items-center w-full">
          <div className="max-w-5xl w-full pb-20">
            {step === 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mx-4">
                <div className="text-center mb-6">
                  <h2 className="font-semibold text-xl mb-4 text-neutral-900">
                    Your Recruitment Team
                  </h2>
                  <p className="text-neutral-500 text-base font-normal max-w-3xl mx-auto">
                    To streamline your hiring process, you can collaborate with
                    your team on{" "}
                    <span className="text-neutral-800 font-medium">
                      Recrivio
                    </span>
                    . Simply add team members below and click &apos;Save Changes&apos;.
                    We&apos;ll send an invitation email to any new users you add.
                  </p>
                </div>

                <div className="flex justify-end items-center mb-6">
                  <button
                    className="flex items-center border border-blue-600 justify-center gap-2 px-4 py-2 text-blue-600 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleAddMember}
                    type="button"
                    disabled={loading || savingChanges}
                  >
                    <FaPlus className="w-4 h-4" />
                    <span>Add Team Member</span>
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-neutral-600">Loading team members...</span>
                  </div>
                ) : (
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
                                    handleRoleChange(member, e.target.value)
                                  }
                                  disabled={loading || savingChanges}
                                  className="w-full border border-neutral-300 px-3 pr-8 rounded-md py-2 text-sm text-neutral-700 bg-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer hover:border-neutral-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                                disabled={loading || savingChanges}
                                className="p-2 text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                )}

                <div className="flex justify-end mt-6">
                  <button
                    onClick={handleSaveChanges}
                    disabled={loading || savingChanges}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm px-6 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    {savingChanges ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <>
                <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mx-4">
                  <div className="space-y-1 max-w-3xl mx-auto">
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
                <div className="flex justify-center mt-8">
                  <button
                    onClick={handleSaveChanges}
                    disabled={loading || savingChanges}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-medium px-8 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                  >
                    {savingChanges ? "Saving..." : "Save Changes"}
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