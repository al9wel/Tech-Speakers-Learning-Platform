export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-12 h-12 rounded-lg bg-bg-alt border border-border-base flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-ink-muted" strokeWidth={1.5} />
      </div>
      <h3 className="font-serif text-lg font-semibold text-ink-primary mb-1.5">{title}</h3>
      <p className="text-sm text-ink-secondary max-w-sm mb-5">{description}</p>
      {action}
    </div>
  );
}
