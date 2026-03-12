import React, { useState } from "react";
import styles from "./Auth.module.css";
import Login from "./Login";
import Register from "./Register";

const Auth: React.FC<{ onAuthSuccess: () => void }> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [cardAnimation, setCardAnimation] = useState("");

  const handleSwitch = (toLogin: boolean) => {
    setCardAnimation(toLogin ? styles.slideOutRight : styles.slideOutLeft);
    setTimeout(() => {
      setIsLogin(toLogin);
      setCardAnimation(toLogin ? styles.slideInLeft : styles.slideInRight);
    }, 300);
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.backgroundAnimation}`}></div>
      <div className={`${styles.card} ${cardAnimation}`}>
        {isLogin ? (
          <Login
            onAuthSuccess={onAuthSuccess}
            switchToRegister={() => handleSwitch(false)}
          />
        ) : (
          <Register
            onAuthSuccess={onAuthSuccess}
            switchToLogin={() => handleSwitch(true)}
          />
        )}
      </div>
    </div>
  );
};

export default Auth;
