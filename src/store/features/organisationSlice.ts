import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { createClient } from '@/utils/supabase/client';

// Types
interface OrganisationMember {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'hr' | 'ta';
    assigned_by: string;
    assigned_at: string;
    is_member_active: boolean;
    is_role_active: boolean;
    status: 'active' | 'inactive';
}

interface OrganisationState {
    members: OrganisationMember[];
    loading: boolean;
    error: string | null;
    lastFetchedOrgId: string | null; // Track which org was last fetched
}

// API Response types for better type safety
interface UserProfileResponse {
    id: string;
    email: string;
    full_name: string;
    is_active: boolean | null;
    user_roles: Array<{
        id: string;
        assigned_by: string | null;
        assigned_at: string | null;
        is_active: boolean | null;
        roles: {
            name: string;
            display_name: string;
        } | null;
    }>;
}

// Initial state
const initialState: OrganisationState = {
    members: [],
    loading: false,
    error: null,
    lastFetchedOrgId: null,
};

const supabase = createClient();

// Helper function to transform user data
const transformUserToMember = (user: UserProfileResponse): OrganisationMember => {
    const userRole = user.user_roles[0]; // Assuming single active role per user

    return {
        id: user.id,
        name: user.full_name || 'Unknown',
        email: user.email,
        is_role_active: userRole?.is_active ?? false,
        role: (userRole?.roles?.name as 'admin' | 'hr' | 'ta') || 'ta', // Default fallback
        assigned_by: userRole?.assigned_by || '',
        assigned_at: userRole?.assigned_at || '',
        is_member_active: user.is_active ?? false,
        status: (user.is_active ?? false) ? 'active' : 'inactive',
    };
};

// Async thunks
export const fetchOrgMembers = createAsyncThunk(
    'organisation/fetchMembers',
    async (orgId: string, { rejectWithValue }) => {
        try {
            if (!orgId) {
                throw new Error('Organization ID is required');
            }

            const { data, error } = await supabase
                .from('user_profiles')
                .select(`
                    id,
                    email,
                    full_name,
                    is_active,
                    user_roles!user_roles_user_id_fkey!inner (
                        id,
                        assigned_by,
                        assigned_at,
                        is_active,
                        roles (
                            name,
                            display_name
                        )
                    )
                `)
                .eq('organization_id', orgId)
                .eq('user_roles.is_active', true);

            if (error) {
                throw new Error(`Failed to fetch members: ${error.message}`);
            }
            console.log('Fetched members:', data);

            if (!data) {
                return { members: [], orgId };
            }

            const members = data.map(transformUserToMember);
            return { members, orgId };

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            return rejectWithValue(message);
        }
    }
);

export const addMemberRole = createAsyncThunk(
    'organisation/addMember',
    async (
        { memberEmailId, role, organization_id, assigned_by }: {
            memberEmailId: string;
            role: string;
            organization_id: string;
            assigned_by: string;
        },
        { rejectWithValue }
    ) => {
        try {
            // Validate inputs
            if (!memberEmailId || !role || !organization_id || !assigned_by) {
                throw new Error('All parameters are required');
            }

            // Call the RPC function to assign role
            const { error: rpcError } = await supabase.rpc('assign_user_role', {
                target_email_id: memberEmailId,
                target_organization_id: organization_id,
                target_role_name: role,
                assigner_user_id: assigned_by
            });

            if (rpcError) {
                throw new Error(`Failed to assign role: ${rpcError.message}`);
            }

            // Fetch updated member data
            const { data: updatedMember, error: fetchError } = await supabase
                .from('user_profiles')
                .select(`
                    id,
                    email,
                    full_name,
                    is_active,
                    user_roles!user_roles_user_id_fkey!inner (
                        id,
                        assigned_by,
                        assigned_at,
                        is_active,
                        roles (
                            name,
                            display_name
                        )
                    )
                `)
                .eq('email', memberEmailId)
                .eq('user_roles.is_active', true)
                .single();

            if (fetchError) {
                throw new Error(`Failed to fetch updated member: ${fetchError.message}`);
            }

            if (!updatedMember) {
                throw new Error('Updated member data not found');
            }

            return transformUserToMember(updatedMember as UserProfileResponse);

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error occurred';
            return rejectWithValue(message);
        }
    }
);

// Slice
const organisationSlice = createSlice({
    name: 'organisation',
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null;
        },
        clearMembers: (state) => {
            state.members = [];
            state.lastFetchedOrgId = null;
        },
        // Optimistic update for better UX
        updateMemberOptimistic: (state, action: PayloadAction<{ memberId: string; updates: Partial<OrganisationMember> }>) => {
            const { memberId, updates } = action.payload;
            const memberIndex = state.members.findIndex(member => member.id === memberId);
            if (memberIndex !== -1) {
                state.members[memberIndex] = { ...state.members[memberIndex], ...updates };
            }
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch members
            .addCase(fetchOrgMembers.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchOrgMembers.fulfilled, (state, action) => {
                state.loading = false;
                state.members = action.payload.members;
                state.lastFetchedOrgId = action.payload.orgId;
            })
            .addCase(fetchOrgMembers.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })

            // Update member role
            .addCase(addMemberRole.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(addMemberRole.fulfilled, (state, action) => {
                state.loading = false;
                const memberIndex = state.members.findIndex(member => member.id === action.payload.id);
                if (memberIndex !== -1) {
                    state.members[memberIndex] = action.payload;
                }
            })
            .addCase(addMemberRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
    },
});

export const { clearError, clearMembers, updateMemberOptimistic } = organisationSlice.actions;

// Selectors
export const selectMembers = (state: { organisation: OrganisationState }) => state.organisation.members;
export const selectActiveMembers = (state: { organisation: OrganisationState }) =>
    state.organisation.members.filter(member => member.status === 'active');
export const selectMembersByRole = (state: { organisation: OrganisationState }, role: 'admin' | 'hr' | 'ta') =>
    state.organisation.members.filter(member => member.role === role);
export const selectOrganisationLoading = (state: { organisation: OrganisationState }) => state.organisation.loading;
export const selectOrganisationError = (state: { organisation: OrganisationState }) => state.organisation.error;

export default organisationSlice.reducer;