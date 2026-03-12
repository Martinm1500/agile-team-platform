import React, { useState } from "react";
import styles from "./Modal.module.css";
import type { Question } from "./QuizTypes";

interface CreateQuizModalProps {
  quizName: string;
  setQuizName: (name: string) => void;
  quizJson: string;
  setQuizJson: (json: string) => void;
  onCreate: () => void;
  onClose: () => void;
}

const CreateQuizModal: React.FC<CreateQuizModalProps> = ({
  quizName,
  setQuizName,
  quizJson,
  setQuizJson,
  onCreate,
  onClose,
}) => {
  const [useJson, setUseJson] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([
    {
      question: "",
      options: ["", "", "", ""],
      correct: "",
    },
  ]);

  const addQuestion = () => {
    if (questions.length >= 20) {
      alert("Cannot add more than 20 questions.");
      return;
    }
    setQuestions([
      ...questions,
      {
        question: "",
        options: ["", "", "", ""],
        correct: "",
      },
    ]);
  };

  const updateQuestion = (
    index: number,
    field: keyof Question,
    value: string | string[]
  ) => {
    setQuestions(
      questions.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    value: string
  ) => {
    setQuestions(
      questions.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((opt, j) =>
                j === optionIndex ? value : opt
              ),
            }
          : q
      )
    );
  };

  const deleteQuestion = (index: number) => {
    if (questions.length === 1) {
      alert("At least one question is required.");
      return;
    }
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleCreate = () => {
    if (useJson) {
      onCreate();
    } else {
      try {
        if (!quizName.trim()) {
          throw new Error("El nombre del quiz no puede estar vacío.");
        }
        if (questions.length > 20) {
          throw new Error("Máximo 20 preguntas permitidas.");
        }
        if (questions.some((q) => q.options.length !== 4)) {
          throw new Error("Cada pregunta debe tener exactamente 4 opciones.");
        }
        if (
          questions.some(
            (q) =>
              !q.question.trim() ||
              !q.correct ||
              !q.options.every((opt) => opt.trim())
          )
        ) {
          throw new Error(
            "Todas las preguntas, opciones y respuestas correctas deben estar completas."
          );
        }
        setQuizJson(JSON.stringify(questions));
        onCreate();
      } catch (error: unknown) {
        const message =
          error instanceof Error ? error.message : "Error al crear el quiz.";
        alert(`Error: ${message}`);
      }
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Create New Quiz</h2>
        <input
          type="text"
          placeholder="Enter quiz name"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          className={styles.quizNameInput}
        />
        <div>
          <label>
            <input
              type="checkbox"
              checked={useJson}
              onChange={() => setUseJson(!useJson)}
            />
            Use JSON input
          </label>
        </div>
        {useJson ? (
          <textarea
            value={quizJson}
            onChange={(e) => setQuizJson(e.target.value)}
            className={styles.quizJsonInput}
            rows={10}
            placeholder='
[
  {
    "question": "What is the capital of France?",
    "options": ["Madrid", "Paris", "Rome", "Berlin"],
    "correct": "Paris"
  },
  ...
]'
          />
        ) : (
          <div className={styles.questionsContainer}>
            {questions.map((question, qIndex) => (
              <div key={qIndex} className={styles.questionCard}>
                <h3>Pregunta {qIndex + 1}</h3>
                <input
                  type="text"
                  placeholder="Enter question"
                  value={question.question}
                  onChange={(e) =>
                    updateQuestion(qIndex, "question", e.target.value)
                  }
                  className={styles.questionInput}
                />
                {question.options.map((option, oIndex) => (
                  <div key={oIndex} className={styles.optionContainer}>
                    <input
                      type="text"
                      placeholder={`Option ${oIndex + 1}`}
                      value={option}
                      onChange={(e) =>
                        updateOption(qIndex, oIndex, e.target.value)
                      }
                      className={styles.optionInput}
                    />
                  </div>
                ))}
                <select
                  value={question.correct}
                  onChange={(e) =>
                    updateQuestion(qIndex, "correct", e.target.value)
                  }
                  className={styles.correctAnswerSelect}
                >
                  <option value="">Select correct answer</option>
                  {question.options.map((option, oIndex) => (
                    <option
                      key={oIndex}
                      value={option}
                      disabled={!option.trim()}
                    >
                      {option || `Option ${oIndex + 1} (empty)`}
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => deleteQuestion(qIndex)}
                  className={styles.deleteQuestionButton}
                  disabled={questions.length === 1}
                >
                  Delete Question
                </button>
              </div>
            ))}
            <button
              onClick={addQuestion}
              disabled={questions.length >= 20}
              className={styles.addQuestionButton}
            >
              Add Question
            </button>
          </div>
        )}
        <div className={styles.modalButtons}>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
          <button onClick={handleCreate} className={styles.createButton}>
            Create Quiz
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateQuizModal;
