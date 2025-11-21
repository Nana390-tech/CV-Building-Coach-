import React, { useState } from 'react';
import { CVData } from '../../types';
import { AIButton } from '../WizardControls';
import { generateAIContent } from '../../services/gemini';
import { Plus, X } from 'lucide-react';

interface StepProps {
  data: CVData;
  updateData: (data: Partial<CVData>) => void;
}

// --- Step 4: Skills ---
export const StepSkills: React.FC<StepProps> = ({ data, updateData }) => {
  const [activeTab, setActiveTab] = useState<'tech' | 'soft'>('tech');
  const [loading, setLoading] = useState(false);

  const techOptions = ["Microsoft Word", "PowerPoint", "Excel (Basic)", "Teams / Zoom", "Typing", "Social Media", "Canva", "Email"];
  const softOptions = ["Communication", "Teamwork", "Active Listening", "Problem Solving", "Time Management", "Customer Service", "Punctuality"];

  const toggleSkill = (skill: string, type: 'technical' | 'soft') => {
    const current = data.skills[type];
    const updated = current.includes(skill) 
      ? current.filter(s => s !== skill)
      : [...current, skill];
    updateData({ skills: { ...data.skills, [type]: updated } });
  };

  const handleAIBullets = async () => {
    setLoading(true);
    try {
      if (activeTab === 'tech') {
        const prompt = `Create 3-5 bullet points describing the student's technical skills: ${data.skills.technical.join(', ')}. Use simple language like 'Able to use...'.`;
        const res = await generateAIContent(prompt);
        updateData({ skills: { ...data.skills, other: (data.skills.other ? data.skills.other + '\n\n' : '') + res } });
      } else {
        const prompt = `For these soft skills: ${data.skills.soft.join(', ')}, write 1 simple example sentence for each showing how a student uses them.`;
        const res = await generateAIContent(prompt);
        updateData({ skills: { ...data.skills, other: (data.skills.other ? data.skills.other + '\n\n' : '') + res } });
      }
    } catch(e) {}
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Skills</h2>
      
      <div className="flex border-b border-slate-200">
        <button 
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'tech' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
          onClick={() => setActiveTab('tech')}
        >
          Technical / Digital
        </button>
        <button 
          className={`px-4 py-2 font-medium text-sm ${activeTab === 'soft' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500'}`}
          onClick={() => setActiveTab('soft')}
        >
          Professional / Soft
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {(activeTab === 'tech' ? techOptions : softOptions).map(opt => (
          <label key={opt} className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-slate-50">
            <input 
              type="checkbox" 
              checked={data.skills[activeTab === 'tech' ? 'technical' : 'soft'].includes(opt)}
              onChange={() => toggleSkill(opt, activeTab === 'tech' ? 'technical' : 'soft')}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
            />
            <span className="ml-2 text-sm text-slate-700">{opt}</span>
          </label>
        ))}
      </div>

      <AIButton 
        label={activeTab === 'tech' ? "Turn into bullet points" : "Give me examples"} 
        onClick={handleAIBullets} 
        loading={loading} 
      />

      <div className="mt-4">
        <label className="block text-sm font-medium text-slate-700 mb-1">Skill Descriptions / Other Skills</label>
        <textarea 
          className="w-full h-32 p-3 border border-slate-300 rounded-md"
          value={data.skills.other}
          onChange={(e) => updateData({ skills: { ...data.skills, other: e.target.value } })}
          placeholder="AI suggestions will appear here..."
        />
      </div>
    </div>
  );
};

