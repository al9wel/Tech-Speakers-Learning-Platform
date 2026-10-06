import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface Breadcrumb {
  label: string;
  path?: string;
}

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  action,
}: {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-[12px] mb-3 flex-wrap">
          {breadcrumbs.map((crumb, idx) => (
            <span key={idx} className="flex items-center gap-1.5">
              {crumb.path ? (
                <Link to={crumb.path} className="text-ink-secondary hover:text-accent transition-base font-medium">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-ink-primary font-medium">{crumb.label}</span>
              )}
              {idx < breadcrumbs.length - 1 && (
                <ChevronLeft className="w-3 h-3 text-ink-muted" />
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-ink-primary">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-ink-secondary mt-1 max-w-2xl">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  );
}
