export default function HeroIllustration({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* background blob */}
      <ellipse cx="200" cy="180" rx="170" ry="120" fill="#F2E9DE" />
      <ellipse cx="200" cy="170" rx="140" ry="100" fill="#FBF7F0" />

      {/* open book */}
      <path d="M80 200 C120 180 160 180 200 200 C240 180 280 180 320 200 L320 240 C280 220 240 220 200 240 C160 220 120 220 80 240 Z" fill="#A98262" />
      <path d="M80 190 C120 170 160 170 200 190 C240 170 280 170 320 190 L320 230 C280 210 240 210 200 230 C160 210 120 210 80 230 Z" fill="#F7F2EA" />
      {/* book spine */}
      <line x1="200" y1="190" x2="200" y2="230" stroke="#A98262" strokeWidth="2" />
      {/* text lines on book */}
      <line x1="100" y1="200" x2="180" y2="200" stroke="#C69C5D" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      <line x1="100" y1="210" x2="170" y2="210" stroke="#C69C5D" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />
      <line x1="220" y1="200" x2="300" y2="200" stroke="#C69C5D" strokeWidth="1.5" opacity="0.5" strokeLinecap="round" />
      <line x1="230" y1="210" x2="300" y2="210" stroke="#C69C5D" strokeWidth="1.5" opacity="0.4" strokeLinecap="round" />

      {/* fountain pen nib */}
      <path d="M200 40 L192 130 L200 145 L208 130 Z" fill="#6B4F3A" />
      <path d="M200 40 L192 130 L200 145 Z" fill="#352A24" />
      {/* nib slit */}
      <line x1="200" y1="50" x2="200" y2="135" stroke="#C69C5D" strokeWidth="1.5" />
      {/* nib tip gold dot */}
      <circle cx="200" cy="138" r="3" fill="#C69C5D" />

      {/* ink drops / sparkles */}
      <circle cx="150" cy="80" r="4" fill="#C69C5D" opacity="0.6" />
      <circle cx="260" cy="70" r="3" fill="#C69C5D" opacity="0.5" />
      <circle cx="170" cy="120" r="2.5" fill="#6F8A72" opacity="0.5" />
      <circle cx="250" cy="110" r="2" fill="#6F8A72" opacity="0.4" />

      {/* small star/sparkle accents */}
      <path d="M130 60 L132 66 L138 68 L132 70 L130 76 L128 70 L122 68 L128 66 Z" fill="#C69C5D" opacity="0.7" />
      <path d="M280 130 L281 134 L285 135 L281 136 L280 140 L279 136 L275 135 L279 134 Z" fill="#C69C5D" opacity="0.6" />
    </svg>
  );
}
