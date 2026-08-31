/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import Lenis from 'lenis';
import { Volume2, VolumeX, ArrowUpRight } from 'lucide-react';
import { getProjectsData, getPrinciplesList, getPhilosophyData, getServicesData, getStatsData, getFaqData, TRANSLATIONS } from './data/portfolioData';
import { ProjectMockup } from './components/ProjectMockup';
import { ContactModal } from './components/ContactModal';
import { MorphingMenu } from './components/MorphingMenu';
import { AboutMePage } from './components/AboutMePage';
import { ProjectsPage } from './components/ProjectsPage';
import { ContactPage } from './components/ContactPage';
import { ProjectDetailPage } from './components/ProjectDetailPage';
import { NotFoundPage } from './components/NotFoundPage';
import { AnimatedQuote } from './components/AnimatedQuote';
import { ScrollReveal } from './components/ScrollReveal';
import { ShutterRevealImage } from './components/ShutterRevealImage';
import { Footer } from './components/Footer';
import { CurtainBlindsTransition, BlindsTransitionStage } from './components/CurtainBlindsTransition';
import { BottomScrollProgress } from './components/BottomScrollProgress';
import { ambientSound, setupGlobalUISFX, uiSfx } from './utils/audio';
import { Language, Project } from './types';

type PageType = 'home' | 'aboutme' | 'projects' | 'contact' | 'project-detail' | '404';

