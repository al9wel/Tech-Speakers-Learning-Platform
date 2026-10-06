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
      <section className="relative overflow-hidden bg-gradient-to-b from-parchment to-cream border-b border-ink-100/60">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle, #6B4F3A 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="container-page py-12 md:py-20 relative">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="text-center lg:text-right space-y-6 animate-slide-up">
              <span className="chip bg-gold/15 text-gold-dark text-sm font-medium">
                <Sparkles className="w-4 h-4" />
                <span>المنصة التعليمية اليمنية المتكاملة</span>
              </span>

              <h1 className="font-heading font-extrabold text-4xl md:text-5xl lg:text-6xl text-ink-900 leading-tight">
                مِداد
                <span className="block text-2xl md:text-3xl text-gold-dark mt-2 font-bold">
                  المعرفة تُكتب وتُشارك
                </span>
              </h1>

              <p className="text-ink-600 text-base md:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">
                منصة تعليمية تجمع الطلاب والمعلمين والمحتوى التعليمي في مساحة واحدة،
                لتجعل الوصول إلى المعرفة أسهل وفق المناهج التعليمية المعتمدة.
              </p>

              {user && profile ? (
                <div className="card p-5 bg-white/90 border-ink-100 max-w-lg mx-auto lg:mx-0 shadow-soft">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center font-bold">
                        {(profile.full_name || user.email || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="text-right">
                        <p className="font-heading font-bold text-sm text-ink-900">
                          مرحباً بك، {profile.full_name || user.email}
                        </p>
                        <span className="chip bg-gold/20 text-gold-dark text-[11px] py-0 px-2 mt-0.5">
                          {profile.role ? roleLabelMap[profile.role] || profile.role : 'مستخدم'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {dashboardPath && (
                      <Link
                        href={dashboardPath}
                        className="btn-primary text-sm flex-1 flex items-center justify-center gap-2"
                      >
                        <span>الذهاب إلى لوحة التحكم</span>
                        <ArrowLeft className="w-4 h-4" />
                      </Link>
                    )}
                    {profile.role && rolePaths[profile.role as keyof typeof rolePaths] && (
                      <Link
                        href={`${rolePaths[profile.role as keyof typeof rolePaths]}/profile`}
                        className="btn-outline text-sm"
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
                    className="btn-primary text-base py-3.5 px-8 shadow-card hover:shadow-soft flex items-center gap-2.5 font-bold rounded-xl"
                  >
                    <span>ابدأ الآن</span>
                    <ArrowLeft className="w-5 h-5" />
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
      <section className="container-page py-12 md:py-16">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="font-heading font-extrabold text-2xl md:text-3xl text-ink-900 mb-2">
            منظومة تعليمية متكاملة لجميع الأدوار
          </h2>
          <p className="text-sm text-ink-500">
            صُممت منصة مِداد لتخدم كافة أطراف العملية التعليمية بكفاءة وسهولة
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card p-6 card-hover">
            <div className="w-12 h-12 rounded-xl bg-sage-50 text-sage-dark flex items-center justify-center mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-ink-900 mb-2">بوابة الطالب</h3>
            <p className="text-xs text-ink-500 leading-relaxed">
              تصفح المواد والمقررات الدراسية، متابعة المعلمين، والحصول على الدعم والإجابات.
            </p>
          </div>

          <div className="card p-6 card-hover">
            <div className="w-12 h-12 rounded-xl bg-gold/15 text-gold-dark flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-ink-900 mb-2">بوابة المعلم</h3>
            <p className="text-xs text-ink-500 leading-relaxed">
              نشر الموارد التعليمية، الإجابة على استفسارات الطلاب، ومتابعة التفاعل الأكاديمي.
            </p>
          </div>

          <div className="card p-6 card-hover">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-ink-900 mb-2">الإشراف التربوي</h3>
            <p className="text-xs text-ink-500 leading-relaxed">
              تدقيق ومراجعة المحتوى العلمي والملخصات لضمان جودة المواد ومطابقتها للمنهج.
            </p>
          </div>

          <div className="card p-6 card-hover">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center mb-4">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-ink-900 mb-2">الإرشاد والدعم</h3>
            <p className="text-xs text-ink-500 leading-relaxed">
              مستشارون نفسيون وتربويون لتقديم الدعم والإرشاد للطلاب في بيئة آمنة وخاصة.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}