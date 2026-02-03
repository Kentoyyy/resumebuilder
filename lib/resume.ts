export type ResumeBasics = {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  summary: string;
  photoUrl?: string;
};

export type ResumeExperience = {
  id: string;
  company: string;
  role: string;
  location: string;
  start: string;
  end: string;
  bullets: string;
};

export type ResumeEducation = {
  id: string;
  school: string;
  degree: string;
  location: string;
  start: string;
  end: string;
  details: string;
};

export type ResumeCertificate = {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link: string;
  details: string;
};

export type ResumeReference = {
  id: string;
  name: string;
  relationship: string;
  email: string;
  phone: string;
  details: string;
};

export type ResumeData = {
  basics: ResumeBasics;
  experience: ResumeExperience[];
  education: ResumeEducation[];
  certificates: ResumeCertificate[];
  references: ResumeReference[];
  skills: string;
};

export function newId(prefix = "id") {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(
    16
  )}`;
}

export const defaultResume: ResumeData = {
  basics: {
    fullName: "Your Name",
    title: "Role / Headline",
    email: "you@email.com",
    phone: "+63",
    location: "City, Country",
    website: "yourwebsite.com",
    linkedin: "linkedin.com/in/you",
    summary:
      "Concise 2–3 lines: your focus, strengths, and what you’re looking for.",
    photoUrl: "",
  },
  experience: [
    {
      id: "exp_1",
      company: "Company Name",
      role: "Job Title",
      location: "City, Country",
      start: "2024",
      end: "Present",
      bullets:
        "• Shipped X that improved Y by Z%\n• Led A, collaborated with B, delivered C\n• Built D using E, resulting in F",
    },
  ],
  education: [
    {
      id: "edu_1",
      school: "University Name",
      degree: "Degree, Major",
      location: "City, Country",
      start: "2020",
      end: "2024",
      details: "GPA (optional) • Honors • Relevant coursework",
    },
  ],
  certificates: [
    {
      id: "cert_1",
      name: "Certification Name",
      issuer: "Issuing Organization",
      date: "2025",
      link: "",
      details: "Short description or credential ID (optional).",
    },
  ],
  references: [
    {
      id: "ref_1",
      name: "Referee Name",
      relationship: "Manager / Professor",
      email: "referee@email.com",
      phone: "+63",
      details: "Optional: only if you want to include references.",
    },
  ],
  skills: "JavaScript, TypeScript, React, Next.js, Tailwind, Node.js",
};


