import styles from "./styles.module.css";

type IconActionButtonProps = {
  label: string;
  onClick: () => void;
  variant?: "edit" | "delete";
  children: React.ReactNode;
};

export function IconActionButton({
  label,
  onClick,
  variant = "edit",
  children,
}: IconActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${styles.button} ${
        variant === "delete" ? styles.delete : styles.edit
      }`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}
