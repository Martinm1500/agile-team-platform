import React, { useState } from "react";
import styles from "./Auth.module.css";
import { useAuth } from "../../features/auth/useAuth";

interface Props {
  onAuthSuccess: () => void;
  switchToRegister: () => void;
}

const Login: React.FC<Props> = ({ onAuthSuccess, switchToRegister }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login({ username, password });
    if (result.meta.requestStatus === "fulfilled") {
      onAuthSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Welcome back!</h2>
      {error && <p className={styles.error}>{error}</p>}
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className={styles.input}
        required
        disabled={loading}
        autoComplete="current-username"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
        required
        disabled={loading}
        autoComplete="current-password"
      />
      <button type="submit" className={styles.button} disabled={loading}>
        {loading ? "Logging In..." : "Log In"}
      </button>
      <p className={styles.switch}>
        Need an account?{" "}
        <span onClick={switchToRegister} className={styles.link}>
          Sign Up
        </span>
      </p>
    </form>
  );
};

export default Login;
