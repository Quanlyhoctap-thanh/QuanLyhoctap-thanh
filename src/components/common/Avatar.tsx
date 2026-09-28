import React from 'react';

interface AvatarProps {
  type?: 'boy-1' | 'boy-2' | 'boy-3' | 'girl-1' | 'girl-2' | 'girl-3' | 'teacher';
  name?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  type = 'boy-1',
  name = '',
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
  };

  const getInitials = (n: string) => {
    if (!n) return 'HS';
    const parts = n.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[parts.length - 2][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Render authentic friendly flat illustration avatar
  if (type === 'teacher') {
    return (
      <div className={`relative rounded-full overflow-hidden shrink-0 bg-blue-100 border border-blue-200 ${sizeMap[size]} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          <circle cx="32" cy="32" r="32" fill="#E0F2FE" />
          {/* Hair back */}
          <path d="M18 26C18 16 24 10 32 10C40 10 46 16 46 26V30H18V26Z" fill="#1E293B" />
          {/* Head & Neck */}
          <rect x="28" y="36" width="8" height="10" fill="#FBD38D" />
          <circle cx="32" cy="27" r="14" fill="#FBD38D" />
          {/* Hair front */}
          <path d="M18 24C20 16 28 14 32 14C38 14 44 17 46 23C44 19 39 17 32 17C24 17 19 21 18 24Z" fill="#0F172A" />
          {/* Glasses */}
          <rect x="22" y="24" width="8" height="6" rx="2" fill="none" stroke="#0284C7" strokeWidth="1.5" />
          <rect x="34" y="24" width="8" height="6" rx="2" fill="none" stroke="#0284C7" strokeWidth="1.5" />
          <path d="M30 27H34" stroke="#0284C7" strokeWidth="1.5" />
          {/* Eyes & Smile */}
          <circle cx="26" cy="27" r="1" fill="#0F172A" />
          <circle cx="38" cy="27" r="1" fill="#0F172A" />
          <path d="M29 34C30.5 35.5 33.5 35.5 35 34" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" />
          {/* Clothes (Teacher Shirt & Tie) */}
          <path d="M14 60C14 47 22 43 32 43C42 43 50 47 50 60H14Z" fill="#0284C7" />
          <polygon points="32,46 28,43 36,43" fill="#FFFFFF" />
          <polygon points="32,46 34,58 30,58" fill="#F59E0B" />
        </svg>
      </div>
    );
  }

  // Boy 1: Short dark hair, yellow-orange tee with red scarf
  if (type === 'boy-1' || type === 'boy-3') {
    return (
      <div className={`relative rounded-full overflow-hidden shrink-0 bg-blue-50 border border-blue-100 ${sizeMap[size]} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          <circle cx="32" cy="32" r="32" fill="#E0F2FE" />
          {/* Hair */}
          <path d="M20 25C20 16 25 11 32 11C39 11 44 16 44 25V28H20V25Z" fill="#334155" />
          {/* Neck & Face */}
          <rect x="29" y="36" width="6" height="8" fill="#FCD34D" />
          <circle cx="32" cy="27" r="13" fill="#FDE68A" />
          {/* Hair bangs */}
          <path d="M19 22C23 16 32 15 45 20C41 17 35 15 30 15C24 15 20 18 19 22Z" fill="#1E293B" />
          {/* Eyes & Smile */}
          <circle cx="27" cy="26" r="1.5" fill="#1E293B" />
          <circle cx="37" cy="26" r="1.5" fill="#1E293B" />
          <path d="M29 32C30.5 34 33.5 34 35 32" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
          <ellipse cx="25" cy="29" rx="2" ry="1" fill="#FCA5A5" opacity="0.6" />
          <ellipse cx="39" cy="29" rx="2" ry="1" fill="#FCA5A5" opacity="0.6" />
          {/* White uniform shirt + Red scarf */}
          <path d="M16 60C16 47 23 42 32 42C41 42 48 47 48 60H16Z" fill="#FFFFFF" />
          {/* Red scarf (khăn quàng đỏ) */}
          <path d="M30 43L24 55L32 50L40 55L34 43Z" fill="#DC2626" />
        </svg>
      </div>
    );
  }

  // Boy 2: Spiky neat hair, blue collared shirt
  if (type === 'boy-2') {
    return (
      <div className={`relative rounded-full overflow-hidden shrink-0 bg-emerald-50 border border-emerald-100 ${sizeMap[size]} ${className}`}>
        <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
          <circle cx="32" cy="32" r="32" fill="#D1FAE5" />
          {/* Spiky hair */}
          <path d="M18 24C19 14 26 10 32 10C38 10 45 14 46 24V28H18V24Z" fill="#475569" />
          {/* Face */}
          <rect x="29" y="36" width="6" height="8" fill="#FCD34D" />
          <circle cx="32" cy="27" r="13" fill="#FDE68A" />
          {/* Eyes & Big Smile */}
          <circle cx="27" cy="26" r="1.5" fill="#1E293B" />
          <circle cx="37" cy="26" r="1.5" fill="#1E293B" />
          <path d="M28 32C30 35 34 35 36 32" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
          {/* Shirt + Scarf */}
          <path d="M16 60C16 47 23 42 32 42C41 42 48 47 48 60H16Z" fill="#F8FAFC" />
          <path d="M30 43L24 55L32 50L40 55L34 43Z" fill="#EF4444" />
        </svg>
      </div>
    );
  }

  // Girl 1 & 2 & 3: Cute girl avatars with ponytails / hair clips & red scarf
  return (
    <div className={`relative rounded-full overflow-hidden shrink-0 bg-rose-50 border border-rose-100 ${sizeMap[size]} ${className}`}>
      <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
        <circle cx="32" cy="32" r="32" fill="#FCE7F3" />
        {/* Ponytails */}
        <circle cx="16" cy="25" r="7" fill="#374151" />
        <circle cx="48" cy="25" r="7" fill="#374151" />
        {/* Face */}
        <rect x="29" y="36" width="6" height="8" fill="#FCD34D" />
        <circle cx="32" cy="27" r="13" fill="#FDE68A" />
        {/* Bangs */}
        <path d="M20 24C22 17 31 15 44 24C41 18 35 15 31 15C25 15 22 18 20 24Z" fill="#1F2937" />
        {/* Pink hair clip */}
        <circle cx="21" cy="20" r="3" fill="#EC4899" />
        {/* Sweet eyes & rosy cheeks */}
        <circle cx="27" cy="27" r="1.5" fill="#1E293B" />
        <circle cx="37" cy="27" r="1.5" fill="#1E293B" />
        <ellipse cx="25" cy="30" rx="2.5" ry="1.2" fill="#F472B6" opacity="0.7" />
        <ellipse cx="39" cy="30" rx="2.5" ry="1.2" fill="#F472B6" opacity="0.7" />
        <path d="M29 33C30.5 35 33.5 35 35 33" stroke="#B45309" strokeWidth="1.5" strokeLinecap="round" />
        {/* White shirt & red scarf */}
        <path d="M16 60C16 47 23 42 32 42C41 42 48 47 48 60H16Z" fill="#FFFFFF" />
        <path d="M30 43L24 55L32 50L40 55L34 43Z" fill="#EF4444" />
      </svg>
    </div>
  );
};

export const SchoolLogo: React.FC<{ className?: string }> = ({ className = 'w-9 h-9' }) => {
  return (
    <div className={`relative rounded-xl overflow-hidden shrink-0 bg-white/10 flex items-center justify-center p-1.5 shadow-sm border border-white/20 ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
        {/* Shield background */}
        <path d="M20 3L6 8V19C6 28 12 34 20 37C28 34 34 28 34 19V8L20 3Z" fill="#F59E0B" fillOpacity="0.2" stroke="#FBBF24" strokeWidth="2" strokeLinejoin="round" />
        {/* Open book */}
        <path d="M12 26C16 24 19 24 20 26C21 24 24 24 28 26V15C24 13 21 13 20 15C19 13 16 13 12 15V26Z" fill="#FFFFFF" />
        <line x1="20" y1="15" x2="20" y2="26" stroke="#0284C7" strokeWidth="1.5" />
        {/* Golden star / sprout */}
        <path d="M20 7L21.5 10.5L25 11L22.5 13.5L23 17L20 15L17 17L17.5 13.5L15 11L18.5 10.5L20 7Z" fill="#F59E0B" />
      </svg>
    </div>
  );
};
