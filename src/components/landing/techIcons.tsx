import type { ReactNode } from "react";

export function TechIcon({ name }: { name: string }): ReactNode {
  switch (name) {
    case "JavaScript":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#F7DF1E" />
          <path d="M7 17.5c.8.5 1.7.8 2.6.8 1.4 0 2.2-.7 2.2-2.1v-7.2h-2.1v7.1c0 .6-.3.9-.9.9-.4 0-.8-.1-1.2-.3l-.6 1.8zm7.3-.2c.9.6 2 .9 3.2.9 2.5 0 3.9-1.4 3.9-3.4 0-1.9-1.1-2.8-2.8-3.6l-.8-.4c-1-.5-1.5-.9-1.5-1.7 0-.7.6-1.3 1.6-1.3.8 0 1.5.3 2 .6l.6-1.6c-.7-.4-1.6-.6-2.5-.6-2.3 0-3.7 1.4-3.7 3.3 0 1.8 1.1 2.7 2.6 3.4l.8.4c1.1.5 1.7 1 1.7 1.9 0 .9-.8 1.5-1.9 1.5-1 0-1.9-.4-2.5-.8l-.6 1.7z" fill="#000000" />
        </svg>
      );
    case "TypeScript":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#3178C6" />
          <path d="M12.5 9.2H6.8v2.3h1.7v6.5h2.3v-6.5h1.7V9.2zm3.8 4.2c.9.5 1.8.8 2.7.8 1.2 0 1.9-.5 1.9-1.4 0-2-3.7-1.3-3.7-4.1 0-1.8 1.4-3.1 3.8-3.1 1.1 0 2.1.3 2.9.8l-.7 2c-.7-.4-1.4-.6-2.2-.6-1.1 0-1.7.5-1.7 1.2 0 1.9 3.7 1.2 3.7 4.1 0 1.9-1.4 3.2-4.1 3.2-1.3 0-2.4-.3-3.3-.9l.7-2z" fill="#ffffff" />
        </svg>
      );
    case "Python":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M11.9 2c-5.2 0-4.9 2.3-4.9 2.3l.1 2.4h5v.7H5.2S2 7 2 12.2s2.8 5 2.8 5h1.7v-2.4s-.1-2.9 2.8-2.9h4.8s2.7.1 2.7-2.6V4.6s.4-2.6-4.9-2.6zm-2.7 1.6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" fill="#387EB8" />
          <path d="M12.1 22c5.2 0 4.9-2.3 4.9-2.3l-.1-2.4h-5v-.7h6.9s3.2.4 3.2-4.8-2.8-5-2.8-5h-1.7v2.4s.1 2.9-2.8 2.9H9.9s-2.7-.1-2.7 2.6v4.7s-.4 2.6 4.9 2.6zm2.7-1.6a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" fill="#FFE873" />
        </svg>
      );
    case "C++":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#00599C" />
          <path d="M11.5 8.2a4.4 4.4 0 0 0-4.2 4.4c0 2.5 1.9 4.4 4.2 4.4 1.7 0 2.8-.7 3.4-1.5l-1.3-1c-.5.6-1.2 1-2.1 1-1.6 0-2.8-1.3-2.8-2.9 0-1.6 1.2-2.9 2.8-2.9.9 0 1.6.4 2.1 1l1.3-1c-.6-.8-1.7-1.5-3.4-1.5zm4.8 3.5h.9v-.9h.8v.9h.9v.8h-.9v.9h-.8v-.9h-.9v-.8zm3.2 0h.9v-.9h.8v.9h.9v.8h-.9v.9h-.8v-.9h-.9v-.8z" fill="#FFFFFF" />
        </svg>
      );
    case "HTML & CSS":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M3 2l1.6 18.2L12 23l7.4-2.8L21 2H3zm14.8 5.6H8.2l.2 2.8h9l-.6 6.7-4.8 1.4-4.8-1.4-.3-3.6h2.4l.2 1.8 2.5.7 2.5-.7.3-3H6.2L5.5 4.8h12.5l-.2 2.8z" fill="#E44D26" />
        </svg>
      );
    case "MATLAB":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M2 17.5L8.5 4l3.8 8.7L18 8l4 9.5-6.2-2.6-3.7 4.1-3.6-7.5L4.5 18z" fill="#D13B00" />
        </svg>
      );
    case "React":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <ellipse cx="12" cy="12" rx="10" ry="3.8" fill="none" stroke="#61DAFB" strokeWidth="1.4" />
          <ellipse cx="12" cy="12" rx="10" ry="3.8" transform="rotate(60 12 12)" fill="none" stroke="#61DAFB" strokeWidth="1.4" />
          <ellipse cx="12" cy="12" rx="10" ry="3.8" transform="rotate(120 12 12)" fill="none" stroke="#61DAFB" strokeWidth="1.4" />
          <circle cx="12" cy="12" r="1.8" fill="#61DAFB" />
        </svg>
      );
    case "Next.js":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 7.5v9h2.2l6.8-9h-2.2L9.8 15V7.5H9z" />
        </svg>
      );
    case "Tailwind CSS":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M12 6c-3.6 0-5.8 1.8-6.6 5.4 1.3-1.8 2.8-2.4 4.5-1.9.9.3 1.6 1 2.3 1.8 1.2 1.3 2.6 2.7 5.8 2.7 3.6 0 5.8-1.8 6.6-5.4-1.3 1.8-2.8 2.4-4.5 1.9-.9-.3-1.6-1-2.3-1.8-1.2-1.3-2.6-2.7-5.8-2.7zm-6.6 6c-3.6 0-5.8 1.8-6.6 5.4 1.3-1.8 2.8-2.4 4.5-1.9.9.3 1.6 1 2.3 1.8 1.2 1.3 2.6 2.7 5.8 2.7 3.6 0 5.8-1.8 6.6-5.4-1.3 1.8-2.8 2.4-4.5 1.9-.9-.3-1.6-1-2.3-1.8-1.2-1.3-2.6-2.7-5.8-2.7z" fill="#06B6D4" />
        </svg>
      );
    case "GSAP":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#0AE448" />
          <path d="M7 12a5 5 0 1 0 8.5-3.5L14 10a3 3 0 1 1-3.5 2H12v-2H7v2z" fill="#000000" />
        </svg>
      );
    case "Framer Motion":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <path d="M4 2h16v8l-8 8v6l-8-8V2zm8 8l8-8H4l8 8z" />
        </svg>
      );
    case "PyQt":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#41CD52" />
          <text x="12" y="16" fill="#FFFFFF" fontSize="11" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Qt</text>
        </svg>
      );
    case "Node.js":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M12 2l9 5.2v10.4L12 22.8 3 17.6V7.2L12 2z" fill="#539E43" />
          <path d="M12 4.5l6.5 3.8v7.4L12 19.5 5.5 15.7V8.3L12 4.5z" fill="#333333" />
        </svg>
      );
    case "FastAPI":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#05998B" />
          <path d="M13.2 5L7 13.5h4.2L9.8 19l7.2-9.5h-4.2L13.2 5z" fill="#FFFFFF" />
        </svg>
      );
    case "Express.js":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <text x="12" y="16" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="monospace">ex</text>
        </svg>
      );
    case "REST APIs":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <text x="12" y="16.5" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">&#123;&nbsp;&#125;</text>
        </svg>
      );
    case "Socket.IO":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#010101" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          <path d="M13 4L6 14h5l-1 6 7-10h-5l1-6z" fill="#FFFFFF" />
        </svg>
      );
    case "Apache Kafka":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <circle cx="12" cy="6" r="2.5" fill="#E44D26" />
          <circle cx="6" cy="16" r="2.5" fill="#E44D26" />
          <circle cx="18" cy="16" r="2.5" fill="#E44D26" />
          <path d="M12 8.5l-4.5 5.5m9 0L12 8.5" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    case "N8N":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#EA4B71" />
          <circle cx="7" cy="12" r="2.5" fill="#FFFFFF" />
          <circle cx="17" cy="8" r="2.5" fill="#FFFFFF" />
          <circle cx="17" cy="16" r="2.5" fill="#FFFFFF" />
          <path d="M9.5 12h5m-2.5-3.5L14.5 12l-2.5 3.5" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
        </svg>
      );
    case "Telegram Bot":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="12" cy="12" r="10.5" fill="#229ED9" />
          <path d="M17.8 7.3l-2.3 10.8c-.2.7-.6.9-1.2.6l-3.5-2.6-1.7 1.6c-.2.2-.4.4-.7.4l.2-3.6 6.6-6c.3-.3-.1-.4-.4-.2L8.6 13.3 5.1 12.2c-.7-.2-.7-.7.2-1l13.6-5.2c.6-.2 1.2.2.9 1.3z" fill="#FFFFFF" />
        </svg>
      );
    case "JWT":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#D63AFF" />
          <path d="M8 8l8 8m0-8l-8 8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "Passport":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <path d="M7 5l-4 7 4 7h10l4-7-4-7H7z" fill="none" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="12" cy="12" r="2.5" fill="currentColor" />
        </svg>
      );
    case "Google OAuth":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h5.9c-.3 1.4-1.1 2.6-2.3 3.4v2.8h3.7c2.2-2 3.5-5 3.5-8.4z" fill="#4285F4" />
          <path d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.8c-1.1.7-2.5 1.2-4.3 1.2-3.3 0-6.1-2.2-7.1-5.3H1.1v2.9C3.1 19.9 7.2 23 12 23z" fill="#34A853" />
          <path d="M4.9 13.1c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3V5.6H1.1C.4 7 0 8.5 0 10.8s.4 3.8 1.1 5.2l3.8-2.9z" fill="#FBBC05" />
          <path d="M12 4.6c1.8 0 3.3.6 4.6 1.8l3.4-3.4C18 1.1 15.2 0 12 0 7.2 0 3.1 3.1 1.1 7.1l3.8 2.9c1-3.1 3.8-5.4 7.1-5.4z" fill="#EA4335" />
        </svg>
      );
    case "PostgreSQL":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M12 2C6.5 2 2 6.5 2 12c0 4.1 2.5 7.6 6.1 9.1-.1-.7-.1-1.8.2-2.5l1.6-4.9c-.3-.5-.4-1.2-.4-1.9 0-2.2 1.4-3.8 3.5-3.8 1.6 0 2.4 1.2 2.4 2.6 0 1.6-1 4-1.6 6.2-.4 1.9 1 3.4 2.8 3.4 3.4 0 5.7-4.3 5.7-9.5 0-3.9-2.6-6.8-7.3-6.8-5.4 0-8.7 4-8.7 8.4 0 1.6.6 3.2 1.4 4.1.2.2.2.4.1.7l-.5 2.1c-.1.3-.3.4-.6.3-2.1-1-3.1-3.6-3.1-6.1 0-5.7 4.9-11 12.6-11 6.7 0 11.2 4.9 11.2 10.2 0 6.9-3.8 12.1-9.4 12.1-1.9 0-3.7-.9-4.3-2.1l-1.2 4.5c-.4 1.6-1.5 3.6-2.2 4.8 1.7.5 3.5.8 5.4.8 5.5 0 10-4.5 10-10S17.5 2 12 2z" fill="#336791" />
        </svg>
      );
    case "MongoDB":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M12 1.5C11.6 2.5 7 9.5 7 14.5c0 4 3 7.5 5 8 2-.5 5-4 5-8 0-5-4.6-12-5-13z" fill="#47A248" />
          <path d="M12 2v20c.4-.1 1.2-.5 1.8-1.2C15.2 19.3 16 17 16 14.5c0-4.5-3.6-11-4-12.5z" fill="#499D4A" />
        </svg>
      );
    case "Redis":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M2 7l10-4 10 4-10 4-10-4zm0 5l10 4 10-4m-20 5l10 4 10-4" fill="none" stroke="#DC382D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "Qdrant":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#DC2626" />
          <path d="M7 7h10v10H7z" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          <circle cx="12" cy="12" r="2.5" fill="#FFFFFF" />
        </svg>
      );
    case "MySQL":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M12 3C7 3 3 6.5 3 11c0 2.5 1.5 5 4 6.5L6 21l4.5-2.5c.5.1 1 .1 1.5.1 5 0 9-3.5 9-8s-4-7.6-9-7.6z" fill="#00758F" />
        </svg>
      );
    case "Microsoft SQL Server":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <ellipse cx="12" cy="5" rx="8" ry="3" fill="#CC292B" />
          <path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5" fill="none" stroke="#CC292B" strokeWidth="2" />
          <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" fill="none" stroke="#CC292B" strokeWidth="2" />
        </svg>
      );
    case "Mongoose":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M4 18c1-5 5-9 11-9 3 0 5 2 5 5 0 4-4 6-9 6-3 0-5-1-7-2z" fill="#880000" />
        </svg>
      );
    case "Docker":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M13 5.5h2v2h-2zm-3 0h2v2h-2zm-3 0h2v2H7zm6 3h2v2h-2zm-3 0h2v2h-2zm-3 0h2v2H7zm-3 0h2v2H4zm9 3h2v2h-2zm-3 0h2v2h-2zm-3 0h2v2H7zm-3 0h2v2H4z" fill="#2496ED" />
          <path d="M22.5 13.5c-.3-.2-1.3-.4-2-.2-.2-.7-.7-1.4-1.4-1.8l-.6-.4-.4.6c-.5.8-.6 1.8-.4 2.8-.7.4-1.8.5-3.1.5H3c-.5 0-.9.2-1.3.5-1 1-1.2 3.1-.3 4.8 1.4 2.7 4.4 3.7 8.3 3.7 6.4 0 11.2-3.4 12.5-8.5l.3-1.5v-.5z" fill="#2496ED" />
        </svg>
      );
    case "Linux":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <path d="M12 2C9.5 2 8 4 8 7c0 1.5.3 3.2 0 4.5-.4 1.5-1.5 2.2-2.5 3-.8.6-1.5 1.5-1.5 2.8 0 2.5 2.5 4.7 8 4.7s8-2.2 8-4.7c0-1.3-.7-2.2-1.5-2.8-1-.8-2.1-1.5-2.5-3-.3-1.3 0-3 0-4.5 0-3-1.5-5-4-5z" />
          <circle cx="10" cy="6.5" r="1" fill="#FFA500" />
          <circle cx="14" cy="6.5" r="1" fill="#FFA500" />
        </svg>
      );
    case "Git":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M22.2 10.7L13.3 1.8a1.8 1.8 0 0 0-2.6 0L8.1 4.4l3.3 3.3a2.1 2.1 0 0 1 2.7 2.7l3.2 3.2a2.1 2.1 0 1 1-1.3 1.2l-3-3a2.1 2.1 0 0 1-2.4-.4L7.5 14.5a2.1 2.1 0 1 1-1.3-1.3L9.3 10a2.1 2.1 0 0 1-.2-1.8L5.9 4.9 1.8 9a1.8 1.8 0 0 0 0 2.6l8.9 8.9c.7.7 1.9.7 2.6 0l8.9-8.9a1.8 1.8 0 0 0 0-2.6z" fill="#F05032" />
        </svg>
      );
    case "GitHub":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <path d="M12 2C6.5 2 2 6.5 2 12c0 4.4 2.9 8.2 6.8 9.5.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.4-3.4-1.4-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.7.4-1.1.6-1.4-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1 .8-.2 1.7-.3 2.5-.3.8 0 1.7.1 2.5.3 1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.7.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7 1 .7 2v3c0 .3.2.6.7.5 4-1.3 6.8-5.1 6.8-9.5 0-5.5-4.5-10-10-10z" />
        </svg>
      );
    case "GitLab":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M22.65 14.39L12 22.13 1.35 14.39a.84.84 0 0 1-.3-.94l1.22-3.78L4.65 2.5a.43.43 0 0 1 .81 0l2.38 7.33h8.32l2.38-7.33a.43.43 0 0 1 .81 0l2.38 7.17 1.22 3.78a.84.84 0 0 1-.3.94z" fill="#E24329" />
        </svg>
      );
    case "AWS":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M6.5 14c2.5 1.5 6.5 2 11 .5" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M16.5 13.5l1.5 1.5-1.5 1.5" stroke="#FF9900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case "Vercel":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <path d="M12 3l10 17H2L12 3z" />
        </svg>
      );
    case "Postman":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#FF6C37" />
          <path d="M7 14l5-4 5 4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case "PostHog":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#1D1F24" />
          <circle cx="12" cy="12" r="7" fill="#F54E00" />
        </svg>
      );
    case "Microsoft Clarity":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="12" cy="12" r="10" fill="#0078D4" />
          <path d="M8 12a4 4 0 1 0 8 0 4 4 0 0 0-8 0z" fill="#FFFFFF" />
        </svg>
      );
    case "Metabase":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#509EE3" />
          <rect x="7" y="7" width="4" height="4" fill="#FFFFFF" />
          <rect x="13" y="7" width="4" height="4" fill="#FFFFFF" />
          <rect x="7" y="13" width="4" height="4" fill="#FFFFFF" />
        </svg>
      );
    case "Selenium":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#00B400" />
          <text x="12" y="16" fill="#FFFFFF" fontSize="12" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">Se</text>
        </svg>
      );
    case "Unit Testing":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <path d="M9 3v4l-4 7c-.5.8-.1 1.9.8 2.3.3.1.6.2.9.2h12.6c1 0 1.8-.8 1.8-1.8 0-.3-.1-.6-.3-.9l-4-7V3h1a1 1 0 0 0 0-2H7a1 1 0 1 0 0 2h2z" fill="none" stroke="currentColor" strokeWidth="1.8" />
        </svg>
      );
    case "Jira":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M12 2L3 11l9 9 9-9-9-9z" fill="#0052CC" />
          <path d="M12 6.5L7.5 11 12 15.5l4.5-4.5L12 6.5z" fill="#2684FF" />
        </svg>
      );
    case "PyTorch":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M13.5 3a7.5 7.5 0 0 0-5.7 12.4l1.6-1.6a5.3 5.3 0 0 1 4.1-8.7V3zm3 3.5a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" fill="#EE4C2C" />
        </svg>
      );
    case "TensorFlow":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M12 2l9 5.2v10.4L12 22.8l-9-5.2V7.2L12 2z" fill="#FF6F00" />
          <path d="M12 6v12m-5-9h10" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case "Keras":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#D00000" />
          <text x="12" y="17" fill="#FFFFFF" fontSize="14" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif">K</text>
        </svg>
      );
    case "OpenCV":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="12" cy="7" r="4.5" fill="none" stroke="#FF0000" strokeWidth="2" />
          <circle cx="7" cy="16" r="4.5" fill="none" stroke="#00FF00" strokeWidth="2" />
          <circle cx="17" cy="16" r="4.5" fill="none" stroke="#0000FF" strokeWidth="2" />
        </svg>
      );
    case "LangChain":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#00A67E" />
          <path d="M8 12h8m-5-3h4a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      );
    case "LangGraph":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <circle cx="6" cy="12" r="3" fill="#3B82F6" />
          <circle cx="18" cy="7" r="3" fill="#3B82F6" />
          <circle cx="18" cy="17" r="3" fill="#3B82F6" />
          <path d="M8.5 11l7-3m-7 5l7 3" stroke="#3B82F6" strokeWidth="1.8" />
        </svg>
      );
    case "RAG":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <ellipse cx="12" cy="6" rx="7" ry="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M5 6v10c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6" fill="none" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 11l-2 3h4l-2 3" stroke="#FFE873" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "MCP":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <path d="M7 6h10M7 18h10M12 6v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <circle cx="12" cy="12" r="3" fill="#38BDF8" />
        </svg>
      );
    case "vLLM":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect width="24" height="24" rx="4" fill="#3B82F6" />
          <path d="M7 8l5 8 5-8" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      );
    case "Ollama":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <path d="M12 3a4 4 0 0 0-4 4c0 1.2.5 2.2 1.3 3L8 14v5a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2v-5l-1.3-4c.8-.8 1.3-1.8 1.3-3a4 4 0 0 0-4-4z" />
        </svg>
      );
    case "AI Agents":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <rect x="4" y="6" width="16" height="12" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
          <circle cx="9" cy="12" r="1.5" fill="currentColor" />
          <circle cx="15" cy="12" r="1.5" fill="currentColor" />
          <path d="M12 2v4m-8 6H2m20 0h-2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "OpenAI API":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <path d="M20.5 9.8a5 5 0 0 0-.4-3.6 5.1 5.1 0 0 0-4.3-2.6 5.2 5.2 0 0 0-2.3.5 5 5 0 0 0-4-2.1c-2.4 0-4.4 1.7-4.9 4a5 5 0 0 0-3 2.2 5.1 5.1 0 0 0 .5 5.5 5.2 5.2 0 0 0 .4 3.6 5.1 5.1 0 0 0 4.3 2.6c.8 0 1.6-.2 2.3-.5a5 5 0 0 0 4 2.1c2.4 0 4.4-1.7 4.9-4a5 5 0 0 0 3-2.2 5.1 5.1 0 0 0-.5-5.5zm-8.5 10.7a3.5 3.5 0 0 1-2.4-1l1.5-1.5a1.8 1.8 0 0 0 1 .3 1.8 1.8 0 0 0 1.8-1.8v-3.7l1.7 1v2.7a3.5 3.5 0 0 1-3.6 3.5zm-5.4-2.8a3.5 3.5 0 0 1-1-2.4l1.5-1.5a1.8 1.8 0 0 0 .6.8 1.8 1.8 0 0 0 2.5-.7l1.8-3.2 1.7 1-1.8 3.2a3.5 3.5 0 0 1-4.7 1.8zm-1.8-6.4a3.5 3.5 0 0 1 1.4-2.2v2.1a1.8 1.8 0 0 0-.4.9 1.8 1.8 0 0 0 .7 2.5l3.2 1.8-1 1.7-3.2-1.8a3.5 3.5 0 0 1-1.3-4.4zm9.6-1.5l-3.2-1.8 1-1.7 3.2 1.8a3.5 3.5 0 0 1 1.3 4.4 3.5 3.5 0 0 1-1.4 2.2v-2.1a1.8 1.8 0 0 0 .4-.9 1.8 1.8 0 0 0-.7-2.5zm4.8 4.2a3.5 3.5 0 0 1 1 2.4l-1.5 1.5a1.8 1.8 0 0 0-.6-.8 1.8 1.8 0 0 0-2.5.7l-1.8 3.2-1.7-1 1.8-3.2a3.5 3.5 0 0 1 4.7-1.8z" />
        </svg>
      );
    case "Gemini API":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <path d="M12 2C12 7.5 7.5 12 2 12c5.5 0 10 4.5 10 10 0-5.5 4.5-10 10-10-5.5 0-10-4.5-10-10z" fill="#4285F4" />
        </svg>
      );
    case "Mistral AI":
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <path d="M3 4h4v4H3zm14 0h4v4h-4zm-7 4h4v4h-4zm-4 4h4v4H6zm8 0h4v4h-4zm-5 4h4v4H9z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="currentColor">
          <circle cx="12" cy="12" r="5" />
        </svg>
      );
  }
}
