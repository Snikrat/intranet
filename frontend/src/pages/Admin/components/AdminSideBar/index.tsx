import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Monitor,
  Megaphone,
  UtensilsCrossed,
  PanelsTopLeft,
  Menu,
  X,
} from "lucide-react";
import styles from "./styles.module.css";
import type { AdminTab } from "../..";

type AdminSidebarProps = {
  activeTab: AdminTab;
  onChangeTab: (tab: AdminTab) => void;
};

const navItems: Array<{
  key: AdminTab;
  label: string;
  icon: React.ReactNode;
}> = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard size={18} />,
  },
  {
    key: "systems",
    label: "Sistemas",
    icon: <Monitor size={18} />,
  },
  {
    key: "campaigns",
    label: "Campanhas",
    icon: <Megaphone size={18} />,
  },
  {
    key: "cardapio",
    label: "Cardápio",
    icon: <UtensilsCrossed size={18} />,
  },
  {
    key: "popup",
    label: "Popup",
    icon: <PanelsTopLeft size={18} />,
  },
];

export function AdminSidebar({ activeTab, onChangeTab }: AdminSidebarProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  function handleToggleMobileMenu() {
    setIsMobileOpen((prev) => !prev);
  }

  function handleCloseMobileMenu() {
    setIsMobileOpen(false);
  }

  function handleChangeTab(tab: AdminTab) {
    onChangeTab(tab);
    setIsMobileOpen(false);
  }

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <div className={styles.mobileTopbar}>
        <div className={styles.mobileBrand}>
          <div className={styles.brandLogo}>PGP</div>

          <div className={styles.brandText}>
            <strong className={styles.brandTitle}>Painel Admin</strong>
            <span className={styles.brandSubtitle}>Intranet</span>
          </div>
        </div>

        <button
          type="button"
          className={styles.mobileMenuButton}
          onClick={handleToggleMobileMenu}
          aria-label={isMobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMobileOpen}
        >
          {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {isMobileOpen && (
        <button
          type="button"
          className={styles.mobileOverlay}
          onClick={handleCloseMobileMenu}
          aria-label="Fechar menu"
        />
      )}

      <aside
        className={`${styles.sidebar} ${
          isMobileOpen ? styles.sidebarMobileOpen : ""
        }`}
      >
        <div className={styles.brand}>
          <div className={styles.brandLogo}>PGP</div>

          <div className={styles.brandText}>
            <strong className={styles.brandTitle}>Painel Admin</strong>
            <span className={styles.brandSubtitle}>Intranet</span>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Navegação do painel admin">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;

            return (
              <button
                key={item.key}
                type="button"
                className={`${styles.navItem} ${
                  isActive ? styles.navItemActive : ""
                }`}
                onClick={() => handleChangeTab(item.key)}
              >
                <span className={styles.navIcon}>{item.icon}</span>
                <span className={styles.navLabel}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
