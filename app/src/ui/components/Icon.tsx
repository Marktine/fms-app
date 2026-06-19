/** @jsxImportSource hono/jsx */
import { renderIcon, type IconNode } from '../../core/utils/icons.ts';
import { raw } from 'hono/html';

type IconProps = {
  name?: string;
  icon?: IconNode;
  class?: string;
  fill?: boolean;
};

export const Icon = ({ name, icon, class: className = "", fill = false }: IconProps) => {
  if (icon) {
    return raw(renderIcon(icon, className));
  }
  return (
    <span class={`material-symbols-outlined ${fill ? "icon-fill" : ""} ${className}`}>
      {name}
    </span>
  );
};
