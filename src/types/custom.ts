import { User } from "@supabase/supabase-js";

export interface UserProfile {
    id: string;
    organization_id: string | null;
    email: string;
    full_name: string;
    phone: string | null;
    avatar_url: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface Organization {
    id: string;
    name: string;
    slug: string;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: string;
    name: string;
    display_name: string;
    description: string | null;
    permissions: Record<string, any>;
    created_at: string;
}

export interface UserRole {
    id: string;
    role_id: string;
    organization_id: string | null;
    assigned_by: string | null;
    assigned_at: string;
    is_active: boolean;
    role: Role;
    role_organization: Organization | null;
}

export interface CompleteUserData {
    id: string;
    email: string;
    email_confirmed_at: string | null;
    created_at: string;
    updated_at: string;
    profile: UserProfile | null;
    organization: Organization | null;
    roles: UserRole[];
}

export interface UserState {
    user: User | null;
    profile: UserProfile | null;
    organization: Organization | null;
    roles: UserRole[];
    completeUserData: CompleteUserData | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}