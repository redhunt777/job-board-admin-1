import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User } from "@supabase/supabase-js";
import { loginServerAction, logoutServerAction, getUserServerAction } from "@/app/login/actions";

// Type definitions
interface UserMetadata {
    [key: string]: any;
    name?: string;
    phone?: string;
    role?: string;
    admin_id?: string;
}

interface AuthUser extends User {
    user_metadata: UserMetadata;
}

interface UserState {
    user: AuthUser | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

// Initial state
const initialState: UserState = {
    user: null,
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

            return {
                user: result.data as AuthUser,
                isAuthenticated: !!result.data
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
        { rejectWithValue }
    ) => {
        try {
            const result = await loginServerAction(email, password)

            if (!result.success || !result.data || !result.data.user) {
                return rejectWithValue(result.error || 'No user data returned');
            }

            return {
                user: result.data.user as AuthUser,
                isAuthenticated: true
            };
        } catch (error) {
            return rejectWithValue('Login failed')
        }
    }
)

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

// Update user metadata in Supabase
// export const updateUserMetadata = createAsyncThunk(
//   'user/updateUserMetadata',
//   async (metadata: UserMetadata, { rejectWithValue }) => {
//     try {
//       const { data, error } = await supabase.auth.updateUser({
//         data: metadata
//       });
//       if (error) throw error;
//       return data.user as AuthUser;
//     } catch (error: any) {
//       return rejectWithValue(error.message);
//     }
//   }
// );

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

        clearUser: (state) => {
            state.user = null;
            state.isAuthenticated = false;
            state.loading = false;
            state.error = null;
        },

        clearError: (state) => {
            state.error = null;
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
                state.isAuthenticated = action.payload.isAuthenticated ?? false;
                state.error = null;
            })
            .addCase(initializeAuth.rejected, (state, action) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.user = null;
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
                state.isAuthenticated = false;
                state.error = null;
            })
            .addCase(logoutUser.rejected, (state, action) => {
                state.loading = false;
                state.error = typeof action.payload === 'string' ? action.payload : String(action.payload);
            })

        // Update User Metadata
        // .addCase(updateUserMetadata.pending, (state) => {
        //   state.loading = true;
        //   state.error = null;
        // })
        // .addCase(updateUserMetadata.fulfilled, (state, action) => {
        //   state.loading = false;
        //   state.user = action.payload;
        //   state.error = null;
        // })
        // .addCase(updateUserMetadata.rejected, (state, action) => {
        //   state.loading = false;
        //   state.error = typeof action.payload === 'string' ? action.payload : String(action.payload);
        // });
    },
});

export const {
    setUser,
    clearUser,
    clearError,
} = userSlice.actions;

export default userSlice.reducer;

// Selectors
export const selectUser = (state: { user: UserState }) => state.user.user;
export const selectIsAuthenticated = (state: { user: UserState }) => state.user.isAuthenticated;
export const selectUserLoading = (state: { user: UserState }) => state.user.loading;
export const selectUserError = (state: { user: UserState }) => state.user.error;

// Derived selectors
export const selectUserEmail = (state: { user: UserState }) => state.user.user?.email;
export const selectUserRole = (state: { user: UserState }) => state.user.user?.user_metadata?.role;
export const selectUserAdminId = (state: { user: UserState }) => state.user.user?.user_metadata?.admin_id;
export const selectUserName = (state: { user: UserState }) => state.user.user?.user_metadata?.name;
export const selectUserPhone = (state: { user: UserState }) => state.user.user?.user_metadata?.phone;
export const selectUserMetadata = (state: { user: UserState }) => state.user.user?.user_metadata;

// Combined selector
export const selectFullUserData = (state: { user: UserState }) => ({
    user: state.user.user,
    email: state.user.user?.email,
    role: state.user.user?.user_metadata?.role,
    admin_id: state.user.user?.user_metadata?.admin_id,
    phone: state.user.user?.user_metadata?.phone,
    name: state.user.user?.user_metadata?.name,
    isAuthenticated: state.user.isAuthenticated,
    loading: state.user.loading,
    error: state.user.error,
});