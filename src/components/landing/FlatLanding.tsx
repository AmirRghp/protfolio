import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { TactileButton } from "tactile-glass-ui";
import WorkAccordion from "./WorkAccordion";
import { portfolioContent } from "../../content";
import styles from "./flatLanding.module.css";

export type FlatLandingProps = {
  isOpen: boolean;
  snapshotCanvas: HTMLCanvasElement | null;
  onReenter: () => void;
};

const EASE = "cubic-bezier(.7,0,.2,1)";
const OUT = "cubic-bezier(.2,.8,.2,1)";
const FULL = "inset(0px 0px 0px 0px round 0px)";
const BLUR = 18;

const CAPABILITIES = [
  "Applied AI & RAG",
  "Deep Learning & PyTorch",
  "Computer Vision",
  "Autonomous Agents",
  "FastAPI & MLOps",
  "Product Management",
];

type StatItem = {
  val: string;
  num: number;
  suffix?: string;
  prefix?: string;
  note: string;
  label: string;
};

const STATS: StatItem[] = [
  { val: "M.Sc.", num: 0, note: "MUST · 2024–Present", label: "Artificial Intelligence & Robotics" },
  { val: "9+", num: 9, suffix: "+", note: "Applied AI, RAG & Vision", label: "Production & Research Projects" },
  { val: "Daraei360", num: 0, note: "FinTech & AI Systems", label: "AI Engineer & Product Manager" },
  { val: "ICSPIS", num: 2025, note: "Executive Committee", label: "11th Int. Signal & Intelligent Systems" },
];

function StatCounter({ st, inView }: { st: StatItem; inView: boolean }) {
  const [display, setDisplay] = useState(st.val);
  const animatedRef = useRef(false);

  useEffect(() => {
    if (!inView || st.num <= 0 || animatedRef.current) return;
    animatedRef.current = true;

    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      return;
    }

    const t0 = performance.now();
    const dur = 1400;
    const to = st.num;
    const prefix = st.prefix || "";
    const suffix = st.suffix || "";
    let raf = 0;

    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / dur);
      // Bonsai easing curve: 1 - Math.pow(2, -10 * k)
      const e = 1 - Math.pow(2, -10 * k);
      const current = Math.round(to * (k >= 1 ? 1 : e));
      setDisplay(`${prefix}${current}${suffix}`);
      if (k < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setDisplay(st.val);
      }
    };

    raf = requestAnimationFrame(step);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [inView, st]);

  return <b data-count={st.num > 0 ? st.num : undefined}>{display}</b>;
}

