import styles from "./styles.module.css";

type DashboardInsightsProps = {
  mostVisitedPage: {
    name: string;
    count: number;
  };
  mostClickedSystem: {
    name: string;
    count: number;
  };
};

export function DashboardInsights({
  mostVisitedPage,
  mostClickedSystem,
}: DashboardInsightsProps) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Insights</h2>
      </div>

      <div className={styles.content}>
        <div className={styles.insightItem}>
          <span className={styles.label}>Página mais acessada</span>
          <strong className={styles.value}>{mostVisitedPage.name}</strong>
          <span className={styles.count}>{mostVisitedPage.count} acessos</span>
        </div>

        <div className={styles.insightItem}>
          <span className={styles.label}>Sistema mais clicado</span>
          <strong className={styles.value}>{mostClickedSystem.name}</strong>
          <span className={styles.count}>
            {mostClickedSystem.count} cliques
          </span>
        </div>
      </div>
    </section>
  );
}
