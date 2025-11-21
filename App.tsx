import React, { useState, useEffect } from 'react';
import { INITIAL_CV_DATA, CVData, STEPS } from './types';
import { NavButtons, ProgressBar } from './components/WizardControls';
import { StepPersonal, StepObjective, StepEducation, StepLanguages } from './components/steps/BasicInfoSteps';
import { StepSkills, StepAchievements, StepHobbies, StepStrengths } from './components/steps/SkillsAndExtras';
import { StepWork, StepVolunteer, StepProjects } from './components/steps/ExperienceSteps';
import { StepReview } from './components/steps/ReviewStep';
import { RotateCcw, FileText, PlusCircle } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'builder'>('home');
  const [currentStep, setCurrentStep] = useState(0);
  const [cvData, setCvData] = useState<CVData>(INITIAL_CV_DATA);
  const [hasSavedData, setHasSavedData] = useState(false);

  // Load data on mount
  useEffect(() => {
    const saved = localStorage.getItem('cv_builder_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCvData(parsed);
        // Rough check if data is "empty" or not
        if (parsed.personalInfo?.firstName || parsed.education?.length > 0) {
            setHasSavedData(true);
        }
      } catch (e) {
        console.error("Failed to load saved data");
      }
    }
  }, []);

  // Persist data
  useEffect(() => {
    if (view === 'builder') {
        localStorage.setItem('cv_builder_data', JSON.stringify(cvData));
    }
  }, [cvData, view]);

  const updateData = (newData: Partial<CVData>) => {
    setCvData(prev => ({ ...prev, ...newData }));
  };

  const startNew = () => {
    if (window.confirm("Are you sure? This will delete your current progress.")) {
        setCvData(INITIAL_CV_DATA);
        setCurrentStep(0);
        localStorage.removeItem('cv_builder_data');
        setView('builder');
        setHasSavedData(false);
    }
  };

  const continueCV = () => {
    setView('builder');
  };

  const handleReset = () => {
    if (window.confirm("This will clear all data and go back to the start. Are you sure?")) {
        setCvData(INITIAL_CV_DATA);
        setCurrentStep(0);
        localStorage.removeItem('cv_builder_data');
    }
  };

  const nextStep = () => setCurrentStep(p => Math.min(p + 1, STEPS.length - 1));
  const prevStep = () => setCurrentStep(p => Math.max(p - 1, 0));

  const renderStep = () => {
    const props = { data: cvData, updateData };
    switch (currentStep) {
      case 0: return <StepPersonal {...props} />;
      case 1: return <StepObjective {...props} />;
      case 2: return <StepEducation {...props} />;
      case 3: return <StepSkills {...props} />;
      case 4: return <StepWork {...props} />;
      case 5: return <StepVolunteer {...props} />;
      case 6: return <StepProjects {...props} />;
      case 7: return <StepAchievements {...props} />;
      case 8: return <StepLanguages {...props} />;
      case 9: return <StepHobbies {...props} />;
      case 10: return <StepStrengths {...props} />;
      case 11: return <StepReview {...props} />;
      default: return <StepPersonal {...props} />;
    }
  };

  if (view === 'home') {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden mb-8">
                <div className="bg-indigo-700 p-8 text-center text-white">
                    <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FileText size={32} />
                    </div>
                    <h2 className="text-sm text-indigo-200 font-semibold uppercase tracking-widest mb-1">Higher Colleges of Technology</h2>
                    <h1 className="text-3xl font-bold mb-2">CV Building Coach</h1>
                    <p className="text-indigo-100">Create a professional CV in minutes.</p>
                </div>
                <div className="p-8 space-y-4">
                    {hasSavedData && (
                        <button 
                            onClick={continueCV}
                            className="w-full flex items-center justify-center p-4 bg-white border-2 border-indigo-600 text-indigo-700 rounded-lg font-bold hover:bg-indigo-50 transition-colors"
                        >
                            <FileText className="mr-2" /> Continue Editing
                        </button>
                    )}
                    <button 
                        onClick={() => {
                            if (hasSavedData) {
                                startNew();
                            } else {
                                setCvData(INITIAL_CV_DATA);
                                setCurrentStep(0);
                                setView('builder');
                            }
                        }}
                        className="w-full flex items-center justify-center p-4 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-md"
                    >
                        <PlusCircle className="mr-2" /> Start New CV
                    </button>
                </div>
                <div className="bg-slate-50 p-4 text-center text-xs text-slate-400">
                    Your progress is saved automatically on this device.
                </div>
            </div>
            
            <footer className="text-slate-400 text-sm text-center">
                <p>Higher Colleges of Technology</p>
                <p>Designed by: Nazila Motahari</p>
            </footer>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-6 md:py-10 px-4">
      <div className="w-full max-w-5xl bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:min-h-[800px]">
        
        {/* Header */}
        <header className="bg-indigo-700 text-white p-4 md:p-6 flex justify-between items-center">
          <div>
             <p className="text-xs text-indigo-200 font-medium uppercase tracking-wider mb-1">Higher Colleges of Technology</p>
             <h1 className="text-xl md:text-2xl font-bold">CV Building Coach</h1>
          </div>
          <div className="flex gap-2">
             <button 
                onClick={() => setView('home')}
                className="px-3 py-1 md:px-4 md:py-2 bg-indigo-800 rounded text-xs md:text-sm hover:bg-indigo-900"
             >
                Home
             </button>
             <button 
                onClick={handleReset}
                className="flex items-center px-3 py-1 md:px-4 md:py-2 bg-white/10 rounded text-xs md:text-sm hover:bg-white/20"
             >
                <RotateCcw size={14} className="mr-1" /> Reset
             </button>
          </div>
        </header>

        {/* Body */}
        <main className="flex-1 p-4 md:p-10 flex flex-col">
          <ProgressBar current={currentStep} total={STEPS.length} />
          
          <div className="flex-1 mt-4">
            {renderStep()}
          </div>

          <NavButtons 
            currentStep={currentStep} 
            totalSteps={STEPS.length} 
            onNext={nextStep} 
            onPrev={prevStep} 
          />
        </main>
      </div>
      
      <footer className="mt-8 text-slate-400 text-sm text-center">
        <p>Higher Colleges of Technology • Designed by: Nazila Motahari</p>
        <p className="text-xs mt-1 opacity-75">Powered by Gemini AI</p>
      </footer>
    </div>
  );
};

export default App;