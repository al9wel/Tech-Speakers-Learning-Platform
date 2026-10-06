import { NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  GraduationCap,
  Compass,
  Bookmark,
  MessageSquareText,
  Globe,
  LifeBuoy,
} from 'lucide-react';

const navItems = [
  { label: 'الرئيسية', path: '/student', icon: BookOpen },
  { label: 'تعليمي', path: '/student/learning', icon: GraduationCap },
  { label: 'المواد', path: '/student/subjects', icon: Compass },
  { label: 'استكشاف', path: '/student/explore', icon: Globe },
  { label: 'المحفوظات', path: '/student/saved', icon: Bookmark },
  { label: 'النقاشات', path: '/student/discussions', icon: MessageSquareText },
];

const bottomItems = [
  { label: 'المساعدة', path: '/student/help', icon: LifeBuoy },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <aside className="hidden md:flex flex-col w-[224px] shrink-0 border-l border-border-base bg-bg-surface h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-8">
        <NavLink to="/student" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-md bg-accent flex items-center justify-center transition-base group-hover:bg-accent-light">
            <BookOpen className="w-4 h-4 text-white" strokeWidth={2.2} />
          </div>
          <span className="font-serif text-lg font-bold text-ink-primary">
            لومن
          </span>
        </NavLink>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 px-3">
        <div className="px-2 mb-2 text-[11px] font-medium text-ink-muted">
          المنهج الدراسي
        </div>
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.path === '/student'
              ? location.pathname === '/student'
              : location.pathname.startsWith(item.path);
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-base relative ${
                    isActive
                      ? 'text-ink-primary bg-bg-alt'
                      : 'text-ink-secondary hover:text-ink-primary hover:bg-bg-alt/60'
                  }`}
                >
                  {isActive && (
                    <span className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-l-full bg-accent" />
                  )}
                  <item.icon className="w-[17px] h-[17px] shrink-0" strokeWidth={1.8} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4">
        <div className="h-px bg-border-subtle mb-3 mx-2" />
        <ul className="space-y-0.5">
          {bottomItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className="flex items-center gap-3 px-3 py-2 text-sm font-medium text-ink-secondary hover:text-ink-primary hover:bg-bg-alt/60 rounded-md transition-base"
              >
                <item.icon className="w-[17px] h-[17px] shrink-0" strokeWidth={1.8} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* User profile */}
        <NavLink
          to="/student"
          className="mt-3 flex items-center gap-2.5 px-2 py-2 rounded-md hover:bg-bg-alt/60 transition-base"
        >
          <div className="w-8 h-8 rounded-full bg-accent-bg border border-accent/20 flex items-center justify-center text-accent font-semibold text-sm">
            ع‌ك
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-ink-primary truncate">عمر الخالدي</div>
            <div className="text-[11px] text-ink-muted truncate">الصف الحادي عشر · طالب</div>
          </div>
        </NavLink>
      </div>
    </aside>
  );
}