interface NavigationTarget {
  page: PageType;
  targetPath?: string;
  project?: Project | null;
  callback?: () => void;
  skipHistory?: boolean;
}

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [timeStr, setTimeStr] = useState<string>('');
  const [isAudioPlaying, setIsAudioPlaying] = useState<boolean>(false);
  const [expandedThought, setExpandedThought] = useState<string>('01');
  const [expandedService, setExpandedService] = useState<string>('01');
  const [expandedFaq, setExpandedFaq] = useState<string>('01');
  const [activeProject, setActiveProject] = useState<Project | null>(null);

  // Modals state
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isContactOpen, setIsContactOpen] = useState<boolean>(false);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Blinds Curtain Transition State
  const [blindsStage, setBlindsStage] = useState<BlindsTransitionStage>('idle');
  const [transitionTitle, setTransitionTitle] = useState<string>('steward jason');
  const pendingNavRef = useRef<NavigationTarget | null>(null);
  const isTransitioningRef = useRef<boolean>(false);
  const currentPageRef = useRef<PageType>('home');

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);

  // Initialize uisfx global audio handlers
  useEffect(() => {
    setupGlobalUISFX();
  }, []);

  const lenisRef = useRef<Lenis | null>(null);

  // Motion Curtain Blinds safe navigation helper
  const navigateTo = (
    page: PageType,
    targetPath?: string,
    options?: { project?: Project | null; callback?: () => void; skipHistory?: boolean }
  ) => {
    // If already on the requested page with no project change or special callback, just scroll top
    if (page === currentPageRef.current && !options?.project && !options?.callback) {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    // Set transition label for the blinds center indicator
    let title = 'steward jason';
    if (options?.project) {
      title = options.project.title;
    } else if (page === 'aboutme') {
      title = 'about me';
    } else if (page === 'projects') {
      title = 'selected works';
    } else if (page === 'contact') {
      title = 'get in touch';
    } else if (page === 'home') {
      title = 'steward jason';
    } else if (page === '404') {
      title = '404 not found';
    }
    setTransitionTitle(title);

    pendingNavRef.current = {
      page,
      targetPath,
      project: options?.project,
      callback: options?.callback,
      skipHistory: options?.skipHistory,
    };
    isTransitioningRef.current = true;

    try {
      uiSfx.playSwitch();
    } catch {}

    // Trigger blinds closing animation across the screen
    setBlindsStage('closing');
  };

  // Called when all curtain blinds have fully closed over the screen
  const handleBlindsClosed = () => {
    const pending = pendingNavRef.current;
    if (pending) {
      setCurrentPage(pending.page);
      currentPageRef.current = pending.page;
      if (pending.project !== undefined) {
        setActiveProject(pending.project);
      }
      if (pending.callback) {
        pending.callback();
      }

      // Reset scroll position instantaneously behind the curtains
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true });
      }
      window.scrollTo({ top: 0, behavior: 'instant' });

      // Update browser history URL
      if (!pending.skipHistory) {
        try {
          const path = pending.targetPath || (pending.page === 'home' ? '/' : `/${pending.page}`);
          if (window.location.pathname !== path) {
            window.history.pushState({ page: pending.page }, '', path);
          }
        } catch {}
      }
    }

    // Uncover new page by opening the blinds downwards
    setBlindsStage('opening');
  };

  // Called when all curtain blinds have fully opened and revealed the new page
  const handleBlindsOpened = () => {
    setBlindsStage('idle');
    isTransitioningRef.current = false;
    pendingNavRef.current = null;
  };

  // Hash, Path and Popstate route listener (Supports direct links, Vercel SPA rewrites, and 404 fallback)
  useEffect(() => {
    const handleRoute = () => {
      const hash = window.location.hash.toLowerCase().replace(/^#\/?/, '').trim();
      const rawPath = window.location.pathname.toLowerCase().replace(/\/+$/, '') || '/';

      let targetPage: PageType = 'home';
      if (rawPath === '/aboutme' || hash === 'aboutme') {
        targetPage = 'aboutme';
      } else if (rawPath === '/projects' || hash === 'projects') {
        targetPage = 'projects';
      } else if (rawPath === '/contact' || hash === 'contact') {
        targetPage = 'contact';
      } else if (rawPath === '/404' || hash === '404') {
        targetPage = '404';
      } else if (rawPath === '/' || rawPath === '' || hash === 'home' || hash === '') {
        targetPage = 'home';
      } else {
        targetPage = '404';
      }

      if (targetPage !== currentPageRef.current) {
        navigateTo(targetPage, undefined, { skipHistory: true });
      }
    };

    window.addEventListener('hashchange', handleRoute);
    window.addEventListener('popstate', handleRoute);
    return () => {
      window.removeEventListener('hashchange', handleRoute);
      window.removeEventListener('popstate', handleRoute);
    };
  }, []);

  // Initialize Ultra-Smooth Inertia Scrolling (Lenis)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 2.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.1,
      touchMultiplier: 1.5,
      infinite: false,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    const reqId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(reqId);
      lenis.destroy();
    };
  }, []);

  // Real-time Clock in HH:mm:ss format
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      setTimeStr(`${hours}:${minutes}:${seconds}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const [footerProgress, setFooterProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight || 0;
      const clientHeight = document.documentElement.clientHeight || window.innerHeight || 0;
      const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;

      const totalScrollable = scrollHeight - clientHeight;
      if (totalScrollable <= 0 || Number.isNaN(totalScrollable)) {
        setFooterProgress(0);
        return;
      }

      const threshold = 600; // Track over the last 600px of scrolling
      const activeArea = totalScrollable - scrollTop;

      if (activeArea < threshold) {
        const p = 1 - activeArea / threshold;
        const clamped = Number.isNaN(p) ? 0 : Math.max(0, Math.min(1, p));
        setFooterProgress(clamped);
      } else {
        setFooterProgress(0);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleSound = () => {
    const active = ambientSound.toggle();
    setIsAudioPlaying(active);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el && lenisRef.current) {
      lenisRef.current.scrollTo(el, {
        offset: -60,
        duration: 1.8,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      });
    } else if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const t = TRANSLATIONS[lang];
  const currentProjects = getProjectsData(lang);
  const currentPrinciples = getPrinciplesList(lang);
  const currentPhilosophy = getPhilosophyData(lang);
  const currentServices = getServicesData(lang);
  const currentStats = getStatsData(lang);
  const currentFaq = getFaqData(lang);
  const localizedActiveProject = activeProject ? (currentProjects.find((p) => p.id === activeProject.id) || activeProject) : null;

  return (
    <div className="min-h-screen bg-[#fafaf9] text-[#121212] font-sans selection:bg-black selection:text-white relative">
      {/* ------------------------------------------------------------- */}
      {/* TOP FLOATING / STICKY HEADER */}
      {/* ------------------------------------------------------------- */}
      <header className="fixed top-0 left-0 right-0 z-40 px-4 sm:px-8 py-4 sm:py-5 flex items-center justify-center sm:justify-between pointer-events-none transition-all">
        {/* Left: • get in touch (Hidden on mobile, visible on desktop) */}
        <button
          onClick={() => {
            uiSfx.playSwitch();
            navigateTo('contact');
          }}
          className="hidden sm:inline-flex pointer-events-auto group items-center gap-2 text-xs sm:text-[13px] font-medium text-zinc-800 hover:text-black transition-all cursor-pointer"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 group-hover:scale-125 transition-transform"></span>
          <span className="tracking-tight">{t.getInTouch}</span>
        </button>

        {/* Center / Primary: [ ] Morphing Menu Button to Card */}
        <MorphingMenu
          isOpen={isMenuOpen}
          setIsOpen={setIsMenuOpen}
          lang={lang}
          onSelectLang={setLang}
          isAudioPlaying={isAudioPlaying}
          onToggleAudio={toggleSound}
          onOpenContact={() => {
            navigateTo('contact');
            setIsMenuOpen(false);
          }}
          onOpenStory={() => {
            navigateTo('aboutme');
            setIsMenuOpen(false);
          }}
          onOpen404={() => {
            navigateTo('404');
            setIsMenuOpen(false);
          }}
          onScrollTo={(id) => {
            if (id === 'projects') {
              navigateTo('projects');
            } else {
              navigateTo('home');
              setTimeout(() => {
                scrollToSection(id);
              }, 100);
            }
          }}
          menuLabel={t.menu}
        />

        {/* Right: Language selector pill group (Hidden on mobile, available in navbar menu) */}
        <div className="hidden sm:flex pointer-events-auto items-center bg-white/90 backdrop-blur-md rounded-full p-0.5 border border-zinc-200/90 shadow-xs">
          {(['id', 'en', 'de', 'ja'] as Language[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-2.5 py-1 rounded-full text-xs font-mono-code transition-all cursor-pointer ${
                lang === l
                  ? 'bg-[#ea580c] text-white font-semibold shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
              }`}
              title={`Switch to ${
                l === 'id' ? 'Bahasa Indonesia' : l === 'en' ? 'English' : l === 'de' ? 'Deutsch' : '日本語'
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT LAYER (SLIDES UP OVER THE STICKY FOOTER) */}
      {/* ------------------------------------------------------------- */}
      <div className="relative z-10 bg-[#fafaf9] shadow-xs pb-16 min-h-[calc(100vh-80px)]">
        {currentPage === 'home' ? (
          <>
            {/* ------------------------------------------------------------- */}
            {/* HERO SECTION */}
            {/* ------------------------------------------------------------- */}
            <section id="hero" className="relative pt-24 sm:pt-28 pb-16 overflow-hidden">
        {/* Hero Top Metadata Row (Aligned with center photo width) */}
        <ScrollReveal delay={100} distance={20}>
          <div className="w-64 sm:w-80 md:w-96 mx-auto px-0 flex justify-between items-center text-xs sm:text-[13px] text-zinc-400 font-mono-code mb-8 sm:mb-12">
            {/* Left: Real-time Clock */}
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 font-mono-code">{timeStr || '15:44:46'}</span>
            </div>

            {/* Right: o lend an ear (Ambient sound toggle) */}
            <button
              onClick={toggleSound}
              className="group flex items-center gap-2 text-zinc-400 hover:text-zinc-900 transition-colors cursor-pointer"
            >
              <span className={`w-1.5 h-1.5 rounded-full border border-zinc-400 group-hover:border-zinc-900 ${isAudioPlaying ? 'bg-emerald-500 border-emerald-500 animate-ping' : ''}`}></span>
              <span>o {t.lendAnEar}</span>
              {isAudioPlaying ? <Volume2 size={13} className="text-emerald-600 animate-pulse" /> : <VolumeX size={13} className="opacity-60" />}
            </button>
          </div>
        </ScrollReveal>

        {/* Hero Portrait & Infinite Slide Text Container */}
        <div className="relative w-full flex flex-col items-center justify-center my-6 sm:my-10">
          
          {/* Center Avatar Photo matching the reference */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-none bg-[#201d1c] overflow-hidden shadow-2xl relative group border border-zinc-900/10">
              {/* Photo Image with scroll-triggered shutter reveal */}
              <ShutterRevealImage
                src="/profile-3.webp"
                alt="Steward Jason Liuwindra"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full"
                imgClassName="w-full h-full object-cover object-center grayscale contrast-115 group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            </div>

            {/* [steward jason liuwindra] caption */}
            <div className="mt-4 text-[11px] sm:text-xs font-mono-code text-zinc-500 tracking-wide">
              {t.nameBracket}
            </div>
          </div>

          {/* GIANT INFINITE SLIDE MARQUEE TEXT (Overlays on top of photo with automatic color inversion) */}
          <div className="absolute w-full top-[42%] sm:top-[44%] -translate-y-1/2 pointer-events-none select-none z-20 overflow-hidden mix-blend-difference">
            <div className="animate-marquee-infinite flex whitespace-nowrap text-[13vw] sm:text-[14vw] font-bold tracking-tighter text-white leading-none uppercase">
              <span>{t.marqueeWord}</span>
              <span>{t.marqueeWord}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* ABOUT / INTRO SECTION */}
      {/* ------------------------------------------------------------- */}
      <section id="about" className="py-20 sm:py-32 px-6 sm:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
          {/* Left Column: [hey, i'm] [steward jason liuwindra] */}
          <div className="md:col-span-3">
            <ScrollReveal delay={100} distance={25}>
              <div className="space-y-1 font-mono-code text-xs sm:text-[13px] text-zinc-500">
                <div>[{t.heyIm}]</div>
                <div className="text-zinc-800 font-medium">{t.nameBracket}</div>
              </div>
            </ScrollReveal>
          </div>

          {/* Center Column: Portrait Photo */}
          <div className="md:col-span-4 flex justify-center">
            <div className="w-32 h-44 sm:w-36 sm:h-52 rounded-none bg-zinc-800 overflow-hidden shadow-lg border border-zinc-200">
              <ShutterRevealImage
                src="/profile-2.webp"
                alt="Steward Jason Liuwindra selfie"
                loading="lazy"
                decoding="async"
                className="w-full h-full"
                imgClassName="w-full h-full object-cover grayscale contrast-125 hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          {/* Right Column: Statement */}
          <div className="md:col-span-5">
            <ScrollReveal delay={300} distance={25}>
              <div className="text-xs sm:text-sm text-zinc-600 leading-relaxed max-w-md">
                {t.introRole}
              </div>
            </ScrollReveal>
          </div>
        </div>

        {/* SCROLL-DRIVEN ANIMATED QUOTE WITH COLOR INTERPOLATION & SLIDE UP */}
        <AnimatedQuote
          text={t.quoteCenter}
          onOpenStory={() => navigateTo('aboutme')}
          myStoryLabel={t.myStory}
        />
      </section>

      {/* ------------------------------------------------------------- */}
      {/* PROJECTS SHOWCASE SECTION (3 CORE PROJECTS) */}
      {/* ------------------------------------------------------------- */}
      <section id="projects" className="py-12 sm:py-20 border-t border-zinc-200/80">
        <div className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 border-b border-zinc-200">
            {currentProjects.map((project, idx) => (
              <ScrollReveal key={project.id} delay={idx * 100} distance={30} className="h-full">
                <div
                  onClick={() => {
                    navigateTo('project-detail', undefined, { project });
                  }}
                  className={`group cursor-pointer flex flex-col justify-between h-full ${
                    idx < 2 ? 'md:border-r border-zinc-200' : ''
                  } border-b md:border-b-0 border-zinc-200 hover:bg-zinc-100/50 transition-colors`}
                >
                  <div className="w-full aspect-[4/3] relative overflow-hidden bg-zinc-100">
                    <ProjectMockup type={project.imageType} imageUrl={project.imageUrl} />
                  </div>
                  <div className="p-4 sm:p-5 space-y-0.5">
                    <div className="text-xs sm:text-[13px] font-medium text-zinc-900 group-hover:underline lowercase flex items-center justify-between">
                      <span>{project.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-500" />
                    </div>
                    <div className="text-[11px] text-zinc-400 font-normal lowercase">
                      {project.client}
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* PRINCIPLES SECTION */}
      {/* ------------------------------------------------------------- */}
      <section id="principles" className="py-24 sm:py-36 px-6 sm:px-12 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
          <div className="md:col-span-4">
            <ScrollReveal delay={100} distance={20}>
              <div className="text-xs sm:text-[13px] font-mono-code text-zinc-400">
                {t.principlesLabel}
              </div>
            </ScrollReveal>
          </div>
          <div className="md:col-span-8 space-y-3 sm:space-y-3.5 text-xs sm:text-[13px] text-zinc-700">
            {currentPrinciples.map((principle, index) => (
              <ScrollReveal key={index} delay={index * 80} distance={20}>
                <div className="hover:text-black transition-colors">
                  {principle}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* THOUGHT SECTION */}
      {/* ------------------------------------------------------------- */}
      <section id="thought" className="py-20 sm:py-28 px-6 sm:px-12 max-w-5xl mx-auto border-t border-zinc-200/60">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
          <div className="md:col-span-4">
            <ScrollReveal delay={100} distance={20}>
              <div className="text-xs sm:text-[13px] font-mono-code text-zinc-400">
                {t.thoughtLabel}
              </div>
            </ScrollReveal>
          </div>

          <div className="md:col-span-8 space-y-8">
            <ScrollReveal delay={150} distance={25}>
              <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed max-w-xl">
                {t.thoughtIntro}
              </p>
            </ScrollReveal>

            <div className="space-y-4 pt-4 border-t border-zinc-200/60">
              {currentPhilosophy.map((item, idx) => {
                const isExpanded = expandedThought === item.number;
                return (
                  <ScrollReveal key={item.number} delay={idx * 100} distance={25}>
                    <div className="border-b border-zinc-100 pb-4 transition-colors">
                      <button
                        onClick={() => setExpandedThought(isExpanded ? '' : item.number)}
                        className="flex items-baseline gap-4 w-full text-left group cursor-pointer py-1"
                        aria-expanded={isExpanded}
                      >
                        <span className={`text-xs sm:text-[13px] font-mono-code transition-colors duration-300 ${
                          isExpanded ? 'text-zinc-900 font-semibold' : 'text-zinc-400 group-hover:text-zinc-800'
                        }`}>
                          {item.number}
                        </span>
                        <span className={`text-lg sm:text-xl font-bold tracking-tight transition-all duration-300 ${
                          isExpanded ? 'text-black translate-x-1' : 'text-zinc-800 group-hover:text-black group-hover:translate-x-0.5'
                        }`}>
                          {item.title}
                        </span>
                      </button>

                      {/* Smooth CSS Grid Accordion Transition */}
                      <div
                        className="grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
                        style={{
                          gridTemplateRows: isExpanded ? '1fr' : '0fr',
                          opacity: isExpanded ? 1 : 0,
                        }}
                      >
                        <div className="min-h-0 pl-8 sm:pl-9 space-y-1.5 pt-2">
                          <p className={`text-xs sm:text-[13px] text-zinc-500 italic transition-all duration-500 delay-75 ${
                            isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                          }`}>
                            {item.headline}
                          </p>
                          <p className={`text-xs sm:text-[12.5px] text-zinc-600 leading-relaxed pt-1 transition-all duration-500 delay-100 ${
                            isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                          }`}>
                            {item.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* SERVICES SECTION */}
      {/* ------------------------------------------------------------- */}
      <section id="services" className="py-20 sm:py-28 px-6 sm:px-12 max-w-5xl mx-auto border-t border-zinc-200/60">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
          <div className="md:col-span-4 space-y-3">
            <ScrollReveal delay={100} distance={20}>
              <div className="text-xs sm:text-[13px] font-mono-code text-zinc-400">
                {t.servicesLabel}
              </div>
            </ScrollReveal>
          </div>

          <div className="md:col-span-8 space-y-8">
            <ScrollReveal delay={150} distance={25}>
              <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed max-w-xl">
                {t.servicesIntro}
              </p>
            </ScrollReveal>

            <div className="space-y-4 pt-4 border-t border-zinc-200/60">
              {currentServices.map((service, idx) => {
                const isExpanded = expandedService === service.number;
                return (
                  <ScrollReveal key={service.number} delay={idx * 100} distance={25}>
                    <div className="border-b border-zinc-100 pb-4 transition-colors">
                      <button
                        onClick={() => setExpandedService(isExpanded ? '' : service.number)}
                        className="flex items-baseline justify-between w-full text-left group cursor-pointer py-1"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-baseline gap-4">
                          <span className={`text-xs sm:text-[13px] font-mono-code transition-colors duration-300 ${
                            isExpanded ? 'text-zinc-900 font-semibold' : 'text-zinc-400 group-hover:text-zinc-800'
                          }`}>
                            {service.number}
                          </span>
                          <span className={`text-lg sm:text-xl font-bold tracking-tight transition-all duration-300 ${
                            isExpanded ? 'text-black translate-x-1' : 'text-zinc-800 group-hover:text-black group-hover:translate-x-0.5'
                          }`}>
                            {service.title}
                          </span>
                        </div>
                        <span className="text-[11px] font-mono-code text-zinc-400 hidden sm:inline-block">
                          [{service.category}]
                        </span>
                      </button>

                      {/* Smooth CSS Grid Accordion Transition */}
                      <div
                        className="grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
                        style={{
                          gridTemplateRows: isExpanded ? '1fr' : '0fr',
                          opacity: isExpanded ? 1 : 0,
                        }}
                      >
                        <div className="min-h-0 pl-8 sm:pl-9 space-y-3 pt-2">
                          <p className={`text-xs sm:text-[12.5px] text-zinc-600 leading-relaxed transition-all duration-500 delay-75 ${
                            isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                          }`}>
                            {service.description}
                          </p>

                          {/* Deliverables tags */}
                          <div className={`flex flex-wrap gap-2 pt-1 transition-all duration-500 delay-100 ${
                            isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                          }`}>
                            {service.deliverables.map((item) => (
                              <span
                                key={item}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 text-[11px] font-mono-code text-zinc-700"
                              >
                                <span className="w-1 h-1 rounded-full bg-zinc-400"></span>
                                <span>{item}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>

            <ScrollReveal delay={200} distance={20}>
              <div className="pt-4">
                <button
                  onClick={() => {
                    navigateTo('contact');
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-300 hover:border-zinc-900 bg-white hover:bg-zinc-50 text-zinc-800 hover:text-black text-xs font-medium transition-all shadow-xs active:scale-95 cursor-pointer lowercase"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
                  <span>• {t.discussProject}</span>
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* STATS & IMPACT IN NUMBERS SECTION */}
      {/* ------------------------------------------------------------- */}
      <section id="stats" className="py-20 sm:py-28 px-6 sm:px-12 max-w-5xl mx-auto border-t border-zinc-200/60">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
          <div className="md:col-span-4 space-y-3">
            <ScrollReveal delay={100} distance={20}>
              <div className="text-xs sm:text-[13px] font-mono-code text-zinc-400">
                {t.statsLabel}
              </div>
            </ScrollReveal>
          </div>

          <div className="md:col-span-8 space-y-8">
            <ScrollReveal delay={150} distance={25}>
              <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed max-w-xl">
                {t.statsIntro}
              </p>
            </ScrollReveal>

            {/* Stats Metric Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {currentStats.map((stat, idx) => (
                <ScrollReveal key={stat.number + stat.label} delay={idx * 80} distance={20}>
                  <div className="p-6 rounded-2xl bg-zinc-50/80 border border-zinc-200/80 hover:border-zinc-400 hover:bg-zinc-50 transition-all duration-300 space-y-2 group">
                    <div className="flex items-baseline gap-1 text-3xl sm:text-4xl font-extrabold text-zinc-900 tracking-tight font-mono-code">
                      <span>{stat.number}</span>
                      <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform">{stat.suffix}</span>
                    </div>
                    <div className="space-y-0.5">
                      <div className="text-xs font-mono-code text-zinc-900 font-bold lowercase">
                        {stat.label}
                      </div>
                      <div className="text-[11px] text-zinc-500 leading-relaxed lowercase">
                        {stat.sublabel}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* FAQ SECTION */}
      {/* ------------------------------------------------------------- */}
      <section id="faq" className="py-20 sm:py-28 px-6 sm:px-12 max-w-5xl mx-auto border-t border-zinc-200/60">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 items-start">
          <div className="md:col-span-4 space-y-3">
            <ScrollReveal delay={100} distance={20}>
              <div className="text-xs sm:text-[13px] font-mono-code text-zinc-400">
                {t.faqLabel}
              </div>
            </ScrollReveal>
          </div>

          <div className="md:col-span-8 space-y-8">
            <ScrollReveal delay={150} distance={25}>
              <p className="text-xs sm:text-[13px] text-zinc-600 leading-relaxed max-w-xl">
                {t.faqIntro}
              </p>
            </ScrollReveal>

            <div className="space-y-4 pt-4 border-t border-zinc-200/60">
              {currentFaq.map((faqItem, idx) => {
                const isExpanded = expandedFaq === faqItem.number;
                return (
                  <ScrollReveal key={faqItem.number} delay={idx * 80} distance={25}>
                    <div className="border-b border-zinc-100 pb-4 transition-colors">
                      <button
                        onClick={() => {
                          uiSfx.playPop();
                          setExpandedFaq(isExpanded ? '' : faqItem.number);
                        }}
                        className="flex items-baseline justify-between w-full text-left group cursor-pointer py-1"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex items-baseline gap-4">
                          <span className={`text-xs sm:text-[13px] font-mono-code transition-colors duration-300 ${
                            isExpanded ? 'text-zinc-900 font-semibold' : 'text-zinc-400 group-hover:text-zinc-800'
                          }`}>
                            {faqItem.number}
                          </span>
                          <span className={`text-base sm:text-lg font-bold tracking-tight lowercase transition-all duration-300 ${
                            isExpanded ? 'text-black translate-x-1' : 'text-zinc-800 group-hover:text-black group-hover:translate-x-0.5'
                          }`}>
                            {faqItem.question}
                          </span>
                        </div>
                        <span className={`text-xs font-mono-code transition-transform duration-300 text-zinc-400 ${
                          isExpanded ? 'rotate-90 text-zinc-900 font-bold' : ''
                        }`}>
                          [+]
                        </span>
                      </button>

                      {/* Smooth CSS Grid Accordion Transition */}
                      <div
                        className="grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden"
                        style={{
                          gridTemplateRows: isExpanded ? '1fr' : '0fr',
                          opacity: isExpanded ? 1 : 0,
                        }}
                      >
                        <div className="min-h-0 pl-8 sm:pl-9 space-y-3 pt-2">
                          <p className={`text-xs sm:text-[12.5px] text-zinc-600 leading-relaxed transition-all duration-500 delay-75 ${
                            isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                          }`}>
                            {faqItem.answer}
                          </p>

                          {faqItem.tags && (
                            <div className={`flex flex-wrap gap-1.5 pt-1 transition-all duration-500 delay-100 ${
                              isExpanded ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
                            }`}>
                              {faqItem.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="text-[10px] font-mono-code text-zinc-400 lowercase"
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* CALL TO ACTION SECTION */}
      {/* ------------------------------------------------------------- */}
      <section className="py-28 sm:py-36 px-6 text-center max-w-xl mx-auto space-y-6">
        <ScrollReveal delay={100} distance={30}>
          <h3 className="text-sm sm:text-base font-bold tracking-tight text-zinc-900">
            {t.buildHeading}
          </h3>
        </ScrollReveal>

        <ScrollReveal delay={180} distance={25}>
          <p className="text-xs sm:text-[13px] text-zinc-500 leading-relaxed">
            {t.buildSub}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={240} distance={20}>
          <div className="pt-2">
            <button
              onClick={() => {
                uiSfx.playSwitch();
                navigateTo('contact');
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-300 hover:border-zinc-900 bg-white hover:bg-zinc-50 text-zinc-800 hover:text-black text-xs font-medium transition-all shadow-xs active:scale-95 cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-900"></span>
              <span>{t.getInTouch}</span>
            </button>
          </div>
        </ScrollReveal>
      </section>
    </>
  ) : currentPage === 'aboutme' ? (
    <AboutMePage
      lang={lang}
      onBack={() => {
        navigateTo('home');
      }}
      onOpenContact={() => {
        navigateTo('contact');
      }}
      onSeeAllProjects={() => {
        navigateTo('projects');
      }}
      onSelectProject={(project) => {
        navigateTo('project-detail', undefined, { project });
      }}
    />
  ) : currentPage === 'projects' ? (
    <ProjectsPage
      lang={lang}
      onBack={() => {
        navigateTo('home');
      }}
      onOpenContact={() => {
        navigateTo('contact');
      }}
      onSelectProject={(project) => {
        navigateTo('project-detail', undefined, { project });
      }}
    />
  ) : currentPage === 'project-detail' && localizedActiveProject ? (
    <ProjectDetailPage
      project={localizedActiveProject}
      lang={lang}
      onBack={() => {
        navigateTo('projects');
      }}
      onOpenContact={() => {
        navigateTo('contact');
      }}
      onSelectProject={(project) => {
        navigateTo('project-detail', undefined, { project });
      }}
      allProjects={currentProjects}
    />
  ) : currentPage === '404' ? (
    <NotFoundPage
      lang={lang}
      onNavigateHome={() => {
        navigateTo('home');
      }}
    />
  ) : (
    <ContactPage
      lang={lang}
      onNavigateHome={() => {
        navigateTo('home');
      }}
    />
  )}
</div>

      {/* ------------------------------------------------------------- */}
      {/* UNIFIED STICKY ANIMATED FOOTER (REVEALED FROM UNDERNEATH) */}
      {/* ------------------------------------------------------------- */}
      <Footer
        footerProgress={footerProgress}
        lang={lang}
        onNavigateHome={() => {
          navigateTo('home');
        }}
        onNavigateAboutMe={() => {
          navigateTo('aboutme');
        }}
        onOpenContact={() => {
          navigateTo('contact');
        }}
        onScrollToProjects={() => {
          navigateTo('projects');
        }}
        onScrollToServices={() => {
          if (currentPage !== 'home') {
            navigateTo('home');
            setTimeout(() => {
              scrollToSection('services');
            }, 120);
          } else {
            scrollToSection('services');
          }
        }}
        onScrollToFaq={() => {
          if (currentPage !== 'home') {
            navigateTo('home');
            setTimeout(() => {
              scrollToSection('faq');
            }, 120);
          } else {
            scrollToSection('faq');
          }
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* MODALS */}
      {/* ------------------------------------------------------------- */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        lang={lang}
      />

      {/* ------------------------------------------------------------- */}
      {/* BOTTOM BLACK SCROLL PROGRESS BAR */}
      {/* ------------------------------------------------------------- */}
      <BottomScrollProgress currentPage={currentPage} />

      {/* ------------------------------------------------------------- */}
      {/* MOTION CURTAIN BLINDS PAGE TRANSITION OVERLAY */}
      {/* ------------------------------------------------------------- */}
      <CurtainBlindsTransition
        stage={blindsStage}
        targetPageName={transitionTitle}
        onClosed={handleBlindsClosed}
        onOpened={handleBlindsOpened}
      />
    </div>
  );
}
