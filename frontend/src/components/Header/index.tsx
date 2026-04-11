import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
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

  const [isChamadosOpen, setIsChamadosOpen] = useState(false);
  const [isUtilidadesOpen, setIsUtilidadesOpen] = useState(false);

  return (
    <header className={styles.wrapper}>
      <div className={styles.navbar}>
        <nav className={styles.menu}>
          {/* INICIO + QUALIDADE */}
          {menuItems.slice(0, 2).map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`${styles.menuLink} ${
                location.pathname === item.path ? styles.active : ""
              }`}
            >
              {item.label}
            </Link>
          ))}

          {/* DROPDOWN ABERTURA DE CHAMADO */}
          <div
            className={styles.dropdownWrapper}
            onMouseEnter={() => setIsChamadosOpen(true)}
            onMouseLeave={() => setIsChamadosOpen(false)}
          >
            <button
              type="button"
              className={`${styles.menuLink} ${styles.dropdownButton} ${
                location.pathname.includes("suporte") ? styles.active : ""
              }`}
            >
              abertura de chamado{" "}
              <span className={styles.arrow}>{isChamadosOpen ? "▴" : "▾"}</span>
            </button>

            {isChamadosOpen && (
              <div className={styles.dropdownMenu}>
                {chamadosMenu.map((subItem) => (
                  <Link
                    key={subItem.label}
                    to={subItem.path}
                    className={styles.dropdownItem}
                  >
                    {subItem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* UTILIDADES COM DROPDOWN */}
          <div
            className={styles.dropdownWrapper}
            onMouseEnter={() => setIsUtilidadesOpen(true)}
            onMouseLeave={() => setIsUtilidadesOpen(false)}
          >
            <button
              type="button"
              className={`${styles.menuLink} ${styles.dropdownButton} ${
                location.pathname === "/cardapio" ? styles.active : ""
              }`}
            >
              utilidades{" "}
              <span className={styles.arrow}>
                {isUtilidadesOpen ? "▴" : "▾"}
              </span>
            </button>

            {isUtilidadesOpen && (
              <div className={styles.dropdownMenu}>
                <Link to="/cardapio" className={styles.dropdownItem}>
                  cardápio
                </Link>
              </div>
            )}
          </div>

          {/* RESTO DO MENU */}
          {menuItems.slice(2).map((item) => (
            <Link
              key={item.key}
              to={item.path}
              className={`${styles.menuLink} ${
                location.pathname === item.path ? styles.active : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
