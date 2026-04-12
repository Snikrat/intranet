import { useEffect, useMemo, useState } from "react";
import styles from "./styles.module.css";
import {
  CalendarDays,
  Truck,
  FolderKanban,
  Mail,
  Wrench,
  BarChart3,
  Boxes,
} from "lucide-react";
import { API_URL } from "../../../../config/env";
import { Pagination } from "../../../../components/Pagination";

type SystemItem = {
  id: number;
  title: string;
  description: string;
  icon: string;
  link: string;
  order: number;
  active: boolean;
};

const iconMap = {
  calendar: CalendarDays,
  truck: Truck,
  folder: FolderKanban,
  mail: Mail,
  wrench: Wrench,
  chart: BarChart3,
  boxes: Boxes,
};

const MOBILE_ITEMS_PER_PAGE = 5;

export function SystemsSection() {
  const [systems, setSystems] = useState<SystemItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth <= 640);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function loadSystems() {
      try {
        const response = await fetch(`${API_URL}/systems`);

        if (!response.ok) {
          throw new Error("Erro ao carregar sistemas");
        }

        const data: SystemItem[] = await response.json();

        const activeSystems = data
          .filter((system) => system.active)
          .sort((a, b) => a.order - b.order);

        setSystems(activeSystems);
      } catch (error) {
        console.error("Erro ao buscar sistemas:", error);
      }
    }

    void loadSystems();
  }, []);

  async function handleTrackClick(systemTitle: string) {
    try {
      await fetch(`${API_URL}/track/system-click`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemName: systemTitle,
        }),
      });
    } catch (error) {
      console.error("Erro ao rastrear clique no sistema:", error);
    }
  }

  const totalPages = Math.ceil(systems.length / MOBILE_ITEMS_PER_PAGE);

  const visibleSystems = useMemo(() => {
    if (!isMobile) {
      return systems;
    }

    const startIndex = (currentPage - 1) * MOBILE_ITEMS_PER_PAGE;
    const endIndex = startIndex + MOBILE_ITEMS_PER_PAGE;

    return systems.slice(startIndex, endIndex);
  }, [systems, currentPage, isMobile]);

  useEffect(() => {
    if (!isMobile) {
      setCurrentPage(1);
      return;
    }

    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [isMobile, currentPage, totalPages]);

  if (systems.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h2 className={styles.title}>
            todas as plataformas de sistemas em um só lugar.
          </h2>
          <p className={styles.subtitle}>
            se essa for sua primeira vez com algum desses sistemas abaixo,
            contate a equipe de ti
          </p>
        </div>

        <p className={styles.emptyMessage}>
          nenhum sistema cadastrado no momento.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          todas as plataformas de sistemas em um só lugar.
        </h2>
        <p className={styles.subtitle}>
          se essa for sua primeira vez com algum desses sistemas abaixo, contate
          a equipe de ti
        </p>
      </div>

      <div className={styles.grid}>
        {visibleSystems.map((system) => {
          const Icon =
            iconMap[system.icon as keyof typeof iconMap] || CalendarDays;

          return (
            <a
              key={system.id}
              href={system.link || "#"}
              className={styles.card}
              target="_blank"
              rel="noreferrer"
              onClick={() => handleTrackClick(system.title)}
            >
              <div className={styles.iconWrapper}>
                <Icon size={28} />
              </div>

              <h3 className={styles.cardTitle}>{system.title}</h3>
              <p className={styles.cardText}>{system.description}</p>
            </a>
          );
        })}
      </div>

      {isMobile && totalPages > 1 && (
        <div className={styles.paginationWrapper}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </section>
  );
}
