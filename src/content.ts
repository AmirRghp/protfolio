export type ProjectIcon = "chat" | "layers" | "radar";

export type ExperienceItem = {
  company: string;
  companyNote?: string;
  title: string;
  roleNote?: string;
  period: string;
  location: string;
  highlights: string[];
};

export type EducationItem = {
  degree: string;
  field: string;
  institution: string;
  period: string;
};

export type CourseItem = {
  title: string;
  provider: string;
  year: string;
  duration: string;
};

export type SkillGroup = {
  category: string;
  skills: {
    name: string;
    level?: string;
  }[];
};

export type AcademicProjectItem = {
  title: string;
  year: string;
  category: string;
  summary: string;
};

export type VolunteerItem = {
  role: string;
  organization: string;
  year: string;
};

export type PortfolioContent = {
  owner: {
    name: string;
    role: string;
    headline: string;
    location: string;
    email: string;
    phone: string;
    githubUrl: `https://github.com/${string}`;
    resumeUrl: string;
    bio: string;
    languages: {
      language: string;
      proficiency: string;
    }[];
    metrics: {
      value: string;
      label: string;
    }[];
    experience: ExperienceItem[];
    education: EducationItem[];
    skillGroups: SkillGroup[];
    courses: CourseItem[];
    academicProjects: AcademicProjectItem[];
    volunteer: VolunteerItem[];
  };
  projects: {
    id: string;
    title: string;
    brief: string;
    githubUrl: `https://github.com/${string}`;
    /** Optional project website. The GitHub repository stays the fallback target. */
    websiteUrl?: `https://${string}`;
    /** Short feature labels shown on the desktop app of the project. */
    highlights?: string[];
    icon: ProjectIcon;
  }[];
};

/** The address of a project: its website when it has one, the GitHub repository otherwise. */
export function projectTarget(project: PortfolioContent["projects"][number]): string {
  return project.websiteUrl ?? project.githubUrl;
}

