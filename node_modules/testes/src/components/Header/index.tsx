import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../services/auth";
import { LogIn, ShieldCheck, Menu, X, ChevronDown } from "lucide-react";
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
    url: "https://login.microsoftonline.com/d41415f4-a9d4-405d-9c9f-c9f78be6f0b5/oauth2/authorize?client%5Fid=00000003%2D0000%2D0ff1%2Dce00%2D000000000000&response%5Fmode=form%5Fpost&ear%5Fjwe%5Fcrypto=eyJhbGciOiJFQ0RILUVTIiwiZW5jIjoiQTI1NkdDTSIsImFwdiI6IkFBQUFDVVZoY2tOc2FXVnVkR2dBQUFCRlEwc3pNQUFBQU1OclZYVVp5dnp0VWZ1ZVlZZTZqeWlJdnRQMUMzbGsyUkhaRDQzYlVNamtRb3h6L1RUWTl4c3Q4QUFJL2JuZktpRkJzTEErOFJmRlJNSWR6OVlKdU5mai8rU0NqMXp6RWxTUFZ4ZURJV1JncW5oNlJsWlAwUVdSaVRMNS9OcUFmZ0FBQUJpZ3NYbXFaYmQ0dGxmZ09VZGo3OVFEMHdjeGxIWklheWc9In0%3D&ear%5Fjwk=eyJhbGciOiJFQ0RILUVTIiwiY3J2IjoiUC0zODQiLCJ4IjoiQUFBQU1NTnJWWFVaeXZ6dFVmdWVZWWU2anlpSXZ0UDFDM2xrMlJIWkQ0M2JVTWprUW94ei9UVFk5eHN0OEFBSS9ibmZLZz09IiwieSI6IkFBQUFNQ0ZCc0xBKzhSZkZSTUlkejlZSnVOZmovK1NDajF6ekVsU1BWeGVESVdSZ3FuaDZSbFpQMFFXUmlUTDUvTnFBZmc9PSIsImt0eSI6IkVDIn0%3D&spa%5Fclient%5Fid=08e18876%2D6177%2D487e%2Db8b5%2Dcf950c1e598c&client%5Finfo=1&response%5Ftype=code%20id%5Ftoken%20spa%5Frt&resource=00000003%2D0000%2D0ff1%2Dce00%2D000000000000&scope=openid&nonce=298125EA08AF729DDD5815AC87D021805274B5E7648412DB%2D31ED1EBC7A5BBF2C5A43401F4A5721917B617FDFC7AC3CFBCBF25BA3346EF700&redirect%5Furi=https%3A%2F%2Fpvaxlog%2Esharepoint%2Ecom%2F%5Fforms%2Fdefault%2Easpx&state=OD0wJjMyPUFBTHhvQUFBQUJRNzI4MlFkU1lLamZBU0pYSiUyRmI4aVo4VzV2aG9ZemdhdDJOMGxNbWRDbFc3eWpkaGFKVXclMkJtJTJCV0czelBhS2ZWcmdaTXRlbEltYlFiSSUyQnRidDJOJTJGTExVeGhRSk5qbUtTY2dGdkg2WXd0c0NvbTc5SE0yZCUyQlVxQ0t0YWFITXFwTUtPbk42dzNtRWtUVDZjQWh4eWdNVVNvZGJNY292aVBrOCUyRkVTZGg4QSUyQlRrRWNjdEtUakdSRHFIVUxqOEhqZnU2TFVpUHFxa0RCS0Y5aUtKSTdNS2sxNEtVTHdwdFN0UTVlT0ppc2RvNCUyQk5wck5peUhockNqRSUyQmFmOUFFTnMybjJDemc1YWElMkJpYXNCSjNMd29MRWw2Tk9VS25Tam9hMzVwMkwlMkJpdmZ3eUw5SVJvcDdNU2xPSXRsNGxzTkZhZVdTWFhiaGtYdHBvZWVLSFJBNGQxV3dlT1VRQWxIUk5VeGFmYlhLYTI2eXlJcXM0djRrTW1lRHgwUEZRJTNEJTNE&claims=%7B%22id%5Ftoken%22%3A%7B%22xms%5Fcc%22%3A%7B%22values%22%3A%5B%22CP1%22%5D%7D%7D%7D&wsucxt=1&cobrandid=11bd8083%2D87e0%2D41b5%2Dbb78%2D0bc43c8a8e8a&client%2Drequest%2Did=e7aa09a2%2Dd025%2Dc000%2Dc082%2Dc635898c84c3",
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
        <div className={styles.mobileTopbar}>
          <div className={styles.mobileBrandText}>
            <span className={styles.mobileTitle}>Intranet</span>
          </div>

          <button
            type="button"
            className={styles.mobileMenuButton}
            onClick={handleToggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
            aria-expanded={isMobileMenuOpen}
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
                    location.pathname.includes("suporte") ? styles.active : ""
                  }`}
                >
                  abertura de chamado
                  <ChevronDown
                    size={16}
                    className={`${styles.chevron} ${
                      isChamadosOpen ? styles.chevronOpen : ""
                    }`}
                  />
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
                    location.pathname === "/cardapio" ? styles.active : ""
                  }`}
                >
                  utilidades
                  <ChevronDown
                    size={16}
                    className={`${styles.chevron} ${
                      isUtilidadesOpen ? styles.chevronOpen : ""
                    }`}
                  />
                </button>

                {isUtilidadesOpen && (
                  <div className={styles.dropdownMenu}>
                    <Link
                      to="/cardapio"
                      className={styles.dropdownItem}
                      onClick={handleCloseMobileMenu}
                    >
                      cardápio
                    </Link>
                  </div>
                )}
              </div>

              {menuItems.slice(2).map(renderMenuItem)}
            </nav>
          </div>

          <div className={styles.actions}>
            <Link
              to={authenticated ? "/admin" : "/login"}
              className={styles.adminButton}
              onClick={handleCloseMobileMenu}
              aria-label={authenticated ? "Ir para o painel admin" : "Entrar"}
            >
              {authenticated ? <ShieldCheck size={18} /> : <LogIn size={18} />}
              <span>{authenticated ? "Painel Admin" : "Entrar"}</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
