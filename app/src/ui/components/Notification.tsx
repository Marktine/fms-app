/** @jsxImportSource hono/jsx */
import { Icon } from './Icon.tsx';
import { AlertCircle, CheckCircle, Info, X } from 'lucide';

type NotificationProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
  class?: string;
  dismissible?: boolean;
};

export const Notification = ({
  message,
  type = 'info',
  class: className = '',
  dismissible = true,
}: NotificationProps) => {
  let containerClasses =
    'pointer-events-auto flex items-center gap-3 p-4 border-[3px] border-[#2D2A26] shadow-[4px_4px_0px_#2D2A26] rounded-none mb-4 relative transition-all duration-200';
  let iconNode = Info;
  let iconClasses = 'w-5 h-5 flex-shrink-0';

  switch (type) {
    case 'success':
      containerClasses += ' bg-[#E3EFE0] text-[#2D4B24]'; // Tactical soft green
      iconNode = CheckCircle;
      iconClasses += ' text-[#2D4B24]';
      break;
    case 'error':
      containerClasses += ' bg-[#FDE8E5] text-[#801B15]'; // Tactical soft red/pink
      iconNode = AlertCircle;
      iconClasses += ' text-[#801B15]';
      break;
    case 'info':
    default:
      containerClasses += ' bg-[#F1EEEC] text-[#2D2A26]'; // Tactical neutral warm gray
      iconNode = Info;
      iconClasses += ' text-[#2D2A26]';
      break;
  }

  return (
    <div class={`${containerClasses} ${className} notification-alert`}>
      <Icon icon={iconNode} class={iconClasses} />

      <div class='flex-1 font-body-md text-sm font-semibold leading-relaxed'>
        {message}
      </div>

      {dismissible && (
        <button
          type='button'
          class='text-current hover:opacity-70 focus:outline-none flex items-center justify-center p-1 rounded-full border border-transparent hover:border-[#2D2A26] transition-all'
          // Lightweight browser-native action to remove the element
          onclick="this.closest('.notification-alert').remove()"
        >
          <Icon icon={X} class='w-4 h-4' />
        </button>
      )}
    </div>
  );
};
