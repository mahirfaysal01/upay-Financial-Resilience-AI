import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Sliders,
  Bell,
  ShieldCheck,
  Shield,
  CheckCircle2,
  Calendar,
  Sparkles,
  Zap,
  ArrowUpRight,
  ChevronRight,
  Bot,
  Layers,
  ChevronDown,
  Lock,
  DollarSign,
  QrCode,
  Users,
  Check,
  X,
  HelpCircle,
  Activity,
  Award,
  Clock,
} from 'lucide-react';
import { UpayLogo } from '../components/UpayLogo';
import { toBengaliNumber } from '../utils/translations';

// Sample Personas for Interactive Hero Morphing
interface HeroPersona {
  id: string;
  name: string;
  role: string;
  risk: number;
  riskLevel: 'HIGH' | 'MODERATE' | 'LOW';
  monthlyIncome: string;
  upcomingBill: string;
  verdict: string;
}

const HERO_PERSONAS: HeroPersona[] = [
  {
    id: 'p1',
    name: 'রহিম হাসান',
    role: 'চাকরিজীবী',
    risk: 82,
    riskLevel: 'HIGH',
    monthlyIncome: '৳৩৫,০০০',
    upcomingBill: '৳২,০০০',
    verdict: '৬ দিনের মধ্যে ওয়ালেট ব্যালেন্স ১,০০০ টাকার নিচে নামার স্পষ্ট ঝুঁকি রয়েছে।',
  },
  {
    id: 'p2',
    name: 'নুসরাত জাহান',
    role: 'স্থিতিশীল সঞ্চয়ী',
    risk: 24,
    riskLevel: 'LOW',
    monthlyIncome: '৳৫০,০০০',
    upcomingBill: '৳৩,৫০০',
    verdict: 'আপনার ওয়ালেটে পর্যাপ্ত সেফটি বাফার রয়েছে। মাস শেষে ঘাটতির ঝুঁকি নেই।',
  },
  {
    id: 'p3',
    name: 'তানভীর আহমেদ',
    role: 'উচ্চ ব্যয়কারী',
    risk: 68,
    riskLevel: 'HIGH',
    monthlyIncome: '৳২৮,০০০',
    upcomingBill: '৳১,৫০০',
    verdict: 'অতিরিক্ত ফুড ডেলিভারি ব্যয়ের কারণে বেতন আসার ৫ দিন আগে ঘাটতি হতে পারে।',
  },
  {
    id: 'p4',
    name: 'আরিফ হোসেন',
    role: 'ফ্রিল্যান্সার',
    risk: 45,
    riskLevel: 'MODERATE',
    monthlyIncome: '৳৪২,০০০',
    upcomingBill: '৳১,২০০',
    verdict: 'অনিয়মিত আয়ের কারণে একটি ১৫% আপৎকালীন রিজার্ভ রাখা বাঞ্ছনীয়।',
  },
];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Scroll states for nav and progress bar
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Transition overlay state for expanding yellow circle
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionOrigin, setTransitionOrigin] = useState<{ x: number; y: number }>({ x: 50, y: 50 });

  // Selected Persona for Live Hero Morphing
  const [selectedPersona, setSelectedPersona] = useState<HeroPersona>(HERO_PERSONAS[0]);
  const [personaFading, setPersonaFading] = useState(false);

  // Hero counter and preview gauge states
  const [gaugeValue, setGaugeValue] = useState(0);
  const [lineProgress, setLineProgress] = useState(0);

  // Trust strip counters (triggered by intersection)
  const [trustAnimated, setTrustAnimated] = useState(false);
  const [count1, setCount1] = useState(0);
  const [count2, setCount2] = useState(0);
  const [count3, setCount3] = useState(0);
  const trustRef = useRef<HTMLDivElement>(null);

  // How it works connecting line (triggered by intersection)
  const [stepsVisible, setStepsVisible] = useState(false);
  const [activeStepHover, setActiveStepHover] = useState<number | null>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  // Mini-demo interactive slider and QR toggle state
  const [reductionSlider, setReductionSlider] = useState(15);
  const [isQrModeActive, setIsQrModeActive] = useState(true);

  // Before vs After View Tab state
  const [comparisonTab, setComparisonTab] = useState<'withUpay' | 'withoutUpay'>('withUpay');

  // FAQ Accordion Open state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Parallax ref for floating preview card
  const previewCardRef = useRef<HTMLDivElement>(null);

  // Track window scroll for nav blur, parallax and progress
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      setScrollY(currentScroll);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = totalHeight > 0 ? (currentScroll / totalHeight) * 100 : 0;
      setScrollProgress(progress);

      // Gentle parallax for preview card (moves 8% slower)
      if (previewCardRef.current && window.innerWidth >= 768) {
        const offset = currentScroll * 0.08;
        previewCardRef.current.style.transform = `translateY(${offset}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Orchestrated Hero entrance animation on mount and persona change
  useEffect(() => {
    const targetRisk = selectedPersona.risk;
    const startTime = performance.now();
    const duration = 900;

    const animateGauge = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / duration);
      const ease = 1 - Math.pow(1 - progress, 3);
      setGaugeValue(Math.round(ease * targetRisk));
      setLineProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animateGauge);
      }
    };

    const timer = setTimeout(() => {
      requestAnimationFrame(animateGauge);
    }, 150);

    return () => clearTimeout(timer);
  }, [selectedPersona]);

  // Handle Persona Click with quick morph transition
  const handleSelectPersona = (p: HeroPersona) => {
    if (p.id === selectedPersona.id) return;
    setPersonaFading(true);
    setTimeout(() => {
      setSelectedPersona(p);
      setPersonaFading(false);
    }, 160);
  };

  // IntersectionObserver for Trust Strip Counters
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !trustAnimated) {
          setTrustAnimated(true);

          const timer1 = setInterval(() => {
            setCount1((prev) => {
              if (prev >= 14) {
                clearInterval(timer1);
                return 14;
              }
              return prev + 1;
            });
          }, 60);

          const timer2 = setInterval(() => {
            setCount2((prev) => {
              if (prev >= 30) {
                clearInterval(timer2);
                return 30;
              }
              return prev + 2;
            });
          }, 45);

          const timer3 = setInterval(() => {
            setCount3((prev) => {
              if (prev >= 82) {
                clearInterval(timer3);
                return 82;
              }
              return prev + 4;
            });
          }, 35);
        }
      },
      { threshold: 0.3 }
    );

    if (trustRef.current) {
      observer.observe(trustRef.current);
    }

    return () => observer.disconnect();
  }, [trustAnimated]);

  // IntersectionObserver for How It Works step connecting line
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setStepsVisible(true);
        }
      },
      { threshold: 0.25 }
    );

    if (stepsRef.current) {
      observer.observe(stepsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // IntersectionObserver-based reveal effect for all 'section' elements
  useEffect(() => {
    const sections = document.querySelectorAll('section');
    sections.forEach((sec) => {
      sec.classList.add('reveal-section');
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('fade-up');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    sections.forEach((sec) => observer.observe(sec));

    return () => {
      sections.forEach((sec) => observer.unobserve(sec));
      observer.disconnect();
    };
  }, []);

  // 3D Tilt calculation for feature cards on desktop
  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia('(hover: none)').matches) return;
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const tiltX = (y / (rect.height / 2)) * -4;
    const tiltY = (x / (rect.width / 2)) * 4;

    card.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`;
  };

  const handleCardMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  // Trigger smooth expanding yellow circle transition to dashboard
  const handleLaunchDashboard = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = ((rect.left + rect.width / 2) / window.innerWidth) * 100;
    const y = ((rect.top + rect.height / 2) / window.innerHeight) * 100;
    setTransitionOrigin({ x, y });
    setIsTransitioning(true);

    setTimeout(() => {
      navigate('/dashboard');
    }, 420);
  };

  // Mini-demo calculations with slider and QR toggle
  const baseDemoRisk = 82;
  const sliderReductionEffect = reductionSlider * 0.7;
  const qrSavingsEffect = isQrModeActive ? 8 : 0;
  const currentRiskCalculated = Math.max(38, Math.round(baseDemoRisk - sliderReductionEffect - qrSavingsEffect));
  const riskDrop = baseDemoRisk - currentRiskCalculated;
  const monthlySavingsTaka = Math.round(reductionSlider * 65 + (isQrModeActive ? 320 : 0));

  const headlineWords = [
    { text: 'আর্থিক', highlight: false },
    { text: 'সমস্যা', highlight: false },
    { text: 'আসার', highlight: false },
    { text: 'আগেই', highlight: true },
    { text: 'জেনে', highlight: false },
    { text: 'নিন', highlight: false },
  ];

  // FAQ items in pure Bangla
  const FAQ_ITEMS = [
    {
      q: 'উপায় এআই কীভাবে আমার সম্ভাব্য আর্থিক ঘাটতি আগে থেকেই বুঝতে পারে?',
      a: 'সিস্টেমটি আপনার অতীতের লেনদেন, আয়ের চক্র, ইউটিলিটি বিলের নির্ধারিত তারিখ এবং দৈনিক খরচের গড় গতিবিধি গাণিতিক মডেলে বিশ্লেষণ করে। বেতন পাওয়ার পূর্বের শেষ ১০ দিনে ওয়ালেট শূন্য হওয়ার ঝুঁকি থাকলে এটি ১৪ দিন আগেই অ্যালার্ট দেয়।',
    },
    {
      q: 'এটি কি আমার অ্যাকাউন্ট থেকে স্বয়ংক্রিয়ভাবে কোনো টাকা কেটে নিবে?',
      a: 'না, কখনোই না। এটি সম্পূর্ণ স্বয়ংক্রিয় সিদ্ধান্ত-সহায়ক (Decision-Support) প্ল্যাটফর্ম। আপনি নিজে অনুমোদন না দেওয়া পর্যন্ত কোনো টাকা স্থানান্তরিত হয় না। বিল বাফার লক করলে টাকা আপনারই ওয়ালেটে সুরক্ষিত রিজার্ভ হিসেবে আলাদা থাকে।',
    },
    {
      q: 'হোয়াট-ইফ সিমুলেটর কীভাবে আমার কাজে লাগবে?',
      a: 'বাস্তবে টাকা খরচ না করেই আপনি স্ক্রিনে স্লাইডার ঘুরিয়ে দেখতে পারবেন—যেমন রেস্তোরাঁয় ১৫% খরচ কমালে কিংবা অতিরিক্ত ৫,০০০ টাকা বোনাস পেলে মাস শেষে আপনার ব্যালেন্স ও ঝুঁকির চিত্রে কী পরিবর্তন ঘটবে।',
    },
    {
      q: 'উপায় ইমার্জেন্সি ০% ন্যানো-বাফার কীভাবে কাজ করে?',
      a: 'যেসব গ্রাহকের ক্যাশ-ফ্লো শৃঙ্খলা ভালো কিন্তু হঠাৎ ইউটিলিটি বিল বা জরুরি প্রয়োজনে সাময়িক টানাপোড়েনে পড়েন, তাদের ক্ষতিকর শিকারি ঋণ এড়াতে উপায় তাৎক্ষণিক ১,০০০ টাকা ০% সুদের বাফার প্রদান করে।',
    },
  ];

  return (
    <div className="route-fade-slide relative min-h-screen bg-[var(--bg)] text-[var(--ink)] overflow-x-clip selection:bg-[var(--yellow)] selection:text-[var(--navy)]">
      {/* 1. TOP YELLOW SCROLL PROGRESS BAR */}
      <div
        className="fixed top-0 left-0 h-[3.5px] bg-[var(--yellow)] z-[100] transition-all duration-75 shadow-xs"
        style={{ width: `${scrollProgress}%` }}
        role="progressbar"
        aria-valuenow={Math.round(scrollProgress)}
        aria-valuemin={0}
        aria-valuemax={100}
      />

      {/* FULL-PAGE EXPANDING TRANSITION OVERLAY */}
      {isTransitioning && (
        <div
          className="fixed inset-0 z-[9999] pointer-events-none flex items-center justify-center overflow-hidden"
          style={{ perspective: 1000 }}
        >
          <div
            className="w-16 h-16 rounded-full bg-[var(--yellow)] animate-ping"
            style={{
              position: 'absolute',
              left: `${transitionOrigin.x}%`,
              top: `${transitionOrigin.y}%`,
              transform: 'translate(-50%, -50%) scale(55)',
              transition: 'transform 450ms cubic-bezier(0.2, 0.8, 0.2, 1), opacity 450ms ease',
            }}
          />
        </div>
      )}

      {/* 2. FLOATING STICKY NAV WITH RADIUS */}
      <header className="fixed top-2.5 sm:top-3.5 left-0 right-0 z-50 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-all duration-300 pointer-events-none">
        <div
          className={`pointer-events-auto rounded-[22px] sm:rounded-full transition-all duration-300 px-4 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between border ${
            scrollY > 15
              ? 'bg-white/95 backdrop-blur-xl border-slate-200/90 shadow-[0_10px_30px_rgba(11,31,75,0.08)]'
              : 'bg-white/85 backdrop-blur-md border-slate-200/60 shadow-xs'
          }`}
        >
          {/* Logo on Left */}
          <Link
            to="/"
            className="flex items-center gap-2 group transition-transform hover:opacity-95"
            aria-label="upay Financial Resilience AI Home"
          >
            <UpayLogo height={36} alt="upay" />
          </Link>

          {/* Right: Demo View Link & Yellow Primary Button */}
          <div className="flex items-center gap-4 sm:gap-6">
            <a
              href="#mini-demo"
              className="hidden sm:inline-block text-[14px] font-bold text-[var(--navy)] nav-link-center-line cursor-pointer"
            >
              লাইভ ডেমো
            </a>
            <a
              href="#comparison"
              className="hidden md:inline-block text-[14px] font-bold text-[var(--navy)] nav-link-center-line cursor-pointer"
            >
              আগে বনাম পরে
            </a>

            <button
              onClick={handleLaunchDashboard}
              className="btn-primary yellow-glow-pulse text-[13.5px] !px-4.5 !py-2 shadow-sm"
              aria-label="শুরু করুন এবং ড্যাশবোর্ড দেখুন"
            >
              <span>শুরু করুন</span>
              <ArrowRight className="w-4 h-4 btn-arrow-icon" />
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20 sm:pt-24 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 sm:space-y-24">
        {/* 3. HERO (Open, Modern Canvas Layout - Blue card removed) */}
        <section
          className={`relative pt-4 sm:pt-8 pb-4 sm:pb-8 transition-all duration-400 ease-out ${
            isTransitioning ? 'scale-[0.97] opacity-60' : 'scale-100 opacity-100'
          }`}
          aria-label="Hero Section"
        >
          {/* Subtle Ambient Glow and Tech Dot Pattern */}
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[340px] bg-gradient-to-tr from-amber-200/25 via-yellow-100/20 to-blue-100/20 blur-3xl rounded-full pointer-events-none -z-10"
            aria-hidden="true"
          />
          <div
            className="absolute -top-12 -left-12 w-64 h-64 bg-amber-100/30 rounded-full blur-2xl pointer-events-none -z-10"
            aria-hidden="true"
          />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
            {/* Left Column: Word-by-Word Headline, Interactive Persona Selectors & Actions */}
            <div className="lg:col-span-7 space-y-5 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50/90 text-[var(--navy)] text-[12px] font-bold border border-amber-200 shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[var(--yellow)] animate-pulse" />
                <span>উপায় ডিজিটাল ফাইনান্সিয়াল রেজিলিয়েন্স</span>
              </div>

              {/* Headline revealed word-by-word with 60ms stagger */}
              <h1 className="font-heading font-extrabold text-[36px] sm:text-[46px] lg:text-[54px] text-[var(--navy)] leading-[1.18] tracking-tight">
                {headlineWords.map((item, idx) => (
                  <span
                    key={idx}
                    className={`inline-block mr-2.5 transition-all duration-500 ${
                      item.highlight
                        ? 'text-amber-500 underline decoration-amber-300 decoration-wavy decoration-2 underline-offset-6'
                        : 'text-[var(--navy)]'
                    }`}
                    style={{
                      animation: `fadeInUp 450ms ease-out ${idx * 60}ms backwards`,
                    }}
                  >
                    {item.text}
                  </span>
                ))}
              </h1>

              <p className="text-slate-600 text-[16px] sm:text-[17.5px] max-w-xl leading-relaxed">
                উপায় এআই আপনার ওয়ালেটের নগদ প্রবাহ ও খরচের গতি বিশ্লেষণ করে মাস শেষের সম্ভাব্য আর্থিক ঘাটতি সমস্যা হওয়ার আগেই পূর্বাভাস দেয়।
              </p>

              {/* Interactive Live Persona Switcher on Light Background */}
              <div className="space-y-2 pt-1">
                <p className="text-[12.5px] text-slate-700 font-bold flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-500" />
                  <span>লাইভ টেস্ট প্রোফাইল বেছে নিন (কার্ডের ডেটা রিয়েল-টাইমে বদলাবে):</span>
                </p>
                <div className="flex flex-wrap items-center gap-2">
                  {HERO_PERSONAS.map((p) => {
                    const isSelected = p.id === selectedPersona.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => handleSelectPersona(p)}
                        className={`px-3 py-1.5 rounded-full text-[12.5px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                          isSelected
                            ? 'bg-[var(--navy)] text-[var(--yellow)] shadow-sm scale-102 ring-2 ring-[var(--yellow)]/60'
                            : 'bg-white text-slate-700 hover:text-[var(--navy)] hover:bg-slate-50 border border-slate-200 shadow-2xs'
                        }`}
                        title={`${p.name} - ${p.role}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-[var(--yellow)]' : 'bg-slate-400'}`} />
                        <span>{p.name}</span>
                        <span className="text-[10.5px] opacity-75 font-normal">({p.role})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Primary & Secondary Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5">
                <button
                  onClick={handleLaunchDashboard}
                  className="btn-primary yellow-glow-pulse text-[15px] !py-3.5 !px-7 shadow-md"
                >
                  <span>ড্যাশবোর্ড খুলুন</span>
                  <ArrowRight className="w-4.5 h-4.5 btn-arrow-icon" />
                </button>

                <a
                  href="#how-it-works"
                  className="btn-secondary text-[15px] !py-3.5 !px-6 text-center shadow-2xs"
                >
                  <span>কীভাবে কাজ করে</span>
                </a>
              </div>
            </div>

            {/* Right Column: Compact, Clean Smart-Pass Preview Card (Light & Concise) */}
            <div
              ref={previewCardRef}
              className="lg:col-span-5 flex justify-center lg:justify-end transition-transform duration-200 ease-out"
            >
              <div
                className={`w-full max-w-sm rounded-[22px] bg-white text-[var(--ink)] p-4.5 sm:p-5 shadow-[0_16px_40px_rgba(0,0,0,0.22)] border border-slate-100 space-y-3.5 transition-all duration-200 ${
                  personaFading ? 'opacity-40 scale-98' : 'opacity-100 scale-100'
                }`}
              >
                {/* Header: Compact User Info & Live Risk Badge */}
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--yellow)] text-[var(--navy)] font-heading font-black text-xs flex items-center justify-center shadow-xs">
                      {selectedPersona.name[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-heading font-bold text-[13.5px] text-[var(--navy)] leading-none">
                          {selectedPersona.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-medium">({selectedPersona.role})</span>
                      </div>
                      <p className="text-[10.5px] text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>লাইভ ক্যাশফ্লো স্ক্যান</span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border ${
                      selectedPersona.riskLevel === 'HIGH'
                        ? 'bg-red-50 text-red-600 border-red-200'
                        : selectedPersona.riskLevel === 'MODERATE'
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    {selectedPersona.riskLevel === 'HIGH'
                      ? '৮২% উচ্চ ঝুঁকি'
                      : selectedPersona.riskLevel === 'MODERATE'
                      ? '৪৮% মাঝারি'
                      : '২৪% সুরক্ষিত'}
                  </span>
                </div>

                {/* Middle: Compact Split Layout (Gauge on Left + Stats & Sparkline on Right) */}
                <div className="grid grid-cols-12 gap-3 items-center pt-0.5">
                  {/* Left: Compact Radial Meter */}
                  <div className="col-span-5 flex flex-col items-center justify-center p-2 rounded-xl bg-slate-50/80 border border-slate-100">
                    <div className="relative w-18 h-18 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 70 70">
                        <circle
                          cx="35"
                          cy="35"
                          r="28"
                          fill="transparent"
                          stroke="#E2E8F0"
                          strokeWidth="6"
                        />
                        <circle
                          cx="35"
                          cy="35"
                          r="28"
                          fill="transparent"
                          stroke={
                            selectedPersona.riskLevel === 'HIGH'
                              ? '#E5484D'
                              : selectedPersona.riskLevel === 'MODERATE'
                              ? '#FFC20E'
                              : '#1FA971'
                          }
                          strokeWidth="6.5"
                          strokeDasharray={2 * Math.PI * 28}
                          strokeDashoffset={2 * Math.PI * 28 * (1 - gaugeValue / 100)}
                          strokeLinecap="round"
                          className="transition-all duration-400 ease-out"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span
                          className={`font-heading font-extrabold text-[17px] leading-none ${
                            selectedPersona.riskLevel === 'HIGH'
                              ? 'text-[var(--danger)]'
                              : selectedPersona.riskLevel === 'MODERATE'
                              ? 'text-amber-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          {toBengaliNumber(gaugeValue)}%
                        </span>
                        <span className="text-[8.5px] text-slate-400 font-bold uppercase mt-0.5">ঘাটতি</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold mt-1">
                      {selectedPersona.riskLevel === 'HIGH'
                        ? '৯ দিনে ঘাটতি'
                        : selectedPersona.riskLevel === 'MODERATE'
                        ? '৫ দিনে ঘাটতি'
                        : 'সুরক্ষিত'}
                    </span>
                  </div>

                  {/* Right: Key Numbers & Sparkline */}
                  <div className="col-span-7 space-y-2">
                    <div className="grid grid-cols-2 gap-1.5">
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <p className="text-[9.5px] text-slate-500 font-medium">নিশ্চিত আয়</p>
                        <p className="font-heading font-extrabold text-[12px] text-[var(--navy)]">
                          {selectedPersona.monthlyIncome}
                        </p>
                      </div>
                      <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 text-center">
                        <p className="text-[9.5px] text-slate-500 font-medium">আসন্ন বিল</p>
                        <p className="font-heading font-extrabold text-[12px] text-[var(--danger)]">
                          {selectedPersona.upcomingBill}
                        </p>
                      </div>
                    </div>

                    {/* Micro Sparkline */}
                    <div className="px-2 py-1 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <span className="text-[9.5px] text-slate-500">১৪ দিনের ট্রেন্ড:</span>
                      <svg className="w-20 h-4" viewBox="0 0 60 16" fill="none">
                        <path
                          d={
                            selectedPersona.riskLevel === 'LOW'
                              ? 'M0 13 Q15 11 30 8 T60 3'
                              : 'M0 3 Q15 5 30 9 T60 14'
                          }
                          stroke={selectedPersona.riskLevel === 'LOW' ? '#1FA971' : '#E5484D'}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* AI Warning Line (Compact 1-liner) */}
                <div
                  className={`px-3 py-2 rounded-xl text-[11.5px] font-medium leading-snug flex items-center gap-2 border ${
                    selectedPersona.riskLevel === 'HIGH'
                      ? 'bg-rose-50/80 border-rose-200 text-rose-800'
                      : selectedPersona.riskLevel === 'MODERATE'
                      ? 'bg-amber-50/80 border-amber-200 text-amber-800'
                      : 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-current" />
                  <p className="line-clamp-2">{selectedPersona.verdict}</p>
                </div>

                {/* Compact One-Tap Action Button */}
                <button
                  onClick={handleLaunchDashboard}
                  className="w-full py-2 px-3 rounded-xl bg-[var(--yellow)] hover:bg-amber-400 text-[var(--navy)] font-heading font-extrabold text-[12px] flex items-center justify-center gap-1.5 shadow-xs hover:shadow-sm transition-all cursor-pointer"
                >
                  <Zap className="w-3 h-3 fill-current" />
                  <span>উপায় বাফার লক সক্রিয় করুন</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
        </div>
      </section>

        {/* 4. REAL-TIME RESILIENCE PULSE TICKER (Infinite Smooth Marquee) */}
        <div className="overflow-hidden rounded-[16px] bg-[var(--navy)] text-white py-3 border border-[var(--navy-2)] shadow-xs relative">
          <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-[var(--navy)] to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[var(--navy)] to-transparent z-10 pointer-events-none" />

          <div className="animate-marquee items-center gap-8 text-[13px] font-medium tracking-wide">
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[var(--yellow)]" />
              <span>রহিম হাসান: ২,০০০ টাকার ডিপিডিসি বিল বাফার সফলভাবে লকড</span>
            </span>
            <span className="text-[var(--yellow)]">✦</span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>নুসরাত জাহান: মাসিক ঘাটতি ঝুঁকি ৮২% থেকে কমে ২৪%-এ নেমে এসেছে</span>
            </span>
            <span className="text-[var(--yellow)]">✦</span>
            <span className="flex items-center gap-2">
              <QrCode className="w-3.5 h-3.5 text-[var(--yellow)]" />
              <span>মেহেদী জামান: মার্চেন্ট কিউআর পেমেন্টে ৩২০ টাকা ক্যাশ-আউট ফি সাশ্রয়</span>
            </span>
            <span className="text-[var(--yellow)]">✦</span>
            <span className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>আরিফ হোসেন: ইউসিবি ন্যানো-বাফার তাৎক্ষণিক প্রাক-অনুমোদিত</span>
            </span>
            <span className="text-[var(--yellow)]">✦</span>
            {/* Repeated for continuous marquee loop */}
            <span className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-[var(--yellow)]" />
              <span>রহিম হাসান: ২,০০০ টাকার ডিপিডিসি বিল বাফার সফলভাবে লকড</span>
            </span>
            <span className="text-[var(--yellow)]">✦</span>
            <span className="flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>নুসরাত জাহান: মাসিক ঘাটতি ঝুঁকি ৮২% থেকে কমে ২৪%-এ নেমে এসেছে</span>
            </span>
          </div>
        </div>

        {/* 5. TRUST STRIP (Animated Counters) */}
        <section
          ref={trustRef}
          className="p-8 sm:p-10 rounded-[24px] bg-white border border-[var(--line)] shadow-xs"
          aria-label="Trust Statistics Strip"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-[var(--line)]">
            {/* Stat 1 */}
            <div className="flex flex-col items-center text-center space-y-1 pt-4 md:pt-0">
              <span className="font-heading font-extrabold text-[40px] sm:text-[46px] text-[var(--navy)] leading-none">
                {toBengaliNumber(count1)} দিন আগে
              </span>
              <p className="text-[14.5px] text-[var(--muted)] font-semibold">
                ঘাটতি হওয়ার আগেই স্মার্ট আগাম সতর্কতা
              </p>
            </div>

            {/* Stat 2 */}
            <div className="flex flex-col items-center text-center space-y-1 pt-6 md:pt-0 md:px-6">
              <span className="font-heading font-extrabold text-[40px] sm:text-[46px] text-[var(--yellow)] leading-none">
                {toBengaliNumber(count2)}+ ক্যাটাগরি
              </span>
              <p className="text-[14.5px] text-[var(--muted)] font-semibold">
                ইউটিলিটি বিল, ক্যাশ-আউট ও ব্যয়ের নিখুঁত শ্রেণিবিন্যাস
              </p>
            </div>

            {/* Stat 3 */}
            <div className="flex flex-col items-center text-center space-y-1 pt-6 md:pt-0 md:pl-6">
              <span className="font-heading font-extrabold text-[40px] sm:text-[46px] text-[var(--danger)] leading-none">
                {toBengaliNumber(count3)}% নির্ভুলতা
              </span>
              <p className="text-[14.5px] text-[var(--muted)] font-semibold">
                গাণিতিক মডেলে লিকুইডিটি ঝুঁকি দ্রুত শনাক্তকরণ
              </p>
            </div>
          </div>
        </section>

        {/* 6. HOW IT WORKS (3 Numbered Steps with Beam Animation) */}
        <section
          id="how-it-works"
          ref={stepsRef}
          className="space-y-10"
          aria-label="How It Works"
        >
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] uppercase tracking-wider">
              কার্যপদ্ধতি
            </span>
            <h2 className="font-heading font-extrabold text-[28px] sm:text-[36px] text-[var(--navy)]">
              কীভাবে কাজ করে উপায় এআই?
            </h2>
            <p className="text-[15px] text-[var(--muted)]">
              ৩টি সহজ পদক্ষেপে আপনার ওয়ালেটের আর্থিক স্বাস্থ্য সম্পূর্ণ সুরক্ষিত থাকে।
            </p>
          </div>

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Animated Connecting Line with moving light beam */}
            <div
              className="hidden md:block absolute top-12 left-16 right-16 h-1.5 bg-[var(--line)] -z-0 overflow-hidden rounded-full"
              aria-hidden="true"
            >
              <div
                className="h-full bg-[var(--navy)] transition-all duration-1000 ease-out relative"
                style={{ width: stepsVisible ? '100%' : '0%' }}
              >
                {stepsVisible && <div className="animate-beam" />}
              </div>
            </div>

            {/* Step 1 */}
            <div
              onMouseEnter={() => setActiveStepHover(1)}
              onMouseLeave={() => setActiveStepHover(null)}
              className={`relative z-10 bg-white rounded-[24px] p-6 border transition-all duration-300 flex flex-col items-center text-center space-y-3 cursor-pointer ${
                activeStepHover === 1
                  ? 'border-[var(--navy)] shadow-md -translate-y-2'
                  : 'border-[var(--line)] shadow-xs'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-[var(--navy)] text-[var(--yellow)] font-heading font-extrabold text-xl flex items-center justify-center shadow-sm">
                ১
              </div>
              <h3 className="font-heading font-bold text-[18px] text-[var(--navy)]">
                রিয়েল-টাইম লেনদেন অডিট
              </h3>
              <p className="text-[14px] text-[var(--muted)] leading-relaxed">
                ওয়ালেটের ইনকাম, ক্যাশ-আউট ও খরচের গতিধারা এআই স্বয়ংক্রিয়ভাবে অডিট করে কোনো অস্বাভাবিকতা আছে কি না যাচাই করে।
              </p>
            </div>

            {/* Step 2 */}
            <div
              onMouseEnter={() => setActiveStepHover(2)}
              onMouseLeave={() => setActiveStepHover(null)}
              className={`relative z-10 bg-white rounded-[24px] p-6 border transition-all duration-300 flex flex-col items-center text-center space-y-3 cursor-pointer ${
                activeStepHover === 2
                  ? 'border-[var(--yellow)] shadow-md -translate-y-2'
                  : 'border-[var(--line)] shadow-xs'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-[var(--yellow)] text-[var(--navy)] font-heading font-extrabold text-xl flex items-center justify-center shadow-sm">
                ২
              </div>
              <h3 className="font-heading font-bold text-[18px] text-[var(--navy)]">
                এআই পূর্বাভাস ও ঝুঁকি মডেল
              </h3>
              <p className="text-[14px] text-[var(--muted)] leading-relaxed">
                আসন্ন বিল ও দৈনন্দিন ব্যয়ের ভিত্তিতে মাস শেষে ব্যালেন্স ১,০০০ টাকার নিচে নামার ঝুঁকি শতাংশে হিসাব করে।
              </p>
            </div>

            {/* Step 3 */}
            <div
              onMouseEnter={() => setActiveStepHover(3)}
              onMouseLeave={() => setActiveStepHover(null)}
              className={`relative z-10 bg-white rounded-[24px] p-6 border transition-all duration-300 flex flex-col items-center text-center space-y-3 cursor-pointer ${
                activeStepHover === 3
                  ? 'border-[var(--navy)] shadow-md -translate-y-2'
                  : 'border-[var(--line)] shadow-xs'
              }`}
            >
              <div className="w-14 h-14 rounded-full bg-[var(--navy)] text-[var(--yellow)] font-heading font-extrabold text-xl flex items-center justify-center shadow-sm">
                ৩
              </div>
              <h3 className="font-heading font-bold text-[18px] text-[var(--navy)]">
                এক-ক্লিকে রেজিলিয়েন্স বাফার
              </h3>
              <p className="text-[14px] text-[var(--muted)] leading-relaxed">
                বিল বাফার লক, ব্যয়ের সিলিং এবং ০% সুদের উপায় ইমার্জেন্সি বাফার চালু করে টানাপোড়েন স্থায়ীভাবে রোধ করুন।
              </p>
            </div>
          </div>
        </section>

        {/* 7. BEFORE VS AFTER COMPARISON (Interactive Showcase) */}
        <section id="comparison" className="space-y-8" aria-label="Before vs After Comparison">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] uppercase tracking-wider">
              বাস্তব পার্থক্য
            </span>
            <h2 className="font-heading font-extrabold text-[28px] sm:text-[36px] text-[var(--navy)]">
              উপায় এআই ছাড়া বনাম উপায় এআই সহ
            </h2>
            <p className="text-[15px] text-[var(--muted)]">
              নিচে টগল করে দেখুন কীভাবে আপনার আর্থিক স্বস্তি ও সুরক্ষার রূপান্তর ঘটে।
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex justify-center">
            <div className="inline-flex p-1.5 rounded-full bg-white border border-[var(--line)] shadow-xs">
              <button
                onClick={() => setComparisonTab('withoutUpay')}
                className={`px-5 py-2 rounded-full text-[13.5px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  comparisonTab === 'withoutUpay'
                    ? 'bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/30'
                    : 'text-[var(--muted)] hover:text-[var(--navy)]'
                }`}
              >
                <X className="w-4 h-4" />
                <span>উপায় এআই ছাড়া (প্রচলিত অবস্থা)</span>
              </button>
              <button
                onClick={() => setComparisonTab('withUpay')}
                className={`px-5 py-2 rounded-full text-[13.5px] font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  comparisonTab === 'withUpay'
                    ? 'bg-[var(--yellow)] text-[var(--navy)] shadow-xs font-extrabold'
                    : 'text-[var(--muted)] hover:text-[var(--navy)]'
                }`}
              >
                <Check className="w-4 h-4" />
                <span>উপায় এআই সহ (রেজিলিয়েন্ট)</span>
              </button>
            </div>
          </div>

          {/* Comparison Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            {comparisonTab === 'withoutUpay' ? (
              <>
                <div className="rounded-[24px] bg-[var(--danger-soft)]/60 border border-[var(--danger)]/30 p-6 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--danger)] text-white flex items-center justify-center font-bold">
                    <X className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-extrabold text-[18px] text-[var(--danger)]">
                    মাস শেষের টানাপোড়েন
                  </h4>
                  <p className="text-[14px] text-slate-700 leading-relaxed">
                    বেতন আসার ৩ থেকে ৫ দিন আগেই ওয়ালেট ব্যালেন্স শেষ হয়ে যায়। প্রয়োজনীয় খরচ মেটাতে বন্ধুদের ধার করতে হয়।
                  </p>
                </div>

                <div className="rounded-[24px] bg-[var(--danger-soft)]/60 border border-[var(--danger)]/30 p-6 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--danger)] text-white flex items-center justify-center font-bold">
                    <X className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-extrabold text-[18px] text-[var(--danger)]">
                    বিল মিস ও জরিমানা
                  </h4>
                  <p className="text-[14px] text-slate-700 leading-relaxed">
                    ডিপিডিসি বা ইন্টারনেট বিলের টাকা আলাদা না রাখায় ভুলে অন্য খাতে খরচ হয়ে যায় এবং বাড়তি লেট ফি দিতে হয়।
                  </p>
                </div>

                <div className="rounded-[24px] bg-[var(--danger-soft)]/60 border border-[var(--danger)]/30 p-6 space-y-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--danger)] text-white flex items-center justify-center font-bold">
                    <X className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-extrabold text-[18px] text-[var(--danger)]">
                    শিকারি ঋণের ফাঁদ
                  </h4>
                  <p className="text-[14px] text-slate-700 leading-relaxed">
                    হঠাৎ চিকিৎসা বা পরিবারের জরুরি প্রয়োজনে চড়া সুদের মহাজনি বা অননুমোদিত অ্যাপস থেকে ঋণ নেওয়ার ঝুঁকি থাকে।
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="rounded-[24px] bg-emerald-50/80 border border-emerald-300 p-6 space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-extrabold text-[18px] text-emerald-950">
                    ১৪ দিন আগে সতর্কতা
                  </h4>
                  <p className="text-[14px] text-emerald-900 leading-relaxed">
                    সমস্যা হওয়ার বহু আগেই সতর্কবার্তা দেয়, ফলে অযথা রেস্তোরাঁ খরচ একটু কমিয়েই ওয়ালেট সবসময় পজিটিভ থাকে।
                  </p>
                </div>

                <div className="rounded-[24px] bg-emerald-50/80 border border-emerald-300 p-6 space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-extrabold text-[18px] text-emerald-950">
                    স্বয়ংক্রিয় বিল বাফার লক
                  </h4>
                  <p className="text-[14px] text-emerald-900 leading-relaxed">
                    আসন্ন ইউটিলিটি বিলের ২,০০০ টাকা আলাদা লকড বাফারে নিরাপদে থাকে। ভুলে কখনোই অন্য কাজে খরচ হতে পারে না।
                  </p>
                </div>

                <div className="rounded-[24px] bg-emerald-50/80 border border-emerald-300 p-6 space-y-3 shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <Check className="w-5 h-5" />
                  </div>
                  <h4 className="font-heading font-extrabold text-[18px] text-emerald-950">
                    ০% সুদে তাৎক্ষণিক বাফার
                  </h4>
                  <p className="text-[14px] text-emerald-900 leading-relaxed">
                    ইউসিবি ব্যাংকের সহায়তায় তাৎক্ষণিক ১,০০০ টাকা ০% সুদের ন্যানো-লিকুইডিটি সুরক্ষা পেয়ে যান এক ক্লিকে।
                  </p>
                </div>
              </>
            )}
          </div>
        </section>

        {/* 8. FEATURE CARDS (Middle Card Yellow, Others Navy, 3D Tilt) */}
        <section className="space-y-10" aria-label="Feature Highlights">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] uppercase tracking-wider">
              প্রধান বৈশিষ্ট্যসমূহ
            </span>
            <h2 className="font-heading font-extrabold text-[28px] sm:text-[36px] text-[var(--navy)]">
              স্মার্ট আর্থিক সিদ্ধান্তের বিশ্বস্ত সহযোগী
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Navy */}
            <div
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="rounded-[24px] bg-[var(--navy)] text-white p-8 flex flex-col justify-between space-y-6 shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-[14px] bg-white/10 flex items-center justify-center text-[var(--yellow)]">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-extrabold text-[22px] text-white">
                  আর্থিক ঝুঁকি স্কোর
                </h3>
                <p className="text-white/80 text-[14.5px] leading-relaxed">
                  আপনার ওয়ালেটের বর্তমান ব্যালেন্স ও খরচের ধারার সমন্বয়ে তৈরি সার্বিক লিকুইডিটি ঝুঁকি স্কোর। সমস্যা হওয়ার আগেই সমাধান নিন।
                </p>
              </div>
              <div className="flex items-center text-[13.5px] font-bold text-[var(--yellow)]">
                <span>রিয়েল-টাইম পূর্বাভাস</span>
              </div>
            </div>

            {/* Card 2: Middle is Yellow (per spec) */}
            <div
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="rounded-[24px] bg-[var(--yellow)] text-[var(--navy)] p-8 flex flex-col justify-between space-y-6 shadow-lg transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-[14px] bg-[var(--navy)] flex items-center justify-center text-[var(--yellow)]">
                  <Sliders className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-extrabold text-[22px] text-[var(--navy)]">
                  হোয়াট-ইফ সিমুলেটর
                </h3>
                <p className="text-[var(--navy)]/85 text-[14.5px] leading-relaxed font-medium">
                  রেস্তোরাঁ খরচ ১৫% কমালে বা অতিরিক্ত ৫,০০০ টাকা আয় হলে আপনার মাস শেষের আর্থিক অবস্থা কতটা বদলাবে তা এক ক্লিকে পরীক্ষা করুন।
                </p>
              </div>
              <div className="flex items-center text-[13.5px] font-extrabold text-[var(--navy)]">
                <span>ইন্টারেক্টিভ সিমুলেশন</span>
              </div>
            </div>

            {/* Card 3: Navy */}
            <div
              onMouseMove={handleCardMouseMove}
              onMouseLeave={handleCardMouseLeave}
              className="rounded-[24px] bg-[var(--navy)] text-white p-8 flex flex-col justify-between space-y-6 shadow-md transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-[14px] bg-white/10 flex items-center justify-center text-[var(--yellow)]">
                  <Bell className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-extrabold text-[22px] text-white">
                  স্মার্ট বিল সতর্কতা
                </h3>
                <p className="text-white/80 text-[14.5px] leading-relaxed">
                  ডিপিডিসি বিদ্যুৎ, ইন্টারনেট ও অন্যান্য ইউটিলিটি বিলের প্রদেয় তারিখের আগেই টাকা আলাদা বাফারে লক করার বিশেষ সুবিধা।
                </p>
              </div>
              <div className="flex items-center text-[13.5px] font-bold text-[var(--yellow)]">
                <span>স্বয়ংক্রিয় বাফার গার্ড</span>
              </div>
            </div>
          </div>

          {/* Utsob Shield Feature Banner */}
          <div className="rounded-[24px] bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 p-7 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-amber-300">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/10 text-slate-950 text-xs font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>ট্র্যাক ০৩ ইনোভেশন · উৎসব শিল্ড</span>
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-[var(--navy)]">
                আসন্ন শারদীয় দুর্গাপূজা ও ঈদের আর্থিক শক অ্যাবজরবার: ৯০ দিন আগের প্রস্তুতি
              </h3>
              <p className="text-[14.5px] text-slate-900/85 max-w-2xl leading-relaxed font-medium">
                আপনার ক্যাশ-ফ্লো মডেল ৯০ দিন আগেই শারদীয় দুর্গাপূজা ও ঈদ শনাক্ত করে। উৎসবের ১৬,০০০–১৮,০০০ টাকার চাপকে প্রতিদিন ছোট দৈনিক পকেটে ভাগ করে মাস শেষের ঘাটতি ও ঋণ স্থায়ীভাবে দূর করুন। সাথে কোরবানি শেয়ার প্ল্যানার!
              </p>
            </div>
            <button
              onClick={() => navigate('/utsob-shield')}
              className="btn-primary !bg-[var(--navy)] hover:!bg-[var(--navy)]/90 !text-white text-[14px] !py-3 !px-6 whitespace-nowrap shadow-md shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <Shield className="w-4 h-4 text-amber-400" />
              <span>উৎসব শিল্ড এক্সপ্লোর করুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* 9. LIVE MINI-DEMO (Interactive 2-Lever Simulation) */}
        <section
          id="mini-demo"
          className="rounded-[28px] bg-white border border-[var(--line)] p-8 sm:p-12 shadow-sm space-y-8"
          aria-label="Live Interactive Mini-Demo"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--line)] pb-5">
            <div>
              <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] uppercase tracking-wider">
                লাইভ টেস্ট ডেমো
              </span>
              <h2 className="font-heading font-extrabold text-[24px] sm:text-[30px] text-[var(--navy)] mt-1.5">
                নিজে পরীক্ষা করে দেখুন: খরচ কমালে কীভাবে ঝুঁকি কমে
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[13px] font-extrabold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>ঝুঁকি: ৮২% → {toBengaliNumber(currentRiskCalculated)}% (−{toBengaliNumber(riskDrop)}%)</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
            {/* 2 Levers Column */}
            <div className="md:col-span-7 space-y-6">
              {/* Lever 1: Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label
                    htmlFor="spend-slider"
                    className="font-heading font-bold text-[15.5px] text-[var(--navy)]"
                  >
                    ১. ঐচ্ছিক ব্যয় হ্রাস (খাবার ও রেস্তোরাঁ):
                  </label>
                  <span className="font-heading font-extrabold text-[20px] text-[var(--navy)]">
                    {toBengaliNumber(reductionSlider)}%
                  </span>
                </div>

                <input
                  id="spend-slider"
                  type="range"
                  min="0"
                  max="30"
                  step="5"
                  value={reductionSlider}
                  onChange={(e) => setReductionSlider(Number(e.target.value))}
                  className="w-full h-3 bg-[var(--line)] rounded-full appearance-none cursor-pointer accent-[var(--navy)]"
                />

                <div className="flex justify-between text-[11.5px] text-[var(--muted)] font-semibold">
                  <span>০% (কোনো পরিবর্তন নয়)</span>
                  <span>১৫% (প্রস্তাবিত লক্ষ্য)</span>
                  <span>৩০% (সর্বোচ্চ সাশ্রয়)</span>
                </div>
              </div>

              {/* Lever 2: QR Mode Toggle */}
              <div className="p-4 rounded-[16px] bg-[var(--bg)] border border-[var(--line)] flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <QrCode className="w-4 h-4 text-[var(--navy)]" />
                    <span className="text-[14px] font-bold text-[var(--navy)]">
                      ২. মার্চেন্ট কিউআর পেমেন্ট (ক্যাশ-আউট ফি সাশ্রয়):
                    </span>
                  </div>
                  <p className="text-[12.5px] text-[var(--muted)]">
                    এজেন্ট থেকে নগদ না তুলে দোকানে উপায় কিউআর দিয়ে কিনলে ৩২০ টাকা ফি বেঁচে যায়।
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsQrModeActive(!isQrModeActive)}
                  className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all cursor-pointer shrink-0 ${
                    isQrModeActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {isQrModeActive ? '✓ সক্রিয় (+৳৩২০)' : 'চালু করুন'}
                </button>
              </div>

              <div className="p-3.5 rounded-[14px] bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[13px] font-bold text-emerald-900">
                <span>মাসিক সম্ভাব্য সাশ্রয়:</span>
                <span className="font-heading font-extrabold text-[16px] text-emerald-700">
                  +৳{toBengaliNumber(monthlySavingsTaka)}
                </span>
              </div>
            </div>

            {/* Mini Gauge Column */}
            <div className="md:col-span-5 flex justify-center">
              <div className="relative w-48 h-48 rounded-full bg-[var(--bg)] p-3 border-2 border-[var(--line)] flex flex-col items-center justify-center shadow-xs">
                <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#E2E8F0"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke={currentRiskCalculated > 65 ? '#E5484D' : currentRiskCalculated > 45 ? '#FFC20E' : '#1FA971'}
                    strokeWidth="8.5"
                    strokeDasharray={2 * Math.PI * 40}
                    strokeDashoffset={2 * Math.PI * 40 * (1 - currentRiskCalculated / 100)}
                    strokeLinecap="round"
                    className="transition-all duration-300 ease-out"
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-wider">
                    হিসাবকৃত ঝুঁকি
                  </span>
                  <span className="font-heading font-extrabold text-[34px] text-[var(--navy)] leading-none my-0.5">
                    {toBengaliNumber(currentRiskCalculated)}%
                  </span>
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    −{toBengaliNumber(riskDrop)}% ঝুঁকি হ্রাস
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. FAQ ACCORDION (Pure Bangla with Smooth Expand) */}
        <section className="space-y-8" aria-label="Frequently Asked Questions">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <span className="text-[12px] font-bold px-3 py-1 rounded-full bg-[var(--yellow-soft)] text-[var(--navy)] uppercase tracking-wider">
              সাধারণ জিজ্ঞাসা
            </span>
            <h2 className="font-heading font-extrabold text-[28px] sm:text-[34px] text-[var(--navy)]">
              সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
            </h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-3">
            {FAQ_ITEMS.map((item, i) => {
              const isOpen = openFaqIndex === i;
              return (
                <div
                  key={i}
                  className="rounded-[18px] bg-white border border-[var(--line)] overflow-hidden shadow-2xs transition-all duration-200"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : i)}
                    className="w-full text-left p-5 flex items-center justify-between gap-4 font-heading font-bold text-[16px] text-[var(--navy)] hover:text-[#B38600] transition-colors cursor-pointer"
                  >
                    <span>{item.q}</span>
                    <ChevronDown
                      className={`w-5 h-5 shrink-0 text-[var(--muted)] transition-transform duration-300 ${
                        isOpen ? 'rotate-180 text-[var(--navy)]' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 pt-0 text-[14.5px] text-[var(--muted)] leading-relaxed border-t border-[var(--line)]/50 animate-in fade-in duration-200">
                      <p className="pt-3">{item.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 11. CLOSING CALL-TO-ACTION (Yellow-Soft Block, Rounded 32px) */}
        <section
          className="rounded-[32px] bg-[var(--yellow-soft)] border border-[var(--yellow)]/40 p-8 sm:p-14 text-center space-y-5"
          aria-label="Call to Action"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--yellow)] text-[var(--navy)] text-[12px] font-extrabold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>উপায় রেজিলিয়েন্স সিস্টেম</span>
          </div>

          <h2 className="font-heading font-extrabold text-[30px] sm:text-[40px] text-[var(--navy)] leading-tight max-w-2xl mx-auto">
            আজই আপনার আর্থিক ভবিষ্যৎ সুরক্ষিত করুন
          </h2>

          <p className="text-[16px] text-[var(--navy)]/80 max-w-xl mx-auto leading-relaxed">
            উপায় ফাইন্যান্সিয়াল রেজিলিয়েন্স এআই-এর সাথে থাকুন সর্বদা এক ধাপ এগিয়ে। মাস শেষের দুশ্চিন্তা দূর করে গড়ে তুলুন নিরাপদ সঞ্চয়।
          </p>

          <div className="pt-2 flex justify-center">
            <button
              onClick={handleLaunchDashboard}
              className="btn-primary yellow-glow-pulse text-[15.5px] !py-3.5 !px-8 shadow-sm"
            >
              <span>এখনই ড্যাশবোর্ড দেখুন</span>
              <ArrowRight className="w-4.5 h-4.5 btn-arrow-icon" />
            </button>
          </div>
        </section>

        {/* 12. SLIM FOOTER (Prototype with Simulated Data) */}
        <footer className="pt-6 pb-8 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-[12.5px] text-[var(--muted)]">
          <div className="flex items-center gap-3">
            <UpayLogo height={28} alt="upay" />
            <span className="border-l border-[var(--line)] pl-3 font-semibold">
              এটি একটি হ্যাকাতন প্রোটোটাইপ ও সিমুলেটেড ডেটা দ্বারা পরিচালিত উদ্ভাবন।
            </span>
          </div>

          <p className="font-medium">
            © ২০২৬ উপায় (ইউসিবি ফিনটেক কোম্পানি লিমিটেড)। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </footer>
      </main>
    </div>
  );
};
