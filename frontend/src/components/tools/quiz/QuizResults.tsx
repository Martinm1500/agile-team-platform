import React from "react";
import styles from "./QuizResults.module.css";
import type { QuizResult } from "./QuizTypes";
import { CheckIcon, CrossIcon } from "../../Icons";

interface QuizResultsProps {
  quizResults: QuizResult[];
  score: number;
  questionsCount: number;
  onReset: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  quizResults,
  score,
  questionsCount,
  onReset,
}) => {
  const percentage = ((score / questionsCount) * 100).toFixed(2);

  return (
    <div className={styles.quizResultsContainer}>
      <div className={styles.resultsHeader}>
        <h2 className={styles.resultsTitle}>Resultados</h2>
        <div className={styles.scoreContainer}>
          <div className={styles.scoreDisplay}>
            <span className={styles.scoreValue}>{score}</span>
            <span className={styles.scoreDivider}>/</span>
            <span className={styles.scoreTotal}>{questionsCount}</span>
          </div>
          <div className={styles.scorePercentage}>{percentage}%</div>
        </div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>

      <div className={styles.resultsGrid}>
        {quizResults.map((result, index) => (
          <div
            key={index}
            className={`${styles.resultCard} ${
              result.isCorrect ? styles.correct : styles.incorrect
            }`}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.questionNumber}>#{index + 1}</span>
              {result.isCorrect ? (
                <CheckIcon
                  className={`${styles.statusIcon} ${styles.correct}`}
                />
              ) : (
                <CrossIcon
                  className={`${styles.statusIcon} ${styles.incorrect}`}
                />
              )}
            </div>

            <p className={styles.questionText}>{result.question}</p>

            <div className={styles.answerContainer}>
              <div
                className={`${styles.answerBox} ${styles.userAnswer} ${
                  result.isCorrect ? styles.correctUserAnswer : ""
                }`}
              >
                <span className={styles.answerLabel}>Tu respuesta:</span>
                <span className={styles.answerText}>{result.selected}</span>
              </div>

              {!result.isCorrect && (
                <div className={`${styles.answerBox} ${styles.correctAnswer}`}>
                  <span className={styles.answerLabel}>Correcta:</span>
                  <span className={styles.answerText}>{result.correct}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <button onClick={onReset} className={styles.resetButton}>
        Volver al Dashboard
      </button>
    </div>
  );
};

export default QuizResults;
