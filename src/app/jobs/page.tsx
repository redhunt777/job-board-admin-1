"use client";
import React, {useEffect} from "react";
import JobsClientComponent from "./JobsClientComponent";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { RootState } from "@/store/store";
import {
  initializeAuth,
} from "@/store/features/userSlice";

export default function JobsPage() {
    const user = useAppSelector((state: RootState) => state.user.user);
    const organization = useAppSelector((state: RootState) => state.user.organization);
    const roles = useAppSelector((state: RootState) => state.user.roles);

    const dispatch = useAppDispatch();

    // Initialize authentication if not already done
    useEffect(() => {
        if (!user || !roles || !organization) {
            dispatch(initializeAuth());
        }
    }, [user, dispatch, roles, organization]);

    // Don't render the component until all required data is loaded
    if (!user || !roles || !organization || roles.length === 0) {
        return <div>Loading...</div>;
    }

    if(!organization){
        return <div>You are not part of any organization.</div>;
    }

    // Ensure that the user has at least one role
    if (roles.length === 0) {
        return <div>No role is assigned to you.</div>;
    }
  
    return (
        <JobsClientComponent 
            userId={user.id} 
            userRole={roles[0]?.role?.name || ""} 
            organizationId={organization.id} 
        />
    );
}