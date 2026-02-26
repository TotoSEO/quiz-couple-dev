import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Clock, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Quiz } from '@/types/quiz';
import { useLanguage } from '@/hooks/useLanguage';
import { getLocalizedPath, RouteKey } from '@/i18n/routes';

interface QuizCardProps {
  quiz: Quiz;
}

// Map quiz slugs to route keys
const slugToRouteKey: Record<string, RouteKey> = {
  'tester-son-couple': 'testCouple',
  'test-points-communs-couples': 'testCommonPoints',
  'quiz-couple-distance': 'testDistance',
  'test-couple-toxique': 'testToxic',
  'quiz-amoureux': 'quizAmoureux',
  'quiz-couple-coquin': 'quizCoquin',
  'quiz-couple-marrant': 'quizMarrant',
  'quiz-qui-connait-mieux-partenaire': 'quizKnowledge',
  'quiz-qui-est-le-plus': 'quizMost',
};

export function QuizCard({ quiz }: QuizCardProps) {
  const { t, lang } = useLanguage();
  
  // Pour les quiz interactifs sans questions traditionnelles, utiliser des valeurs personnalisées
  const isKnowledgeQuiz = quiz.slug === 'quiz-qui-connait-mieux-partenaire';
  const isMostQuiz = quiz.slug === 'quiz-qui-est-le-plus';
  
  const questionCount = isKnowledgeQuiz ? 100 : isMostQuiz ? 240 : quiz.questions.length;
  const estimatedTime = isKnowledgeQuiz ? 15 : isMostQuiz ? 15 : Math.ceil(quiz.questions.length * 0.5);

  // Déterminer si c'est un quiz à deux ou en groupe
  const isDuoQuiz = quiz.slug === 'tester-son-couple' || quiz.slug === 'quiz-couple-coquin' || isKnowledgeQuiz;
  const isGroupQuiz = isMostQuiz;

  // Get localized path
  const routeKey = slugToRouteKey[quiz.slug];
  const quizPath = routeKey ? getLocalizedPath(routeKey, lang) : `/${quiz.slug}`;

  // Get translated quiz info
  const translationKey = routeKey || '';
  const shortTitle = t(`quizzes:${translationKey}.shortTitle`, quiz.shortTitle);
  const description = t(`quizzes:${translationKey}.description`, quiz.description);

  return (
    <div className="group relative h-full">
      {/* Card principale */}
      <div className="relative overflow-hidden border-2 border-border/50 bg-card/80 backdrop-blur-sm rounded-3xl transition-all duration-300 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 h-full flex flex-col">
        {/* Header avec icône et badge */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 group-hover:from-primary/30 group-hover:to-secondary/30 transition-all duration-300 group-hover:scale-110">
              <span className="text-3xl">{quiz.icon}</span>
            </div>
            <Badge 
              variant="secondary" 
              className="rounded-full px-3 py-1.5 text-xs font-semibold bg-primary/10 text-primary border-0"
            >
              {questionCount} {t('common:quiz.question', 'questions')}
            </Badge>
          </div>
          
          <h3 className="text-xl md:text-2xl font-bold font-display mb-2 group-hover:text-primary transition-colors">
            {shortTitle}
          </h3>
          
          <p className="text-muted-foreground leading-relaxed line-clamp-3">
            {description}
          </p>
        </div>
        
        {/* Footer avec infos et bouton */}
        <div className="mt-auto p-6 pt-4 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-5">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary/70" />
              <span>~{estimatedTime} min</span>
            </div>
            {isDuoQuiz && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary/70" />
                <span>{t('common:quiz.forTwo', 'À deux')}</span>
              </div>
            )}
            {isGroupQuiz && (
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary/70" />
                <span>{t('common:quiz.players', '2-8 joueurs')}</span>
              </div>
            )}
          </div>
          
          <Button 
            asChild 
            className="w-full gap-2 rounded-2xl py-6 text-base font-semibold group-hover:glow-primary transition-all"
          >
            <Link to={quizPath}>
              {t('common:buttons.startQuiz', 'Faire le quiz')}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
