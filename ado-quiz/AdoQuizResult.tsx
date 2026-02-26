import { Button } from '@/components/ui/button';
import { Heart, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShareButtons } from '@/components/shared/ShareButtons';
import type { AdoResult } from '@/data/quizzes/quiz-ado-questions';

interface ResultData {
  player1: { name: string; score: number; answers: number[] };
  player2: { name: string; score: number; answers: number[] };
  avgScore: number;
  maxScore: number;
  result: AdoResult;
  questionIds: number[];
}

interface Props {
  results: ResultData;
  onReset: () => void;
}

const OPTION_LETTERS = ['a', 'b', 'c', 'd'] as const;

export function AdoQuizResult({ results, onReset }: Props) {
  const { t } = useTranslation('quiz-ado');
  const { player1, player2, avgScore, maxScore, result, questionIds } = results;
  const percentage = Math.round((avgScore / maxScore) * 100);
  const [showAnswers, setShowAnswers] = useState(false);

  const resultTitle = t(`results.${result.key}.title`);
  const resultDesc = t(`results.${result.key}.text`, { name1: player1.name, name2: player2.name });
  const adviceTitle = t(`results.${result.key}.adviceTitle`);
  const adviceText = t(`results.${result.key}.advice`, { name1: player1.name, name2: player2.name });

  return (
    <div className="glass-card p-6 md:p-8 space-y-8">
      {/* Score header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white">
          <span className="text-2xl font-bold">{percentage}%</span>
        </div>
        <h2 className="text-2xl font-bold">{resultTitle}</h2>
        <p className="text-muted-foreground max-w-lg mx-auto">{resultDesc}</p>
      </div>

      {/* Score explanation */}
      <p className="text-sm text-muted-foreground text-center italic">
        {t('results.scoreExplanation')}
      </p>

      {/* Individual scores */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">{player1.name}</p>
          <p className="text-2xl font-bold">{player1.score}<span className="text-sm text-muted-foreground">/{maxScore}</span></p>
        </div>
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">{player2.name}</p>
          <p className="text-2xl font-bold">{player2.score}<span className="text-sm text-muted-foreground">/{maxScore}</span></p>
        </div>
      </div>

      {/* Average */}
      <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-4 text-center">
        <p className="text-sm text-muted-foreground mb-1">{t('results.averageScore')}</p>
        <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
          {avgScore}<span className="text-lg text-muted-foreground">/{maxScore}</span>
        </p>
      </div>

      {/* Advice */}
      <div className="bg-card rounded-xl border p-5">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Heart className="h-4 w-4 text-emerald-500" />
          {adviceTitle}
        </h3>
        <p className="text-sm text-muted-foreground">{adviceText}</p>
      </div>

      {/* Answer breakdown toggle */}
      <div>
        <Button
          variant="outline"
          className="w-full gap-2"
          onClick={() => setShowAnswers(!showAnswers)}
        >
          {showAnswers ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          {t('results.showAnswers')}
        </Button>

        {showAnswers && (
          <div className="mt-4 space-y-4">
            {questionIds.map((qId, idx) => {
              const p1Answer = player1.answers[idx];
              const p2Answer = player2.answers[idx];
              const p1Letter = OPTION_LETTERS[(p1Answer || 1) - 1] || 'a';
              const p2Letter = OPTION_LETTERS[(p2Answer || 1) - 1] || 'a';
              const otherName = player2.name || '';

              return (
                <div key={qId} className="bg-muted/30 rounded-xl p-4 space-y-2">
                  <p className="font-medium text-sm">
                    {idx + 1}. {t(`q.${qId}`, { name: otherName })}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">{player1.name} :</span>
                      <span className="text-muted-foreground">{t(`q.${qId}${p1Letter}`)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-semibold text-blue-600 dark:text-blue-400 shrink-0">{player2.name} :</span>
                      <span className="text-muted-foreground">{t(`q.${qId}${p2Letter}`)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Share */}
      <div className="text-center space-y-3">
        <p className="text-sm text-muted-foreground">{t('results.shareResult')}</p>
        <ShareButtons
          title={t('results.shareTitle', { score: percentage })}
          text={t('results.shareText', { name1: player1.name, name2: player2.name, score: percentage })}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3">
        <Button onClick={onReset} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" />
          {t('results.playAgain')}
        </Button>
      </div>
    </div>
  );
}
