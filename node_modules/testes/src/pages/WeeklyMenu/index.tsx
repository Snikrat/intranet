import { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { Header } from "../../components/Header";
import { Footer } from "../../components/Footer";
import { Utensils } from "lucide-react";
import { API_URL } from "../../config/env";

type DayKey = "Segunda" | "Terça" | "Quarta" | "Quinta" | "Sexta";

type DayMenu = {
  items: string;
  isToDefine: boolean;
  isHoliday: boolean;
};

type WeeklyMenu = {
  active: boolean;
  days: Record<DayKey, DayMenu>;
};

const MENU_ENDPOINT = `${API_URL}/menu/current`;

const weekDays = [
  "Domingo",
  "Segunda",
  "Terça",
  "Quarta",
  "Quinta",
  "Sexta",
  "Sábado",
];

function getWeekRange() {
  const today = new Date();
  const day = today.getDay();

  const diffToMonday = day === 0 ? -6 : 1 - day;

  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  const friday = new Date(monday);
  friday.setDate(monday.getDate() + 4);

  const format = (date: Date) => date.toLocaleDateString("pt-BR");

  return `${format(monday)} — ${format(friday)}`;
}

function getTodayName() {
  const today = new Date();
  return weekDays[today.getDay()];
}

function getDayItems(day: DayMenu) {
  if (day.isHoliday) return ["Feriado"];
  if (day.isToDefine) return ["A definir"];

  return day.items
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

const emptyMenu: WeeklyMenu = {
  active: true,
  days: {
    Segunda: { items: "", isToDefine: false, isHoliday: false },
    Terça: { items: "", isToDefine: false, isHoliday: false },
    Quarta: { items: "", isToDefine: false, isHoliday: false },
    Quinta: { items: "", isToDefine: false, isHoliday: false },
    Sexta: { items: "", isToDefine: false, isHoliday: false },
  },
};

export function CardapioPage() {
  const todayName = getTodayName();

  const [menu, setMenu] = useState<WeeklyMenu>(emptyMenu);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    async function loadMenu() {
      try {
        setIsLoading(true);
        setHasError(false);

        const response = await fetch(MENU_ENDPOINT);

        if (!response.ok) {
          throw new Error("Erro ao carregar cardápio");
        }

        const data = (await response.json()) as WeeklyMenu;
        setMenu(data);
      } catch (error) {
        console.error("Erro ao carregar cardápio:", error);
        setHasError(true);
      } finally {
        setIsLoading(false);
      }
    }

    void loadMenu();
  }, []);

  const menuData = [
    { day: "Segunda", data: menu.days.Segunda },
    { day: "Terça", data: menu.days["Terça"] },
    { day: "Quarta", data: menu.days.Quarta },
    { day: "Quinta", data: menu.days.Quinta },
    { day: "Sexta", data: menu.days.Sexta },
  ];

  return (
    <div className={styles.page}>
      <Header />

      <section className={styles.hero}>
        <div className={styles.overlay} />
        <div className={styles.heroContent}>
          <span className={styles.heroBadge}>utilidades</span>
          <h1 className={styles.heroTitle}>Cardápio</h1>
          <p className={styles.heroDate}>{getWeekRange()}</p>
          <p className={styles.heroInfo}>Atendimento da cozinha: 12h às 14h.</p>
        </div>
      </section>

      <main className={styles.content}>
        {isLoading ? (
          <section className={styles.menuGrid}>
            <article className={styles.menuCard}>
              <h3 className={styles.dayTitle}>Carregando cardápio...</h3>
            </article>
          </section>
        ) : hasError ? (
          <section className={styles.menuGrid}>
            <article className={styles.menuCard}>
              <h3 className={styles.dayTitle}>Erro ao carregar</h3>
              <p className={styles.menuItem}>
                Verifique se o backend está rodando.
              </p>
            </article>
          </section>
        ) : !menu.active ? (
          <section className={styles.menuGrid}>
            <article className={styles.menuCard}>
              <h3 className={styles.dayTitle}>Cardápio indisponível</h3>
            </article>
          </section>
        ) : (
          <section className={styles.menuGrid}>
            {menuData.map(({ day, data }) => {
              const isToday = day === todayName;
              const items = getDayItems(data);

              return (
                <article
                  key={day}
                  className={`${styles.menuCard} ${
                    isToday ? styles.menuCardActive : ""
                  }`}
                >
                  {isToday && (
                    <span className={styles.todayBadgeTop}>HOJE</span>
                  )}

                  <div className={styles.iconWrapper}>
                    <Utensils size={34} />
                  </div>

                  <h3 className={styles.dayTitle}>{day}</h3>

                  <ul className={styles.menuList}>
                    {items.length > 0 ? (
                      items.map((item) => (
                        <li
                          key={item}
                          className={`${styles.menuItem} ${
                            data.isHoliday
                              ? styles.menuItemHoliday
                              : data.isToDefine
                                ? styles.menuItemToDefine
                                : ""
                          }`}
                        >
                          {item}
                        </li>
                      ))
                    ) : (
                      <li className={styles.menuItem}>Sem itens cadastrados</li>
                    )}
                  </ul>
                </article>
              );
            })}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
