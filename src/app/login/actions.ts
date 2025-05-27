'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'
import { option } from 'motion/react-client'

export async function admin_email_login(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs

  if (!formData.has('email') || !formData.has('password')) {
    console.log('Missing email or password in form data')
    console.error('Form data:', formData)
    redirect('/login?error=missing_fields')
 }
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    redirect('/login?error=invalid_credentials!')
  }

  revalidatePath('/', 'layout') // Revalidate the root path to update the session state
  // This will ensure that the session is updated across the app
  redirect('/dashboard')
  // You can redirect to a specific page after successful login
}


//checking if the user is already logged in
export async function checkUserLoggedIn() {
  const supabase = await createClient()

  // Get the current user session
  const {
    data: {  user }
  } = await supabase.auth.getUser()

  // If a session exists, the user is logged in
  if (user) {
    redirect('/dashboard') // Redirect to the dashboard or any other page
  } else {
    return false
  }
}