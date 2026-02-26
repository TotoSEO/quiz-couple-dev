import { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';

export function MostQuizTransition() {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div 
        className={`text-center transform transition-all duration-500 ${
          isVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'
        }`}
      >
        <div className="flex justify-center gap-4 mb-6">
          <span className="text-4xl animate-bounce" style={{ animationDelay: '0ms' }}>⚡</span>
          <span className="text-4xl animate-bounce" style={{ animationDelay: '100ms' }}>🎉</span>
          <span className="text-4xl animate-bounce" style={{ animationDelay: '200ms' }}>🚀</span>
          <span className="text-4xl animate-bounce" style={{ animationDelay: '300ms' }}>✨</span>
        </div>

        <h2 
          className={`text-4xl md:text-6xl font-black transition-all duration-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}
          style={{
            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--secondary)) 50%, hsl(var(--primary)) 100%)',
            backgroundSize: '200% 200%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            animation: 'gradient-flow 2s ease infinite',
          }}
        >
          {t('quizGames:question.nextQuestionTransition')}
        </h2>

        <p 
          className={`mt-4 text-xl text-muted-foreground transition-all duration-700 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
          }`}
        >
          {t('quizGames:question.getReadyToVote')}
        </p>

        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-3 h-3 rounded-full bg-primary/30"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
                animation: `float ${2 + Math.random() * 2}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 1}s`,
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes gradient-flow {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) scale(1); opacity: 0.5; }
          50% { transform: translateY(-20px) scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
