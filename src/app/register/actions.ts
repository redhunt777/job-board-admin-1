'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function admin_email_signup(formData: FormData) {
  const supabase = await createClient()

  // type-casting here for convenience
  // in practice, you should validate your inputs
  if (!formData.has('email') || !formData.has('password') || !formData.has('phone') || !formData.has('name')) {
    redirect('/register?error=missing_fields')
  }
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    options: {
      data: {
        role: 'user',
        phone: formData.get('phone') as string,
        full_name: formData.get('name') as string,
      },
    },
  }

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.error('Registration error:', error)
    console.error('Form data:', formData)
    redirect('/register?error=registration_failed!')
  }

  revalidatePath('/', 'layout')
  redirect('/login?message=Please check your email to confirm your account.')
}