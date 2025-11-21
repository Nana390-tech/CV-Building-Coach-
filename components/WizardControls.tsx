import React from 'react';
import { ChevronLeft, ChevronRight, Wand2 } from 'lucide-react';
import { STEPS } from '../types';

interface Props {
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
}

export const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const progress = ((current + 1) / total) * 100;
  
  return (
    <div className="w-full mb-6">
      <div className="flex justify-between text-xs uppercase text-slate-500 mb-2 font-semibold tracking-wider">
        <span>Step {current + 1} of {total}</span>
        <span>{STEPS[current]}</span>
      </div>
      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-indigo-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const NavButtons: React.FC<Props> = ({ currentStep, totalSteps, onNext, onPrev }) => {
  return (
    <div className="flex justify-between mt-8 pt-6 border-t border-slate-200">
      <button
        onClick={onPrev}
        disabled={currentStep === 0}
        className={`flex items-center px-6 py-2 rounded-lg text-sm font-medium transition-colors
          ${currentStep === 0 
            ? 'text-slate-300 cursor-not-allowed' 
            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Back
      </button>
      
      <button
        onClick={onNext}
        className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
      >
        {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
        {currentStep !== totalSteps - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
      </button>
    </div>
  );
};

interface AIButtonProps {
  onClick: () => void;
  loading: boolean;
  label: string;
  icon?: boolean;
}

export const AIButton: React.FC<AIButtonProps> = ({ onClick, loading, label, icon = true }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="inline-flex items-center px-4 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-md text-sm font-medium hover:bg-purple-100 focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors disabled:opacity-50 disabled:cursor-wait"
  >
    {loading ? (
      <span className="animate-pulse">Thinking...</span>
    ) : (
      <>
        {icon && <Wand2 className="w-4 h-4 mr-2" />}
        {label}
      </>
    )}
  </button>
);