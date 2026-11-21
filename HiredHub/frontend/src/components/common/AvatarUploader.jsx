import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';
import Avatar from './Avatar';
import Button from './Button';
import useAuth from '../../hooks/useAuth';
import { errorMessage } from '../../services/api';
import { uploadAvatar } from '../../services/profileService';

export default function AvatarUploader() {
  const { user, setUser } = useAuth();
  const input = useRef(null);
  const [busy, setBusy] = useState(false);

  const onPick = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { toast.error('Choose a JPG, PNG or WEBP image'); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error('The image must be smaller than 2 MB'); return; }
    setBusy(true);
    try { setUser(await uploadAvatar(file)); toast.success('Profile picture updated'); }
    catch (err) { toast.error(errorMessage(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar user={user} size={72} />
      <div>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={onPick} aria-label="Upload profile picture" />
        <Button variant="secondary" size="sm" icon={Camera} loading={busy} onClick={() => input.current?.click()}>Change picture</Button>
        <p className="mt-1.5 text-xs text-slate-500">JPG, PNG or WEBP, up to 2 MB</p>
      </div>
    </div>
  );
}
