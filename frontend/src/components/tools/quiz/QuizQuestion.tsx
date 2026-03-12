import React from "react";
import styles from "./QuizQuestion.module.css";
import type { Question } from "./QuizTypes";

interface QuizQuestionProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  onAnswerSelect: (option: string) => void;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onAnswerSelect,
}) => {
  return (
    <div className={styles.quizContainer}>
      <div className={styles.timerContainer}>
        <div className={styles.timer}>
          <span>Tiempo: ∞</span>
        </div>
      </div>

      <div className={styles.questionCard}>
        <div className={styles.questionHeader}>
          <span className={styles.questionNumber}>
            Pregunta {questionNumber}/{totalQuestions}
          </span>
        </div>
        <div className={styles.questionContent}>
          <p className={styles.questionText}>{question.question}</p>
        </div>

        <div className={styles.optionsContainer}>
          {question.options.map((option, i) => (
            <label key={i} className={styles.optionLabel}>
              <input
                type="radio"
                name={`question-${questionNumber}`}
                value={option}
                checked={selectedAnswer === option}
                onChange={() => onAnswerSelect(option)}
                className={styles.radioInput}
              />
              <span className={styles.optionText}>{option}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuizQuestion;
