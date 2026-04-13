import styles from "./styles.module.css";
import { Clock3, Phone, Mail } from "lucide-react";

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={styles.overlay}></div>

      <div className={styles.content}>
        <div className={styles.textBlock}>
          <h1 className={styles.title}>bem vindos a intranet</h1>
          <p className={styles.subtitle}>todas as ferramentas em um só lugar</p>
        </div>

        <div className={styles.infoGrid}>
          <article className={styles.card}>
            <div className={styles.icon}>
              <Clock3 size={48} strokeWidth={2.2} />
            </div>

            <div>
              <h2 className={styles.cardTitle}>horário de atendimento</h2>
              <p className={styles.cardText}>08:00 - 17:48 / seg. - sex.</p>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.icon}>
              <Phone size={48} strokeWidth={2.2} />
            </div>

            <div>
              <h2 className={styles.cardTitle}>suporte</h2>
              <p className={styles.cardText}>tel: (21) 2628-7972</p>
              <p className={styles.cardText}>ramal 211 (CGA)</p>
              <p className={styles.cardText}>cel: (21) 99757-3768</p>
            </div>
          </article>

          <article className={styles.card}>
            <div className={styles.icon}>
              <Mail size={48} strokeWidth={2.2} />
            </div>

            <div>
              <h2 className={styles.cardTitle}>email de suporte</h2>
              <p className={styles.cardText}>suporte.ti@pvax.com.br</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
