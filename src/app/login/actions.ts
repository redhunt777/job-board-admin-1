'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

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
    console.error('Login error:', error)
    redirect('/login?error=invalid_credentials!')
  }

  revalidatePath('/', 'layout') // Revalidate the root path to update the session state
  redirect('/dashboard') 
}