import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { TactileButton } from "tactile-glass-ui";
import { LiquidGrid, PixelTetris } from "@/features/landing/effects";
import { DomeGallery } from "./dome-gallery/dome-gallery";
import { DOME_PROJECTS } from "./dome-gallery/domeProjects";
import { PortfolioLoader } from "./PortfolioLoader";
import { getAssetUrl } from "@/core/utils";
import { portfolioContent } from "@/data";
import { Button as GlisseButton, Glass } from "glisse";
import "glisse/styles.css";
import DynamicText from "@/core/components/kokonutui";
import { useResponsiveDevice } from "@/core/utils/responsive";
import { TechStackSection } from "./TechStackSection";
import { GithubActivitySection } from "./GithubActivitySection";
import MobileArcadeFab from "./MobileArcadeFab";
import { MobileArcadeModal } from "@/features/arcade";
import styles from "./flatLanding.module.css";

export type FlatLandingProps = {
  isOpen: boolean;
  snapshotCanvas?: HTMLCanvasElement | null;
  onReenter: () => void;
  allowRoomEntry?: boolean;
  isIntroDismissed?: boolean;
  isReentering?: boolean;
  initialMobileArcadeOpen?: boolean;
};

const DYNAMIC_ROLES = [
  "AI Engineer",
  "ML Engineer",
  "Software Engineer",
  "Creative Developer",
];

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
  { val: "Babol, IR", num: 0, note: "BASED", label: "UTC+3:30" },
  { val: "INTERNATIONAL", num: 0, note: "OPEN", label: "RELOCATE OR REMOTE" },
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

