import styles from "./styles.module.css";

type Props = {
  title: string;
  subtitle?: string;
  buttonText?: string;
  onNew?: () => void;
  children: React.ReactNode;
};

export function AdminLayout({
  title,
  subtitle,
  buttonText,
  onNew,
  children,
}: Props) {
  const showActionButton = Boolean(buttonText && onNew);

  return (
    <div className={styles.wrapper}>
      <header className={styles.topbar}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{title}</h1>
          {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
        </div>

        {showActionButton ? (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={onNew}
          >
            {buttonText}
          </button>
        ) : null}
      </header>

      <div className={styles.layout}>{children}</div>
    </div>
  );
}
