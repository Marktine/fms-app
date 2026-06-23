/** @jsxImportSource hono/jsx */
import { Child } from 'hono/jsx';

type ButtonProps = {
  children?: Child;
  variant?: 'primary' | 'outline' | 'ghost' | 'none';
  class?: string;
  [key: string]: any;
};

export const Button = ({
  children,
  variant = 'primary',
  class: className = '',
  ...props
}: ButtonProps) => {
  let baseClasses = '';

  switch (variant) {
    case 'primary':
      baseClasses =
        'bg-[#6B7F62] text-white border-[3px] border-[#2D2A26] shadow-[4px_4px_0px_#2D2A26] px-4 py-3 rounded-lg font-label-caps text-label-caps uppercase flex items-center justify-center gap-2 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all duration-200';
      break;
    case 'outline':
      baseClasses =
        'border-[3px] border-on-surface bg-surface hover:bg-surface-container text-on-surface font-label-caps text-label-caps uppercase px-4 py-2 transition-colors focus:outline-none flex items-center justify-center gap-2';
      break;
    case 'ghost':
      baseClasses =
        'text-on-surface hover:text-[#6B7F62] transition-colors p-2 rounded-full focus:ring-2 focus:ring-[#6B7F62] focus:ring-offset-2 focus:outline-none flex items-center justify-center';
      break;
    case 'none':
    default:
      baseClasses = '';
  }

  return (
    <button class={`${baseClasses} ${className}`} {...props}>
      {children}
    </button>
  );
};
