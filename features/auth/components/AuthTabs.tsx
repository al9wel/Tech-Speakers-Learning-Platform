'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAction, signupAction } from '@/features/auth/server/actions'
import { LogoMark } from '@/components/Logo'
import { Mail, Lock, User as UserIcon, Loader2, AlertCircle } from 'lucide-react'

interface AuthTabsProps {
  initialMode?: 'login' | 'signup'
}

export function AuthTabs({ initialMode = 'login' }: AuthTabsProps) {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)

  // Login form state
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)

  // Signup form state
  const [signupFullName, setSignupFullName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoggingIn(true)
    setLoginError(null)

    const res = await loginAction({
      email: loginEmail,
      password: loginPassword,
    })

    if (!res.success) {
      setIsLoggingIn(false)
      setLoginError(res.message || 'فشل تسجيل الدخول')
    } else {
      // Notify Navbar immediately
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'))
      }
      router.push(res.redirectTo || '/')
      router.refresh()
    }
  }

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSigningUp(true)
    setSignupError(null)

    const res = await signupAction({
      full_name: signupFullName,
      email: signupEmail,
      password: signupPassword,
    })

    if (!res.success) {
      setIsSigningUp(false)
      setSignupError(res.message || 'فشل إنشاء الحساب')
    } else {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'))
      }
      // تم تعليق التحقق من البريد مؤقتاً
      // router.push(res.redirectTo || '/verify-email')
      router.push(res.redirectTo || '/student')
      router.refresh()
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 animate-page">
      <div className="w-full max-w-md">
        {/* Logo and Titles */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <LogoMark />
          </div>
          <h1 className="font-serif font-bold text-2xl text-ink-900">
            {mode === 'login' ? 'تسجيل الدخول إلى مِداد' : 'إنشاء حساب طالب جديد'}
          </h1>
          <p className="text-xs sm:text-sm text-ink-500 mt-1 leading-relaxed">
            {mode === 'login'
              ? 'أهلاً بعودتك، أدخل بياناتك للمتابعة'
              : 'انضم إلى منصة مِداد التعليمية وابدأ رحلة تعلمك'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-paper-mid p-1 rounded-md flex items-center mb-5 border border-ink-200">
          <button
            type="button"
            onClick={() => {
              setMode('login')
              setLoginError(null)
              setSignupError(null)
            }}
            className={`flex-1 py-2 rounded-md font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-ink-900 shadow-xs border border-ink-200/50'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            تسجيل الدخول
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup')
              setLoginError(null)
              setSignupError(null)
            }}
            className={`flex-1 py-2 rounded-md font-medium text-xs sm:text-sm transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-ink-900 shadow-xs border border-ink-200/50'
                : 'text-ink-600 hover:text-ink-900'
            }`}
          >
            إنشاء حساب طالب
          </button>
        </div>

        {/* Main Card */}
        <div className="card p-6 sm:p-7 bg-paper-light shadow-md border border-ink-200/80 rounded-lg">
          {mode === 'login' ? (
            /* Login Form */
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="login_email"
                  className="block text-xs font-semibold text-ink-700 mb-1.5"
                >
                  البريد الإلكتروني:
                </label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    id="login_email"
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pr-10 pl-4 py-2 rounded-md border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login_password"
                  className="block text-xs font-semibold text-ink-700 mb-1.5"
                >
                  كلمة المرور:
                </label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
                  <input
                    id="login_password"
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pr-10 pl-4 py-2 rounded-md border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full text-sm sm:text-base py-2.5 rounded-md font-medium flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark text-white shadow-xs transition-colors cursor-pointer"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري تسجيل الدخول...</span>
                    </>
                  ) : (
                    <span>تسجيل الدخول</span>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Student Sign Up Form */
            <form onSubmit={handleSignupSubmit} className="space-y-4">
              {signupError && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{signupError}</span>
                </div>
              )}

              <div>
                <label
                  htmlFor="signup_fullname"
                  className="block text-xs font-semibold text-ink-700 mb-1.5"
                >
                  الاسم الكامل:
                </label>
                <div className="relative">
                  <UserIcon className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  <input
                    id="signup_fullname"
                    type="text"
                    required
                    value={signupFullName}
                    onChange={(e) => setSignupFullName(e.target.value)}
                    placeholder="مثال: سالم أحمد علي"
                    className="w-full pr-10 pl-4 py-2 rounded-md border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup_email"
                  className="block text-xs font-semibold text-ink-700 mb-1.5"
                >
                  البريد الإلكتروني:
                </label>
                <div className="relative">
                  <Mail className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  <input
                    id="signup_email"
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="student@example.com"
                    className="w-full pr-10 pl-4 py-2 rounded-md border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
                    dir="ltr"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="signup_password"
                  className="block text-xs font-semibold text-ink-700 mb-1.5"
                >
                  كلمة المرور:
                </label>
                <div className="relative">
                  <Lock className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400 pointer-events-none" />
                  <input
                    id="signup_password"
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="6 أحرف على الأقل"
                    className="w-full pr-10 pl-4 py-2 rounded-md border border-ink-200 bg-white text-sm text-ink-900 placeholder:text-ink-400 focus:outline-none focus:border-teal focus:ring-1 focus:ring-teal/20"
                    dir="ltr"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSigningUp}
                  className="w-full text-sm sm:text-base py-2.5 rounded-md font-medium flex items-center justify-center gap-2 bg-teal hover:bg-teal-dark text-white shadow-xs transition-colors cursor-pointer"
                >
                  {isSigningUp ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>جاري إنشاء الحساب...</span>
                    </>
                  ) : (
                    <span>إنشاء حساب طالب</span>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Bottom Switch Link */}
          <div className="mt-6 pt-5 border-t border-ink-200/60 text-center text-xs text-ink-500">
            {mode === 'login' ? (
              <p>
                ليس لديك حساب بعد؟{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="font-medium text-teal hover:underline cursor-pointer"
                >
                  إنشاء حساب طالب جديد
                </button>
              </p>
            ) : (
              <p>
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="font-medium text-teal hover:underline cursor-pointer"
                >
                  تسجيل الدخول
                </button>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
