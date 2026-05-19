type IconProps = { className?: string };

export const CarryOnIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Ручная кладь"
  >
    {/* Curved handle */}
    <path
      d="M7 8 C7 4.5 13 4.5 13 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Bag body */}
    <rect x="3" y="8" width="14" height="10" rx="2" />
    {/* Centre clasp */}
    <rect x="9" y="11" width="2" height="3" rx="1" fill="rgba(255,255,255,0.55)" />
  </svg>
);

export const CheckedBaggageIcon = ({ className }: IconProps) => (
  <svg
    className={className}
    viewBox="0 0 20 20"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="Багаж"
  >
    {/* Left handle stem */}
    <rect x="7.2" y="0" width="1.3" height="5" rx="0.65" />
    {/* Right handle stem */}
    <rect x="11.5" y="0" width="1.3" height="5" rx="0.65" />
    {/* Cross bar */}
    <rect x="6.5" y="0" width="7" height="1.4" rx="0.7" />
    {/* Suitcase body */}
    <rect x="2" y="5" width="16" height="12" rx="2" />
    {/* Horizontal strap */}
    <rect x="2" y="10" width="16" height="1.5" fill="rgba(255,255,255,0.35)" />
    {/* Left wheel */}
    <circle cx="6" cy="18.5" r="1.2" />
    {/* Right wheel */}
    <circle cx="14" cy="18.5" r="1.2" />
  </svg>
);