export default function FlatLanding({ isOpen, snapshotCanvas, onReenter }: FlatLandingProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const shotBoxRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);

  const [transitionState, setTransitionState] = useState<"closed" | "opening" | "open" | "closing">(
    () => (isOpen ? "open" : "closed"),
  );
  const [isReady, setIsReady] = useState(() => isOpen);
  const [isScrolled, setIsScrolled] = useState(false);
  const [numbersInView, setNumbersInView] = useState(false);
  const runningAnimationsRef = useRef<Animation[]>([]);

  const settle = useCallback(() => {
    for (const a of runningAnimationsRef.current) {
      try {
        a.commitStyles();
      } catch {
        // commitStyles can throw if target node was disconnected
      }
      a.cancel();
    }
    runningAnimationsRef.current = [];
  }, []);

  // Compute frame clip
  const frameClip = useCallback(() => {
    const media = mediaRef.current;
    const frame = frameRef.current;
    if (!media || !frame) return { clip: FULL, origin: "50% 50%" };

    const m = media.getBoundingClientRect();
    const r = frame.getBoundingClientRect();
    const top = r.top - m.top;
    const left = r.left - m.left;
    return {
      clip: `inset(${Math.max(0, top)}px ${Math.max(0, m.width - left - r.width)}px ${Math.max(0, m.height - top - r.height)}px ${Math.max(0, left)}px round 6px)`,
      origin: `${left + r.width / 2}px ${top + r.height / 2}px`,
    };
  }, []);

  // Handle Close / Re-enter
  const handleReenter = useCallback(async () => {
    if (transitionState === "closing" || transitionState === "closed") return;
    setTransitionState("closing");
    setIsReady(false);

    const root = rootRef.current;
    const media = mediaRef.current;
    const shotBox = shotBoxRef.current;
    const veil = veilRef.current;
    const reel = reelRef.current;
    const page = root?.querySelector(`.${styles.ldPage}`) as HTMLElement | null;

    if (!root || !media || !shotBox || !veil || !reel || !page) {
      setTransitionState("closed");
      onReenter();
      return;
    }

    // Scroll to top first
    if (root.scrollTop > 2) {
      root.scrollTo({ top: 0, behavior: "smooth" });
      const t0 = performance.now();
      await new Promise<void>((resolve) => {
        const wait = () => {
          if (root.scrollTop <= 2 || performance.now() - t0 > 900) {
            resolve();
          } else {
            requestAnimationFrame(wait);
          }
        };
        wait();
      });
      root.scrollTop = 0;
    }

    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof root.animate !== "function") {
      setTransitionState("closed");
      onReenter();
      return;
    }

    const { clip } = frameClip();
    const D = 900;

    const r1 = reel.animate(
      [
        { opacity: 1, transform: "none" },
        { opacity: 0, transform: "translateY(30px) scale(.97)" },
      ],
      { duration: 380, fill: "both", easing: "cubic-bezier(.5,0,.75,0)" },
    );
    const r2 = page.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 320, delay: 80, fill: "both", easing: "linear" });
    const r3 = media.animate([{ clipPath: clip }, { clipPath: FULL }], { duration: D, delay: 220, fill: "both", easing: EASE });
    const r4 = shotBox.animate(
      [
        { filter: `blur(${BLUR}px)`, transform: "scale(1.08)" },
        { filter: "blur(0px)", transform: "scale(1)" },
      ],
      { duration: D, delay: 220, fill: "both", easing: EASE },
    );
    const r5 = veil.animate([{ opacity: 1 }, { opacity: 0 }], { duration: D * 0.8, delay: 220, fill: "both", easing: EASE });
    runningAnimationsRef.current = [r1, r2, r3, r4, r5];

    try {
      await Promise.all([r1.finished, r2.finished, r3.finished, r4.finished, r5.finished]);
      settle();
      // Fade out root snapshot over the live scene underneath
      const fadeAnim = root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, fill: "both", easing: "linear" });
      await fadeAnim.finished;
      try {
        fadeAnim.commitStyles();
      } catch {
        // commitStyles can throw if target node was disconnected
      }
      fadeAnim.cancel();
    } catch {
      settle();
    }

    setTransitionState("closed");
    onReenter();
  }, [transitionState, frameClip, onReenter, settle]);

  // Mount canvas into shotBox
  useEffect(() => {
    const shotBox = shotBoxRef.current;
    if (!shotBox) return;

    if (snapshotCanvas) {
      shotBox.replaceChildren(snapshotCanvas);
    } else {
      shotBox.replaceChildren();
    }
  }, [snapshotCanvas]);

  // Open Transition
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const root = rootRef.current;
    const media = mediaRef.current;
    const shotBox = shotBoxRef.current;
    const veil = veilRef.current;
    const frame = frameRef.current;
    const reel = reelRef.current;
    const nav = navRef.current;

    if (!root || !media || !shotBox || !veil || !frame || !reel || !nav) {
      setTransitionState("open");
      setIsReady(true);
      return;
    }

    root.scrollTop = 0;
    setIsScrolled(false);
    settle();

    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof root.animate !== "function") {
      setTransitionState("open");
      setIsReady(true);
      return;
    }

    const { clip, origin } = frameClip();
    shotBox.style.transformOrigin = origin;

    const T = 150;
    const D = 1050;

    const a1 = root.animate([{ opacity: 0 }, { opacity: 1 }], { duration: T, fill: "both", easing: "linear" });
    const a2 = media.animate([{ clipPath: FULL }, { clipPath: clip }], { duration: D, delay: T, fill: "both", easing: EASE });
    const a3 = shotBox.animate(
      [
        { filter: "blur(0px)", transform: "scale(1)" },
        { filter: `blur(${BLUR}px)`, transform: "scale(1.08)" },
      ],
      { duration: D, delay: T, fill: "both", easing: EASE },
    );
    const a4 = veil.animate([{ opacity: 0 }, { opacity: 1 }], { duration: D, delay: T + 200, fill: "both", easing: OUT });
    const a5 = nav.animate(
      [
        { opacity: 0, transform: "translateY(-10px)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 700, delay: T + 600, fill: "both", easing: OUT },
    );
    const a6 = reel.animate(
      [
        { opacity: 0, transform: "translateY(40px) scale(.96)" },
        { opacity: 1, transform: "none" },
      ],
      { duration: 900, delay: T + 780, fill: "both", easing: OUT },
    );
    runningAnimationsRef.current = [a1, a2, a3, a4, a5, a6];

    let active = true;
    Promise.all([a1.finished, a2.finished, a3.finished, a4.finished, a5.finished, a6.finished])
      .then(() => {
        if (!active) return;
        settle();
        setTransitionState("open");
        setIsReady(true);
      })
      .catch(() => {
        if (!active) return;
        settle();
        setTransitionState("open");
        setIsReady(true);
      });

    return () => {
      active = false;
    };
  }, [isOpen, frameClip, settle]);

  // Window resize handler while open keeps snapshot frameClip dynamically updated
  useEffect(() => {
    if (transitionState !== "open") return;
    const place = () => {
      const { clip, origin } = frameClip();
      if (mediaRef.current) mediaRef.current.style.clipPath = clip;
      if (shotBoxRef.current) shotBoxRef.current.style.transformOrigin = origin;
    };
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, [transitionState, frameClip]);

  // Global Escape key returns to room when at root flat landing
  useEffect(() => {
    if (transitionState !== "open") return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "Escape") {
        void handleReenter();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [transitionState, handleReenter]);

  // Scroll listener for nav glass styling & intersection observer for rise elements
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const handleScroll = () => {
      setIsScrolled(root.scrollTop > 12);
    };
    root.addEventListener("scroll", handleScroll, { passive: true });

    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== "undefined") {
      io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              e.target.classList.add(styles.in);
              if (e.target.id === "ld-numbers" || e.target.classList.contains(styles.ldNumbers)) {
                setNumbersInView(true);
              }
              io?.unobserve(e.target);
            }
          }
        },
        { root, threshold: 0.12 },
      );

      root.querySelectorAll(`.${styles.ldRise}`).forEach((el) => io?.observe(el));
      const numbersSec = root.querySelector("#ld-numbers");
      if (numbersSec) io.observe(numbersSec);
    }

    return () => {
      root.removeEventListener("scroll", handleScroll);
      if (io) io.disconnect();
    };
  }, [isOpen, isReady]);

  const scrollToSection = (id: string, e?: MouseEvent) => {
    if (e) e.preventDefault();
    const root = rootRef.current;
    if (!root) return;

    if (id === "top") {
      root.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const targetEl = root.querySelector(`#${id}`);
    if (targetEl) {
      const top = targetEl.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop - 64;
      root.scrollTo({ top, behavior: "smooth" });
    }
  };

  const featured = portfolioContent.projects.find((p) => p.id === "omnidoc-rag") || portfolioContent.projects[0];
  const isElementVisible = isOpen || transitionState !== "closed";

  return (
    <div
      ref={rootRef}
      id="landing"
      className={`${styles.ld} ${isElementVisible ? styles.open : ""} ${isReady ? styles.ready : ""}`}
      aria-label="Amirreza Gholipour Flat Portfolio"
    >
      <div ref={mediaRef} className={styles.ldMedia} aria-hidden="true">
        <div ref={shotBoxRef} className={styles.ldShot} />
        <div ref={veilRef} className={styles.ldVeil} />
      </div>

      <header ref={navRef} className={`${styles.ldNav} ${isScrolled ? styles.scrolled : ""}`}>
        <a className={styles.ldLogo} href="#top" onClick={(e) => scrollToSection("top", e)}>
          <svg viewBox="0 0 20 20" aria-hidden="true">
            <path d="M10 1.5v17M1.5 10h17M4 4l12 12M16 4 4 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
          <b>AG</b>
          <span>/ AI Engineer</span>
        </a>

        <nav className={styles.ldLinks} aria-label="Page navigation">
          <a href="#ld-work" onClick={(e) => scrollToSection("ld-work", e)}>
            Work
          </a>
          <a href="#ld-numbers" onClick={(e) => scrollToSection("ld-numbers", e)}>
            Numbers
          </a>
          <a href="#ld-experience" onClick={(e) => scrollToSection("ld-experience", e)}>
            Experience
          </a>
          <a href="#ld-contact" onClick={(e) => scrollToSection("ld-contact", e)}>
            Contact
          </a>
        </nav>

        <div className={styles.ldNavCta}>
          <TactileButton
            onClick={handleReenter}
            style={{
              "--btn-h": "38px",
              "--btn-pad-h": "18px",
              "--btn-radius": "999px",
              fontSize: "13px",
            } as CSSProperties}
          >
            Re-enter
          </TactileButton>
        </div>
      </header>

      <main className="intro" aria-labelledby="name">
        <div className={styles.ldPage}>
        <section className={styles.ldHero} id="ld-top">
          <div ref={frameRef} className={styles.ldFrame}>
            <div ref={reelRef} className={styles.ldReel} aria-label="Featured Showreel">
              <div className={styles.ldReelTex} />
              <a
                className={styles.ldReelCap}
                href={featured.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i />
                <span>Featured</span>
                <b>{featured.title} — Enterprise CRAG</b>
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5.5 4.5h6v6M11.5 4.5 4.5 11.5" />
                </svg>
              </a>
            </div>
          </div>
        </section>

        <div className={styles.ldWrap}>
          {/* Intro Section */}
          <section className={`${styles.ldIntro} ${styles.ldX}`} id="intro">
            <div className={styles.ldRise}>
              <h1 id="name">{portfolioContent.owner.name}</h1>
            </div>
            <div className={`${styles.ldIntroSide} ${styles.ldRise}`}>
              <p className={styles.ldIntroRole}>
                <b>{portfolioContent.owner.role}</b> · {portfolioContent.owner.headline}
              </p>
              <p>{portfolioContent.owner.bio}</p>
              <div className={styles.ldActions}>
                <a
                  className={`${styles.ldBtn} ${styles.dark}`}
                  href="#ld-work"
                  onClick={(e) => scrollToSection("ld-work", e)}
                >
                  See the work
                </a>
                <a className={styles.ldBtn} href={`mailto:${portfolioContent.owner.email}`}>
                  Start a conversation
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5.5 4.5h6v6M11.5 4.5 4.5 11.5" />
                  </svg>
                </a>
              </div>
            </div>
          </section>

          {/* Capabilities Ticker Strip */}
          <section className={`${styles.ldTools} ${styles.ldX} ${styles.ldRise}`} aria-label="Capabilities">
            {CAPABILITIES.map((c) => (
              <span key={c}>{c}</span>
            ))}
          </section>

          {/* Work Section */}
          <section className={`${styles.ldWork} ${styles.ldX}`} id="ld-work">
            <div className={`${styles.ldHead} ${styles.ldRise}`}>
              <div>
                <div className={styles.ldKicker}>
                  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 .6 9.4 6.6 15.4 8 9.4 9.4 8 15.4 6.6 9.4.6 8 6.6 6.6Z" />
                  </svg>
                  Selected Work
                </div>
                <h2>
                  Four branches
                  <br />
                  of the work
                </h2>
              </div>
              <p className={styles.ldHeadNote}>
                The four core pillars of applied machine learning, vision, and autonomous agent systems. Open one to scroll through its projects.
              </p>
            </div>
            <div className={styles.ldRise}>
              <WorkAccordion />
            </div>
          </section>

          {/* Statement Quote Section */}
          <section className={`${styles.ldStatement} ${styles.ldX}`}>
            <p className={styles.ldRise}>
              <b>First and foremost, I have always loved challenging and distinctive work.</b> Alongside continuous learning, collaborative teamwork is one of my favorite parts of engineering—the strongest results happen when team members bring their knowledge, experience, and perspectives together toward a shared goal.
            </p>
          </section>

          {/* Numbers Metric Cards */}
          <section className={`${styles.ldNumbers} ${styles.ldX}`} id="ld-numbers" aria-label="Key Numbers">
            {STATS.map((st) => (
              <div key={st.label} className={`${styles.ldStat} ${styles.ldRise}`}>
                <span className={styles.ldK}>{st.note}</span>
                <div>
                  <StatCounter st={st} inView={numbersInView} />
                  <p>{st.label}</p>
                </div>
              </div>
            ))}
          </section>

          {/* Experience & Education */}
          <section className={`${styles.ldProcess} ${styles.ldX}`} id="ld-experience" aria-label="Experience & Education">
            <div className={`${styles.ldKicker} ${styles.ldRise}`}>
              <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 .6 9.4 6.6 15.4 8 9.4 9.4 8 15.4 6.6 9.4.6 8 6.6 6.6Z" />
              </svg>
              Career & Education
            </div>
            <h2 className={styles.ldRise}>Experience & Background</h2>
            <ol>
              {portfolioContent.owner.experience.map((exp) => (
                <li key={`${exp.company}-${exp.title}`} className={styles.ldRise}>
                  <div className={styles.ldProcessItem}>
                    <h3>
                      {exp.company} — {exp.title}
                    </h3>
                    <p>{exp.highlights.join(" ")}</p>
                    <em>{exp.period}</em>
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
                    </svg>
                  </div>
                </li>
              ))}
              {portfolioContent.owner.education.map((edu) => (
                <li key={`${edu.institution}-${edu.degree}`} className={styles.ldRise}>
                  <div className={styles.ldProcessItem}>
                    <h3>
                      {edu.degree} · {edu.field}
                    </h3>
                    <p>{edu.institution}</p>
                    <em>{edu.period}</em>
                    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
                    </svg>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Footer Section */}
          <footer className={`${styles.ldFoot} ${styles.ldX}`} id="ld-contact">
            <h2 className={styles.ldRise}>Have a project or opportunity in mind?</h2>
            <a className={`${styles.ldMail} ${styles.ldRise}`} href={`mailto:${portfolioContent.owner.email}`}>
              {portfolioContent.owner.email}
              <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 10h11M11 5.5 15.5 10 11 14.5" />
              </svg>
            </a>

            <nav className={`${styles.ldSocial} ${styles.ldRise}`} aria-label="Social and professional links">
              <a href={portfolioContent.owner.githubUrl} target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
                  <path d="M9 18c-4.51 2-5-2-7-2" />
                </svg>
                <span>GitHub</span>
                <em>github.com/AmirRghp</em>
              </a>
              <a href="https://www.linkedin.com/in/amirreza-gholipour" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
                <span>LinkedIn</span>
                <em>Amirreza Gholipour</em>
              </a>
              <a href="https://t.me/AmirR_ghp" target="_blank" rel="noopener noreferrer">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
                <span>Telegram</span>
                <em>@AmirR_ghp</em>
              </a>
              <a href={`tel:${portfolioContent.owner.phone}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span>Phone / Direct</span>
                <em>{portfolioContent.owner.phone}</em>
              </a>
            </nav>

            <div className={`${styles.ldFootCta} ${styles.ldRise}`}>
              <TactileButton onClick={handleReenter}>
                Enter The Room
              </TactileButton>
            </div>

            <div className={styles.ldFootRow}>
              <span>© {new Date().getFullYear()} Amirreza Gholipour</span>
              <a href="#top" onClick={(e) => scrollToSection("top", e)}>
                Back to top
              </a>
            </div>
          </footer>
        </div>
        </div>
      </main>
    </div>
  );
}
