import styles from "./styles.module.css";
import { Pagination } from "../../../../../../components/Pagination";

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
            <div className={styles.meta}>
              <span className={styles.date}>{item.date}</span>
              <span className={styles.time}>[{item.time}]</span>
            </div>

            <span className={styles.text}>{item.text}</span>
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
