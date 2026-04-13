import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { isAuthenticated } from "../../services/auth";
import { LogIn, ShieldCheck, Menu, X, ChevronDown } from "lucide-react";
import styles from "./styles.module.css";

const menuItems = [
  { label: "início", path: "/", key: "inicio" },
  { label: "qualidade e risco", path: "/qualidade", key: "qualidade" },
  { label: "brigada", path: "/brigada", key: "brigada" },
  { label: "fale conosco", path: "/contato", key: "contato" },
];

const chamadosMenu = [
  { label: "suporte tecnologia", path: "/suporte-ti" },
  { label: "suporte manutenção", path: "/suporte-manutencao" },
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
              {menuItems.slice(0, 2).map((item) => (
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
              ))}

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
                    {chamadosMenu.map((subItem) => (
                      <Link
                        key={subItem.label}
                        to={subItem.path}
                        className={styles.dropdownItem}
                        onClick={handleCloseMobileMenu}
                      >
                        {subItem.label}
                      </Link>
                    ))}
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

              {menuItems.slice(2).map((item) => (
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
              ))}
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
