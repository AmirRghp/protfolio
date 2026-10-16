export type PortfolioContent = {
  owner: {
    name: string;
    role: string;
    experience: {
      company: string;
      title: string;
      period: string;
    }[];
  };
  projects: {
    id: string;
    title: string;
    brief: string;
    githubUrl: `https://github.com/${string}`;
  }[];
};

export const portfolioContent: PortfolioContent = {
  owner: {
    name: "Amirreza Gholipour",
    role: "AI Engineer",
    experience: [
      {
        company: "Daraei360",
        title: "AI Engineer",
        period: "October 2025 – May 2026",
      },
      {
        company: "Daraei360",
        title: "Product Manager",
        period: "May 2026 – September 2026",
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
    },
    {
      id: "laya-finetuning-pipeline",
      title: "Laya Fine-tuning Pipeline",
      brief:
        "A reproducible pipeline for preparing Persian RAG data and fine-tuning and evaluating the Laya Multilingual decision model. It uses Laya's training API; saved run timings are historical estimates, not a current benchmark.",
      githubUrl: "https://github.com/AmirRghp/laya-finetune",
    },
    {
      id: "freelance-project-radar",
      title: "Freelance Project Radar",
      brief:
        "A backend that collects public freelance listings, normalizes and deduplicates them, ranks matches against a freelancer profile, and can send Telegram alerts. Demo mode works offline; live public-page adapters are best-effort and disabled by default.",
      githubUrl: "https://github.com/AmirRghp/freelance-project-radar",
    },
  ],
};
