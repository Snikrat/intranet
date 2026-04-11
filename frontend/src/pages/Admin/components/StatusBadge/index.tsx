import styles from "./styles.module.css";

type StatusBadgeProps = {
  active: boolean;
  activeLabel?: string;
  inactiveLabel?: string;
};

export function StatusBadge({
  active,
  activeLabel = "Ativo",
  inactiveLabel = "Inativo",
}: StatusBadgeProps) {
  return (
    <span
      className={`${styles.badge} ${active ? styles.active : styles.inactive}`}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}
