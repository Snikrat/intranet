import styles from "./styles.module.css";
import { Pagination } from "../../../../../../components/Pagination";
import { Bell, Monitor, Megaphone } from "lucide-react";

type Activity = {
  id: number;
  text: string;
  time: string;
  date: string;
};

type RecentActivityProps = {
  activities: Activity[];
  pagination: {
    page: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  } | null;
  onPageChange: (page: number) => void;
};

function getIcon(text: string) {
  const normalized = text.toLowerCase();

  if (normalized.includes("popup")) return <Bell size={16} />;
  if (normalized.includes("campanha")) return <Megaphone size={16} />;
  return <Monitor size={16} />;
}

export function RecentActivity({
  activities,
  pagination,
  onPageChange,
}: RecentActivityProps) {
  return (
    <section className={styles.card}>
      <div className={styles.header}>
        <h2 className={styles.title}>Atividade recente</h2>
      </div>

      <ul className={styles.list}>
        {activities.length === 0 && (
          <li className={styles.empty}>Nenhuma atividade encontrada</li>
        )}

        {activities.map((item) => (
          <li key={item.id} className={styles.item}>
            <div className={styles.icon}>{getIcon(item.text)}</div>

            <div className={styles.content}>
              <div className={styles.textWrapper}>
                <span className={styles.text}>{item.text}</span>
                <div className={styles.tooltip}>{item.text}</div>
              </div>

              <div className={styles.meta}>
                <span className={styles.date}>{item.date}</span>
                <span className={styles.time}>[{item.time}]</span>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {pagination && pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </section>
  );
}
