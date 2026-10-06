import { Link } from 'react-router-dom';
import { Check, Play, MessageSquare, Bookmark, BookOpen } from 'lucide-react';
import type { ActivityItem } from '@/types';

interface ActivityTimelineProps {
  activities: ActivityItem[];
  maxItems?: number;
}

const typeConfig = {
  completed: { icon: Check, color: 'text-success', bg: 'bg-success-bg', border: 'border-success/30' },
  started: { icon: BookOpen, color: 'text-accent', bg: 'bg-accent-bg', border: 'border-accent/30' },
  answered: { icon: MessageSquare, color: 'text-amber', bg: 'bg-amber-bg', border: 'border-amber/30' },
  saved: { icon: Bookmark, color: 'text-ink-secondary', bg: 'bg-bg-alt', border: 'border-border-base' },
};

export function ActivityTimeline({ activities, maxItems }: ActivityTimelineProps) {
  const items = maxItems ? activities.slice(0, maxItems) : activities;

  return (
    <div className="space-y-0">
      {items.map((activity, idx) => {
        const config = typeConfig[activity.type];
        const Icon = config.icon;
        const isLast = idx === items.length - 1;

        return (
          <div key={activity.id} className="flex gap-3 group">
            {/* Timeline */}
            <div className="flex flex-col items-center shrink-0">
              <div className={`w-6 h-6 rounded-full ${config.bg} border ${config.border} flex items-center justify-center`}>
                <Icon className={`w-3 h-3 ${config.color}`} strokeWidth={2.2} fill={activity.type === 'completed' ? 'currentColor' : 'none'} />
              </div>
              {!isLast && <div className="w-px flex-1 min-h-[24px] bg-border-subtle my-1" />}
            </div>

            {/* Content */}
            <div className={`flex-1 ${isLast ? '' : 'pb-4'}`}>
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[13px] text-ink-secondary font-medium">{activity.label}</span>
                <span className="text-[11px] text-ink-muted shrink-0">{activity.timestamp}</span>
              </div>
              {activity.lessonTitle && (
                <Link
                  to={`/student/lesson/${activity.lessonId}`}
                  className="text-sm text-ink-primary hover:text-accent transition-base font-medium"
                >
                  {activity.lessonTitle}
                </Link>
              )}
              <Link
                to={`/student/subjects/${activity.subjectId}`}
                className="text-[11px] text-ink-muted hover:text-ink-secondary transition-base"
              >
                {activity.subject}
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
