import { useEffect, useState } from "react";
import { SummaryCards } from "./components/SummaryCards";
import { DashboardInsights } from "./components/DashboardInsights";
import { RecentActivity } from "./components/RecentActivity";
import { trackPageView } from "../../../../services/tracking";
import styles from "./styles.module.css";
import { AdminLayout } from "../../components/AdminLayout";

type DashboardSummary = {
  activeSystems: number;
  activeCampaigns: number;
  accessesToday: number;
  accessesWeek: number;
  mostVisitedPage: {
    name: string;
    count: number;
  };
  mostClickedSystem: {
    name: string;
    count: number;
  };
};

type Activity = {
  id: number;
  text: string;
  time: string;
  date: string;
  createdAt: number;
};

type ActivitiesResponse = {
  items: Activity[];
  pagination: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
};

export function DashboardModule() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesPage, setActivitiesPage] = useState(1);
  const [activitiesPagination, setActivitiesPagination] = useState<
    ActivitiesResponse["pagination"] | null
  >(null);

  useEffect(() => {
    async function loadSummary() {
      try {
        const response = await fetch("http://localhost:3000/dashboard/summary");

        if (!response.ok) {
          throw new Error("Erro ao carregar resumo do dashboard");
        }

        const data: DashboardSummary = await response.json();
        setSummary(data);
      } catch (error) {
        console.error("Erro ao carregar resumo do dashboard:", error);
      }
    }

    void loadSummary();
  }, []);

  useEffect(() => {
    async function loadActivities() {
      try {
        const response = await fetch(
          `http://localhost:3000/activities?page=${activitiesPage}&limit=5`,
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar atividades");
        }

        const data: ActivitiesResponse = await response.json();

        setActivities(data.items);
        setActivitiesPagination(data.pagination);
      } catch (error) {
        console.error("Erro ao carregar atividades:", error);
      }
    }

    void loadActivities();
  }, [activitiesPage]);

  useEffect(() => {
    trackPageView("dashboard");
  }, []);

  return (
    <AdminLayout title="Dashboard" subtitle="Visão geral da intranet.">
      {!summary ? (
        <p className={styles.loadingText}>Carregando dashboard...</p>
      ) : (
        <>
          <SummaryCards summary={summary} />

          <div className={styles.dashboardGrid}>
            <DashboardInsights
              mostVisitedPage={summary.mostVisitedPage}
              mostClickedSystem={summary.mostClickedSystem}
            />

            <RecentActivity
              activities={activities}
              pagination={activitiesPagination}
              onPageChange={setActivitiesPage}
            />
          </div>
        </>
      )}
    </AdminLayout>
  );
}
