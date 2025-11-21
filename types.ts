export interface Education {
  id: string;
  institution: string;
  program: string;
  graduationYear: string;
  courses: string;
}

export interface Experience {
  id: string;
  role: string;
  organization: string;
  dates: string;
  description: string;
  type: 'work' | 'volunteer';
}

export interface Project {
  id: string;
  title: string;
  course: string;
  description: string;
  details: string;
}

export interface CVData {
  personalInfo: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    city: string;
    linkedin: string;
    photo?: string; // Base64 string
  };
  objective: string;
  education: Education[];
  skills: {
    technical: string[];
    soft: string[];
    other: string;
  };
  workExperience: Experience[];
  volunteerExperience: Experience[];
  projects: Project[];
  achievements: string[];
  languages: {
    native: string;
    englishLevel: string;
    other: string;
  };
  hobbies: {
    selected: string[];
    other: string;
    description: string;
  };
  strengths: string[];
}

export const INITIAL_CV_DATA: CVData = {
  personalInfo: { firstName: '', lastName: '', phone: '', email: '', city: '', linkedin: '' },
  objective: '',
  education: [],
  skills: { technical: [], soft: [], other: '' },
  workExperience: [],
  volunteerExperience: [],
  projects: [],
  achievements: [],
  languages: { native: 'Arabic', englishLevel: 'A2', other: '' },
  hobbies: { selected: [], other: '', description: '' },
  strengths: [],
};

export const STEPS = [
  "Personal Info", "Objective", "Education", "Skills", 
  "Experience", "Volunteer", "Projects", "Achievements", 
  "Languages", "Hobbies", "Strengths", "Review"
];