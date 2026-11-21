// Circular progress for match percentage. Colour tells you at a glance: strong, decent or weak fit.
export default function MatchRing({ value, size = 48 }) {
  const stroke = size >= 80 ? 8 : 5;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const color = value >= 75 ? '#10B981' : value >= 50 ? '#4F46E5' : '#F59E0B';
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${value}% match`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#E2E8F0" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c * (1 - value / 100)} style={{ transition: 'stroke-dashoffset .6s ease' }} />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-bold" style={{ fontSize: size * (size >= 80 ? 0.26 : 0.27) }}>{value}%</span>
    </div>
  );
}
