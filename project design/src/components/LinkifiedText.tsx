import { ExternalLink } from 'lucide-react';

const URL_RE = /(https?:\/\/[^\s<>"']+)/gi;

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

type Props = {
  text: string;
  className?: string;
};

export default function LinkifiedText({ text, className }: Props) {
  if (!text) return null;
  const parts = text.split(URL_RE);
  const matches = text.match(URL_RE) || [];

  return (
    <span className={className}>
      {parts.map((part, i) => {
        const url = matches[i];
        if (url && isSafeUrl(url)) {
          return (
            <a
              key={i}
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gold-dark hover:underline inline-flex items-baseline gap-0.5"
              dir="ltr"
            >
              {part}
              <ExternalLink className="w-3 h-3 inline-block opacity-50 shrink-0" />
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </span>
  );
}