export const portfolioContent: PortfolioContent = {
  owner: {
    name: "Amirreza Gholipour",
    role: "AI Engineer",
    headline: "Machine Learning Engineer · M.Sc. in Artificial Intelligence & Robotics",
    location: "Babol, Mazandaran, Iran",
    email: "amirreza.gh0094@gmail.com",
    phone: "09001110554",
    githubUrl: "https://github.com/AmirRghp",
    resumeUrl: "/assets/aistudio/_______________-en_e3282018.pdf",
    bio: "First and foremost, I have always loved challenging and distinctive work. That curiosity drew me into artificial intelligence and machine learning and shaped my career path. Currently, I work as a machine learning engineer developing data-driven solutions to solve real-world problems with modern ML and generative AI models. Alongside continuous learning, collaborative teamwork is one of my favorite parts of engineering—the strongest results happen when team members bring their knowledge, experience, and perspectives together toward a shared goal.",
    languages: [
      { language: "English", proficiency: "Upper Intermediate" },
      { language: "Persian", proficiency: "Native" },
    ],
    metrics: [
      { value: "M.Sc.", label: "AI & Robotics at MUST" },
      { value: "Daraei360", label: "AI Engineer & Product Manager" },
      { value: "9+ Projects", label: "Applied AI, RAG & Vision" },
      { value: "ICSPIS 2025", label: "Executive Committee" },
    ],
    experience: [
      {
        company: "Daraei360",
        companyNote: "dadehnegareghtesad",
        title: "Product Manager",
        period: "May 2026 – September 2026",
        location: "Babol, Iran",
        highlights: [
          "Implemented practical, high-impact product features tailored to real user workflows.",
          "Conducted structured competitor analysis to guide roadmap prioritization.",
          "Analyzed Microsoft Clarity, PostHog, and Metabase telemetry for behavioral user insights.",
          "Defined, scoped, and managed engineering tasks for the IT team in Jira.",
          "Partnered directly with customer relations and support teams to resolve user issues rapidly.",
        ],
      },
      {
        company: "Daraei360",
        companyNote: "dadehnegareghtesad",
        title: "AI Engineer",
        roleNote: "AI Developer",
        period: "October 2025 – May 2026",
        location: "Babolsar, Iran",
        highlights: [
          "Designed and deployed data-driven machine learning and generative AI workflows.",
          "Built retrieval-augmented generation (RAG), fine-tuning, and intelligent automation pipelines.",
          "Integrated backend AI services using Python, FastAPI, vector databases, and modern LLM frameworks.",
        ],
      },
    ],
    education: [
      {
        degree: "Master of Science",
        field: "Artificial Intelligence and Robotics",
        institution: "Mazandaran University of Science and Technology",
        period: "2024 – Present",
      },
      {
        degree: "Bachelor of Science",
        field: "Software Engineering",
        institution: "Mazandaran University of Science and Technology",
        period: "2019 – 2024",
      },
    ],
    skillGroups: [
      {
        category: "AI, Machine Learning & GenAI",
        skills: [
          { name: "Python", level: "Intermediate" },
          { name: "PyTorch" },
          { name: "TensorFlow" },
          { name: "Keras", level: "Intermediate" },
          { name: "OpenCV", level: "Intermediate" },
          { name: "Retrieval-Augmented Generation (RAG)" },
          { name: "Model Fine-Tuning" },
          { name: "LangChain" },
          { name: "LangGraph" },
          { name: "MCP (Model Context Protocol)" },
          { name: "AI Prompt Engineering" },
          { name: "Qdrant" },
          { name: "MATLAB", level: "Basic" },
        ],
      },
      {
        category: "Backend, Data & Infrastructure",
        skills: [
          { name: "FastAPI", level: "Intermediate" },
          { name: "REST API", level: "Basic" },
          { name: "PostgreSQL", level: "Intermediate" },
          { name: "MySQL", level: "Intermediate" },
          { name: "Microsoft SQL Server", level: "Intermediate" },
          { name: "Redis", level: "Basic" },
          { name: "Apache Kafka", level: "Basic" },
          { name: "Docker", level: "Intermediate" },
          { name: "Linux", level: "Intermediate" },
          { name: "Git & GitLab", level: "Intermediate" },
          { name: "N8N Workflow Automation" },
          { name: "Aiogram & Telegram Bot API" },
        ],
      },
      {
        category: "Product Analytics & Frontend",
        skills: [
          { name: "PostHog" },
          { name: "Metabase" },
          { name: "Microsoft Clarity" },
          { name: "Jira", level: "Intermediate" },
          { name: "HTML & CSS", level: "Intermediate" },
          { name: "React", level: "Basic" },
          { name: "Next.js", level: "Basic" },
          { name: "JavaScript", level: "Basic" },
          { name: "PyQt5" },
          { name: "Unit Testing", level: "Basic" },
          { name: "Selenium", level: "Basic" },
          { name: "Postman", level: "Basic" },
        ],
      },
    ],
    courses: [
      {
        title: "Machine Learning Specialization",
        provider: "Coursera",
        year: "2025",
        duration: "1 month",
      },
      {
        title: "Unsupervised Learning, Recommenders, Reinforcement Learning",
        provider: "Coursera",
        year: "2025",
        duration: "1 month",
      },
      {
        title: "Advanced Learning Algorithms",
        provider: "Coursera",
        year: "2025",
        duration: "1 month",
      },
      {
        title: "Generative AI Complete Bootcamp — NLP, Transformers & Gen AI",
        provider: "Udemy",
        year: "2025",
        duration: "1 month",
      },
      {
        title: "PyTorch for Deep Learning Bootcamp",
        provider: "Udemy",
        year: "2025",
        duration: "2 months",
      },
    ],
    academicProjects: [
      {
        title: "Project Management Kanban Board with an AI Assistant",
        year: "2026",
        category: "AI Product Engineering",
        summary: "Interactive project management Kanban workspace integrated with an AI assistant for task breakdown and workflow automation.",
      },
      {
        title: "Covid-19 Detection from Radiology Images",
        year: "2025",
        category: "Computer Vision & Ensemble ML",
        summary: "Ensemble classification pipeline detecting Covid-19 patterns from chest radiology imaging.",
      },
      {
        title: "Cryptocurrency & Global Gold Price Forecasting",
        year: "2025",
        category: "Time-Series Forecasting",
        summary: "Predictive machine learning models for forecasting cryptocurrency markets and global gold prices.",
      },
      {
        title: "AI-Powered Telegram Bot for Social Media Analysis",
        year: "2025",
        category: "NLP & Bot Automation",
        summary: "Telegram bot connected to AI models for automated social media trend and content analysis.",
      },
      {
        title: "AI-Based Image Recognition for KYC Identity Verification",
        year: "2025",
        category: "Computer Vision & Security",
        summary: "Automated image recognition pipeline designed for Know Your Customer (KYC) identity verification.",
      },
    ],
    volunteer: [
      {
        role: "Executive Committee Member",
        organization: "The 11th International Conference on Signal Processing and Intelligent Systems (ICSPIS 2025)",
        year: "2026",
      },
    ],
  },
  projects: [
    {
      id: "enterprise-knowledge-copilot",
      title: "Enterprise Knowledge Copilot",
      brief:
        "A self-hosted assistant that retrieves from authorized documents and answers with source links and verified quotes. It includes manager tools for accounts and documents. Citation checks confirm quote support, not the semantic correctness of every model answer.",
      githubUrl: "https://github.com/AmirRghp/enterprise-knowledge-copilot",
      highlights: ["Authorized documents", "Source links", "Verified quotes"],
      icon: "chat",
    },
    {
      id: "laya-finetuning-pipeline",
      title: "Laya Fine-tuning Pipeline",
      brief:
        "A reproducible pipeline for preparing Persian RAG data and fine-tuning and evaluating the Laya Multilingual decision model. It uses Laya's training API; saved run timings are historical estimates, not a current benchmark.",
      githubUrl: "https://github.com/AmirRghp/laya-finetune",
      highlights: ["Persian RAG data", "Model fine-tuning", "Evaluation"],
      icon: "layers",
    },
    {
      id: "freelance-project-radar",
      title: "Freelance Project Radar",
      brief:
        "A backend that collects public freelance listings, normalizes and deduplicates them, ranks matches against a freelancer profile, and can send Telegram alerts. Demo mode works offline; live public-page adapters are best-effort and disabled by default.",
      githubUrl: "https://github.com/AmirRghp/freelance-project-radar",
      highlights: ["Listing collection", "Match ranking", "Telegram alerts"],
      icon: "radar",
    },
  ],
};
