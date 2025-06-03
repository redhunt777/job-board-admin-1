'use server'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

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
    return {
      success: false,
      error: 'An unexpected error occurred',
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
    return {
      success: false,
      error: 'An unexpected error occurred',
      data: null
    }
  }
}

// getUser from supabase
export async function getUserServerAction() {
  const supabase = await createClient()

  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      return {
        success: false,
        error: error.message,
        data: null
      }
    }

    return {
      success: true,
      error: null,
      data: user
    }
  } catch (err) {
    return {
      success: false,
      error: 'An unexpected error occurred',
      data: null
    }
  }
}