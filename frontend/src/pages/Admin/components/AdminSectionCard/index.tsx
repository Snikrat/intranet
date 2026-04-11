import styles from "./styles.module.css";

type AdminSectionCardProps = {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
};

export function AdminSectionCard({
  title,
  children,
  footer,
  className = "",
}: AdminSectionCardProps) {
  return (
    <section className={`${styles.sectionCard} ${className}`.trim()}>
      <h2 className={styles.title}>{title}</h2>

      <div className={styles.content}>{children}</div>

      {footer ? <div className={styles.footer}>{footer}</div> : null}
    </section>
  );
}
