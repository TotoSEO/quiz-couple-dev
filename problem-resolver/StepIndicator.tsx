import { Check, FileText, MessageSquare, Brain, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ResolverStep } from '@/types/problem-resolver';
import { useLanguage } from '@/hooks/useLanguage';

interface StepIndicatorProps {
  currentStep: ResolverStep;
  hasContext: boolean;
  currentPersonIndex: number;
  totalPersons: number;
}

export function StepIndicator({ 
  currentStep, 
  hasContext,
  currentPersonIndex,
  totalPersons 
}: StepIndicatorProps) {
  const { t } = useLanguage();

  const steps = [
    { 
      id: 'context', 
      label: t('quizGames:problemResolver.stepContext'), 
      icon: FileText,
      completed: hasContext,
    },
    { 
      id: 'statements', 
      label: t('quizGames:problemResolver.stepStatements'), 
      icon: MessageSquare,
      completed: currentStep === 'loading' || currentStep === 'result',
      sublabel: hasContext && currentStep === 'statements' 
        ? `${currentPersonIndex + 1}/${totalPersons}` 
        : undefined,
    },
    { 
      id: 'loading', 
      label: t('quizGames:problemResolver.stepAnalysis'), 
      icon: Brain,
      completed: currentStep === 'result',
    },
    { 
      id: 'result', 
      label: t('quizGames:problemResolver.stepResult'), 
      icon: Trophy,
      completed: false,
    },
  ];

  const currentIndex = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="flex items-center justify-between max-w-xl mx-auto overflow-x-auto px-1">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = step.id === currentStep;
        const isCompleted = step.completed || index < currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300',
                  isCompleted && 'bg-primary text-primary-foreground',
                  isActive && !isCompleted && 'bg-primary/20 text-primary ring-2 ring-primary',
                  !isActive && !isCompleted && 'bg-muted text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <span className={cn(
                'mt-2 text-[10px] sm:text-xs font-medium text-center whitespace-nowrap',
                isActive ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {step.label}
              </span>
              {step.sublabel && (
                <span className="text-xs text-primary font-semibold">
                  {step.sublabel}
                </span>
              )}
            </div>

            {index < steps.length - 1 && (
              <div 
                className={cn(
                  'h-0.5 w-8 md:w-16 mx-2 transition-colors duration-300',
                  index < currentIndex ? 'bg-primary' : 'bg-border'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}