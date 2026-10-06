import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { rolePaths, isAppRole } from '@/lib/auth/roles'
import HeroIllustration from '@/components/HeroIllustration'
import {
  Sparkles,
  ArrowLeft,
  GraduationCap,
  Users,
  Heart,
  ShieldCheck,
} from 'lucide-react'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'الرئيسية',
  description: 'منصة تعليمية يمنية شاملة للطلاب والمعلمين والمستشارين والمشرفين',
}

export default async function HomePage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let profile: { full_name: string | null; role: string | null } | null = null
  let dashboardPath: string | null = null

  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, role')
      .eq('id', user.id)
      .single()

    if (data && isAppRole(data.role)) {
      profile = data
      dashboardPath = rolePaths[data.role]
    }
  }

  const roleLabelMap: Record<string, string> = {
    student: 'طالب',
    teacher: 'معلم',
    admin: 'مشرف عام',
    supervisor: 'مشرف تربوي',
    counselor: 'مستشار نفسي',
  }

  return (
    <div className="animate-page">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-paper-light border-b border-ink-200/80">
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #2d5f5d 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="container-page py-14 md:py-24 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="text-center lg:text-right space-y-6 animate-slide-up">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-sm bg-teal/10 text-teal-dark text-xs font-semibold border border-teal/20">
                <Sparkles className="w-3.5 h-3.5 text-teal" />
                <span>المنصة التعليمية اليمنية المتكاملة</span>
              </span>

              <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl text-ink-900 leading-tight">
                مِداد
                <span className="block text-2xl md:text-3xl text-amber-800 mt-2 font-serif font-normal">
                  المعرفة تُكتب وتُشارك
                </span>
              </h1>

              <p className="text-ink-600 text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 font-sans">
                منصة تعليمية تجمع الطلاب والمعلمين والمحتوى التعليمي في مساحة واحدة،
                لتجعل الوصول إلى المعرفة أسهل وفق المناهج التعليمية المعتمدة.
              </p>

              {user && profile ? (
                <div className="rounded-lg p-5 bg-white border border-ink-200/80 max-w-lg mx-auto lg:mx-0 shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-md bg-teal/10 text-teal flex items-center justify-center font-bold">
                        {(profile.full_name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="text-right">
                        <p className="font-serif font-bold text-base text-ink-900">
                          مرحباً بك، {profile.full_name || user.email}
                        </p>
                        <span className="inline-block text-xs font-semibold px-2 py-0.5 rounded-sm bg-paper-mid text-ink-700 mt-0.5">
                          {profile.role ? roleLabelMap[profile.role] || profile.role : 'مستخدم'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {dashboardPath && (
                      <Link
                        href={dashboardPath}
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md bg-teal hover:bg-teal-dark text-white text-sm font-medium transition-colors flex-1 shadow-xs"
                      >
                        <span>الذهاب إلى لوحة التحكم</span>
                        <ArrowLeft className="w-4 h-4" />
                      </Link>
                    )}
                    {profile.role && rolePaths[profile.role as keyof typeof rolePaths] && (
                      <Link
                        href={`${rolePaths[profile.role as keyof typeof rolePaths]}/profile`}
                        className="btn-outline text-sm py-2 px-3.5 rounded-md"
                      >
                        الملف الشخصي
                      </Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex justify-center lg:justify-start">
                  <Link
                    href="/auth"
                    className="inline-flex items-center gap-2 px-7 py-3 rounded-md bg-teal hover:bg-teal-dark text-white text-base font-medium shadow-xs transition-colors"
                  >
                    <span>ابدأ الآن</span>
                    <ArrowLeft className="w-4 h-4" />
                  </Link>
                </div>
              )}
            </div>

            <div className="hidden lg:flex justify-center animate-fade-in">
              <HeroIllustration className="w-full max-w-md" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="container-page py-14 md:py-20">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-serif font-bold text-2xl md:text-3xl text-ink-900 mb-2">
            منظومة تعليمية متكاملة لجميع الأدوار
          </h2>
          <p className="text-xs sm:text-sm text-ink-600 leading-relaxed font-sans">
            صُممت منصة مِداد لتخدم كافة أطراف العملية التعليمية بكفاءة وسهولة
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="rounded-lg border border-ink-200/80 bg-paper-light p-6 shadow-xs hover:border-teal/50 transition-colors">
            <div className="w-10 h-10 rounded-md bg-teal/10 text-teal flex items-center justify-center mb-4">
              <GraduationCap className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-ink-900 mb-2">بوابة الطالب</h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              تصفح المواد والمقررات الدراسية، متابعة المعلمين، والحصول على الدعم والإجابات.
            </p>
          </div>

          <div className="rounded-lg border border-ink-200/80 bg-paper-light p-6 shadow-xs hover:border-amber-600/40 transition-colors">
            <div className="w-10 h-10 rounded-md bg-amber-500/10 text-amber-800 flex items-center justify-center mb-4">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-ink-900 mb-2">بوابة المعلم</h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              نشر الموارد التعليمية، الإجابة على استفسارات الطلاب، ومتابعة التفاعل الأكاديمي.
            </p>
          </div>

          <div className="rounded-lg border border-ink-200/80 bg-paper-light p-6 shadow-xs hover:border-teal/50 transition-colors">
            <div className="w-10 h-10 rounded-md bg-teal/10 text-teal flex items-center justify-center mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-ink-900 mb-2">الإشراف التربوي</h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              تدقيق ومراجعة المحتوى العلمي والملخصات لضمان جودة المواد ومطابقتها للمنهج.
            </p>
          </div>

          <div className="rounded-lg border border-ink-200/80 bg-paper-light p-6 shadow-xs hover:border-ink-300 transition-colors">
            <div className="w-10 h-10 rounded-md bg-ink-100 text-ink-700 flex items-center justify-center mb-4">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-lg text-ink-900 mb-2">الإرشاد والدعم</h3>
            <p className="text-xs text-ink-600 leading-relaxed">
              مستشارون نفسيون وتربويون لتقديم الدعم والإرشاد للطلاب في بيئة آمنة وخاصة.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}