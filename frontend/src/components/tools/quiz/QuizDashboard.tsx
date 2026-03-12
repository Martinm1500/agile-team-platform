import React, { useState } from "react";
import styles from "./QuizDashboard.module.css";
import type { Question, Quiz, QuizResult } from "./QuizTypes";
import ConfirmModal from "./ConfirmModal";
import QuizzesTable from "./QuizzesTable";
import CreateQuizModal from "./CreateQuizModal";
import EditQuizModal from "./EditQuizModal";

import {
  CollectionIcon,
  ImportIcon,
  PlusIcon,
  QueueIcon,
  SearchIcon,
} from "../../Icons";
import QuizQuestion from "./QuizQuestion";
import QuizResults from "./QuizResults";

const QuizDashboard: React.FC = () => {
  const [searchInput, setSearchInput] = useState("");
  const [quizzes, setQuizzes] = useState<Quiz[]>([
    {
      id: 1,
      name: "General Knowledge",
      questions: [
        {
          question: "What is the capital of France?",
          options: ["Madrid", "Paris", "Rome", "Berlin"],
          correct: "Paris",
        },
        {
          question: "Which planet is known as the Red Planet?",
          options: ["Venus", "Mars", "Jupiter", "Saturn"],
          correct: "Mars",
        },
      ],
      created: "Apr 17, 2024",
    },
  ]);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [quizToEdit, setQuizToEdit] = useState<Quiz | null>(null);
  const [quizJson, setQuizJson] = useState("");
  const [quizName, setQuizName] = useState("");
  const [quizToDelete, setQuizToDelete] = useState<number | null>(null);
  const [currentView, setCurrentView] = useState<
    "dashboard" | "quiz" | "results"
  >("dashboard");
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{
    [key: number]: string;
  }>({});
  const [quizResults, setQuizResults] = useState<QuizResult[]>([]);
  const [score, setScore] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const filterQuizzes = () => {
    return quizzes.filter((quiz) =>
      quiz.name.toLowerCase().includes(searchInput.toLowerCase())
    );
  };

  const handleEditQuiz = (id: number) => {
    const quiz = quizzes.find((q) => q.id === id);
    if (quiz) {
      setQuizToEdit(quiz);
      setShowEditModal(true);
    }
  };

  const handleSaveEdit = (editedQuiz: Quiz) => {
    if (editedQuiz.questions.length > 20) {
      alert("Cannot save quiz: Maximum 20 questions allowed.");
      return;
    }
    if (editedQuiz.questions.some((q) => q.options.length !== 4)) {
      alert("Cannot save quiz: Each question must have exactly 4 options.");
      return;
    }
    if (
      editedQuiz.questions.some(
        (q) =>
          !q.question.trim() ||
          !q.correct ||
          !q.options.every((opt) => opt.trim())
      )
    ) {
      alert(
        "Cannot save quiz: All fields must be filled, and a correct answer must be selected."
      );
      return;
    }
    setQuizzes(quizzes.map((q) => (q.id === editedQuiz.id ? editedQuiz : q)));
    alert("Quiz updated successfully!");
    closeModal();
  };

  const handleStartQuiz = (id: number) => {
    const quiz = quizzes.find((q) => q.id === id);
    if (quiz) {
      setSelectedQuiz(quiz);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setQuizResults([]);
      setScore(0);
      setCurrentView("quiz");
    }
  };

  const handleShareQuiz = () => {
    setShowShareModal(true);
  };

  const copyLink = () => {
    const link = "http://example.com/quiz/123";
    navigator.clipboard.writeText(link);
    alert("Link copied to clipboard!");
  };

  const handleDeleteQuiz = (id: number) => {
    setQuizToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (quizToDelete) {
      setQuizzes(quizzes.filter((quiz) => quiz.id !== quizToDelete));
      alert("Quiz deleted");
    }
    setShowDeleteModal(false);
    setQuizToDelete(null);
  };

  const closeModal = () => {
    setShowShareModal(false);
    setShowDeleteModal(false);
    setShowCreateModal(false);
    setShowEditModal(false);
    setQuizToEdit(null);
    setQuizJson("");
    setQuizName("");
  };

  const createQuiz = () => {
    try {
      const questions: Question[] = JSON.parse(quizJson);
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("El JSON debe ser un arreglo no vacío.");
      }
      if (!quizName.trim()) {
        throw new Error("El nombre del quiz no puede estar vacío.");
      }
      if (questions.length > 20) {
        throw new Error("Máximo 20 preguntas permitidas.");
      }
      if (questions.some((q) => q.options.length !== 4)) {
        throw new Error("Cada pregunta debe tener exactamente 4 opciones.");
      }

      const newQuiz: Quiz = {
        id: quizzes.length + 1,
        name: quizName.trim(),
        questions,
        created: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
      };

      setQuizzes([...quizzes, newQuiz]);
      alert("Quiz created successfully!");
      closeModal();
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Ingresa un JSON válido con el formato correcto.";
      alert(`Error: ${message}`);
    }
  };

  const handleAnswerSelect = (questionIndex: number, option: string) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionIndex]: option,
    }));
  };

  const goToPrevious = () => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToNext = () => {
    setCurrentQuestionIndex((prev) =>
      Math.min(prev + 1, selectedQuiz!.questions.length - 1)
    );
  };

  const submitQuiz = () => {
    setShowConfirmation(true);
  };

  const confirmSubmit = () => {
    if (selectedQuiz) {
      let currentScore = 0;
      const results: QuizResult[] = [];

      selectedQuiz.questions.forEach((q, index) => {
        const selected = selectedAnswers[index] || "No respondida";
        const isCorrect = selected === q.correct;
        if (isCorrect) currentScore++;

        results.push({
          question: q.question,
          selected,
          correct: q.correct,
          isCorrect,
        });
      });

      setScore(currentScore);
      setQuizResults(results);
      setShowConfirmation(false);
      setCurrentView("results");
    }
  };

  const cancelSubmit = () => {
    setShowConfirmation(false);
  };

  const resetQuiz = () => {
    setCurrentView("dashboard");
    setSelectedQuiz(null);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setQuizResults([]);
    setScore(0);
  };

  const filteredQuizzes = filterQuizzes();

  return (
    <div className={styles.quizDashboard}>
      {currentView === "dashboard" && (
        <>
          <div className={styles.header}>
            <h1>Quizzes</h1>
          </div>
          <div className={styles.container}>
            <div className={styles.searchQuizContainer}>
              <button
                className={styles.createBtn}
                onClick={() => setShowCreateModal(true)}
              >
                <PlusIcon />
                Create Quiz
              </button>
              <input
                type="text"
                placeholder="Search"
                className={styles.searchInput}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <SearchIcon className={styles.searchIcon} />
            </div>
            <QuizzesTable
              quizzes={filteredQuizzes}
              onEdit={handleEditQuiz}
              onStart={handleStartQuiz}
              onShare={handleShareQuiz}
              onDelete={handleDeleteQuiz}
            />
          </div>
          <div className={styles.exploreSection}>
            <h2>Explore</h2>
            <div className={styles.exploreCards}>
              <div className={styles.exploreCard}>
                <div className={styles.icon}>
                  <CollectionIcon />
                </div>
                <div className={styles.content}>
                  <h3>Collection</h3>
                  <p>
                    Create or edit existing collections, organize quizzes into
                    them
                  </p>
                </div>
              </div>
              <div className={styles.exploreCard}>
                <div className={styles.icon}>
                  <ImportIcon />
                </div>
                <div className={styles.content}>
                  <h3>Import</h3>
                  <p>Import existing quizzes from a file in various formats</p>
                </div>
              </div>
              <div className={styles.exploreCard}>
                <div className={styles.icon}>
                  <QueueIcon />
                </div>
                <div className={styles.content}>
                  <h3>Queue</h3>
                  <p>
                    Add existing quizzes to custom queues that best fit your
                    needs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {currentView === "quiz" && selectedQuiz && (
        <>
          <div className={styles.header}>
            <h1>{selectedQuiz.name}</h1>
          </div>
          <QuizQuestion
            question={selectedQuiz.questions[currentQuestionIndex]}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={selectedQuiz.questions.length}
            selectedAnswer={selectedAnswers[currentQuestionIndex]}
            onAnswerSelect={(option) =>
              handleAnswerSelect(currentQuestionIndex, option)
            }
          />
          <div className={styles.memoLabNavigationButtons}>
            <button
              onClick={goToPrevious}
              className={`${styles.memoLabNavButton} ${styles.memoLabPrevButton}`}
              disabled={currentQuestionIndex === 0}
            >
              Anterior
            </button>
            <button
              onClick={goToNext}
              className={`${styles.memoLabNavButton} ${styles.memoLabNextButton}`}
              disabled={
                currentQuestionIndex === selectedQuiz.questions.length - 1
              }
            >
              Siguiente
            </button>
            <button
              onClick={submitQuiz}
              className={styles.memoLabSubmitButton}
              disabled={
                Object.keys(selectedAnswers).length <
                selectedQuiz.questions.length
              }
            >
              Enviar Respuestas
            </button>
            <button
              onClick={resetQuiz}
              className={`${styles.memoLabNavButton} ${styles.memoLabReturn}`}
            >
              Volver al Dashboard
            </button>
          </div>
          {showConfirmation && (
            <ConfirmModal
              title="Confirmar Envío"
              message="¿Estás seguro de que deseas enviar tus respuestas?"
              onConfirm={confirmSubmit}
              onCancel={cancelSubmit}
            />
          )}
        </>
      )}

      {currentView === "results" && quizResults.length > 0 && (
        <QuizResults
          quizResults={quizResults}
          score={score}
          questionsCount={selectedQuiz!.questions.length}
          onReset={resetQuiz}
        />
      )}

      {showShareModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Share Quiz</h2>
            <p>
              Link:{" "}
              <input type="text" value="http://example.com/quiz/123" readOnly />
            </p>
            <button onClick={copyLink}>Copy Link</button>
            <button onClick={closeModal}>Close</button>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Confirm Deletion</h2>
            <p>Are you sure you want to delete this quiz?</p>
            <button onClick={confirmDelete}>Yes</button>
            <button onClick={closeModal}>No</button>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateQuizModal
          quizName={quizName}
          setQuizName={setQuizName}
          quizJson={quizJson}
          setQuizJson={setQuizJson}
          onCreate={createQuiz}
          onClose={closeModal}
        />
      )}

      {showEditModal && quizToEdit && (
        <EditQuizModal
          quiz={quizToEdit}
          onSave={handleSaveEdit}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default QuizDashboard;
