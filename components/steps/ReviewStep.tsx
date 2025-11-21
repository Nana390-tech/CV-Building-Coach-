import React, { useState } from 'react';
import { CVData } from '../../types';
import { generateAIContent } from '../../services/gemini';
import { AIButton } from '../WizardControls';
import { CheckCircle2, Download } from 'lucide-react';
import jsPDF from 'jspdf';

interface StepProps {
  data: CVData;
  updateData: (data: Partial<CVData>) => void;
}

export const StepReview: React.FC<StepProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [aiFeedback, setAiFeedback] = useState<string>('');

  const handleFullCheck = async () => {
    setLoading(true);
    try {
      // Exclude photo base64 from prompt to save tokens/avoid errors
      const { photo, ...infoWithoutPhoto } = data.personalInfo;
      const fullCV = JSON.stringify({ ...data, personalInfo: infoWithoutPhoto }, null, 2);
      const prompt = `You are a CV editor for A2/B1 ESL students. Review this CV data. 
      Provide a list of 3-5 specific, encouraging improvements. Do not rewrite the whole thing, just give advice.
      Data: ${fullCV}`;
      const res = await generateAIContent(prompt);
      setAiFeedback(res);
    } catch (e) {
      setAiFeedback("Could not connect to AI.");
    }
    setLoading(false);
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    const lineHeight = 7;
    const margin = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    const addText = (text: string, fontSize = 10, isBold = false) => {
      doc.setFontSize(fontSize);
      doc.setFont("helvetica", isBold ? "bold" : "normal");
      
      // Handle multi-line text
      const splitText = doc.splitTextToSize(text, 170);
      doc.text(splitText, margin, y);
      y += (splitText.length * lineHeight) + 2;
      
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    };

    // Photo
    if (data.personalInfo.photo) {
      try {
        // Add photo to top right: x, y, w, h
        doc.addImage(data.personalInfo.photo, 'JPEG', pageWidth - 50, 15, 30, 30);
      } catch (e) {
        console.error("Error adding image to PDF", e);
      }
    }

    // Header
    addText(`${data.personalInfo.firstName} ${data.personalInfo.lastName}`, 22, true);
    addText(`${data.personalInfo.city} | ${data.personalInfo.phone} | ${data.personalInfo.email}`, 10);
    if (data.personalInfo.linkedin) {
        addText(data.personalInfo.linkedin, 10);
    }
    y += 5;
    
    // Ensure we clear the image height if it was added
    if (data.personalInfo.photo && y < 50) {
       y = 50;
    }
    
    // Objective
    if (data.objective) {
        addText("OBJECTIVE", 14, true);
        addText(data.objective);
        y += 5;
    }

    // Education
    if (data.education.length > 0) {
        addText("EDUCATION", 14, true);
        data.education.forEach(edu => {
            addText(`${edu.institution}, ${edu.program} (${edu.graduationYear})`, 11, true);
            if (edu.courses) addText(edu.courses);
            y += 2;
        });
        y += 3;
    }

    // Experience
    if (data.workExperience.length > 0) {
        addText("EXPERIENCE", 14, true);
        data.workExperience.forEach(exp => {
            addText(`${exp.role} at ${exp.organization} | ${exp.dates}`, 11, true);
            addText(exp.description);
            y += 2;
        });
        y += 3;
    }

    // Skills
    if (data.skills.technical.length > 0 || data.skills.soft.length > 0) {
        addText("SKILLS", 14, true);
        if (data.skills.technical.length > 0) addText("Technical: " + data.skills.technical.join(", "));
        if (data.skills.soft.length > 0) addText("Soft Skills: " + data.skills.soft.join(", "));
        if (data.skills.other) addText(data.skills.other);
        y += 5;
    }

    // Strengths
    if (data.strengths.length > 0) {
        addText("STRENGTHS", 14, true);
        data.strengths.forEach(s => addText("• " + s));
        y += 5;
    }

    doc.save('My_CV.pdf');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 h-full">
      {/* Checklist Side */}
      <div className="w-full lg:w-1/3 space-y-6">
        <h2 className="text-2xl font-bold text-slate-800">Final Review</h2>
        <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
          <h3 className="font-bold mb-4">Section Check</h3>
          <ul className="space-y-2">
            {[
              { label: "Personal Info", valid: !!data.personalInfo.firstName },
              { label: "Objective", valid: !!data.objective },
              { label: "Education", valid: data.education.length > 0 },
              { label: "Skills", valid: data.skills.technical.length > 0 || data.skills.soft.length > 0 },
              { label: "Experience", valid: data.workExperience.length > 0 || data.volunteerExperience.length > 0 },
            ].map((item, i) => (
              <li key={i} className="flex items-center text-sm">
                <CheckCircle2 className={`w-4 h-4 mr-2 ${item.valid ? 'text-green-500' : 'text-slate-300'}`} />
                <span className={item.valid ? 'text-slate-700' : 'text-slate-400'}>{item.label}</span>
              </li>
            ))}
          </ul>
        </div>

        <AIButton label="Ask AI to check my whole CV" onClick={handleFullCheck} loading={loading} />
        
        {aiFeedback && (
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 text-sm text-purple-800">
            <h4 className="font-bold mb-2">AI Suggestions:</h4>
            <pre className="whitespace-pre-wrap font-sans">{aiFeedback}</pre>
          </div>
        )}

        <button 
          onClick={downloadPDF}
          className="w-full flex justify-center items-center px-4 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition-colors"
        >
          <Download className="w-5 h-5 mr-2" /> Download PDF
        </button>
      </div>

      {/* Preview Side */}
      <div className="w-full lg:w-2/3 bg-white border border-slate-200 shadow-lg min-h-[600px] p-8 font-serif">
        <div className="flex justify-between items-start border-b pb-6 mb-6">
            <div className="flex-1">
                <h1 className="text-3xl font-bold uppercase text-slate-900">{data.personalInfo.firstName} {data.personalInfo.lastName}</h1>
                <div className="text-slate-600 mt-2 space-y-1">
                    <p>{data.personalInfo.city}</p>
                    <p>{data.personalInfo.phone}</p>
                    <p>{data.personalInfo.email}</p>
                    {data.personalInfo.linkedin && <p className="text-slate-500 text-sm">{data.personalInfo.linkedin}</p>}
                </div>
            </div>
            {data.personalInfo.photo && (
                <img 
                    src={data.personalInfo.photo} 
                    alt="Profile" 
                    className="w-32 h-32 object-cover rounded border border-slate-200 shadow-sm ml-4"
                />
            )}
        </div>

        {data.objective && (
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 mb-2">Objective</h3>
            <p className="text-slate-700 leading-relaxed">{data.objective}</p>
          </div>
        )}

        {data.education.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 mb-2">Education</h3>
            {data.education.map((edu, i) => (
              <div key={i} className="mb-3">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{edu.institution}</span>
                  <span>{edu.graduationYear}</span>
                </div>
                <div className="text-slate-700 italic">{edu.program}</div>
                <p className="text-slate-600 text-sm">{edu.courses}</p>
              </div>
            ))}
          </div>
        )}

        {(data.workExperience.length > 0 || data.volunteerExperience.length > 0) && (
           <div className="mb-6">
             <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 mb-2">Experience</h3>
             {[...data.workExperience, ...data.volunteerExperience].map((exp, i) => (
               <div key={i} className="mb-4">
                 <div className="flex justify-between font-bold text-slate-800">
                    <span>{exp.role}</span>
                    <span>{exp.dates}</span>
                 </div>
                 <div className="text-slate-700 italic">{exp.organization}</div>
                 <p className="text-slate-600 text-sm mt-1 whitespace-pre-line">{exp.description}</p>
               </div>
             ))}
           </div>
        )}

        <div className="mb-6">
           <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 mb-2">Skills</h3>
           <div className="flex flex-wrap gap-2">
             {[...data.skills.technical, ...data.skills.soft].map((s, i) => (
               <span key={i} className="bg-slate-100 px-2 py-1 rounded text-sm text-slate-700">{s}</span>
             ))}
           </div>
           {data.skills.other && <p className="text-slate-600 text-sm mt-2 whitespace-pre-line">{data.skills.other}</p>}
        </div>
        
        {data.strengths.length > 0 && (
             <div className="mb-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-300 mb-2">Key Strengths</h3>
                <ul className="list-disc pl-5 text-slate-700 text-sm">
                    {data.strengths.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
             </div>
        )}
      </div>
    </div>
  );
};