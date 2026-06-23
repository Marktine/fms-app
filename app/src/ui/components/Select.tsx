/** @jsxImportSource hono/jsx */
import { Child } from 'hono/jsx';

type SelectOption = { value: string; label: string } | string;

type SelectProps = {
  options?: SelectOption[];
  children?: Child;
  class?: string;
  [key: string]: unknown;
};

export const Select = ({
  options,
  children,
  class: className = '',
  ...props
}: SelectProps) => {
  return (
    <select
      class={`appearance-none bg-surface-container border-[3px] border-on-surface px-4 py-2 font-label-caps text-label-caps uppercase text-on-surface focus:outline-none focus:ring-0 focus:bg-primary-fixed-dim hover:bg-surface-variant transition-colors cursor-pointer rounded-none ${className}`}
      {...props}
    >
      {options
        ? options.map((opt, index) => {
          if (typeof opt === 'string') {
            return <option key={index} value={opt}>{opt}</option>;
          }
          return <option key={index} value={opt.value}>{opt.label}</option>;
        })
        : children}
    </select>
  );
};
