import styles from "./styles.module.css";

type AdminListItemProps = {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  status?: React.ReactNode;
  actions?: React.ReactNode;
  onClick?: () => void;
};

export function AdminListItem({
  title,
  description,
  icon,
  status,
  actions,
  onClick,
}: AdminListItemProps) {
  const Component = onClick ? "button" : "div";

  return (
    <Component
      className={`${styles.item} ${onClick ? styles.clickable : ""}`.trim()}
      onClick={onClick}
      type={onClick ? "button" : undefined}
    >
      <div className={styles.left}>
        {icon ? <div className={styles.icon}>{icon}</div> : null}

        <div className={styles.texts}>
          <h3 className={styles.title}>{title}</h3>

          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </div>
      </div>

      {(status || actions) && (
        <div className={styles.right}>
          {status ? <div className={styles.status}>{status}</div> : null}
          {actions ? <div className={styles.actions}>{actions}</div> : null}
        </div>
      )}
    </Component>
  );
}
