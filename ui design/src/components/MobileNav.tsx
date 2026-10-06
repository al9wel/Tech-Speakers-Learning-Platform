import { NavLink, useLocation } from 'react-router-dom';
import { BookOpen, GraduationCap, Compass, Bookmark, MessageSquareText } from 'lucide-react';

const mobileNavItems = [
  { label: 'الرئيسية', path: '/student', icon: BookOpen },
  { label: 'تعليمي', path: '/student/learning', icon: GraduationCap },
  { label: 'المواد', path: '/student/subjects', icon: Compass },
  { label: 'محفوظ', path: '/student/saved', icon: Bookmark },
  { label: 'نقاش', path: '/student/discussions', icon: MessageSquareText },
];

export function MobileNav() {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-bg-surface border-t border-border-base">
      <div className="flex items-center justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {mobileNavItems.map((item) => {
          const isActive = item.path === '/student'
            ? location.pathname === '/student'
            : location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-md transition-base min-w-[52px] ${
                isActive ? 'text-accent' : 'text-ink-muted'
              }`}
            >
              <div className={`relative ${isActive ? '' : ''}`}>
                {isActive && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                )}
                <item.icon className="w-[20px] h-[20px]" strokeWidth={isActive ? 2.2 : 1.7} />
              </div>
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
