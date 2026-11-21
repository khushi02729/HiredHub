import { initials } from '../../utils/format';

const PALETTES = [['#4F46E5', '#7C3AED'], ['#0EA5E9', '#4F46E5'], ['#10B981', '#0EA5E9'], ['#F59E0B', '#F43F5E'], ['#EC4899', '#7C3AED'], ['#14B8A6', '#4F46E5']];
const hash = (s) => [...s].reduce((a, c) => a + c.charCodeAt(0), 0);

// Uses the company's logo when there is one, otherwise a stable gradient tile with initials.
export default function CompanyLogo({ name = '?', logo, size = 44 }) {
  const style = { width: size, height: size };
  if (logo) return <img src={logo} alt={`${name} logo`} style={style} className="shrink-0 rounded-xl border border-slate-200 object-cover" />;
  const [a, b] = PALETTES[hash(name) % PALETTES.length];
  return (
    <div
      aria-hidden="true"
      style={{ ...style, fontSize: size * 0.36, backgroundImage: `linear-gradient(135deg, ${a}, ${b})` }}
      className="grid shrink-0 place-items-center rounded-xl font-bold text-white"
    >
      {initials(name)}
    </div>
  );
}
