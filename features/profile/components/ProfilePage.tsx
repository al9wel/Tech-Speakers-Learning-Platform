'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { updateProfileAction, changePasswordAction } from '@/features/profile/server/actions'
import type { AppRole } from '@/lib/auth/roles'
import { toast } from 'sonner'
import {
  User as UserIcon,
  Shield,
  GraduationCap,
  Users,
  Heart,
  ShieldCheck,
  ArrowRight,
  KeyRound,
  Calendar,
  Mail,
  Loader2,
} from 'lucide-react'

interface ProfilePageProps {
  email: string
  fullName: string | null
  role: AppRole
  createdAt: string
  backUrl: string
  errorMessage?: string
  successMessage?: string
}

const roleMap: Record<AppRole, { label: string; icon: any; color: string }> = {
  admin: { label: 'مشرف عام', icon: Shield, color: 'bg-paper-terracotta/10 text-paper-terracotta border-paper-terracotta/20' },
  teacher: { label: 'معلم', icon: Users, color: 'bg-accent/10 text-accent border-accent/30' },
  student: { label: 'طالب', icon: GraduationCap, color: 'bg-blue-50 text-blue-800 border-blue-200/60' },
  supervisor: { label: 'مشرف تربوي', icon: ShieldCheck, color: 'bg-emerald-50 text-emerald-800 border-emerald-200/60' },
  counselor: { label: 'مستشار نفسي', icon: Heart, color: 'bg-rose-50 text-rose-800 border-rose-200/60' },
}

export function ProfilePage({
  email,
  fullName,
  role,
  createdAt,
  backUrl,
}: ProfilePageProps) {
  const router = useRouter()
  const [currentFullName, setCurrentFullName] = useState(fullName ?? '')
  const [currentEmail, setCurrentEmail] = useState(email)
  const [newPassword, setNewPassword] = useState('')

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  const roleInfo = roleMap[role] || {
    label: role,
    icon: UserIcon,
    color: 'bg-bg-alt text-ink-secondary border-border-subtle',
  }
  const RoleIcon = roleInfo.icon

  const formattedDate = createdAt
    ? createdAt.replace('T', ' ').substring(0, 10)
    : 'غير متوفر'

  const displayName = currentFullName || currentEmail.split('@')[0]
  const initialLetter = displayName.charAt(0).toUpperCase()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)

    const res = await updateProfileAction({
      full_name: currentFullName,
      email: currentEmail,
    })

    setIsUpdatingProfile(false)

    if (res.success) {
      toast.success(res.message)
      // Notify navbar of profile updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('auth-changed'))
      }
      router.refresh()
    } else {
      toast.error(res.message)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChangingPassword(true)

    const res = await changePasswordAction({
      new_password: newPassword,
    })

    setIsChangingPassword(false)

    if (res.success) {
      toast.success(res.message)
      setNewPassword('')
      router.refresh()
    } else {
      toast.error(res.message)
    }
  }

  return (
    <div className="container-page py-8 max-w-2xl">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-serif font-bold text-2xl text-ink-primary">الملف الشخصي</h1>
        <Link
          href={backUrl}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border-base bg-bg-surface hover:bg-bg-alt text-xs font-medium text-ink-secondary transition-colors"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span>العودة للوحة التحكم</span>
        </Link>
      </div>

      {/* User Hero Card */}
      <div className="bg-bg-surface border border-border-base rounded-lg p-6 sm:p-8 text-center mb-6 shadow-xs">
        <div className="w-16 h-16 rounded-full bg-accent/10 border border-accent/20 text-accent flex items-center justify-center font-serif font-bold text-2xl mx-auto mb-3">
          {initialLetter}
        </div>
        <h2 className="font-serif font-bold text-2xl text-ink-primary mb-1">{displayName}</h2>
        <p className="text-xs sm:text-sm text-ink-muted mb-3" dir="ltr">{currentEmail}</p>
        <div className="inline-flex">
          <span className={`inline-flex items-center gap-1.5 text-xs py-1 px-2.5 rounded-md border font-medium ${roleInfo.color}`}>
            <RoleIcon className="w-3.5 h-3.5" />
            <span>{roleInfo.label}</span>
          </span>
        </div>
      </div>

      {/* Account Details Readonly */}
      <div className="bg-bg-surface border border-border-base rounded-lg p-5 sm:p-6 mb-6">
        <h3 className="font-serif font-bold text-base text-ink-primary mb-4 pb-2 border-b border-border-subtle">
          معلومات الحساب
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="flex items-center gap-3 p-3 rounded-md bg-bg-alt/60 border border-border-subtle">
            <Mail className="w-4.5 h-4.5 text-ink-muted" />
            <div>
              <p className="text-xs text-ink-muted">البريد الإلكتروني المسجل</p>
              <p className="text-sm font-semibold text-ink-primary" dir="ltr">{currentEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-md bg-bg-alt/60 border border-border-subtle">
            <Calendar className="w-4.5 h-4.5 text-ink-muted" />
            <div>
              <p className="text-xs text-ink-muted">تاريخ إنشاء الحساب</p>
              <p className="text-sm font-semibold text-ink-primary font-mono">{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-bg-surface border border-border-base rounded-lg p-5 sm:p-6 mb-6">
        <h3 className="font-serif font-bold text-base text-ink-primary mb-4 pb-2 border-b border-border-subtle flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-accent" />
          <span>تعديل البيانات الشخصية</span>
        </h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-xs font-semibold text-ink-primary mb-1.5">
              الاسم الكامل:
            </label>
            <input
              id="full_name"
              type="text"
              value={currentFullName}
              onChange={(e) => setCurrentFullName(e.target.value)}
              placeholder="أدخل اسمك الكامل"
              className="w-full px-3 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-ink-primary mb-1.5">
              البريد الإلكتروني:
            </label>
            <input
              id="email"
              type="email"
              required
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              dir="ltr"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto flex items-center justify-center gap-2 min-w-32 shadow-xs cursor-pointer"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري الحفظ...</span>
                </>
              ) : (
                <span>حفظ التعديلات</span>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Form */}
      <div className="bg-bg-surface border border-border-base rounded-lg p-5 sm:p-6">
        <h3 className="font-serif font-bold text-base text-ink-primary mb-4 pb-2 border-b border-border-subtle flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber" />
          <span>تغيير كلمة المرور</span>
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="new_password" className="block text-xs font-semibold text-ink-primary mb-1.5">
              كلمة المرور الجديدة:
            </label>
            <input
              id="new_password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="6 أحرف على الأقل"
              className="w-full px-3 py-2 rounded-md border border-border-base bg-bg-surface text-sm text-ink-primary placeholder:text-ink-muted/50 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors max-w-md"
              dir="ltr"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="px-4 py-2 rounded-md bg-accent hover:bg-accent-hover text-white text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto flex items-center justify-center gap-2 min-w-36 shadow-xs cursor-pointer"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>جاري التحديث...</span>
                </>
              ) : (
                <span>تغيير كلمة المرور</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
