import { cn } from '@/lib/utils';

interface WaveDividerProps {
  className?: string;
  direction?: 'up' | 'down';
  variant?: 'primary' | 'muted' | 'background';
}

export function WaveDivider({ 
  className, 
  direction = 'down',
  variant = 'muted'
}: WaveDividerProps) {
  const colorClasses = {
    primary: 'text-primary/10',
    muted: 'text-muted',
    background: 'text-background',
  };

  return (
    <div 
      className={cn(
        "w-full overflow-hidden leading-none",
        direction === 'up' && 'rotate-180',
        className
      )}
    >
      <svg
        viewBox="0 0 1440 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("w-full h-auto", colorClasses[variant])}
        preserveAspectRatio="none"
      >
        <path
          d="M0 60L48 65.3C96 71 192 81 288 76C384 71 480 49 576 54.7C672 60 768 92 864 97.3C960 103 1056 81 1152 70.7C1248 60 1344 60 1392 60L1440 60L1440 120L1392 120C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120L0 120Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}

export function WaveDividerDouble({ className }: { className?: string }) {
  return (
    <div className={cn("w-full overflow-hidden leading-none", className)}>
      <svg
        viewBox="0 0 1440 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto text-muted"
        preserveAspectRatio="none"
      >
        <path
          d="M0 50C240 80 480 20 720 50C960 80 1200 20 1440 50L1440 100L0 100Z"
          fill="currentColor"
          fillOpacity="0.5"
        />
        <path
          d="M0 60C240 30 480 90 720 60C960 30 1200 90 1440 60L1440 100L0 100Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
