import React, { useState } from 'react';
import { CVData, Education } from '../../types';
import { AIButton } from '../WizardControls';
import { generateAIContent, checkEnglish } from '../../services/gemini';
import { Trash2, Plus, Camera, Upload } from 'lucide-react';

interface StepProps {
  data: CVData;
  updateData: (data: Partial<CVData>) => void;
}

// --- Step 1: Personal Info ---
export const StepPersonal: React.FC<StepProps> = ({ data, updateData }) => {
  const [loading, setLoading] = useState(false);

  const handleChange = (field: keyof typeof data.personalInfo, value: string) => {
    updateData({ personalInfo: { ...data.personalInfo, [field]: value } });
  };

  const handleAICheck = async () => {
    setLoading(true);
    try {
      const info = JSON.stringify(data.personalInfo);
      const prompt = `You are a CV assistant for A2-level ESL students. Check this JSON for spelling/capitalization errors. Return ONLY valid JSON. Input: ${info}`;
      const result = await generateAIContent(prompt);
      // Clean markdown code blocks if present
      const cleanJson = result.replace(/```json|```/g, '').trim();
      const corrected = JSON.parse(cleanJson);
      updateData({ personalInfo: { ...data.personalInfo, ...corrected } });
    } catch (e) {
      alert("Could not correct automatically. Please check your connection.");
    }
    setLoading(false);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Please choose a smaller photo (under 2MB).");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        updateData({ personalInfo: { ...data.personalInfo, photo: reader.result as string } });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    updateData({ personalInfo: { ...data.personalInfo, photo: undefined } });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h2 className="text-2xl font-bold text-slate-800">Personal Information</h2>
            <p className="text-slate-600">Tell us who you are.</p>
        </div>
      </div>
      
      {/* Photo Upload Section */}
      <div className="flex items-center gap-6 bg-white p-4 border border-slate-200 rounded-lg shadow-sm">
        <div className="relative group">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center overflow-hidden border-2 ${data.personalInfo.photo ? 'border-indigo-500' : 'border-slate-200 bg-slate-100'}`}>
            {data.personalInfo.photo ? (
              <img src={data.personalInfo.photo} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <Camera className="w-8 h-8 text-slate-400" />
            )}
          </div>
          {data.personalInfo.photo && (
              <button 
                onClick={removePhoto}
                className="absolute -top-1 -right-1 bg-red-500 text-white p-1 rounded-full shadow-sm hover:bg-red-600"
                title="Remove photo"
              >
                <Trash2 size={14} />
              </button>
          )}
        </div>
        
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Profile Photo (Optional)</label>
          <p className="text-xs text-slate-500 mb-3">Upload a professional photo of yourself.</p>
          <label className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer shadow-sm">
            <Upload className="w-4 h-4 mr-2" />
            Upload Photo
            <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input label="First Name" placeholder="e.g. Ahmed" value={data.personalInfo.firstName} onChange={v => handleChange('firstName', v)} />
        <Input label="Family Name" placeholder="e.g. Al Mansoori" value={data.personalInfo.lastName} onChange={v => handleChange('lastName', v)} />
        <Input label="Phone Number" placeholder="e.g. 050 123 4567" value={data.personalInfo.phone} onChange={v => handleChange('phone', v)} />
        <Input label="Email" placeholder="e.g. ahmed@example.com" value={data.personalInfo.email} onChange={v => handleChange('email', v)} />
        <Input label="City / Emirate" placeholder="e.g. Abu Dhabi" value={data.personalInfo.city} onChange={v => handleChange('city', v)} />
        <Input label="LinkedIn (Optional)" placeholder="linkedin.com/in/..." value={data.personalInfo.linkedin} onChange={v => handleChange('linkedin', v)} />
      </div>
      
      <div className="mt-4">
        <AIButton label="Check my English" onClick={handleAICheck} loading={loading} />
      </div>
    </div>
  );
};

// --- Step 2: Objective ---
export const StepObjective: React.FC<StepProps> = ({ data, updateData }) => {
  const [loading, setLoading] = useState(false);

  const handleIdeas = async () => {
    setLoading(true);
    try {
      const prompt = `The student is an A2-level English learner. Suggest a simple 3-sentence career objective for a college student in the UAE with limited experience. Use very simple vocabulary.`;
      const res = await generateAIContent(prompt);
      updateData({ objective: res });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleImprove = async () => {
    setLoading(true);
    try {
      const res = await checkEnglish(data.objective, "Career Objective");
      updateData({ objective: res });
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const addStarter = (text: string) => {
    updateData({ objective: data.objective + (data.objective ? ' ' : '') + text });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Career Objective</h2>
        <p className="text-slate-600 mt-2">Write 2–3 sentences about the job you want and why.</p>
      </div>

      <textarea
        className="w-full h-32 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        placeholder="I am a hard working student..."
        value={data.objective}
        onChange={(e) => updateData({ objective: e.target.value })}
      />

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">Sentence starters (click to add):</p>
        <div className="flex flex-wrap gap-2">
          {["I am a student at...", "I am interested in working as...", "I have skills in..."].map(s => (
            <button key={s} onClick={() => addStarter(s)} className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-sm hover:bg-indigo-100">
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <AIButton label="Give me ideas" onClick={handleIdeas} loading={loading} />
        <AIButton label="Improve my writing" onClick={handleImprove} loading={loading} />
      </div>
    </div>
  );
};

// --- Step 3: Education ---
export const StepEducation: React.FC<StepProps> = ({ data, updateData }) => {
  const [loading, setLoading] = useState(false);

  const addEdu = () => {
    const newEdu: Education = { id: Date.now().toString(), institution: '', program: '', graduationYear: '', courses: '' };
    updateData({ education: [...data.education, newEdu] });
  };

  const updateEdu = (id: string, field: keyof Education, val: string) => {
    updateData({
      education: data.education.map(e => e.id === id ? { ...e, [field]: val } : e)
    });
  };

  const removeEdu = (id: string) => {
    updateData({ education: data.education.filter(e => e.id !== id) });
  };

  const suggestSentence = async (edu: Education) => {
    setLoading(true);
    try {
      const prompt = `Write 1 simple CV line describing this education: ${edu.program} at ${edu.institution}. Use A2/B1 English.`;
      const res = await generateAIContent(prompt);
      updateEdu(edu.id, 'courses', res); // Putting suggestion in description/courses field
    } catch(e) {}
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-800">Education</h2>
      
      {data.education.map((edu, idx) => (
        <div key={edu.id} className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm space-y-4 relative">
          <div className="absolute top-4 right-4">
            <button onClick={() => removeEdu(edu.id)} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>
          </div>
          <h3 className="font-medium text-slate-900">School / College #{idx + 1}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="College Name" value={edu.institution} onChange={v => updateEdu(edu.id, 'institution', v)} />
            <Input label="Program / Major" value={edu.program} onChange={v => updateEdu(edu.id, 'program', v)} />
            <Input label="Graduation Year" placeholder="e.g. 2025" value={edu.graduationYear} onChange={v => updateEdu(edu.id, 'graduationYear', v)} />
            <Input label="Key Courses (or Description)" value={edu.courses} onChange={v => updateEdu(edu.id, 'courses', v)} />
          </div>
          <AIButton label="Suggest a description" onClick={() => suggestSentence(edu)} loading={loading} />
        </div>
      ))}

      <button onClick={addEdu} className="flex items-center text-indigo-600 font-medium hover:text-indigo-800">
        <Plus className="w-4 h-4 mr-1" /> Add Education
      </button>
      
      {/* Preview Example */}
      <div className="bg-slate-50 p-4 rounded text-sm text-slate-600 border border-slate-200">
        <span className="font-bold">Example:</span> 2023–Present – Higher Colleges of Technology – Diploma in Applied Media
      </div>
    </div>
  );
};

// --- Step 9: Languages ---
export const StepLanguages: React.FC<StepProps> = ({ data, updateData }) => {
    const [loading, setLoading] = useState(false);

    const checkLangs = async () => {
        setLoading(true);
        try {
           const prompt = `Format this language list for a CV. Native: ${data.languages.native}. English: ${data.languages.englishLevel}. Other: ${data.languages.other}. Return a simple summary string.`;
           const res = await generateAIContent(prompt);
           updateData({ languages: { ...data.languages, other: res } }); 
        } catch(e){}
        setLoading(false);
    };

    return (
        <div className="space-y-6">
             <h2 className="text-2xl font-bold text-slate-800">Languages</h2>
             <div className="grid gap-4 max-w-md">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Native Language</label>
                    <input 
                        type="text" 
                        value={data.languages.native} 
                        onChange={(e) => updateData({ languages: {...data.languages, native: e.target.value}})}
                        className="w-full p-2 border border-slate-300 rounded"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">English Level</label>
                    <select 
                        value={data.languages.englishLevel}
                        onChange={(e) => updateData({ languages: {...data.languages, englishLevel: e.target.value}})}
                        className="w-full p-2 border border-slate-300 rounded"
                    >
                        <option value="A2">A2 (Elementary)</option>
                        <option value="A2+">A2+ (Pre-Intermediate)</option>
                        <option value="B1">B1 (Intermediate)</option>
                        <option value="B2">B2 (Upper Intermediate)</option>
                    </select>
                 </div>
                 <Input label="Other Languages" placeholder="e.g. French (Basic)" value={data.languages.other} onChange={(v) => updateData({ languages: {...data.languages, other: v}})} />
             </div>
             <AIButton label="Check Format" onClick={checkLangs} loading={loading} />
        </div>
    )
}


// Helper UI Component
const Input = ({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) => (
  <div className="flex flex-col">
    <label className="text-sm font-medium text-slate-700 mb-1">{label}</label>
    <input
      className="px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);