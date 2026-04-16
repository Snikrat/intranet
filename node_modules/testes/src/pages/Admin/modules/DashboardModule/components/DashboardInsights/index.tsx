import styles from "./styles.module.css";
import { MousePointerClick, TrendingUp, Clock3 } from "lucide-react";

type DashboardInsightsProps = {
  mostVisitedPage: {
    name: string;
    count: number;
  };
  mostClickedSystem: {
    name: string;
    count: number;
  };
  peakAccessHour: {
    label: string;
    count: number;
  };
};

export function DashboardInsights({
  mostVisitedPage,
  mostClickedSystem,
  peakAccessHour,
}: DashboardInsightsProps) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Insights</h2>
        <p className={styles.subtitle}>
          Resumo rápido dos destaques da intranet
        </p>
      </div>

      <div className={styles.list}>
        <div className={styles.item}>
          <div className={styles.icon}>
            <TrendingUp size={18} />
          </div>

          <div className={styles.content}>
            <span className={styles.label}>Página mais acessada</span>
            <strong className={styles.value}>{mostVisitedPage.name}</strong>
            <span className={styles.count}>
              {mostVisitedPage.count} acessos registrados
            </span>
          </div>
        </div>

        <div className={styles.item}>
          <div className={styles.icon}>
            <MousePointerClick size={18} />
          </div>

          <div className={styles.content}>
            <span className={styles.label}>Sistema mais clicado</span>
            <strong className={styles.value}>{mostClickedSystem.name}</strong>
            <span className={styles.count}>
              {mostClickedSystem.count} cliques registrados
            </span>
          </div>
        </div>

        <div className={styles.item}>
          <div className={styles.icon}>
            <Clock3 size={18} />
          </div>

          <div className={styles.content}>
            <span className={styles.label}>Horário com mais acessos</span>
            <strong className={styles.value}>{peakAccessHour.label}</strong>
            <span className={styles.count}>
              {peakAccessHour.count} acessos registrados
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
