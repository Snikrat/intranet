import styles from "./styles.module.css";

type SummaryCardProps = {
  label: string;
  value: number | string;
};

export function SummaryCard({ label, value }: SummaryCardProps) {
  return (
    <article className={styles.card}>
      <span className={styles.label}>{label}</span>
      <strong className={styles.value}>{value}</strong>
    </article>
  );
}