// --- Step 8: Achievements ---
export const StepAchievements: React.FC<StepProps> = ({ data, updateData }) => {
  const [newAchievement, setNewAchievement] = useState('');
  const [loading, setLoading] = useState(false);

  const add = () => {
    if (newAchievement.trim()) {
      updateData({ achievements: [...data.achievements, newAchievement] });
      setNewAchievement('');
    }
  };

  const remove = (idx: number) => {
    updateData({ achievements: data.achievements.filter((_, i) => i !== idx) });
  };

  const improve = async () => {
    setLoading(true);
    try {
      const prompt = `Rewrite these achievements as professional CV bullet points using verbs like 'Achieved', 'Received'. A2/B1 level: ${data.achievements.join('; ')}`;
      const res = await generateAIContent(prompt);
      // Naive split by newline if AI returns a list
      const improvedList = res.split('\n').filter(l => l.trim().length > 0).map(l => l.replace(/^- /, '').replace(/^\* /, ''));
      updateData({ achievements: improvedList });
    } catch(e) {}
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Achievements</h2>
      <div className="flex gap-2">
        <input 
          className="flex-1 p-2 border border-slate-300 rounded" 
          placeholder="e.g. Perfect Attendance Award" 
          value={newAchievement}
          onChange={e => setNewAchievement(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
        />
        <button onClick={add} className="bg-indigo-600 text-white px-4 rounded hover:bg-indigo-700"><Plus /></button>
      </div>

      <ul className="space-y-2">
        {data.achievements.map((ach, idx) => (
          <li key={idx} className="flex justify-between items-center p-3 bg-white border rounded shadow-sm">
            <span>{ach}</span>
            <button onClick={() => remove(idx)} className="text-slate-400 hover:text-red-500"><X size={16} /></button>
          </li>
        ))}
      </ul>

      {data.achievements.length > 0 && (
        <AIButton label="Turn into strong CV lines" onClick={improve} loading={loading} />
      )}
    </div>
  );
};

// --- Step 10: Hobbies ---
export const StepHobbies: React.FC<StepProps> = ({ data, updateData }) => {
    const [loading, setLoading] = useState(false);
    const hobbies = ["Football", "Gym", "Gaming", "Movies", "Photography", "Technology", "Travel", "Reading", "Cooking", "Art"];

    const toggleHobby = (h: string) => {
        const current = data.hobbies.selected;
        const updated = current.includes(h) ? current.filter(i => i !== h) : [...current, h];
        updateData({ hobbies: { ...data.hobbies, selected: updated } });
    };

    const generateDesc = async () => {
        setLoading(true);
        try {
            const prompt = `Write 2-3 short sentences to describe this student's hobbies: ${data.hobbies.selected.join(', ')}. Professional but friendly.`;
            const res = await generateAIContent(prompt);
            updateData({ hobbies: { ...data.hobbies, description: res } });
        } catch(e) {}
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Hobbies & Interests</h2>
            <div className="flex flex-wrap gap-2">
                {hobbies.map(h => (
                    <button 
                        key={h}
                        onClick={() => toggleHobby(h)}
                        className={`px-4 py-2 rounded-full text-sm transition-colors ${
                            data.hobbies.selected.includes(h) 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                    >
                        {h}
                    </button>
                ))}
            </div>
            <textarea 
                className="w-full h-24 p-3 border border-slate-300 rounded"
                placeholder="Describe your hobbies..."
                value={data.hobbies.description}
                onChange={e => updateData({ hobbies: { ...data.hobbies, description: e.target.value } })}
            />
            <AIButton label="Write description" onClick={generateDesc} loading={loading} />
        </div>
    );
}

// --- Step 11: Strengths ---
export const StepStrengths: React.FC<StepProps> = ({ data, updateData }) => {
    const [loading, setLoading] = useState(false);
    const options = [
        "I am punctual.", "I can work in a team.", "I am polite with people.",
        "I like to learn new things.", "I stay calm in stressful situations.", "I prepare before an exam/interview."
    ];

    const toggleStrength = (s: string) => {
         const current = data.strengths;
         const updated = current.includes(s) ? current.filter(x => x !== s) : [...current, s];
         updateData({ strengths: updated });
    };

    const writeStrengths = async () => {
        setLoading(true);
        try {
            const prompt = `Create a 'Key Strengths' section with bullet points based on: ${data.strengths.join(', ')}. Simple, one line each, positive tone.`;
            const res = await generateAIContent(prompt);
            // We'll put the result in the 'other' skills or just append to an alert for now, 
            // but ideally we'd have a specific field. For this implementation, let's overwrite the selection 
            // or append to a free text. Since the requirement implies self-reflection, let's just display the generated text in a text area for them to copy/edit.
            // Actually, let's append to the user's selection list for display? No, text is better.
            // Let's add a temporary field or just alert it.
            // Re-reading prompt: "Create a short Key Strengths section".
            // I will store this in a separate "description" or just assume they want the text.
            // Let's repurpose the 'skills.other' or create a new text block. 
            // Simpler: Just replace the list with the AI strings? No, let's use a textarea.
            const cleanList = res.split('\n').filter(x => x.trim());
            updateData({ strengths: cleanList });
        } catch(e) {}
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">Key Strengths</h2>
            <p className="text-slate-600">What are you good at?</p>
            <div className="grid gap-2">
                {options.map(opt => (
                   <label key={opt} className="flex items-center p-3 border rounded hover:bg-slate-50 cursor-pointer">
                       <input 
                         type="checkbox" 
                         checked={data.strengths.includes(opt)}
                         onChange={() => toggleStrength(opt)}
                         className="w-4 h-4 text-indigo-600"
                       />
                       <span className="ml-3 text-slate-800">{opt}</span>
                   </label> 
                ))}
            </div>
            
            {/* Display current strengths as list if they are custom/AI generated */}
            <div className="mt-4 bg-white p-4 rounded border border-slate-200">
                 <h4 className="font-bold mb-2 text-sm text-slate-500 uppercase">Your List</h4>
                 <ul className="list-disc pl-5 space-y-1">
                     {data.strengths.map((s, i) => <li key={i}>{s}</li>)}
                 </ul>
            </div>

            <AIButton label="Write my strengths" onClick={writeStrengths} loading={loading} />
        </div>
    );
}
