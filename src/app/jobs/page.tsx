"use client";
import React, { useEffect, useState } from "react";
import JobsClientComponent from "./JobsClientComponent";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { RootState } from "@/store/store";
import { initializeAuth } from "@/store/features/userSlice";

// Loading component for better UX
const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-gray-600">{message}</span>
  </div>
);

// Error/Info message component
const InfoMessage = ({ message, type = "info" }: { message: string; type?: "info" | "error" }) => (
  <div className={`p-4 rounded-lg text-center ${
    type === "error" 
      ? "bg-red-50 text-red-700 border border-red-200" 
      : "bg-blue-50 text-blue-700 border border-blue-200"
  }`}>
    {message}
  </div>
);

export default function JobsPage() {
  const user = useAppSelector((state: RootState) => state.user.user);
  const organization = useAppSelector((state: RootState) => state.user.organization);
  const roles = useAppSelector((state: RootState) => state.user.roles);
  const isLoading = useAppSelector((state: RootState) => state.user.loading);
  const error = useAppSelector((state: RootState) => state.user.error);

    // UI selectors
  const collapsed = useAppSelector((state) => state.ui.sidebar.collapsed);

  const dispatch = useAppDispatch();

    useEffect(() => {
    if (!user && !isLoading) {
        console.log("User not found, initializing auth...");
        console.log("Current user state:", user);
        console.log("Current loading state:", isLoading);
        dispatch(initializeAuth());
    }
    }, [user, isLoading, dispatch]);

  // Handle error state
  if (error) {
    return (
      <div className={`transition-all duration-300 h-full px-3 md:px-0 ${collapsed ? "md:ml-20" : "md:ml-64"} pt-4`}>
        <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
          <InfoMessage 
            message={`Authentication error: ${error}`} 
            type="error" 
          />
        </div>
      </div>
    );
  }

  // Handle loading state
   if (isLoading || !user) {
    return (
      <div className={`transition-all duration-300 h-full px-3 md:px-0 ${collapsed ? "md:ml-20" : "md:ml-64"} pt-4`}>
        <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
          <LoadingSpinner message="Loading user authentication..." />
        </div>
      </div>
    );
  }

  // Handle missing organization
  if (!organization) {
    return (
      <div className={`transition-all duration-300 h-full px-3 md:px-0 ${collapsed ? "md:ml-20" : "md:ml-64"} pt-4`}>
        <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
          <InfoMessage 
            message="You are not part of any organization. Please contact your administrator." 
            type="info"
          />
        </div>
      </div>
    );
  }

  // Handle missing roles with more helpful message
  if (!roles || roles.length === 0) {
    return (
       <div className={`transition-all duration-300 h-full px-3 md:px-0 ${collapsed ? "md:ml-20" : "md:ml-64"} pt-4`}>
        <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
          <InfoMessage 
            message="No role is assigned to you. Please contact your administrator to assign a role." 
            type="info"
          />
        </div>
      </div>
    );
  }

  // Get the primary role (first role) with fallback
  const primaryRole = roles[0]?.role?.name || "Unknown";

  // Additional validation for required data
  if (!user.id || !organization.id) {
    return (
      <div className="container min-h-screen mx-auto px-4 py-8">
        <InfoMessage 
          message="Invalid user or organization data. Please try refreshing the page." 
          type="error" 
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <JobsClientComponent
        userId={user.id}
        userRole={primaryRole}
        organizationId={organization.id}
      />
    </div>
  );
}