import React, { useState } from 'react';
import { CVData, Experience, Project } from '../../types';
import { AIButton } from '../WizardControls';
import { generateAIContent } from '../../services/gemini';
import { Trash2, Plus } from 'lucide-react';

interface StepProps {
  data: CVData;
  updateData: (data: Partial<CVData>) => void;
}

const ExperienceList: React.FC<{
  items: Experience[];
  onChange: (items: Experience[]) => void;
  type: 'work' | 'volunteer';
}> = ({ items, onChange, type }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const add = () => {
    onChange([...items, { id: Date.now().toString(), role: '', organization: '', dates: '', description: '', type }]);
  };

  const update = (id: string, field: keyof Experience, val: string) => {
    onChange(items.map(i => i.id === id ? { ...i, [field]: val } : i));
  };

  const remove = (id: string) => {
    onChange(items.filter(i => i.id !== id));
  };

  const aiAssist = async (item: Experience, mode: 'bullets' | 'professional') => {
    setLoadingId(item.id);
    try {
      const prompt = mode === 'bullets' 
        ? `The student has limited experience. Turn these notes into 2-3 simple bullet points using past tense and action verbs: "${item.description}". Keep language A2/B1.`
        : `Rewrite this experience description to be more professional but simple English: "${item.description}"`;
      
      const res = await generateAIContent(prompt);
      update(item.id, 'description', res);
    } catch(e) {}
    setLoadingId(null);
  };

  const starters = type === 'work' 
    ? ["Helped customers with...", "Assisted with...", "Worked with a team to..."]
    : ["Helped organize...", "Supported the...", "Volunteered at..."];

  return (
    <div className="space-y-6">
       {items.map((item, idx) => (
         <div key={item.id} className="p-4 border rounded-lg bg-white shadow-sm space-y-4 relative">
            <button onClick={() => remove(item.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
            <h3 className="font-medium text-slate-900">{type === 'work' ? 'Job' : 'Activity'} #{idx + 1}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <input className="p-2 border rounded" placeholder="Role / Title" value={item.role} onChange={e => update(item.id, 'role', e.target.value)} />
               <input className="p-2 border rounded" placeholder={type === 'work' ? "Company / Place" : "Event / Organization"} value={item.organization} onChange={e => update(item.id, 'organization', e.target.value)} />
               <input className="p-2 border rounded" placeholder="Dates (e.g. Jan 2023 - Present)" value={item.dates} onChange={e => update(item.id, 'dates', e.target.value)} />
            </div>
            <div>
                <textarea 
                    className="w-full h-24 p-2 border rounded" 
                    placeholder="What did you do?"
                    value={item.description}
                    onChange={e => update(item.id, 'description', e.target.value)}
                />
                <div className="mt-2 flex gap-2 flex-wrap">
                    {starters.map(s => (
                        <button key={s} onClick={() => update(item.id, 'description', item.description + (item.description ? ' ' : '') + s)} className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded-full hover:bg-indigo-100">
                            {s}
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex gap-2">
                <AIButton label="Give me bullet points" onClick={() => aiAssist(item, 'bullets')} loading={loadingId === item.id} />
                <AIButton label="Make professional" onClick={() => aiAssist(item, 'professional')} loading={loadingId === item.id} icon={false} />
            </div>
         </div>
       ))}
       <button onClick={add} className="flex items-center text-indigo-600 font-medium"><Plus className="w-4 h-4 mr-1"/> Add {type === 'work' ? 'Work' : 'Volunteer'} Experience</button>
    </div>
  );
};

export const StepWork: React.FC<StepProps> = ({ data, updateData }) => (
    <>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Work & Activity Experience</h2>
        <ExperienceList items={data.workExperience} onChange={i => updateData({ workExperience: i })} type="work" />
    </>
);

export const StepVolunteer: React.FC<StepProps> = ({ data, updateData }) => (
    <>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Volunteer Experience</h2>
        <ExperienceList items={data.volunteerExperience} onChange={i => updateData({ volunteerExperience: i })} type="volunteer" />
    </>
);

export const StepProjects: React.FC<StepProps> = ({ data, updateData }) => {
  const [loadingId, setLoadingId] = useState<string|null>(null);

  const add = () => updateData({ projects: [...data.projects, { id: Date.now().toString(), title: '', course: '', description: '', details: '' }] });
  const update = (id: string, field: keyof Project, val: string) => {
      updateData({ projects: data.projects.map(p => p.id === id ? { ...p, [field]: val } : p) });
  };
  const remove = (id: string) => updateData({ projects: data.projects.filter(p => p.id !== id) });

  const summarize = async (p: Project) => {
      setLoadingId(p.id);
      try {
          const prompt = `Write 2-3 bullet points describing this project: "${p.details}" and role. Focus on teamwork and responsibility. Simple English.`;
          const res = await generateAIContent(prompt);
          update(p.id, 'description', res);
      } catch(e) {}
      setLoadingId(null);
  };

  return (
      <div className="space-y-6">
          <h2 className="text-2xl font-bold text-slate-800">Academic Projects</h2>
          {data.projects.map((p, idx) => (
              <div key={p.id} className="p-4 border rounded-lg bg-white shadow-sm space-y-4 relative">
                  <button onClick={() => remove(p.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                  <h3 className="font-medium">Project #{idx+1}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input className="p-2 border rounded" placeholder="Project Title" value={p.title} onChange={e => update(p.id, 'title', e.target.value)} />
                      <input className="p-2 border rounded" placeholder="Course (Optional)" value={p.course} onChange={e => update(p.id, 'course', e.target.value)} />
                  </div>
                  <div>
                      <label className="block text-sm text-slate-600 mb-1">What did you do? (Rough notes)</label>
                      <textarea className="w-full h-20 p-2 border rounded" value={p.details} onChange={e => update(p.id, 'details', e.target.value)} placeholder="e.g. Worked in team of 4, designed slides..." />
                  </div>
                  <div>
                      <label className="block text-sm text-slate-600 mb-1">CV Description (Result)</label>
                      <textarea className="w-full h-24 p-2 border rounded bg-slate-50" value={p.description} onChange={e => update(p.id, 'description', e.target.value)} />
                  </div>
                  <AIButton label="Summarise Project" onClick={() => summarize(p)} loading={loadingId === p.id} />
              </div>
          ))}
          <button onClick={add} className="flex items-center text-indigo-600 font-medium"><Plus className="w-4 h-4 mr-1"/> Add Project</button>
      </div>
  );
};
