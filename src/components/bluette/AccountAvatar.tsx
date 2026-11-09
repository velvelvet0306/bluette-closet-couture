import React from 'react';

interface AccountAvatarProps {
  name: string;
  url: string | null | undefined;
  size?: number;
  className?: string;
}

/** Round sticker avatar: the person's photo, or their initial on butter yellow. */
export const AccountAvatar: React.FC<AccountAvatarProps> = ({ name, url, size = 36, className = '' }) => {
  const initial = (name.trim()[0] ?? '★').toUpperCase();
  return (
    <span
      className={`inline-flex items-center justify-center overflow-hidden rounded-full border-2 border-paper bg-butter text-ink font-whimsical shadow-[0_3px_0_var(--color-honey)] shrink-0 ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.42) }}
    >
      {url ? <img src={url} alt="" className="w-full h-full object-cover" /> : initial}
    </span>
  );
};
