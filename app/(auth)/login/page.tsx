"use client";

import { GalleryVerticalEnd } from "lucide-react"
import { useState } from "react";
import { AuthForm } from "@/components/auth-form"
// import DemoLogin from "@/components/auth/DemoLogin"
import { createClient } from "@/utils/supabase/client"
// import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AuthFormData {
  name?: string
  email: string
  password: string
  confirmPassword?: string
}

export default function SignInPage() {
  const [loading, setLoading] = useState(false);
  // const router = useRouter();
  const supabase = createClient();

  const getFriendlyErrorMessage = (errorMessage: string): string => {
    if (!errorMessage) return 'An error occurred. Please try again.'

    switch (errorMessage) {
      case 'Invalid login credentials':
        return 'Wrong email or password. Please try again.'
      case 'Email not confirmed':
        return 'Please check your email and confirm your account first.'
      case 'Too many requests':
        return 'Too many attempts. Please wait a moment and try again.'
      case 'User not found':
        return 'No account found with this email address.'
      default:
        return 'Login failed. Please check your credentials and try again.'
    }
  }

  const handleLogin = async (formData: AuthFormData) => {
    const { email, password } = formData
    setLoading(true)

    try {
      console.log('Starting login process...')

      // Clear any existing session first
      await supabase.auth.signOut()

      // Small delay to ensure signOut is processed
      await new Promise(resolve => setTimeout(resolve, 100))

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Login attempt result:', {
        user: data.user?.id,
        session: !!data.session,
        error: error?.message
      })

      if (error) {
        console.error('Login error:', error)
        const userMessage = getFriendlyErrorMessage(error.message)
        toast.error(userMessage)
        return
      }

      if (data.user && data.session) {
        console.log('Login successful!')
        toast.success('Logged in successfully!')

        // Wait for session to be established
        await new Promise(resolve => setTimeout(resolve, 1000))

        // Use window.location for a hard redirect to ensure middleware processes the session
        console.log('Redirecting to dashboard...')
        window.location.href = '/buyers'
      } else {
        console.error('Login failed - no user or session')
        toast.error('Login failed - please try again')
      }

    } catch (err) {
      console.error('Unexpected login error:', err)
      toast.error('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    // NOTE: Ensure this demo user exists in your Supabase project.
    const demoCredentials = {
      email: 'darbaryash44@gmail.com',
      password: '111111',
    };

    await handleLogin(demoCredentials);
  }

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden flex items-center justify-center">
      <div className="absolute top-0 z-[0] h-screen w-screen bg-black-950/10 bg-white" />

      <div className="relative z-10 w-full max-w-md mx-auto p-2">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-lg blur-xl bg-black-500/30" />
              {/* <div className="relative bg-gradient-to-r from-black-600 to-black-700 text-black flex size-8 items-center justify-center rounded-lg">
                <GalleryVerticalEnd className="size-5" />
              </div> */}
            </div>
            {/* <span className="text-2xl font-bold bg-clip-text text-transparent bg-black">
              Learn-Scribe
            </span> */}
          </div>
          {/* <h1 className="text-3xl font-bold text-black mb-2">Welcome Back</h1>
          <p className="text-gray-600">Log in to your account to continue</p> */}
        </div>

        <div className="backdrop-blur-xl bg-white border border-white/10 rounded-2xl shadow-xl p-8">
          <AuthForm mode="login" onSubmit={handleLogin} onDemoLogin={handleDemoLogin} />
          {loading && (
            <div className="text-center text-sm text-gray-400 mt-4">
              Logging you in...
            </div>
          )}
        </div>

        <div className="mt-4">
          {/* <DemoLogin /> */}
        </div>

        <div className="text-center text-xs text-gray-500 mt-6">
          By continuing, you agree to our{" "}
          <a href="#" className="text-black-400 hover:text-black-300 underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-black-400 hover:text-black-300 underline">
            Privacy Policy
          </a>
        </div>
      </div>
    </div>
  )
}