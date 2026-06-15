const LOGO_SRC = 'https://res.cloudinary.com/ds8ojqqra/image/upload/v1781534184/logo_hjllfb.png';
// const LOGO_SRC = 'https://res.cloudinary.com/ds8ojqqra/image/upload/v1781535454/logo-removebg-preview_y9pvit.png';


type LogoProps = {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md';
};

export function Logo({ variant = 'dark', size = 'md' }: LogoProps) {
  const imgCls  = size === 'sm' ? 'w-8 h-8'  : 'w-10 h-10';
  const textCls = size === 'sm' ? 'text-lg'  : 'text-xl';

  return (
    <div className="flex items-center gap-2.5">
      <img
        src={LOGO_SRC}
        alt="SquadSplit"
        className={`${imgCls} rounded-xl object-contain shrink-0`}
      />
      <span className={`${textCls} font-bold ${variant === 'light' ? 'text-white' : 'text-gray-900'}`}>
        Squad<span className={variant === 'light' ? 'text-teal-200' : 'text-teal-600'}>Split</span>
      </span>
    </div>
  );
}
