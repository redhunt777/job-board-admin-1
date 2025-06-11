'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'

interface SignupResult {
  success: boolean;
  error?: string;
  message?: string;
}

export async function admin_email_signup(formData: FormData): Promise<SignupResult> {
  try {
    const supabase = await createClient()

    // Validate required fields
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;
    const name = formData.get('name') as string;

    if (!email || !password || !phone || !name) {
      return {
        success: false,
        error: 'All fields are required. Please fill in all information.'
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return {
        success: false,
        error: 'Please enter a valid email address.'
      }
    }

    // Basic password validation
    if (password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long.'
      }
    }

    // Basic phone validation (you might want to make this more robust)
    if (phone.length < 10) {
      return {
        success: false,
        error: 'Please enter a valid phone number.'
      }
    }

    const data = {
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          role: 'user',
          phone: phone.trim(),
          full_name: name.trim(),
        },
      },
    }

    const { error } = await supabase.auth.signUp(data)

    if (error) {
      console.error('Registration error:', error)

      // Handle specific Supabase errors
      if (error.message.includes('User already registered')) {
        return {
          success: false,
          error: 'An account with this email already exists. Please try logging in instead.'
        }
      }

      if (error.message.includes('Invalid email')) {
        return {
          success: false,
          error: 'Please enter a valid email address.'
        }
      }

      if (error.message.includes('Password')) {
        return {
          success: false,
          error: 'Password does not meet requirements. Please choose a stronger password.'
        }
      }

      // Generic error for other cases
      return {
        success: false,
        error: 'Registration failed. Please check your information and try again.'
      }
    }

    // Revalidate the layout to reflect authentication changes
    revalidatePath('/', 'layout')

    return {
      success: true,
      message: "Registration successful! Please check your email and click the confirmation link to activate your account."
    }

  } catch (error) {
    console.error('Unexpected error during registration:', error)
    return {
      success: false,
      error: 'An unexpected error occurred. Please try again later.'
    }
  }
}