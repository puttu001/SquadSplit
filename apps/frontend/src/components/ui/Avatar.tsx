import { clsx } from 'clsx';

interface AvatarProps {
  name:      string;
  src?:      string | null;
  size?:     'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-sm', md: 'w-10 h-10 text-base', lg: 'w-14 h-14 text-xl' };

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  return src ? (
    <img
      src={src}
      alt={name}
      className={clsx('rounded-full object-cover', sizeClasses[size], className)}
    />
  ) : (
    <div
      className={clsx(
        'rounded-full bg-primary-500 text-white flex items-center justify-center font-semibold',
        sizeClasses[size],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}