export default function FlatLanding({
  isOpen,
  onReenter,
  allowRoomEntry = true,
  isIntroDismissed = true,
  isReentering = false,
  initialMobileArcadeOpen = false,
}: FlatLandingProps) {
  const device = useResponsiveDevice();
  const rootRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const transitionImgRef = useRef<HTMLImageElement>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const reelRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const heroOverlayRef = useRef<HTMLDivElement>(null);
  const portalFxRef = useRef<HTMLDivElement>(null);
  const scanCrestRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [isScrolled, setIsScrolled] = useState(false);
  const [numbersInView, setNumbersInView] = useState(false);
  const [isMobileArcadeOpen, setIsMobileArcadeOpen] = useState(() =>
    Boolean(initialMobileArcadeOpen || (typeof window !== "undefined" && window.location.hash === "#arcade")),
  );
  const [suppressInitialLoader] = useState(() =>
    Boolean(initialMobileArcadeOpen || (typeof window !== "undefined" && window.location.hash === "#arcade")),
  );

  // Open mobile arcade modal automatically when navigating directly to #arcade
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleHash = () => {
      if (window.location.hash === "#arcade") {
        setIsMobileArcadeOpen(true);
      }
    };
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  // Lock body and landing container scroll when mobile handheld arcade modal is open
  useEffect(() => {
    if (typeof document === "undefined" || !isMobileArcadeOpen) return;
    const prevBodyOverflow = document.body.style.overflow;
    const root = rootRef.current;
    const prevRootOverflow = root ? root.style.overflowY : "";
    document.body.style.overflow = "hidden";
    if (root) {
      root.style.overflowY = "hidden";
    }
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      if (root) {
        root.style.overflowY = prevRootOverflow;
      }
    };
  }, [isMobileArcadeOpen]);

  const isClosing = Boolean(isReentering);
  const transitionState: "closed" | "opening" | "open" | "closing" = isClosing
    ? "closing"
    : isOpen
      ? "open"
      : "closed";
  const isReady = isOpen;

  // Defer loading the ASCII video until the 3D intro has finished or the user opens FlatLanding
  useEffect(() => {
    if (!isOpen && !isIntroDismissed) return;
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.readyState === 0) {
        video.load();
      }
    } catch {
      // Safe fallback in non-browser test runners
    }
  }, [isOpen, isIntroDismissed]);

  // Handle Close / Re-enter (Flat Landing -> Live 3D Room via reverse roller-shutter)
  const handleReenter = useCallback(() => {
    if (transitionState !== "open") return;
    videoRef.current?.pause();
    onReenter();
  }, [transitionState, onReenter]);

  // Reset DOM scroll when opening or after closing completes
  useEffect(() => {
    if (!isOpen && rootRef.current) {
      rootRef.current.scrollTop = 0;
    }
  }, [isOpen]);

  // Video playback management
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isOpen) {
      const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (!reduced) {
        video.play().catch(() => { });
      }
    } else if (transitionState === "closed") {
      video.pause();
    }
  }, [isOpen, transitionState]);

  // Global Escape key returns to room when at root flat landing
  useEffect(() => {
    if (!allowRoomEntry || transitionState !== "open" || isMobileArcadeOpen) return;
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.defaultPrevented) return;
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.key === "Escape") {
        void handleReenter();
      }
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, [allowRoomEntry, transitionState, isMobileArcadeOpen, handleReenter]);


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
              e.target.setAttribute("data-pl-rise", "true");
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

  const isElementVisible = isOpen;

  return (
    <div
      ref={rootRef}
      id="landing"
      className={[
        styles.ld,
        isElementVisible ? styles.open : "",
        isReady ? styles.ready : "",
        isClosing ? styles.closing : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-transition-state={transitionState}
      aria-label="Amirreza Gholipour Flat Portfolio"
    >
      {isOpen && isIntroDismissed && !isClosing && !suppressInitialLoader && (
        <PortfolioLoader scopeRef={rootRef} />
      )}

      {isElementVisible && (
        <div ref={backdropRef} className={styles.ldBackground} data-pl-ignore="true" aria-hidden="true">
          <LiquidGrid
            mode="dots"
            background="#000000"
            lineColor="#FFFFFF1A"
            glowColor="#2F2F2F"
            cellSize={16}
            lineWidth={1}
            radius={58}
            intensity={10}
            collide={true}
            clickRipple={true}
          />
        </div>
      )}

      <header ref={navRef} className={`${styles.ldNav} ${isScrolled ? styles.scrolled : ""}`}>
        <Glass
          className={`${styles.ldNavGlass} ${isScrolled ? styles.visible : ""}`}
          data-pl-ignore="true"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            pointerEvents: "none",
            borderRadius: 0,
            boxShadow: "none",
            border: "none",
            outline: "none",
            backgroundImage: "none",
            "--lg-glass": "rgba(8, 6, 20, 0.55)",
            "--lg-glass-bend": 0.31,
            "--lg-glass-dispersion": 0.4,
            "--lg-blur": "3px",
            "--lg-rim-shine": 0,
            "--lg-edge": "transparent",
            "--lg-drop": "transparent",
          } as CSSProperties}
          aria-hidden="true"
        />
        <a className={styles.ldLogo} href="#top" onClick={(e) => scrollToSection("top", e)}>
          <b>AG</b>
          <span>/ AI Engineer</span>
        </a>

        <nav className={styles.ldLinks} aria-label="Page navigation">
          <a href="#ld-work" onClick={(e) => scrollToSection("ld-work", e)}>
            Work
          </a>
          <a href="#ld-experience" onClick={(e) => scrollToSection("ld-experience", e)}>
            Experience
          </a>
          <a href="#ld-techstack" onClick={(e) => scrollToSection("ld-techstack", e)}>
            Tech Stack
          </a>
          <a href="#ld-activity" onClick={(e) => scrollToSection("ld-activity", e)}>
            Activity
          </a>
          <a href="#ld-contact" onClick={(e) => scrollToSection("ld-contact", e)}>
            Contact
          </a>
        </nav>

        <div className={styles.ldNavCta}>
          {allowRoomEntry ? (
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
          ) : (
            <a
              href="#ld-contact"
              className={styles.ldNavContactBtn}
              onClick={(e) => scrollToSection("ld-contact", e)}
              aria-label="Get in Touch"
            >
              Get in Touch
            </a>
          )}
        </div>

      </header>

      <main className="intro" aria-labelledby="name">
        <div className={styles.ldPage}>
          <section className={styles.ldHero} id="ld-top">
            <div className={styles.ldHeroInner}>
              <div ref={frameRef} className={styles.ldFrame}>
                <div
                  ref={reelRef}
                  className={styles.ldReel}
                  data-pl-media="BANNER"
                  aria-label="Room ASCII Animation"
                >
                  <img
                    ref={transitionImgRef}
                    className={styles.ldTransitionImg}
                    src={getAssetUrl("assets/ascii-room.webp")}
                    alt=""
                    aria-hidden="true"
                  />
                  <video
                    ref={videoRef}
                    className={styles.ldReelVideo}
                    src={getAssetUrl("assets/ascii-room.webm")}
                    poster={getAssetUrl("assets/ascii-room.webp")}
                    autoPlay
                    loop
                    muted
                    playsInline
                    preload="metadata"
                    aria-label="Nocturnal Room ASCII Loop"
                  />
                  <div ref={portalFxRef} className={styles.ldPortalFx} aria-hidden="true">
                    <div className={styles.ldMatrixGrid} />
                    <div ref={scanCrestRef} className={styles.ldScanCrest} />
                    <div className={styles.ldPortalSheen} />
                  </div>
                </div>

                {/* Hero Intro Overlay */}
                <div ref={heroOverlayRef} className={styles.ldHeroOverlay} aria-label="Introduction">
                  <div className={styles.ldHeroStack}>
                    <p className={styles.ldHeroEyebrow}>Hey there 👋 Welcome to my digital space.</p>
                    <h1 id="name">{portfolioContent.owner.name}</h1>
                    <div
                      className={styles.ldHeroRoleWrap}
                      data-pl-text={portfolioContent.owner.role}
                      aria-label="Role focus"
                    >
                      <DynamicText
                        mode="morph"
                        words={DYNAMIC_ROLES}
                        interval={2400}
                        loop={true}
                        className={styles.ldDynamicText}
                      />
                      <span className="sr-only">{portfolioContent.owner.role} · {portfolioContent.owner.headline}</span>
                    </div>
                    <p className={styles.ldHeroBio}>
                      I love solving challenging, real-world problems where data meets human experience.
                      <br />
                      Currently building intelligent systems, autonomous agents, and clean backend architectures.
                    </p>
                    <div className={styles.ldActions} data-theme="dark">
                      <GlisseButton onClick={(e) => scrollToSection("ld-work", e)}>
                        See my work
                      </GlisseButton>
                      <a
                        className={styles.ldGhostBtn}
                        href="#ld-contact"
                        onClick={(e) => scrollToSection("ld-contact", e)}
                      >
                        Get in Touch
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div ref={wrapRef} className={styles.ldWrap}>

            {/* Capabilities Ticker Strip */}
            <section className={`${styles.ldTools} ${styles.ldX}`} aria-label="Capabilities">
              {CAPABILITIES.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </section>

            {/* Work Section */}
            <section className={`${styles.ldWork} ${styles.ldX}`} id="ld-work" aria-label="Selected Work">
              <div className={styles.ldRise}>
                <DomeGallery projects={DOME_PROJECTS} />
              </div>
            </section>

            {/* Statement Quote Section */}
            <section className={`${styles.ldStatement} ${styles.ldX}`} id="ld-about" aria-label="About Me">
              <div className={styles.ldStatementInner}>
                <div className={`${styles.ldKicker} ${styles.ldRise}`}>
                  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                    <path d="M8 .6 9.4 6.6 15.4 8 9.4 9.4 8 15.4 6.6 9.4.6 8 6.6 6.6Z" />
                  </svg>
                  About Me
                </div>
                <p className={styles.ldRise}>
                  <b>First and foremost, I thrive on challenging and distinctive engineering work.</b>{" "}
                  Beyond continuous learning, collaborative teamwork is my favorite part of engineering—the strongest products emerge when diverse experience, sharp execution, and shared vision come together.
                </p>
              </div>
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
              <h2 className={styles.ldRise}>Experience</h2>
              <ol>
                {portfolioContent.owner.experience.map((exp) => (
                  <li key={`${exp.company}-${exp.title}`} className={styles.ldRise}>
                    <div className={styles.ldProcessItem}>
                      <h3>
                        {exp.title ? `${exp.company} — ${exp.title}` : exp.company}
                      </h3>
                      <p>{exp.highlights.join(" ")}</p>
                      <em>{exp.period}</em>

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

                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Tech Stack Section */}
            <section className={`${styles.ldTech} ${styles.ldX}`} id="ld-techstack" aria-label="Tech Stack">
              <div className={styles.ldRise}>
                <TechStackSection />
              </div>
            </section>

            {/* Github Activity Section */}
            <section className={`${styles.ldActivity} ${styles.ldX}`} id="ld-activity" aria-label="Github Activity">
              <div className={styles.ldRise}>
                <GithubActivitySection />
              </div>
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
                <a href="https://www.linkedin.com/in/amirreza-gholipour-11a05a323/" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                  <span>LinkedIn</span>
                  <em>Amirreza Gholipour</em>
                </a>
                <a href="https://t.me/amir_rghp2" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                  <span>Telegram</span>
                  <em>@amir_rghp2</em>
                </a>
                <a href={`tel:${portfolioContent.owner.phone}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <span>Phone / Direct</span>
                  <em>{portfolioContent.owner.phone}</em>
                </a>
              </nav>

              {allowRoomEntry && (
                <div className={`${styles.ldFootCta} ${styles.ldRise}`}>
                  <TactileButton onClick={handleReenter}>
                    Enter The Room
                  </TactileButton>
                </div>
              )}


              {/* Floor Pixel Tetris Canvas */}
              <div className={styles.ldFootTetris} aria-hidden="true">
                <PixelTetris
                  cellSize={device.isMobile ? 10 : 20}
                  mobileCellSize={10}
                  gap={1}
                  rounded={20}
                  boardColor="transparent"
                  colors={["#FFFFFF", "#FFFFFF"]}
                  movement={4}
                  dropSpeed={2}
                  maxStackHeight={device.isMobile ? 9 : 6}
                  mobileMaxStackHeight={9}
                  prefillRows={device.isMobile ? 7 : 5}
                  mobilePrefillRows={7}
                />
              </div>

              <div className={styles.ldFootRow}>
                <span>© {new Date().getFullYear()} AMIRREZA GHOLIPOUR</span>
                <button
                  type="button"
                  className={styles.ldBackToTop}
                  onClick={(e) => scrollToSection("top", e)}
                  aria-label="Scroll back to top"
                >
                  BACK TO TOP
                </button>
              </div>
            </footer>
          </div>
        </div>
      </main>

      {(!allowRoomEntry || device.isMobileOrTablet) && !isMobileArcadeOpen && (
        <MobileArcadeFab onClick={() => setIsMobileArcadeOpen(true)} />
      )}

      <MobileArcadeModal
        isOpen={isMobileArcadeOpen}
        onClose={() => setIsMobileArcadeOpen(false)}
      />
    </div>
  );
}
