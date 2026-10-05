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
  admin: { label: 'مشرف عام', icon: Shield, color: 'bg-gold/20 text-gold-dark border-gold/30' },
  teacher: { label: 'معلم', icon: Users, color: 'bg-gold/15 text-gold-dark border-gold/30' },
  student: { label: 'طالب', icon: GraduationCap, color: 'bg-sage-50 text-sage-dark border-sage-100' },
  supervisor: { label: 'مشرف تربوي', icon: ShieldCheck, color: 'bg-blue-50 text-blue-800 border-blue-200' },
  counselor: { label: 'مستشار نفسي', icon: Heart, color: 'bg-rose-50 text-rose-800 border-rose-200' },
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
    color: 'bg-ink-100 text-ink-800',
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
    <div className="container-page py-10 animate-page max-w-2xl">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-extrabold text-2xl text-ink-900">الملف الشخصي</h1>
        <Link
          href={backUrl}
          className="btn-outline text-sm flex items-center gap-2 hover:bg-ink-50"
        >
          <ArrowRight className="w-4 h-4" />
          <span>العودة للوحة التحكم</span>
        </Link>
      </div>

      {/* User Hero Card */}
      <div className="card p-8 text-center mb-6 shadow-card">
        <div className="w-20 h-20 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center font-heading font-bold text-3xl mx-auto mb-4 shadow-soft">
          {initialLetter}
        </div>
        <h2 className="font-heading font-extrabold text-2xl text-ink-900 mb-1">{displayName}</h2>
        <p className="text-sm text-ink-500 mb-3" dir="ltr">{currentEmail}</p>
        <div className="inline-flex">
          <span className={`chip text-xs py-1 px-3 border ${roleInfo.color}`}>
            <RoleIcon className="w-4 h-4" />
            <span>{roleInfo.label}</span>
          </span>
        </div>
      </div>

      {/* Account Details Readonly */}
      <div className="card p-6 mb-6">
        <h3 className="font-heading font-bold text-base text-ink-900 mb-4 pb-2 border-b border-ink-100/60">
          معلومات الحساب
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-50/50">
            <Mail className="w-5 h-5 text-ink-500" />
            <div>
              <p className="text-xs text-ink-500">البريد الإلكتروني المسجل</p>
              <p className="text-sm font-semibold text-ink-900" dir="ltr">{currentEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-ink-50/50">
            <Calendar className="w-5 h-5 text-ink-500" />
            <div>
              <p className="text-xs text-ink-500">تاريخ إنشاء الحساب</p>
              <p className="text-sm font-semibold text-ink-900 font-mono">{formattedDate}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Form */}
      <div className="card p-6 mb-6">
        <h3 className="font-heading font-bold text-base text-ink-900 mb-4 pb-2 border-b border-ink-100/60 flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-ink-700" />
          <span>تعديل البيانات الشخصية</span>
        </h3>
        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div>
            <label htmlFor="full_name" className="block text-xs font-bold text-ink-700 mb-1.5">
              الاسم الكامل:
            </label>
            <input
              id="full_name"
              type="text"
              value={currentFullName}
              onChange={(e) => setCurrentFullName(e.target.value)}
              placeholder="أدخل اسمك الكامل"
              className="input-field text-sm"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-xs font-bold text-ink-700 mb-1.5">
              البريد الإلكتروني:
            </label>
            <input
              id="email"
              type="email"
              required
              value={currentEmail}
              onChange={(e) => setCurrentEmail(e.target.value)}
              className="input-field text-sm"
              dir="ltr"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="btn-primary text-sm w-full sm:w-auto flex items-center justify-center gap-2 min-w-32"
            >
              {isUpdatingProfile ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
      <div className="card p-6">
        <h3 className="font-heading font-bold text-base text-ink-900 mb-4 pb-2 border-b border-ink-100/60 flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-gold-dark" />
          <span>تغيير كلمة المرور</span>
        </h3>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label htmlFor="new_password" className="block text-xs font-bold text-ink-700 mb-1.5">
              كلمة المرور الجديدة:
            </label>
            <input
              id="new_password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="6 أحرف على الأقل"
              className="input-field text-sm max-w-md"
              dir="ltr"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isChangingPassword}
              className="btn-gold text-sm w-full sm:w-auto font-bold flex items-center justify-center gap-2 min-w-36"
            >
              {isChangingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
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
