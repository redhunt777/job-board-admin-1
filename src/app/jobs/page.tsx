"use client";
import React, {useEffect} from "react";
import JobsClientComponent from "./JobsClientComponent";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import {
  initializeAuth,

} from "@/store/features/userSlice";

export default function JobsPage() {

    const user = useAppSelector((state) => state.user.user);
    const organization = useAppSelector((state) => state.user.organization);
    const roles = useAppSelector((state) => state.user.roles);

    const dispatch = useAppDispatch();

    useEffect(() => {
      dispatch(initializeAuth());
    }
  , [dispatch]);
  
  return <JobsClientComponent initialJobs={[]} userId={user?.id} userRole={roles[0].role.name} organizationId={organization?.id} />;
}
