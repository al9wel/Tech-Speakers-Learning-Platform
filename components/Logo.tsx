import Link from 'next/link';

type LogoProps = {
  variant?: 'full' | 'compact' | 'white';
  className?: string;
  showTagline?: boolean;
};

export default function Logo({ variant = 'full', className = '', showTagline = false }: LogoProps) {
  const textColor = variant === 'white' ? 'text-white' : 'text-ink-primary';
  const subColor = variant === 'white' ? 'text-white/70' : 'text-ink-muted';

  return (
    <Link
      href="/"
      className={`flex items-center gap-2.5 group shrink-0 select-none ${className}`}
      aria-label="مِداد - الصفحة الرئيسية"
    >
      <span className="shrink-0 flex items-center justify-center">
        <LogoMark variant={variant} />
      </span>
      <span className="flex flex-col leading-none shrink-0">
        <span
          className={`font-serif font-bold text-lg sm:text-xl tracking-tight ${textColor}`}
        >
          مِداد
        </span>
        {variant !== 'compact' && (
          <span
            className={`text-[11px] font-medium ${subColor} mt-0.5 whitespace-nowrap`}
          >
            {showTagline ? 'المعرفة تُكتب وتُشارك' : 'MIDAD'}
          </span>
        )}
      </span>
    </Link>
  );
}

export function LogoMark({ variant = 'full', className = '' }: { variant?: string; className?: string }) {
  const bookColor = variant === 'white' ? '#FAF8F4' : '#D4CFC4';
  const bookPageColor = variant === 'white' ? '#2D5F5D' : '#FAF8F4';
  const nibColor = variant === 'white' ? '#FAF8F4' : '#2D5F5D';
  const nibShade = variant === 'white' ? '#4A8580' : '#1C1B19';
  const goldAccent = '#B8732E';

  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform group-hover:scale-105 ${className}`}
      aria-hidden="true"
    >
      {/* open book - back pages */}
      <path
        d="M10 38c6-3.5 12-3.5 22 0.5c10-4 16-4 22-0.5v6c-6-3.5-12-3.5-22 0.5c-10-4-16-4-22-0.5v-6z"
        fill={bookColor}
      />
      {/* open book - front pages */}
      <path
        d="M10 35c6-3.5 12-3.5 22 0.5c10-4 16-4 22-0.5v6c-6-3.5-12-3.5-22 0.5c-10-4-16-4-22-0.5v-6z"
        fill={bookPageColor}
      />
      {/* pen nib */}
      <path d="M32 6L28.5 26L32 31L35.5 26L32 6Z" fill={nibColor} />
      <path d="M32 6L28.5 26L32 31L32 6Z" fill={nibShade} opacity="0.5" />
      {/* nib tip */}
      <circle cx="32" cy="29" r="2.2" fill={goldAccent} />
      {/* spine line */}
      <path d="M32 35.5v6" stroke={bookColor} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
