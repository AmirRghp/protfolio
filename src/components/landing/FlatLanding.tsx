import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { TactileButton } from "tactile-glass-ui";
import LiquidGrid from "./LiquidGrid";
import WorkAccordion from "./WorkAccordion";
import {
  computeHeroPortalGeometry,
  EASE_CRISP_OUT,
  EASE_PORTAL_DOCK,
  EASE_PORTAL_EXPAND,
  EASE_SCAN_SWEEP,
  HERO_CLOSE_TIMING,
  HERO_OPEN_TIMING,
} from "./heroTransition";
import { getAssetUrl } from "../../assetUrl";
import { portfolioContent } from "../../content";
import { Button as GlisseButton } from "glisse";
import "glisse/styles.css";
import DynamicText from "../kokonutui/dynamic-text";
import { TechStackSection } from "./TechStackSection";
import styles from "./flatLanding.module.css";

export type FlatLandingProps = {
  isOpen: boolean;
  snapshotCanvas?: HTMLCanvasElement | null;
  onReenter: () => void;
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

export default function FlatLanding({ isOpen, onReenter }: FlatLandingProps) {
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
        a.cancel();
      } catch {
        // Ignore already finished/cancelled animations
      }
    }
    runningAnimationsRef.current = [];
  }, []);

  const clearAnimatedStyles = useCallback(() => {
    const page = rootRef.current?.querySelector(`.${styles.ldPage}`) as HTMLElement | null;
    for (const el of [
      rootRef.current,
      backdropRef.current,
      transitionImgRef.current,
      frameRef.current,
      reelRef.current,
      portalFxRef.current,
      scanCrestRef.current,
      heroOverlayRef.current,
      navRef.current,
      wrapRef.current,
      page,
    ]) {
      el?.removeAttribute("style");
    }
  }, []);

  const measurePortalGeometry = useCallback(() => {
    const frame = frameRef.current;
    const vw = typeof window !== "undefined" ? window.innerWidth : 1440;
    const vh = typeof window !== "undefined" ? window.innerHeight : 900;
    if (!frame) {
      return computeHeroPortalGeometry(
        { width: vw, height: vh },
        { left: 16, top: 64, width: Math.max(320, vw - 32), height: Math.max(360, vh - 284) },
        6,
      );
    }
    const r = frame.getBoundingClientRect();
    return computeHeroPortalGeometry(
      { width: vw, height: vh },
      {
        left: r.left,
        top: r.top,
        width: r.width || Math.max(320, vw - 32),
        height: r.height || Math.max(360, vh - 284),
      },
      6,
    );
  }, []);

  // Pre-warm the ASCII video decoder while the user is in the 3D room so frame 1 is ready immediately
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (video.readyState === 0) {
        video.load();
      }
    } catch {
      // Safe fallback in non-browser test runners
    }
  }, []);

  // Handle Close / Re-enter (Flat Hero -> Live 3D Room)
  const handleReenter = useCallback(async () => {
    if (transitionState !== "open") return;
    setTransitionState("closing");
    setIsReady(false);

    const root = rootRef.current;
    const backdrop = backdropRef.current;
    const frame = frameRef.current;
    const nav = navRef.current;
    const wrap = wrapRef.current;

    if (!root || !frame || !wrap) {
      videoRef.current?.pause();
      setTransitionState("closed");
      onReenter();
      return;
    }

    // Smoothly scroll back to top before expanding the hero portal
    if (root.scrollTop > 2) {
      root.scrollTo({ top: 0, behavior: "smooth" });
      const t0 = performance.now();
      await new Promise<void>((resolve) => {
        const wait = () => {
          if (root.scrollTop <= 2 || performance.now() - t0 > 750) {
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
      settle();
      clearAnimatedStyles();
      videoRef.current?.pause();
      setTransitionState("closed");
      onReenter();
      return;
    }

    settle();
    clearAnimatedStyles();

    const geo = measurePortalGeometry();

    // 1. Fade out page content, sticky header, and dark LiquidGrid backdrop so the live 3D room sits directly behind the expanding portal
    const heroOverlay = heroOverlayRef.current;
    const rHeroOverlay = heroOverlay
      ? heroOverlay.animate(
          [
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
            { opacity: 0, transform: "translate3d(0, 12px, 0)" },
          ],
          {
            duration: HERO_CLOSE_TIMING.contentFadeDuration,
            fill: "both",
            easing: "ease-out",
          },
        )
      : null;

    const rWrap = wrap.animate(
      [
        { opacity: 1, transform: "translate3d(0, 0, 0)" },
        { opacity: 0, transform: "translate3d(0, 14px, 0)" },
      ],
      {
        duration: HERO_CLOSE_TIMING.contentFadeDuration,
        fill: "both",
        easing: "ease-out",
      },
    );

    const rNav = nav
      ? nav.animate(
          [
            { opacity: 1, transform: "translate3d(0, 0, 0)" },
            { opacity: 0, transform: "translate3d(0, -10px, 0)" },
          ],
          {
            duration: HERO_CLOSE_TIMING.navFadeDuration,
            fill: "both",
            easing: "ease-out",
          },
        )
      : null;

    const rBackdrop = backdrop
      ? backdrop.animate([{ opacity: 1 }, { opacity: 0 }], {
          duration: HERO_CLOSE_TIMING.backdropFadeDuration,
          fill: "both",
          easing: "ease-out",
        })
      : null;

    // 2. The live playing Hero video container itself expands distortion-free to fill 100vw×100vh
    const rExpand = frame.animate(
      [
        { transform: geo.dockedTransform, clipPath: geo.dockedClipPath },
        { transform: geo.fullscreenTransform, clipPath: geo.fullscreenClipPath },
      ],
      {
        duration: HERO_CLOSE_TIMING.expandDuration,
        fill: "both",
        easing: EASE_PORTAL_EXPAND,
      },
    );

    // 3. Full-screen live ASCII video dissolves directly into the live 3D room
    const rDissolve = frame.animate([{ opacity: 1 }, { opacity: 0 }], {
      duration: HERO_CLOSE_TIMING.dissolveDuration,
      delay: HERO_CLOSE_TIMING.dissolveDelay,
      fill: "both",
      easing: EASE_CRISP_OUT,
    });

    const anims: Animation[] = [rWrap, rExpand, rDissolve];
    if (rHeroOverlay) anims.push(rHeroOverlay);
    if (rNav) anims.push(rNav);
    if (rBackdrop) anims.push(rBackdrop);
    runningAnimationsRef.current = anims;

    try {
      await Promise.all(anims.map((a) => a.finished));
    } catch {
      // Interrupted or cancelled
    }

    videoRef.current?.pause();
    root.style.display = "none";
    setTransitionState("closed");
    onReenter();
  }, [transitionState, measurePortalGeometry, onReenter, settle, clearAnimatedStyles]);

  // Clean up WAAPI fill animations only after the closed state has committed and hidden root
  useEffect(() => {
    if (!isOpen && transitionState === "closed") {
      settle();
      clearAnimatedStyles();
    }
  }, [isOpen, transitionState, settle, clearAnimatedStyles]);

  // Open Transition (Live 3D Room -> Full-Screen ASCII Video -> Docked Hero Frame)
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const root = rootRef.current;
    const backdrop = backdropRef.current;
    const frame = frameRef.current;
    const portalFx = portalFxRef.current;
    const scanCrest = scanCrestRef.current;
    const nav = navRef.current;
    const wrap = wrapRef.current;

    if (!root || !frame || !nav || !wrap) {
      setTransitionState("open");
      setIsReady(true);
      return;
    }

    root.scrollTop = 0;
    setIsScrolled(false);
    setTransitionState("opening");
    setIsReady(false);
    settle();
    clearAnimatedStyles();

    const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof root.animate !== "function") {
      setTransitionState("open");
      setIsReady(true);
      return;
    }

    // Start live ASCII video immediately at t = 0 so the portal is alive throughout the entire transition
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }

    const geo = measurePortalGeometry();

    // 1. Full-screen live ASCII portal quantizes in directly over the 3D room
    const aFrameFade = frame.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: HERO_OPEN_TIMING.quantizeFadeDuration,
      fill: "both",
      easing: EASE_CRISP_OUT,
    });

    // 2. Full-screen live ASCII portal smoothly docks into the Hero frame without aspect distortion or element swap
    const aFrameMorph = frame.animate(
      [
        { transform: geo.fullscreenTransform, clipPath: geo.fullscreenClipPath },
        { transform: geo.dockedTransform, clipPath: geo.dockedClipPath },
      ],
      {
        duration: HERO_OPEN_TIMING.dockDuration,
        delay: HERO_OPEN_TIMING.dockDelay,
        fill: "both",
        easing: EASE_PORTAL_DOCK,
      },
    );

    // 3. Digital matrix cell grid & bi-chromatic laser scan crest bridge the 3D-to-ASCII conversion across full frame height
    const aPortalFx = portalFx
      ? portalFx.animate(
          [{ opacity: 0 }, { opacity: 0.68, offset: 0.35 }, { opacity: 0.35, offset: 0.75 }, { opacity: 0 }],
          {
            duration: HERO_OPEN_TIMING.dockDuration,
            fill: "both",
            easing: "ease-out",
          },
        )
      : null;

    const aScanCrest = scanCrest
      ? scanCrest.animate(
          [
            { transform: "translate3d(0, -140px, 0)" },
            { transform: "translate3d(0, calc(100cqh + 40px), 0)" },
          ],
          {
            duration: HERO_OPEN_TIMING.scanSweepDuration,
            fill: "both",
            easing: EASE_SCAN_SWEEP,
          },
        )
      : null;

    // 4. Nocturnal LiquidGrid backdrop, sticky header, and portfolio sections reveal around the docking frame
    const aBackdrop = backdrop
      ? backdrop.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: HERO_OPEN_TIMING.backdropDuration,
          delay: HERO_OPEN_TIMING.backdropDelay,
          fill: "both",
          easing: "ease-out",
        })
      : null;

    const aNav = nav.animate(
      [
        { opacity: 0, transform: "translate3d(0, -12px, 0)" },
        { opacity: 1, transform: "translate3d(0, 0, 0)" },
      ],
      {
        duration: HERO_OPEN_TIMING.navDuration,
        delay: HERO_OPEN_TIMING.navDelay,
        fill: "both",
        easing: EASE_CRISP_OUT,
      },
    );

    const aWrap = wrap.animate(
      [
        { opacity: 0, transform: "translate3d(0, 18px, 0)" },
        { opacity: 1, transform: "translate3d(0, 0, 0)" },
      ],
      {
        duration: HERO_OPEN_TIMING.contentDuration,
        delay: HERO_OPEN_TIMING.contentDelay,
        fill: "both",
        easing: EASE_PORTAL_DOCK,
      },
    );

    const anims: Animation[] = [aFrameFade, aFrameMorph, aNav, aWrap];
    if (aPortalFx) anims.push(aPortalFx);
    if (aScanCrest) anims.push(aScanCrest);
    if (aBackdrop) anims.push(aBackdrop);
    runningAnimationsRef.current = anims;

    let active = true;
    Promise.all(anims.map((a) => a.finished))
      .then(() => {
        if (!active) return;
        settle();
        clearAnimatedStyles();
        setTransitionState("open");
        setIsReady(true);
      })
      .catch(() => {
        if (!active) return;
        settle();
        clearAnimatedStyles();
        setTransitionState("open");
        setIsReady(true);
      });

    return () => {
      active = false;
    };
  }, [isOpen, measurePortalGeometry, settle, clearAnimatedStyles]);

  // Video playback management
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isOpen) {
      const reduced = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      if (!reduced) {
        video.play().catch(() => {});
      }
    } else if (transitionState === "closed") {
      video.pause();
    }
  }, [isOpen, transitionState]);

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

  const isElementVisible = isOpen || transitionState !== "closed";

  return (
    <div
      ref={rootRef}
      id="landing"
      className={`${styles.ld} ${isElementVisible ? styles.open : ""} ${isReady ? styles.ready : ""}`}
      data-transition-state={transitionState}
      aria-label="Amirreza Gholipour Flat Portfolio"
    >
      {isElementVisible && (
        <div ref={backdropRef} className={styles.ldBackground} aria-hidden="true">
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
          <a href="#ld-techstack" onClick={(e) => scrollToSection("ld-techstack", e)}>
            Tech Stack
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
            <div ref={reelRef} className={styles.ldReel} aria-label="Room ASCII Animation">
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
                preload="auto"
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
                <div className={styles.ldHeroRoleWrap} aria-label="Role focus">
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
        </section>

        <div ref={wrapRef} className={styles.ldWrap}>

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
            <h2 className={styles.ldRise}>Experience & Background</h2>
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
