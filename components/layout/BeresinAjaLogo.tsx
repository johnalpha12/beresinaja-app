interface Props {
  size?: number
}

export default function BeresinAjaLogo({ size = 48 }: Props) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="BeresinAja logo">
      {/* Handle */}
      <rect x="28" y="38" width="16" height="26" rx="6" fill="#78909C" />
      {/* Shaft */}
      <rect x="33" y="14" width="6" height="28" rx="2" fill="#546E7A" />
      {/* Tip */}
      <polygon points="33,10 39,10 37,4 35,4" fill="#455A64" />
      {/* Sparkle */}
      <line x1="44" y1="16" x2="52" y2="8" stroke="#29B6F6" strokeWidth="3" strokeLinecap="round" />
      <line x1="48" y1="24" x2="58" y2="22" stroke="#29B6F6" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="46" y1="10" x2="50" y2="4" stroke="#29B6F6" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}
