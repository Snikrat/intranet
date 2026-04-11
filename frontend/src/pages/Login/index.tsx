import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import { Logo } from "../../components/Logo";

export function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validUsername = "admin";
    const validPassword = "123";

    if (username === validUsername && password === validPassword) {
      setError("");
      navigate("/admin");
      return;
    }

    setError("usuário ou senha inválidos");
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <Logo />
          </div>
          <h1 className={styles.title}>Acesso administrativo</h1>
          <p className={styles.subtitle}>
            Entre com seu usuário e senha para continuar.
          </p>
        </div>

        <form className={styles.form} onSubmit={handleLogin}>
          <div className={styles.field}>
            <label htmlFor="username" className={styles.label}>
              Usuário
            </label>
            <input
              id="username"
              type="text"
              placeholder="Digite seu usuário"
              className={styles.input}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>
              Senha
            </label>
            <input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              className={styles.input}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" className={styles.button}>
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
