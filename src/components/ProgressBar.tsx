import React from 'react';
import { useFormContext } from '@/utils/formContext';

const ProgressBar: React.FC = () => {
  const { currentStep, progress, goToStep } = useFormContext();
  
  const steps = [
    { number: 1, name: 'Personal Information', shortName: 'Personal' },
    { number: 2, name: 'Employment', shortName: 'Job' },
    { number: 3, name: 'Financial', shortName: 'Finance' },
    { number: 4, name: 'Loan Details', shortName: 'Loan' },
    { number: 5, name: 'Documents', shortName: 'Docs' },
  ];
  
  return (
    <div className="w-full mb-10">
      <div className="relative">
        {/* Progress bar */}
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Step indicators */}
        <div className="flex justify-between mt-2">
          {steps.map((step) => (
            <div
              key={step.number}
              className="relative flex flex-col items-center cursor-pointer"
              onClick={() => step.number <= currentStep && goToStep(step.number)}
            >
              <div
                className={`w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-full transition-all duration-300 z-10 text-xs md:text-sm font-medium ${
                  step.number === currentStep
                    ? 'bg-primary text-white scale-110 shadow-md'
                    : step.number < currentStep
                    ? 'bg-primary/20 text-primary'
                    : 'bg-secondary text-foreground/50'
                }`}
              >
                {step.number}
              </div>
              <span 
                className={`absolute top-8 md:top-10 text-[10px] md:text-xs font-medium transition-all duration-300 text-center ${
                  step.number === currentStep 
                    ? 'text-primary' 
                    : 'text-foreground/50'
                }`}
              >
                <span className="hidden md:inline">{step.name}</span>
                <span className="inline md:hidden">{step.shortName}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
