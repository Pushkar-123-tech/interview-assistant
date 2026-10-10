import { useState } from "react";

const useInterview = () => {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const currentQuestion = questions[currentIndex] || null;

  const addAnswer = (answer) => {
    setAnswers((previous) => [
      ...previous,
      {
        question: currentQuestion,
        answer,
      },
    ]);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((previous) => previous + 1);
    }
  };

  const resetInterview = () => {
    setQuestions([]);
    setAnswers([]);
    setCurrentIndex(0);
  };

  return {
    questions,
    setQuestions,
    answers,
    currentIndex,
    currentQuestion,
    addAnswer,
    nextQuestion,
    resetInterview,
  };
};

export default useInterview;