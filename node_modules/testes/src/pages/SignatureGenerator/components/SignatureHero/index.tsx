import styles from "./styles.module.css";

export function SignatureHero() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <h1 className={styles.title}>GERADOR DE ASSINATURA</h1>

        <p className={styles.subtitle}>
          CRIE SUA ASSINATURA CORPORATIVA DE FORMA RÁPIDA E PADRONIZADA
        </p>
      </div>
    </section>
  );
}
