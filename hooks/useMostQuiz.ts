import { useState, useCallback } from 'react';
import { MostPlayer, MostQuestion, MostPhase, MostAnswer } from '@/types/most-quiz';
import { getRandomMostQuestions } from '@/data/quizzes/quiz-most-questions';
import { tgd } from '@/utils/quiz-i18n';
import i18n from 'i18next';

const QUESTIONS_PER_GAME = 20;
const TRANSITION_DURATION = 2000;

export function useMostQuiz() {
  const [phase, setPhase] = useState<MostPhase>('setup');
  const [players, setPlayers] = useState<MostPlayer[]>([
    { id: '1', name: '' },
    { id: '2', name: '' },
  ]);
  const [selectedQuestions, setSelectedQuestions] = useState<MostQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<MostAnswer[]>([]);
  const [designations, setDesignations] = useState<Record<string, number>>({});

  // Gestion des joueurs
  const addPlayer = useCallback(() => {
    if (players.length >= 8) return;
    const newId = String(players.length + 1);
    setPlayers([...players, { id: newId, name: '' }]);
  }, [players]);

  const removePlayer = useCallback((playerId: string) => {
    if (players.length <= 2) return;
    setPlayers(players.filter(p => p.id !== playerId));
  }, [players]);

  const updatePlayerName = useCallback((playerId: string, name: string) => {
    setPlayers(players.map(p => 
      p.id === playerId ? { ...p, name } : p
    ));
  }, [players]);

  // Validation du setup
  const canStartGame = useCallback(() => {
    return players.length >= 2 && players.every(p => p.name.trim().length > 0);
  }, [players]);

  // Démarrer le quiz
  const startQuiz = useCallback(() => {
    if (!canStartGame()) return;
    const questions = getRandomMostQuestions(QUESTIONS_PER_GAME);
    setSelectedQuestions(questions);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    const initialDesignations: Record<string, number> = {};
    players.forEach(p => { initialDesignations[p.id] = 0; });
    setDesignations(initialDesignations);
    setPhase('question');
  }, [canStartGame, players]);

  // Répondre à une question
  const answerQuestion = useCallback((selectedPlayerId: string | null) => {
    const currentQuestion = selectedQuestions[currentQuestionIndex];
    const newAnswer: MostAnswer = { questionId: currentQuestion.id, selectedPlayerId };
    setAnswers([...answers, newAnswer]);
    if (selectedPlayerId !== null) {
      setDesignations(prev => ({
        ...prev,
        [selectedPlayerId]: (prev[selectedPlayerId] || 0) + 1,
      }));
    }
    if (currentQuestionIndex >= selectedQuestions.length - 1) {
      setPhase('results');
    } else {
      setPhase('transition');
      setTimeout(() => {
        setCurrentQuestionIndex(prev => prev + 1);
        setPhase('question');
      }, TRANSITION_DURATION);
    }
  }, [selectedQuestions, currentQuestionIndex, answers]);

  // Translated current question
  const getCurrentQuestion = useCallback(() => {
    const q = selectedQuestions[currentQuestionIndex];
    if (!q) return q;
    return { ...q, text: tgd(`most.${q.id}`, q.text) };
  }, [selectedQuestions, currentQuestionIndex, i18n.language]);

  // Obtenir les résultats triés
  const getResults = useCallback(() => {
    return players
      .map(player => ({
        playerId: player.id,
        playerName: player.name,
        count: designations[player.id] || 0,
      }))
      .sort((a, b) => b.count - a.count);
  }, [players, designations]);

  // Recommencer avec de nouvelles questions
  const restartWithNewQuestions = useCallback(() => {
    const questions = getRandomMostQuestions(QUESTIONS_PER_GAME);
    setSelectedQuestions(questions);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    const initialDesignations: Record<string, number> = {};
    players.forEach(p => { initialDesignations[p.id] = 0; });
    setDesignations(initialDesignations);
    setPhase('question');
  }, [players]);

  // Recommencer avec de nouveaux joueurs
  const restartWithNewPlayers = useCallback(() => {
    setPlayers([{ id: '1', name: '' }, { id: '2', name: '' }]);
    setSelectedQuestions([]);
    setCurrentQuestionIndex(0);
    setAnswers([]);
    setDesignations({});
    setPhase('setup');
  }, []);

  // Lettres pour les joueurs (A, B, C, etc.)
  const getPlayerLetter = useCallback((index: number) => {
    return String.fromCharCode(65 + index);
  }, []);

  return {
    // État
    phase, players, currentQuestionIndex,
    totalQuestions: QUESTIONS_PER_GAME,
    
    // Getters
    getCurrentQuestion, getResults, canStartGame, getPlayerLetter,
    
    // Actions joueurs
    addPlayer, removePlayer, updatePlayerName,
    
    // Actions jeu
    startQuiz, answerQuestion, restartWithNewQuestions, restartWithNewPlayers,
  };
}
