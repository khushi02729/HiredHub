import { assetUrl, initials } from '../../utils/format';

export default function Avatar({ user, size = 36, className = '' }) {
  const style = { width: size, height: size, fontSize: size * 0.38 };
  if (user?.avatar) return <img src={assetUrl(user.avatar)} alt="" style={style} className={`shrink-0 rounded-full object-cover ${className}`} />;
  return (
    <div style={style} className={`grid shrink-0 place-items-center rounded-full bg-brand font-semibold text-white ${className}`}>
      {initials(user?.name)}
    </div>
  );
}
