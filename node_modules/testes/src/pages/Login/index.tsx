import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import styles from "./styles.module.css";
import { Logo } from "../../components/Logo";
import { api } from "../../services/api";
import { AUTH_MESSAGE_KEY, TOKEN_KEY } from "../../services/auth";
import { toast } from "react-toastify";
import { ArrowLeft } from "lucide-react";

export function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const message = localStorage.getItem(AUTH_MESSAGE_KEY);

    if (message) {
      toast.error(message);
      localStorage.removeItem(AUTH_MESSAGE_KEY);
    }
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      const { token } = response.data;

      localStorage.setItem(TOKEN_KEY, token);
      navigate("/admin");
    } catch {
      setError("usuário ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        <Link to="/" className={styles.backButton}>
          <ArrowLeft size={16} />
          <span>Voltar para a home</span>
        </Link>

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

          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </main>
  );
}
