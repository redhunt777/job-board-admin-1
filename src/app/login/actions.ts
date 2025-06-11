'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Types to match your Redux slice
interface UserProfile {
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

interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string | null;
  permissions: Record<string, any>;
  created_at: string;
}

interface UserRole {
  id: string;
  role_id: string;
  organization_id: string | null;
  assigned_by: string | null;
  assigned_at: string;
  is_active: boolean;
  role: Role;
  role_organization: Organization | null;
}

interface CompleteUserData {
  id: string;
  email: string;
  email_confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  profile: UserProfile | null;
  organization: Organization | null;
  roles: UserRole[];
}

export async function loginServerAction(email: string, password: string) {
  const supabase = await createClient()

  // Validate input
  if (!email || !password) {
    return {
      success: false,
      error: 'Email and password are required',
      data: null
    }
  }

  try {
    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    // Revalidate the path on successful login
    revalidatePath('/', 'layout')

    return {
      success: true,
      error: null,
      data
    }
  } catch (err) {
    console.error('Login error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred during login',
      data: null
    }
  }
}

export async function logoutServerAction() {
  const supabase = await createClient()

  try {
    const { error } = await supabase.auth.signOut()
    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    // Revalidate the path on successful logout
    revalidatePath('/', 'layout')

    return {
      success: true,
      error: null,
      data: null
    }
  } catch (err) {
    console.error('Logout error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred during logout',
      data: null
    }
  }
}

// Enhanced getUserServerAction that uses your RPC function
export async function getUserServerAction() {
  const supabase = await createClient()

  try {
    // First check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError) {
      return {
        success: false,
        error: authError.message,
        data: null
      }
    }

    // If no user is authenticated, return early
    if (!user) {
      return {
        success: false,
        error: 'No authenticated user found',
        data: null
      }
    }

    // Call your RPC function to get complete user data
    const { data: completeUserData, error: rpcError } = await supabase
      .rpc('get_current_user_with_profile')

    if (rpcError) {
      console.error('RPC error:', rpcError)
      // Fallback to basic user data if RPC fails
      return {
        success: true,
        error: null,
        data: {
          id: user.id,
          email: user.email || '',
          email_confirmed_at: user.email_confirmed_at,
          created_at: user.created_at,
          updated_at: user.updated_at,
          profile: null,
          organization: null,
          roles: []
        } as CompleteUserData
      }
    }

    // If RPC returns null (no user), return error
    if (!completeUserData) {
      return {
        success: false,
        error: 'User data not found',
        data: null
      }
    }

    console.log('Complete user data fetched:', completeUserData)

    return {
      success: true,
      error: null,
      data: completeUserData as unknown as CompleteUserData
    }
  } catch (err) {
    console.error('Get user error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred while fetching user data',
      data: null
    }
  }
}

// Additional helper function to refresh user profile data
export async function refreshUserProfileAction() {
  const supabase = await createClient()

  try {
    // Call your RPC function to get fresh user data
    const { data: completeUserData, error: rpcError } = await supabase
      .rpc('get_current_user_with_profile')

    if (rpcError) {
      return {
        success: false,
        error: rpcError.message,
        data: null
      }
    }

    if (!completeUserData) {
      return {
        success: false,
        error: 'User data not found',
        data: null
      }
    }

    // Revalidate paths that might show user data
    revalidatePath('/', 'layout')

    return {
      success: true,
      error: null,
      data: completeUserData as unknown as CompleteUserData
    }
  } catch (err) {
    console.error('Refresh user profile error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred while refreshing user data',
      data: null
    }
  }
}

// Helper function to update user profile
export async function updateUserProfileAction(profileData: Partial<UserProfile>) {
  const supabase = await createClient()

  try {
    // First check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return {
        success: false,
        error: 'User not authenticated',
        data: null
      }
    }

    // Update the user profile
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    // Revalidate relevant paths
    revalidatePath('/', 'layout')

    return {
      success: true,
      error: null,
      data: data as UserProfile
    }
  } catch (err) {
    console.error('Update profile error:', err)
    return {
      success: false,
      error: 'An unexpected error occurred while updating profile',
      data: null
    }
  }
}