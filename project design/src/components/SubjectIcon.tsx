import {
  BookOpen, Moon, PenLine, Sigma, Atom, Dna, FlaskConical,
  Cpu, Globe2, ScrollText, Users, Languages,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  BookOpen, Moon, PenLine, Sigma, Atom, Dna, FlaskConical,
  Cpu, Globe2, ScrollText, Users, Languages,
};

export function SubjectIcon({ name, className = 'w-6 h-6' }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? BookOpen;
  return <Icon className={className} aria-hidden="true" />;
}
