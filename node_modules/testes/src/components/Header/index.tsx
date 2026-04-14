import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../services/auth";
import { Settings, Menu, X, ChevronDown } from "lucide-react";
import styles from "./styles.module.css";

type MenuItem = {
  label: string;
  key: string;
  path?: string;
  url?: string;
};

type SubMenuItem = {
  label: string;
  path?: string;
  url?: string;
};

const menuItems: MenuItem[] = [
  { label: "início", path: "/", key: "inicio" },
  {
    label: "qualidade e risco",
    url: "https://login.microsoftonline.com/...",
    key: "qualidade",
  },
  { label: "brigada", path: "/brigada", key: "brigada" },
  {
    label: "fale conosco",
    url: "https://www.siscompliance.com.br/pvax-md-gusto/#/home",
    key: "contato",
  },
];

const chamadosMenu: SubMenuItem[] = [
  {
    label: "suporte tecnologia",
    url: "https://helpdesk.solutionscloud.com.br/",
  },
  { label: "suporte manutenção", url: "https://helpdesk.solidezeng.com.br/" },
];

/* 🔥 NOVO ARRAY DE UTILIDADES */
const utilidadesMenu: SubMenuItem[] = [
  { label: "cardápio", path: "/cardapio" },
  { label: "gerador de assinatura", path: "/gerador-assinatura" },
];

export function Header() {
  const location = useLocation();
  const authenticated = isAuthenticated();

  const [isChamadosOpen, setIsChamadosOpen] = useState(false);
  const [isUtilidadesOpen, setIsUtilidadesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  function closeAllMenus() {
    setIsChamadosOpen(false);
    setIsUtilidadesOpen(false);
  }

  function handleToggleMobileMenu() {
    setIsMobileMenuOpen((prev) => !prev);
    closeAllMenus();
  }

  function handleCloseMobileMenu() {
    setIsMobileMenuOpen(false);
    closeAllMenus();
  }

  function handleChamadosToggle() {
    setIsChamadosOpen((prev) => !prev);
    setIsUtilidadesOpen(false);
  }

  function handleUtilidadesToggle() {
    setIsUtilidadesOpen((prev) => !prev);
    setIsChamadosOpen(false);
  }

  function renderMenuItem(item: MenuItem) {
    if (item.url) {
      return (
        <a
          key={item.key}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleCloseMobileMenu}
          className={styles.menuLink}
        >
          {item.label}
        </a>
      );
    }

    if (item.path) {
      return (
        <Link
          key={item.key}
          to={item.path}
          onClick={handleCloseMobileMenu}
          className={`${styles.menuLink} ${
            location.pathname === item.path ? styles.active : ""
          }`}
        >
          {item.label}
        </Link>
      );
    }

    return null;
  }

  function renderSubMenuItem(item: SubMenuItem) {
    if (item.url) {
      return (
        <a
          key={item.label}
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.dropdownItem}
          onClick={handleCloseMobileMenu}
        >
          {item.label}
        </a>
      );
    }

    if (item.path) {
      return (
        <Link
          key={item.label}
          to={item.path}
          className={styles.dropdownItem}
          onClick={handleCloseMobileMenu}
        >
          {item.label}
        </Link>
      );
    }

    return null;
  }

  return (
    <header className={styles.wrapper}>
      <div className={styles.container}>
        {/* MOBILE */}
        <div className={styles.mobileTopbar}>
          <span className={styles.mobileTitle}>Intranet</span>

          <button
            type="button"
            className={styles.mobileMenuButton}
            onClick={handleToggleMobileMenu}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* DESKTOP */}
        <div
          className={`${styles.desktopArea} ${
            isMobileMenuOpen ? styles.mobileMenuOpen : ""
          }`}
        >
          <div className={styles.navbar}>
            {/* MENU */}
            <nav className={styles.menu}>
              {menuItems.slice(0, 2).map(renderMenuItem)}

              {/* CHAMADOS */}
              <div
                className={styles.dropdownWrapper}
                onMouseEnter={() =>
                  window.innerWidth > 768 && setIsChamadosOpen(true)
                }
                onMouseLeave={() =>
                  window.innerWidth > 768 && setIsChamadosOpen(false)
                }
              >
                <button
                  type="button"
                  onClick={handleChamadosToggle}
                  className={`${styles.menuLink} ${styles.dropdownButton}`}
                >
                  abertura de chamado
                  <ChevronDown size={16} />
                </button>

                {isChamadosOpen && (
                  <div className={styles.dropdownMenu}>
                    {chamadosMenu.map(renderSubMenuItem)}
                  </div>
                )}
              </div>

              {/* UTILIDADES */}
              <div
                className={styles.dropdownWrapper}
                onMouseEnter={() =>
                  window.innerWidth > 768 && setIsUtilidadesOpen(true)
                }
                onMouseLeave={() =>
                  window.innerWidth > 768 && setIsUtilidadesOpen(false)
                }
              >
                <button
                  type="button"
                  onClick={handleUtilidadesToggle}
                  className={`${styles.menuLink} ${styles.dropdownButton}`}
                >
                  utilidades
                  <ChevronDown size={16} />
                </button>

                {isUtilidadesOpen && (
                  <div className={styles.dropdownMenu}>
                    {utilidadesMenu.map(renderSubMenuItem)}
                  </div>
                )}
              </div>

              {menuItems.slice(2).map(renderMenuItem)}
            </nav>

            {/* ENGRENAGEM */}
            <Link
              to={authenticated ? "/admin" : "/login"}
              className={styles.settingsButton}
              onClick={handleCloseMobileMenu}
              aria-label="Acessar área administrativa"
            >
              <Settings size={18} />
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
