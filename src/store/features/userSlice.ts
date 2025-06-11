import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "@supabase/supabase-js";
import { loginServerAction, logoutServerAction, getUserServerAction } from "@/app/login/actions";
import type { CompleteUserData, UserState } from "@/types/custom";

// Initial state
const initialState: UserState = {
    user: null,
    profile: null,
    organization: null,
    roles: [],
    completeUserData: null,
    isAuthenticated: false,
    loading: false,
    error: null,
};

// Async thunks
export const initializeAuth = createAsyncThunk(
    'auth/initializeAuth',
    async (_, { rejectWithValue }) => {
        try {
            const result = await getUserServerAction();

            if (!result.success || !result.data) {
                return rejectWithValue(result.error || 'No user data returned');
            }

            const completeData = result.data as CompleteUserData;

            // Create a User object for backward compatibility
            const user: User = {
                id: completeData.id,
                email: completeData.email,
                email_confirmed_at: completeData.email_confirmed_at ?? undefined,
                created_at: completeData.created_at,
                updated_at: completeData.updated_at,
                aud: 'authenticated',
                role: 'authenticated',
                app_metadata: {},
                user_metadata: {},
                identities: [],
                factors: [],
            };

            return {
                user,
                profile: completeData.profile,
                organization: completeData.organization,
                roles: completeData.roles || [],
                completeUserData: completeData,
                isAuthenticated: true
            };
        } catch (error) {
            return rejectWithValue('Initialization failed');
        }
    }
);

export const loginUser = createAsyncThunk(
    'auth/loginUser',
    async (
        { email, password }: { email: string; password: string },
        { rejectWithValue, dispatch }
    ) => {
        try {
            const result = await loginServerAction(email, password);

            if (!result.success || !result.data || !result.data.user) {
                return rejectWithValue(result.error || 'No user data returned');
            }

            // After successful login, get the complete user data with profile
            const userDataResult = await getUserServerAction();

            if (userDataResult.success && userDataResult.data) {
                const completeData = userDataResult.data as CompleteUserData;

                return {
                    user: result.data.user as User,
                    profile: completeData.profile,
                    organization: completeData.organization,
                    roles: completeData.roles || [],
                    completeUserData: completeData,
                    isAuthenticated: true
                };
            }

            // Fallback to just auth user data
            return {
                user: result.data.user as User,
                profile: null,
                organization: null,
                roles: [],
                completeUserData: null,
                isAuthenticated: true
            };
        } catch (error) {
            return rejectWithValue('Login failed');
        }
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logoutUser',
    async (_, { rejectWithValue }) => {
        try {
            const result = await logoutServerAction();

            if (!result.success) {
                return rejectWithValue(result.error || 'Logout failed');
            }

            return null; // No user data on logout
        } catch (error) {
            return rejectWithValue('Logout failed');
        }
    }
);

// New thunk to refresh user data
export const refreshUserData = createAsyncThunk(
    'auth/refreshUserData',
    async (_, { rejectWithValue }) => {
        try {
            const result = await getUserServerAction();

            if (!result.success || !result.data) {
                return rejectWithValue(result.error || 'Failed to refresh user data');
            }

            const completeData = result.data as CompleteUserData;

            // Create a User object for backward compatibility
            const user: User = {
                id: completeData.id,
                email: completeData.email,
                email_confirmed_at: completeData.email_confirmed_at ?? undefined,
                created_at: completeData.created_at,
                updated_at: completeData.updated_at,
                aud: 'authenticated',
                role: 'authenticated',
                app_metadata: {},
                user_metadata: {},
                identities: [],
                factors: [],
            };

            return {
                user,
                profile: completeData.profile,
                organization: completeData.organization,
                roles: completeData.roles || [],
                completeUserData: completeData,
                isAuthenticated: true
            };
        } catch (error) {
            return rejectWithValue('Failed to refresh user data');
        }
    }
);

// Slice
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = !!action.payload;
            state.loading = false;
            state.error = null;
        },

        setCompleteUserData: (state, action) => {
            const { user, profile, organization, roles, completeUserData } = action.payload;
            state.user = user;
            state.profile = profile;
            state.organization = organization;
            state.roles = roles || [];
            state.completeUserData = completeUserData;
            state.isAuthenticated = !!user;
            state.loading = false;
            state.error = null;
        },

        clearUser: (state) => {
            state.user = null;
            state.profile = null;
            state.organization = null;
            state.roles = [];
            state.completeUserData = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },

        clearError: (state) => {
            state.error = null;
        },

        updateProfile: (state, action) => {
            if (state.profile) {
                state.profile = { ...state.profile, ...action.payload };
            }
            if (state.completeUserData?.profile) {
                state.completeUserData.profile = { ...state.completeUserData.profile, ...action.payload };
            }
        },
    },

    extraReducers: (builder) => {
        builder
            // Initialize Auth
            .addCase(initializeAuth.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(initializeAuth.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.profile = action.payload.profile;
                state.organization = action.payload.organization;
                state.roles = action.payload.roles;
                state.completeUserData = action.payload.completeUserData;
                state.isAuthenticated = action.payload.isAuthenticated;
                state.error = null;
            })
            .addCase(initializeAuth.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
                state.profile = null;
                state.organization = null;
                state.roles = [];
                state.completeUserData = null;
                state.error = typeof action.payload === 'string' ? action.payload : String(action.payload);
            })

            // Login User
            .addCase(loginUser.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loginUser.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.profile = action.payload.profile;
                state.organization = action.payload.organization;
                state.roles = action.payload.roles;
                state.completeUserData = action.payload.completeUserData;
                state.isAuthenticated = true;
                state.error = null;
            })
            .addCase(loginUser.rejected, (state, action) => {
                state.loading = false;
                state.error = typeof action.payload === 'string' ? action.payload : String(action.payload);
                state.isAuthenticated = false;
            })

            // Logout User
            .addCase(logoutUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.loading = false;
                state.user = null;
                state.profile = null;
                state.organization = null;
                state.roles = [];
                state.completeUserData = null;
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = typeof action.payload === 'string' ? action.payload : String(action.payload);
            })

            // Refresh User Data
            .addCase(refreshUserData.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(refreshUserData.fulfilled, (state, action) => {
                state.loading = false;
                state.user = action.payload.user;
                state.profile = action.payload.profile;
                state.organization = action.payload.organization;
                state.roles = action.payload.roles;
                state.completeUserData = action.payload.completeUserData;
                state.isAuthenticated = action.payload.isAuthenticated;
                state.error = null;
            })
            .addCase(refreshUserData.rejected, (state, action) => {
                state.loading = false;
                state.error = typeof action.payload === 'string' ? action.payload : String(action.payload);
            });
    },
});

