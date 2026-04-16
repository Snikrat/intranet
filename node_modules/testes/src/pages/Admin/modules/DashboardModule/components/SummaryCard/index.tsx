import styles from "./styles.module.css";

type SummaryCardProps = {
  label: string;
  value: number;
  icon?: React.ReactNode;
  helper?: string;
};

export function SummaryCard({ label, value, icon, helper }: SummaryCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        {icon && <div className={styles.icon}>{icon}</div>}
      </div>

      <strong className={styles.value}>{value}</strong>

      {helper && <span className={styles.helper}>{helper}</span>}
    </article>
  );
}
