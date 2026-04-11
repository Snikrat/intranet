import { useEffect, useState } from "react";
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

export function SystemsSection() {
  const [systems, setSystems] = useState<SystemItem[]>([]);

  useEffect(() => {
    async function loadSystems() {
      try {
        const response = await fetch("http://localhost:3000/systems");

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

    loadSystems();
  }, []);

  async function handleTrackClick(systemTitle: string) {
    try {
      await fetch("http://localhost:3000/track/system-click", {
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
        {systems.map((system) => {
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
    </section>
  );
}
