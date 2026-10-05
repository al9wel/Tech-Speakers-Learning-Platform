import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, X, Search, User as UserIcon, LogOut, LayoutDashboard, GraduationCap, ShieldCheck, Heart, MessageSquare } from 'lucide-react';
import Logo from '@/components/Logo';
import { useApp } from '@/context/AppContext';

const navLinks = [
  { to: '/', label: 'الرئيسية' },
  { to: '/subjects', label: 'المواد' },
  { to: '/teachers', label: 'المعلمون' },
  { to: '/support', label: 'الدعم النفسي' },
  { to: '/contribute', label: 'ساهم' },
  { to: '/suggestions', label: 'الاقتراحات' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useApp();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/search?q=${encodeURIComponent(search.trim())}`);
      setSearch('');
      setOpen(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-cream/85 backdrop-blur-md border-b border-ink-100/60">
      <nav className="container-page flex items-center justify-between h-16 gap-4">
        <Logo />

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `px-3.5 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                  isActive ? 'text-ink-900 bg-ink-100/60' : 'text-ink-700 hover:bg-ink-50 hover:text-ink-900'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        {/* Desktop search + auth */}
        <div className="hidden lg:flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث..."
              className="w-44 rounded-full border border-ink-200 bg-white/70 py-2 pr-9 pl-3 text-sm focus:w-56 transition-all focus:border-gold focus:ring-2 focus:ring-gold/20"
            />
          </form>
          {user ? (
            <div className="flex items-center gap-2">
              {user.role === 'admin' && (
                <Link to="/admin" className="btn-ghost text-sm">
                  <LayoutDashboard className="w-4 h-4" />
                  لوحة التحكم
                </Link>
              )}
              {user.role === 'moderator' && (
                <Link to="/moderator" className="btn-ghost text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  لوحة المراجعة
                </Link>
              )}
              {user.role === 'teacher' && (
                <Link to="/teacher" className="btn-ghost text-sm">
                  <GraduationCap className="w-4 h-4" />
                  واجهة المعلم
                </Link>
              )}
              {user.role === 'counselor' && (
                <Link to="/counselor" className="btn-ghost text-sm">
                  <Heart className="w-4 h-4" />
                  واجهة المستشار
                </Link>
              )}
              {user.role !== 'counselor' && (
                <Link to="/my-messages" className="btn-ghost text-sm">
                  <MessageSquare className="w-4 h-4" />
                  رسائلي
                </Link>
              )}
              <Link to="/account" className="btn-outline text-sm">
                <UserIcon className="w-4 h-4" />
                {user.name}
              </Link>
              <button onClick={() => { void logout().then(() => navigate('/')); }} className="btn-outline text-sm text-red-600 border-red-100 hover:bg-red-50" aria-label="تسجيل الخروج">
                <LogOut className="w-4 h-4" />
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary text-sm">
              تسجيل الدخول
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="lg:hidden p-2 rounded-lg text-ink-700 hover:bg-ink-50"
          onClick={() => setOpen(!open)}
          aria-label="القائمة"
          aria-expanded={open}
        >
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="lg:hidden border-t border-ink-100/60 bg-cream animate-fade-in">
          <div className="container-page py-4 space-y-3">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن درس، موضوع، أو مادة..."
                className="input-field pr-10"
              />
            </form>
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `px-3 py-2.5 rounded-lg text-[15px] font-medium text-center transition-colors ${
                      isActive ? 'text-ink-900 bg-ink-100' : 'text-ink-700 bg-white/60 hover:bg-ink-50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
            </div>
            {user ? (
              <div className="flex gap-2">
                {user.role === 'admin' && (
                  <Link to="/admin" onClick={() => setOpen(false)} className="btn-outline flex-1 text-sm">
                    <LayoutDashboard className="w-4 h-4" /> لوحة التحكم
                  </Link>
                )}
                {user.role === 'moderator' && (
                  <Link to="/moderator" onClick={() => setOpen(false)} className="btn-outline flex-1 text-sm">
                    <ShieldCheck className="w-4 h-4" /> لوحة المراجعة
                  </Link>
                )}
                {user.role === 'teacher' && (
                  <Link to="/teacher" onClick={() => setOpen(false)} className="btn-outline flex-1 text-sm">
                    <GraduationCap className="w-4 h-4" /> واجهة المعلم
                  </Link>
                )}
                {user.role === 'counselor' && (
                  <Link to="/counselor" onClick={() => setOpen(false)} className="btn-outline flex-1 text-sm">
                    <Heart className="w-4 h-4" /> واجهة المستشار
                  </Link>
                )}
                {user.role !== 'counselor' && (
                  <Link to="/my-messages" onClick={() => setOpen(false)} className="btn-outline flex-1 text-sm">
                    <MessageSquare className="w-4 h-4" /> رسائلي
                  </Link>
                )}
                <button onClick={() => { void logout().then(() => { setOpen(false); navigate('/'); }); }} className="btn-outline flex-1 text-sm text-red-600 border-red-100 hover:bg-red-50">
                  <LogOut className="w-4 h-4" /> تسجيل الخروج
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="btn-primary w-full">
                تسجيل الدخول
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
