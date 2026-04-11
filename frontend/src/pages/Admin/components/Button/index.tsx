import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./styles.module.css";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "ghost"
  | "dangerSoft"
  | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

export function Button({
  children,
  variant = "secondary",
  fullWidth = false,
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${styles.button} ${styles[variant]} ${
        fullWidth ? styles.fullWidth : ""
      } ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}
