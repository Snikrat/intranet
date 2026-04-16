import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../services/auth";
import { Menu, X, ChevronDown } from "lucide-react";
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
  { label: "Início", path: "/", key: "inicio" },
  {
    label: "Qualidade e risco",
    url: "https://pvaxlog.sharepoint.com/sites/PVAXDRIVE-FilesDrive/QUALIDADE/Forms/AllItems.aspx?id=%2Fsites%2FPVAXDRIVE%2DFilesDrive%2FQUALIDADE%2FControle%20de%20Documentos%2FPublica%C3%A7%C3%A3o%20Intranet&viewid=35166fcc%2Dff34%2D4dc0%2D8b8e%2D2a7db25af3ef",
    key: "qualidade",
  },
  { label: "Brigada", path: "/brigada", key: "brigada" },
  {
    label: "Fale conosco",
    url: "https://www.siscompliance.com.br/pvax-md-gusto/#/home",
    key: "contato",
  },
];

const chamadosMenu: SubMenuItem[] = [
  {
    label: "Suporte tecnologia",
    url: "https://helpdesk.solutionscloud.com.br/",
  },
  { label: "Suporte manutenção", url: "https://helpdesk.solidezeng.com.br/" },
];

const utilidadesMenu: SubMenuItem[] = [
  { label: "Cardápio", path: "/cardapio" },
  { label: "Gerador de assinatura", path: "/gerador-assinatura" },
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

  function isPathActive(path?: string) {
    if (!path) return false;
    if (path === "/") return location.pathname === "/";
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  }

  function isSubMenuGroupActive(items: SubMenuItem[]) {
    return items.some((item) => item.path && isPathActive(item.path));
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
            isPathActive(item.path) ? styles.active : ""
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
          className={`${styles.dropdownItem} ${
            isPathActive(item.path) ? styles.active : ""
          }`}
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

        <div
          className={`${styles.desktopArea} ${
            isMobileMenuOpen ? styles.mobileMenuOpen : ""
          }`}
        >
          <div className={styles.navbar}>
            <nav className={styles.menu}>
              {menuItems.slice(0, 2).map(renderMenuItem)}

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
                  className={`${styles.menuLink} ${styles.dropdownButton} ${
                    isSubMenuGroupActive(chamadosMenu) ? styles.active : ""
                  }`}
                >
                  Abertura de chamado
                  <ChevronDown size={16} />
                </button>

                {isChamadosOpen && (
                  <div className={styles.dropdownMenu}>
                    {chamadosMenu.map(renderSubMenuItem)}
                  </div>
                )}
              </div>

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
                  className={`${styles.menuLink} ${styles.dropdownButton} ${
                    isSubMenuGroupActive(utilidadesMenu) ? styles.active : ""
                  }`}
                >
                  Utilidades
                  <ChevronDown size={16} />
                </button>

                {isUtilidadesOpen && (
                  <div className={styles.dropdownMenu}>
                    {utilidadesMenu.map(renderSubMenuItem)}
                  </div>
                )}
              </div>

              <Link
                to={authenticated ? "/admin" : "/login"}
                onClick={handleCloseMobileMenu}
                className={`${styles.menuLink} ${
                  isPathActive("/admin") || isPathActive("/login")
                    ? styles.active
                    : ""
                }`}
              >
                T.I
              </Link>

              {menuItems.slice(2).map(renderMenuItem)}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
