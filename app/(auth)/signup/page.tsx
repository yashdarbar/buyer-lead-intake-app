// eslint-disable-file @typescript-eslint/no-unused-vars
"use client";

import { GalleryVerticalEnd } from "lucide-react"
import { AuthForm } from "@/components/auth-form"
// import { supabaseBrowser } from "@/lib/supabase-browser";
import { createClient } from "@/utils/supabase/client"
import toast from "react-hot-toast";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface AuthFormData {
  name?: string
  email: string
  password: string
  confirmPassword?: string
}


export default function SignUpPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSignup = async (formData: AuthFormData) => {
  const { email, password, name } = formData
  setLoading(true)

  try {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: name,
        },
        emailRedirectTo: `${window.location.origin}/login`
      }
    })

    if (error) {
      // const userMessage = getFriendlyErrorMessage(error.message)
      toast.error(error.message)
      return
    }

    toast.success('Account created! Please check your email to confirm.')

    // Redirect to login page or email confirmation page
    router.push('/login?message=Please check your email to confirm your account')
    // Or redirect to a dedicated confirmation page:
    // router.push('/auth/confirm-email')

  } catch (error: any) {
    toast.error('Failed to create account. Please try again.')
    console.error('Signup error:', error)
  } finally {
    setLoading(false)
  }
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
          {/* <h1 className="text-3xl font-bold text-black mb-2">Create Account</h1>
          <p className="text-gray-400">Join us and start creating amazing content</p> */}
        </div>

        <div className="backdrop-blur-xl bg-white border border-white/10 rounded-2xl shadow-xl p-8">
          <AuthForm mode="signup" onSubmit={handleSignup} />
          {loading && (
            <div className="text-center text-sm text-gray-400 mt-4">
              Creating your account...
            </div>
          )}
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
