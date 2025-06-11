"use client";

import { useEffect, useMemo } from "react";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { GoPlus } from "react-icons/go";
import { HiOutlineArrowCircleLeft } from "react-icons/hi";
import Link from "next/link";
import CandidatesList from "@/components/candidates_list_component";
import {
  fetchJobApplicationsWithAccess,
  setUserContext,
  clearError,
  selectCandidatesError,
  selectCandidatesLoading,
  selectUserContext,
  selectHasFullAccess,
  selectIsTAOnly,
  CandidateWithApplication,
  UserContext,
} from "@/store/features/candidatesSlice";

import {
  initializeAuth,
} from "@/store/features/userSlice";

export default function Candidates() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // UI selectors
  const collapsed = useAppSelector((state) => state.ui.sidebar.collapsed);
  
  // Candidates selectors
  const error = useAppSelector(selectCandidatesError);
  const loading = useAppSelector(selectCandidatesLoading);
  const userContext = useAppSelector(selectUserContext);
  const hasFullAccess = useAppSelector(selectHasFullAccess);
  const isTAOnly = useAppSelector(selectIsTAOnly);

  // Get user authentication data
  const user = useAppSelector((state) => state.user.user);
  const organization = useAppSelector((state) => state.user.organization);
  const roles = useAppSelector((state) => state.user.roles);

  // Initialize authentication if not already done
  useEffect(() => {
    if (!user || !organization) {
      dispatch(initializeAuth());
    }
  }, [dispatch, user, organization]);

  // Memoize user context to prevent unnecessary re-renders
  const memoizedUserContext = useMemo((): UserContext | null => {
    console.log("Memoizing user context:", {
      userId: user?.id,
      organizationId: organization?.id,
      roles: roles[0],
    }
    )
    if (!user?.id || !organization?.id || !roles[0]) {
      return null;
    }

    return {
      userId: user.id,
      organizationId: organization.id,
      roles: roles.map(role => typeof role === 'string' ? role : role.toString()), // e.g., ['admin'], ['hr'], ['ta'], etc.
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
      dispatch(fetchJobApplicationsWithAccess({
        filters: {}, // You can add default filters here if needed
        userContext: memoizedUserContext,
      }));
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

  // Handle candidate click (optional - for future use)
  const handleCandidateClick = (candidate: CandidateWithApplication) => {
    // Navigate to candidate detail page
    router.push(`/candidates/${candidate.application_id}`);
  };

  // Show loading state if user context is not available
  if (!memoizedUserContext) {
    return (
      <div className={`transition-all duration-300 h-full px-3 md:px-0 ${collapsed ? "md:ml-20" : "md:ml-64"} pt-4`}>
        <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading user context...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error state if there's an authentication error
  if (!user || !organization) {
    return (
      <div className={`transition-all duration-300 h-full px-3 md:px-0 ${collapsed ? "md:ml-20" : "md:ml-64"} pt-4`}>
        <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-500 mb-2">Authentication Error</p>
              <p className="text-gray-500 text-sm">Unable to load user or organization data</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`transition-all duration-300 h-full px-3 md:px-0 ${collapsed ? "md:ml-20" : "md:ml-64"} pt-4`}>
      <div className="max-w-8xl mx-auto px-2 md:px-4 py-4">
        {/* Back Navigation and Title */}
        <div className="flex items-center gap-2 mb-6">
          <Link
            href="/dashboard"
            className="flex items-center text-gray-500 hover:text-gray-700 font-semibold text-lg transition-colors"
          >
            <HiOutlineArrowCircleLeft className="w-8 h-8 mr-2" />
            <span>Back to Dashboard</span>
          </Link>
          <span className="text-lg text-gray-300 font-light">/</span>
          <span className="text-lg font-bold text-gray-900">Candidates</span>
        </div>

        {/* Header with Role-based Content */}
        <div className="flex items-center flex-wrap justify-between my-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-[#151515]">
                All Candidates
              </h1>
              
              {/* Role indicator badge */}
              {isTAOnly && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  TA Access
                </span>
              )}
              {hasFullAccess && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Full Access
                </span>
              )}
            </div>
            
            <div className="mt-2">
              <p className="text-sm text-[#606167]">
                {isTAOnly 
                  ? "Manage candidates for jobs you have access to."
                  : "Manage all candidates and their applications with ease."
                }
              </p>
              
              {/* Organization info */}
              <p className="text-xs text-[#8B8B8B] mt-1">
                Organization: {organization.name || 'Current Organization'}
              </p>
            </div>
          </div>

          {/* Add Job Button - Show based on permissions */}
          {(hasFullAccess || roles?.includes('admin' as any)) && (
            <div className="w-full md:w-auto mt-4 md:mt-0">
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
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
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
              <p className="text-blue-800 text-sm">Loading candidates...</p>
            </div>
          </div>
        )}

        {/* Access Control Info for TA users */}
        {isTAOnly && !loading && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-amber-400 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-amber-800">
                  Limited Access
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  You can only view and manage candidates for jobs you have been granted access to.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Candidates List Component */}
        <CandidatesList
          showHeader={false} // We're showing our own header above
          showFilters={true}
          showPagination={true}
          showSorting={true}
          maxItems={20}
          onCandidateClick={handleCandidateClick}
        />
      </div>
    </div>
  );
}
