"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { GoPlus } from "react-icons/go";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import Link from "next/link";
import CandidatesList from "@/components/candidates_list_component";
import { RootState } from "@/store/store";
import {
  fetchJobApplicationsWithAccess,
  setUserContext,
  clearError,
  selectCandidatesError,
  selectCandidatesLoading,
  selectUserContext,
  selectHasFullAccess,
  selectIsTAOnly,
  UserContext,
} from "@/store/features/candidatesSlice";

import { initializeAuth } from "@/store/features/userSlice";

import { User } from "@supabase/supabase-js";
import { Organization, UserRole } from "@/types/custom";

// Loading component for better UX
const LoadingSpinner = ({ message = "Loading..." }: { message?: string }) => (
  <div className="flex items-center justify-center min-h-[200px]">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span className="ml-2 text-neutral-600">{message}</span>
  </div>
);

// Error/Info message component
const InfoMessage = ({
  message,
  type = "info",
}: {
  message: string;
  type?: "info" | "error";
}) => (
  <div
    className={`p-4 rounded-lg text-center ${
      type === "error"
        ? "bg-red-50 text-red-700 border border-red-200"
        : "bg-blue-50 text-blue-700 border border-blue-200"
    }`}
  >
    {message}
  </div>
);

// Main Candidates Content Component
const CandidatesContent = ({
  user,
  organization,
  roles,
  collapsed,
}: {
  user: User;
  organization: Organization;
  roles: UserRole[];
  collapsed: boolean;
}) => {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Candidates selectors
  const error = useAppSelector((state) =>
    selectCandidatesError(state as RootState)
  );
  const loading = useAppSelector((state) =>
    selectCandidatesLoading(state as RootState)
  );
  const userContext = useAppSelector((state) =>
    selectUserContext(state as RootState)
  );
  const hasFullAccess = useAppSelector((state) =>
    selectHasFullAccess(state as RootState)
  );
  const isTAOnly = useAppSelector((state) =>
    selectIsTAOnly(state as RootState)
  );

  // Memoize user context to prevent unnecessary re-renders
  const memoizedUserContext = useMemo((): UserContext | null => {
    console.log("Memoizing user context:", {
      userId: user?.id,
      organizationId: organization?.id,
      roles: roles,
    });

    if (!user?.id || !organization?.id || !roles || roles.length === 0) {
      return null;
    }

    return {
      userId: user.id,
      organizationId: organization.id,
      roles: roles.map((role) =>
        typeof role === "string" ? role : role?.role?.name || role.toString()
      ),
    };
  }, [user?.id, organization?.id, roles]);

  // Set user context when it's available
  useEffect(() => {
    if (memoizedUserContext && !userContext) {
      dispatch(setUserContext(memoizedUserContext));
    }
  }, [memoizedUserContext, userContext, dispatch]);

  // Load candidates when user context is available
  useEffect(() => {
    if (memoizedUserContext) {
      dispatch(
        fetchJobApplicationsWithAccess({
          filters: {}, // You can add default filters here if needed
          userContext: memoizedUserContext,
        })
      );
    }
  }, [dispatch, memoizedUserContext]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      if (error) {
        dispatch(clearError());
      }
    };
  }, [dispatch, error]);

  const handleAddJob = () => {
    router.push("/jobs/add-job");
  };

  return (
    <div
      className={`transition-all duration-300 h-full px-3 md:px-6 ${
        collapsed ? "md:ml-20" : "md:ml-60"
      } pt-4`}
    >
      <div className="max-w-8xl mx-auto px-0 md:px-4 py-0 md:py-4">
        {/* Back Navigation and Title */}
        <div className="flex items-center gap-1 mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-neutral-500 hover:text-neutral-700 font-medium md:text-base text-sm transition-colors"
          >
            <HiOutlineArrowCircleLeft className="w-6 h-6 mr-1" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="md:text-base text-sm text-neutral-500 font-light">
            /
          </span>
          <span className="md:text-base text-sm font-medium text-neutral-900">
            Candidates
          </span>
        </div>

        {/* Header with Role-based Content */}
        <div className="flex items-center flex-wrap justify-between my-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-neutral-900">
                All Candidates
              </h1>

              {/* Role indicator badge */}
              {/* {isTAOnly && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  TA Access
                </span>
              )}
              {hasFullAccess && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Full Access
                </span>
              )} */}
            </div>

            <div className="mt-2">
              <p className="text-sm text-neutral-500">
                {isTAOnly
                  ? "Manage candidates for jobs you have access to."
                  : "Manage all candidates and their applications with ease."}
              </p>

              {/* Organization and role info */}
              {/* <div className="flex flex-wrap gap-4 text-xs text-neutral-500 mt-1">
                <span>
                  Organization: {organization.name || "Current Organization"}
                </span>
                <span>Role: {primaryRole}</span>
              </div> */}
            </div>
          </div>

          {/* Add Job Button - Show based on permissions */}
          {(hasFullAccess ||
            roles?.some(
              (role) =>
                (typeof role === "string" ? role : role?.role?.name) === "admin"
            )) && (
            <div className="w-full hidden md:block md:w-auto mt-4 md:mt-0">
              <button
                type="button"
                onClick={handleAddJob}
                aria-label="Add Job"
                className="bg-blue-600 w-full md:w-auto hover:bg-blue-700 text-white sm:font-medium sm:text-xl rounded-lg py-2 transition-colors cursor-pointer px-5 flex items-center justify-center md:justify-start gap-2"
              >
                <GoPlus className="h-8 w-8" />
                Add Job
              </button>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Error loading candidates
                </h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => dispatch(clearError())}
                  className="text-red-800 hover:text-red-900 text-sm underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
              <p className="text-blue-800 text-sm">Lo</p>
            </div>
          </div>
        )}

        {/* Access Control Info for TA users */}
        {/* {isTAOnly && !loading && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-amber-400 mt-0.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Limited Access
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  You can only view and manage candidates for jobs you have been
                  granted access to.
                </p>
              </div>
            </div>
          </div>
        )} */}

        {/* Candidates List Component */}
        <CandidatesList
          showHeader={false} // We're showing our own header above
          showFilters={true}
          // showPagination={true}
          showSorting={true}
          maxItems={20}
        />
      </div>
    </div>
  );
};

