import styles from "./styles.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.column}>
          <h3 className={styles.logo}>Intranet</h3>
          <p className={styles.text}>
            Central de acesso aos sistemas e ferramentas internas da empresa.
          </p>
        </div>

        <div className={styles.column}>
          <h4 className={styles.title}>Links úteis</h4>
          <ul className={styles.list}>
            <li>
              <a href="#">Início</a>
            </li>
            <li>
              <a href="#">Chamados</a>
            </li>
            <li>
              <a href="#">Sistemas</a>
            </li>
            <li>
              <a href="#">Suporte TI</a>
            </li>
          </ul>
        </div>

        <div className={styles.column}>
          <h4 className={styles.title}>Contato</h4>
          <p className={styles.text}>📞 (21) 2628-7972</p>
          <p className={styles.text}>📧 suporte.ti@pvax.com.br</p>
          <p className={styles.text}>🕒 Seg - Sex: 08:00 - 17:48</p>
        </div>
      </div>

      <div className={styles.bottom}>
        © {new Date().getFullYear()} TIC - Todos os direitos reservados
      </div>
    </footer>
  );
}
