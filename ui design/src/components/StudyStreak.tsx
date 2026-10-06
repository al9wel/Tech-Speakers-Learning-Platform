import { Flame } from 'lucide-react';
import { studyStreak } from '@/data/mockData';

export function StudyStreak() {
  const days = ['أ', 'ث', 'ث', 'ر', 'خ', 'ج', 'س'];
  const activeDays = [true, true, true, true, true, false, false];

  return (
    <div className="border border-border-base rounded-lg bg-bg-surface p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber" strokeWidth={2} />
          <span className="text-sm font-semibold text-ink-primary">سلسلة الدراسة</span>
        </div>
        <span className="text-sm font-semibold text-amber">{studyStreak.current} يوم</span>
      </div>

      {/* Week dots */}
      <div className="flex items-center justify-between gap-1 mb-3">
        {days.map((day, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
                activeDays[idx]
                  ? 'bg-amber-bg text-amber border border-amber/30'
                  : 'bg-bg-alt text-ink-muted'
              }`}
            >
              {day}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between text-[11px] text-ink-muted pt-2 border-t border-border-subtle">
        <span>هذا الأسبوع: {studyStreak.thisWeek} جلسات</span>
        <span>{Math.floor(studyStreak.totalMinutes / 60)} ساعة إجمالاً</span>
      </div>
    </div>
  );
}
