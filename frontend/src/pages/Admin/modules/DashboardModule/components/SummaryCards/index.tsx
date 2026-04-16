import styles from "./styles.module.css";
import { SummaryCard } from "../SummaryCard";
import { Monitor, Megaphone, MousePointerClick, BarChart3 } from "lucide-react";

type Summary = {
  activeSystems: number;
  activeCampaigns: number;
  accessesToday: number;
  accessesWeek: number;
};

type SummaryCardsProps = {
  summary: Summary;
};

const cards = (summary: Summary) => [
  {
    label: "Sistemas ativos",
    value: summary.activeSystems,
    icon: <Monitor size={20} />,
    helper: "Sistemas disponíveis no momento",
  },
  {
    label: "Campanhas ativas",
    value: summary.activeCampaigns,
    icon: <Megaphone size={20} />,
    helper: "Campanhas em exibição",
  },
  {
    label: "Acessos hoje",
    value: summary.accessesToday,
    icon: <MousePointerClick size={20} />,
    helper: "Total registrado hoje",
  },
  {
    label: "Acessos na semana",
    value: summary.accessesWeek,
    icon: <BarChart3 size={20} />,
    helper: "Acumulado dos últimos 7 dias",
  },
];

export function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className={styles.grid}>
      {cards(summary).map((card) => (
        <SummaryCard
          key={card.label}
          label={card.label}
          value={card.value}
          icon={card.icon}
          helper={card.helper}
        />
      ))}
    </div>
  );
}
