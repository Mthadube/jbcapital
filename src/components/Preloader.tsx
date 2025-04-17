import React, { useEffect, useState } from 'react';

interface PreloaderProps {
  onLoadingComplete?: () => void;
  minDisplayTime?: number;
}

const Preloader: React.FC<PreloaderProps> = ({ 
  onLoadingComplete,
  minDisplayTime = 2000 // Minimum time to show the preloader for visual effect
}) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [animationStage, setAnimationStage] = useState(0);
  
  useEffect(() => {
    // Start progress animation
    const interval = setInterval(() => {
      setProgress(prev => {
        const nextProgress = prev + (100 - prev) * 0.05;
        return nextProgress > 99.5 ? 100 : nextProgress;
      });
    }, 30);
    
    // Simulate page loading
    window.addEventListener('load', handleLoadComplete);
    
    // Set a minimum display time
    const minTimeTimeout = setTimeout(() => {
      if (progress >= 100) {
        completeLoading();
      }
    }, minDisplayTime);
    
    // Staggered animation stages (exclude logo, which is visible immediately)
    const stageTimeouts = [
      setTimeout(() => setAnimationStage(1), 400),
      setTimeout(() => setAnimationStage(2), 600),
      setTimeout(() => setAnimationStage(3), 800),
    ];
    
    return () => {
      clearInterval(interval);
      clearTimeout(minTimeTimeout);
      stageTimeouts.forEach(timeout => clearTimeout(timeout));
      window.removeEventListener('load', handleLoadComplete);
    };
  }, [minDisplayTime, progress]);
  
  // Handle window load event
  const handleLoadComplete = () => {
    setProgress(100);
  };
  
  // Complete loading and trigger fade out
  const completeLoading = () => {
    setFadeOut(true);
    setTimeout(() => {
      if (onLoadingComplete) {
        onLoadingComplete();
      }
    }, 500); // Match the transition duration
  };
  
  // When progress hits 100, start the completion process
  useEffect(() => {
    if (progress === 100) {
      completeLoading();
    }
  }, [progress]);
  
  // Animation delay classes based on animation stage
  const getAnimationClass = (stage: number) => {
    if (animationStage >= stage) {
      return 'animate-slide-up opacity-100';
    }
    return 'opacity-0';
  };
  
  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-gray-900 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      <div className="w-full max-w-md px-6 flex flex-col items-center">
        {/* Logo - always visible from the start with rotating circle around it */}
        <div className="mb-12 relative w-40 h-40 flex items-center justify-center">
          {/* Rotating circle animation */}
          <div className="absolute inset-0 scale-[2.2] pointer-events-none">
            <svg className="w-full h-full animate-spin-slow" viewBox="0 0 200 200">
              <defs>
                <linearGradient id="circleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0066cc" stopOpacity="0.1" />
                  <stop offset="50%" stopColor="#0066cc" stopOpacity="1" />
                  <stop offset="100%" stopColor="#0066cc" stopOpacity="0.1" />
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="98" fill="none" stroke="url(#circleGradient)" strokeWidth="2" strokeDasharray="20 10" />
              <circle cx="100" cy="100" r="98" fill="none" stroke="#0066cc" strokeWidth="0.5" strokeOpacity="0.3" />
              <circle cx="100" cy="2" r="3" fill="#0066cc" />
            </svg>
          </div>
          
          {/* Logo with float animation */}
          <div className="animate-float opacity-100 z-10">
            <img src="/logo.png" alt="JB Capital" className="h-16" />
          </div>
        </div>
        
        {/* Loading bar */}
        <div className={`w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-4 ${getAnimationClass(1)}`} style={{ transitionDelay: '200ms' }}>
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-primary rounded-full transition-all duration-300 ease-out relative overflow-hidden"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 animate-shine"></div>
          </div>
        </div>
        
        {/* Loading text */}
        <div className={`text-center ${getAnimationClass(2)}`} style={{ transitionDelay: '300ms' }}>
          <p className="text-foreground/70 mb-2">Loading your experience</p>
          <p className="text-sm font-medium text-primary">{Math.round(progress)}%</p>
        </div>
        
        {/* Animated elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Animated shapes */}
          <div className="absolute top-1/4 left-1/4 w-8 h-8 rounded-full bg-primary/10 animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-12 h-12 rounded-full bg-blue-500/10 animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-6 h-6 rounded-full bg-purple-500/10 animate-pulse" style={{ animationDuration: '2.5s' }}></div>
          
          {/* Loading satellites */}
          <div className="absolute top-1/2 left-1/5 w-4 h-4 rounded-full bg-primary loader-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-3 h-3 rounded-full bg-blue-400 loader-pulse" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute top-1/3 left-2/3 w-5 h-5 rounded-full bg-purple-500 loader-pulse" style={{ animationDelay: '1s' }}></div>
          
          {/* Lines */}
          <div className="absolute inset-0">
            <svg className="absolute inset-0 w-full h-full opacity-[0.03]" width="100%" height="100%">
              <pattern id="preloader-grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                <line x1="50" y1="0" x2="50" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
                <line x1="0" y1="50" x2="50" y2="50" stroke="currentColor" strokeWidth="0.5" className="text-primary" />
              </pattern>
              <rect x="0" y="0" width="100%" height="100%" fill="url(#preloader-grid)" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preloader; 