export const {
    setUser,
    setCompleteUserData,
    clearUser,
    clearError,
    updateProfile,
} = userSlice.actions;

export default userSlice.reducer;

// Enhanced Selectors
export const selectUser = (state: { user: UserState }) => state.user.user;
export const selectProfile = (state: { user: UserState }) => state.user.profile;
export const selectOrganization = (state: { user: UserState }) => state.user.organization;
export const selectRoles = (state: { user: UserState }) => state.user.roles;
export const selectCompleteUserData = (state: { user: UserState }) => state.user.completeUserData;
export const selectIsAuthenticated = (state: { user: UserState }) => state.user.isAuthenticated;
export const selectUserLoading = (state: { user: UserState }) => state.user.loading;
export const selectUserError = (state: { user: UserState }) => state.user.error;

// Combined selector
export const selectFullUserData = (state: { user: UserState }) => ({
    user: state.user.user,
    profile: state.user.profile,
    organization: state.user.organization,
    roles: state.user.roles,
    completeUserData: state.user.completeUserData,
    isAuthenticated: state.user.isAuthenticated,
    loading: state.user.loading,
    error: state.user.error,
});

// Permission helper selectors
export const selectUserPermissions = (state: { user: UserState }) => {
    const roles = state.user.roles;
    if (!roles || roles.length === 0) return {};

    // Merge all permissions from all roles
    return roles.reduce((allPermissions, userRole) => {
        if (userRole.is_active && userRole.role.permissions) {
            return { ...allPermissions, ...userRole.role.permissions };
        }
        return allPermissions;
    }, {});
};

export const selectHasPermission = (permission: string) => (state: { user: UserState }) => {
    const roles = state.user.roles;
    if (!roles || roles.length === 0) return false;

    // Check if user has admin role (all permissions)
    const hasAdminRole = roles.some(userRole =>
        userRole.is_active &&
        userRole.role.permissions?.all === true
    );

    if (hasAdminRole) return true;

    // Check specific permission
    const permissionPath = permission.split('.');
    return roles.some(userRole => {
        if (!userRole.is_active) return false;

        let perms: any = userRole.role.permissions;
        for (const path of permissionPath) {
            if (!perms || typeof perms !== 'object') return false;
            perms = perms[path];
        }
        return perms === true;
    });
};

export const selectUserRoleNames = (state: { user: UserState }) => {
    return state.user.roles?.filter(role => role.is_active).map(role => role.role.name) || [];
};