export default function Candidates() {
  const dispatch = useAppDispatch();

  // UI selectors
  const collapsed = useAppSelector((state) => state.ui.sidebar.collapsed);

  // User authentication data
  const user = useAppSelector((state: RootState) => state.user.user);
  const organization = useAppSelector(
    (state: RootState) => state.user.organization
  );
  const roles = useAppSelector((state: RootState) => state.user.roles);
  const isLoading = useAppSelector((state: RootState) => state.user.loading);
  const error = useAppSelector((state: RootState) => state.user.error);

  // Ref to track if auth initialization has been attempted
  const authInitialized = useRef(false);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Initialize auth only once and only if user is truly not authenticated
  useEffect(() => {
    if (
      authInitialized.current || 
      isLoading || 
      user || 
      error ||
      !mountedRef.current
    ) {
      return;
    }

    console.log("Initializing auth for the first time...");
    authInitialized.current = true;
    dispatch(initializeAuth());
  }, [dispatch, user, isLoading, error]);

  // Reset auth initialization flag when user logs out
  useEffect(() => {
    if (error && authInitialized.current) {
      console.log("User error detected, resetting auth initialization flag");
      authInitialized.current = false;
    }
  }, [error]);

  // Handle error state
  if (error) {
    return (
      <div
        className={`transition-all duration-300 h-full px-3 md:px-0 ${
          collapsed ? "md:ml-20" : "md:ml-60"
        } pt-4`}
      >
        <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <h3 className="text-red-800 font-medium">Authentication Error</h3>
            <p className="text-red-700 mt-2">{error}</p>
            <div className="mt-4">
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show loading only during initial auth check
  if (isLoading && !authInitialized.current) {
    return (
      <div
        className={`transition-all duration-300 h-full px-3 md:px-0 ${
          collapsed ? "md:ml-20" : "md:ml-60"
        } pt-4`}
      >
        <div className="max-w-8xl mx-auto px-2 md:px-4 py-4 flex justify-center items-center">
          <LoadingSpinner message="Loading candidates..." />
        </div>
      </div>
    );
  }

  // If no user after auth initialization, redirect to login
  if (!user && authInitialized.current && !isLoading) {
    return (
      <div
        className={`transition-all duration-300 h-full px-3 md:px-0 ${
          collapsed ? "md:ml-20" : "md:ml-60"
        } pt-4`}
      >
        <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <h3 className="text-yellow-800 font-medium">Authentication Required</h3>
            <p className="text-yellow-700 mt-2">Please log in to access candidates.</p>
            <div className="mt-4">
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle missing organization
  if (!organization) {
    return (
      <div
        className={`transition-all duration-300 h-full px-3 md:px-0 ${
          collapsed ? "md:ml-20" : "md:ml-60"
        } pt-4`}
      >
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
      <div
        className={`transition-all duration-300 h-full px-3 md:px-0 ${
          collapsed ? "md:ml-20" : "md:ml-60"
        } pt-4`}
      >
        <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
          <InfoMessage
            message="No role is assigned to you. Please contact your administrator to assign a role."
            type="info"
          />
        </div>
      </div>
    );
  }

  // Additional validation for required data
  if (!user || !user.id || !organization.id) {
    return (
      <div
        className={`transition-all duration-300 h-full px-3 md:px-0 ${
          collapsed ? "md:ml-20" : "md:ml-60"
        } pt-4`}
      >
        <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
          <InfoMessage
            message="Invalid user or organization data. Please try refreshing the page."
            type="error"
          />
        </div>
      </div>
    );
  }

  return (
    <CandidatesContent
      user={user}
      organization={organization}
      roles={roles}
      collapsed={collapsed}
    />
  );
}