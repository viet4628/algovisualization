import type { HTMLAttributes, ReactNode } from "react";

type Props = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  delay?: number; // ms
  as?: "div" | "section" | "article" | "header" | "footer";
};

export function Reveal({ children, delay = 0, as: Tag = "div", className = "", style, ...rest }: Props) {
  return (
    <Tag
      className={`reveal ${className}`}
      style={{ transitionDelay: `${delay}ms`, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
