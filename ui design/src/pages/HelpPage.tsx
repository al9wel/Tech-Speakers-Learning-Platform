import { Link } from 'react-router-dom';
import { LifeBuoy, BookOpen, MessageSquareText, Mail } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';

const helpResources = [
  {
    icon: BookOpen,
    title: 'دليل البدء',
    description: 'تعلّم كيفية تصفح منهجك وتتبع تقدمك والاستفادة القصوى من تجربة التعلم.',
  },
  {
    icon: MessageSquareText,
    title: 'منتدى المجتمع',
    description: 'اطرح الأسئلة وشارك الأفكار وتواصل مع زملائك المتعلمين في مساحة النقاش المجتمعية.',
  },
  {
    icon: Mail,
    title: 'تواصل مع الدعم',
    description: 'تواصل مع فريق الدعم للمشكلات التقنية أو أسئلة الحساب أو إرشادات المنهج.',
  },
];

export function HelpPage() {
  return (
    <div className="animate-fade-in">
      <div className="max-w-[700px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <PageHeader
          title="المساعدة والدعم"
          subtitle="اعثر على الإجابات واحصل على إرشادات واستفد القصوى من تجربة تعلمك."
        />

        <div className="space-y-3">
          {helpResources.map((resource, idx) => {
            const Icon = resource.icon;
            return (
              <div
                key={idx}
                className="border border-border-base rounded-lg bg-bg-surface p-5 transition-base hover:border-ink-muted/30"
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-md bg-bg-alt border border-border-base flex items-center justify-center shrink-0">
                    <Icon className="w-[17px] h-[17px] text-ink-secondary" strokeWidth={1.8} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-ink-primary mb-1">{resource.title}</h3>
                    <p className="text-[13px] text-ink-secondary leading-relaxed">{resource.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 pt-6 border-t border-border-base text-center">
          <Link
            to="/student"
            className="text-[13px] font-medium text-ink-secondary hover:text-accent transition-base"
          >
            → العودة إلى الرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
