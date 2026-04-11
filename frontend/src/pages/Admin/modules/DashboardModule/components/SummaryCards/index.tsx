import styles from "./styles.module.css";
import { SummaryCard } from "../SummaryCard";

type Summary = {
  activeSystems: number;
  activeCampaigns: number;
  accessesToday: number;
  accessesWeek: number;
};

type SummaryCardsProps = {
  summary: Summary;
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className={styles.grid}>
      <SummaryCard label="Sistemas ativos" value={summary.activeSystems} />

      <SummaryCard label="Campanhas ativas" value={summary.activeCampaigns} />

      <SummaryCard label="Acessos hoje" value={summary.accessesToday} />

      <SummaryCard label="Acessos na semana" value={summary.accessesWeek} />
    </div>
  );
}
