import React, { useState } from "react";
import styles from "./Modal.module.css";
import type { Quiz, Question } from "./QuizTypes";

interface EditQuizModalProps {
  quiz: Quiz;
  onSave: (quiz: Quiz) => void;
  onClose: () => void;
}

const EditQuizModal: React.FC<EditQuizModalProps> = ({
  quiz,
  onSave,
  onClose,
}) => {
  const [quizName, setQuizName] = useState(quiz.name);
  const [questions, setQuestions] = useState<Question[]>(quiz.questions);

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
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    onSave({
      ...quiz,
      name: quizName,
      questions,
      created: quiz.created,
    });
  };

  return (
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <h2>Edit Quiz</h2>
        <input
          type="text"
          placeholder="Enter quiz name"
          value={quizName}
          onChange={(e) => setQuizName(e.target.value)}
          className={styles.quizNameInput}
        />
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
                  <option key={oIndex} value={option} disabled={!option.trim()}>
                    {option || `Option ${oIndex + 1} (empty)`}
                  </option>
                ))}
              </select>
              <button
                onClick={() => deleteQuestion(qIndex)}
                className={styles.deleteQuestionButton}
              >
                Delete Question
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addQuestion}
          disabled={questions.length >= 20}
          className={styles.addQuestionButton}
        >
          Add Question
        </button>
        <div className={styles.modalButtons}>
          <button onClick={handleSave} className={styles.createButton}>
            Save Quiz
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditQuizModal;
