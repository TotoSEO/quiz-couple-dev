import { cn } from '@/lib/utils';

interface FloatingBlobsProps {
  className?: string;
  variant?: 'hero' | 'section' | 'subtle';
}

export function FloatingBlobs({ className, variant = 'hero' }: FloatingBlobsProps) {
  if (variant === 'subtle') {
    return (
      <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse-soft" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft delay-1000" />
      </div>
    );
  }

  if (variant === 'section') {
    return (
      <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
        <div className="absolute top-1/4 -left-20 w-64 h-64 bg-primary/15 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 -right-20 w-64 h-64 bg-secondary/15 rounded-full blur-3xl animate-float-slow delay-500" />
      </div>
    );
  }

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {/* Large primary blob - top right */}
      <div 
        className="absolute -top-20 -right-20 w-96 h-96 bg-primary/20 animate-blob animate-float"
        style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%', filter: 'blur(60px)' }}
      />
      
      {/* Medium secondary blob - bottom left */}
      <div 
        className="absolute -bottom-32 -left-32 w-80 h-80 bg-secondary/25 animate-blob animate-float-slow"
        style={{ 
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%', 
          filter: 'blur(50px)',
          animationDelay: '2s'
        }}
      />
      
      {/* Small accent blob - center */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-accent/20 animate-blob"
        style={{ 
          borderRadius: '50% 60% 30% 60% / 30% 60% 70% 40%', 
          filter: 'blur(40px)',
          animationDelay: '4s'
        }}
      />
      
      {/* Extra small blob - top left */}
      <div 
        className="absolute top-20 left-1/4 w-40 h-40 bg-primary/15 animate-float"
        style={{ 
          borderRadius: '60% 40% 60% 40% / 40% 60% 40% 60%', 
          filter: 'blur(30px)',
          animationDelay: '1s'
        }}
      />
    </div>
  );
}
