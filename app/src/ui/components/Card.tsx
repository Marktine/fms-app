/** @jsxImportSource hono/jsx */
import { Child } from "hono/jsx";

type CardProps = {
  children?: Child;
  class?: string;
  [key: string]: any;
};

export const Card = ({ children, class: className = "", ...props }: CardProps) => {
  return (
    <div
      class={`bg-surface-container-lowest border-[3px] border-on-surface shadow-[4px_4px_0px_#1b1c1a] rounded-none flex flex-col relative ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
