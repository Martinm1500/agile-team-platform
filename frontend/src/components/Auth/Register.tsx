import React, { useState } from "react";
import styles from "./Auth.module.css";
import { useAuth } from "../../features/auth/useAuth";

interface Props {
  onAuthSuccess: () => void;
  switchToLogin: () => void;
}

const Register: React.FC<Props> = ({ onAuthSuccess, switchToLogin }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { register, loading, error } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await register({ username, email, password });
    if (result.meta.requestStatus === "fulfilled") {
      onAuthSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Create your account</h2>
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
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
        required
        disabled={loading}
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
        {loading ? "Signing Up..." : "Sign Up"}
      </button>
      <p className={styles.switch}>
        Already have an account?{" "}
        <span onClick={switchToLogin} className={styles.link}>
          Log In
        </span>
      </p>
    </form>
  );
};

export default Register;
