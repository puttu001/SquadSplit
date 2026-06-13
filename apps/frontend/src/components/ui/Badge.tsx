import { clsx } from 'clsx';

type Color = 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple';

const colorClasses: Record<Color, string> = {
  gray:   'bg-gray-100 text-gray-700',
  blue:   'bg-blue-100 text-blue-700',
  green:  'bg-green-100 text-green-700',
  red:    'bg-red-100 text-red-700',
  yellow: 'bg-yellow-100 text-yellow-700',
  purple: 'bg-purple-100 text-purple-700',
};

interface BadgeProps {
  children: React.ReactNode;
  color?:   Color;
  className?: string;
}

export function Badge({ children, color = 'gray', className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colorClasses[color], className)}>
      {children}
    </span>
  );
}
