'use client';

import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  Instagram,
  Facebook,
  Mail,
  Truck,
  Shield,
  Award,
  Sofa,
  Armchair,
  Table2,
  LampFloor,
  BedDouble,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Scroll-triggered reveal — used for every section below the hero so the page
// feels alive as you scroll, not just on first load.
// ---------------------------------------------------------------------------
function Reveal({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`reveal ${visible ? 'reveal-visible' : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Minimal single-line armchair, drawn with one continuous stroke so it can
// "assemble" itself on load — the signature moment of the page.
function AssemblingChair({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 400"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M 90 180
           L 90 300
           Q 90 320 110 320
           L 110 340
           M 110 320 L 290 320
           L 290 340
           M 290 320 Q 310 320 310 300
           L 310 180
           M 90 180 Q 90 140 130 140
           L 270 140 Q 310 140 310 180
           M 130 140 L 130 90 Q 130 70 150 70
           L 250 70 Q 270 70 270 90
           L 270 140
           M 90 220 L 60 220 Q 50 220 50 230
           L 50 260 Q 50 270 60 270
           L 90 270
           M 310 220 L 340 220 Q 350 220 350 230
           L 350 260 Q 350 270 340 270
           L 310 270"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        pathLength="1"
        className="chair-draw"
      />
    </svg>
  );
}

type Swatch = { name: string; note: string; texture: React.CSSProperties };

const SWATCHES: Swatch[] = [
  {
    name: 'Walnut',
    note: 'Frames',
    texture: {
      backgroundColor: '#5A4030',
      backgroundImage:
        'repeating-linear-gradient(100deg, rgba(0,0,0,0.18) 0px, rgba(0,0,0,0.18) 1px, transparent 1px, transparent 7px)',
    },
  },
  {
    name: 'Bouclé',
    note: 'Upholstery',
    texture: {
      backgroundColor: '#D8CBB8',
      backgroundImage: 'radial-gradient(rgba(0,0,0,0.12) 1.2px, transparent 1.2px)',
      backgroundSize: '7px 7px',
    },
  },
  {
    name: 'Brass',
    note: 'Hardware',
    texture: {
      backgroundColor: '#9C7A3E',
      backgroundImage:
        'linear-gradient(115deg, rgba(255,255,255,0.35) 0%, transparent 30%, transparent 60%, rgba(255,255,255,0.2) 80%)',
    },
  },
  {
    name: 'Linen',
    note: 'Soft goods',
    texture: {
      backgroundColor: '#C9BFA8',
      backgroundImage:
        'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 4px), repeating-linear-gradient(90deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0.06) 1px, transparent 1px, transparent 4px)',
    },
  },
  {
    name: 'Rattan',
    note: 'Weave detail',
    texture: {
      backgroundColor: '#B08654',
      backgroundImage:
        'repeating-linear-gradient(45deg, rgba(0,0,0,0.15) 0px, rgba(0,0,0,0.15) 2px, transparent 2px, transparent 9px), repeating-linear-gradient(-45deg, rgba(0,0,0,0.1) 0px, rgba(0,0,0,0.1) 2px, transparent 2px, transparent 9px)',
    },
  },
  {
    name: 'Charcoal Oak',
    note: 'Accent legs',
    texture: {
      backgroundColor: '#33291F',
      backgroundImage:
        'repeating-linear-gradient(95deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 8px)',
    },
  },
];

const CATEGORIES = [
  { name: 'Sofas', Icon: Sofa },
  { name: 'Chairs', Icon: Armchair },
  { name: 'Tables', Icon: Table2 },
  { name: 'Lighting', Icon: LampFloor },
  { name: 'Bedroom', Icon: BedDouble },
  { name: 'Decor', Icon: Sparkles },
];

const PERKS = [
  {
    title: 'Early Access',
    body: 'Founding members shop the full collection 48 hours before anyone else.',
  },
  {
    title: 'Launch Pricing',
    body: 'Lock in opening-week pricing on your first order, before it changes.',
  },
  {
    title: 'A Design Consult',
    body: 'A short call with our team to help plan the room you\u2019re furnishing.',
  },
];

function EmailForm({ id }: { id: string }) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    // TODO: wire this up to your actual mailing-list endpoint
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="rounded-full border border-[#C47456]/40 bg-[#C47456]/10 px-6 py-4 inline-block">
        <p className="text-[#C47456] font-medium">You&apos;re on the list — talk soon.</p>
      </div>
    );
  }

  return (
    <form
      id={id}
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 w-full max-w-md"
    >
      <div className="relative flex-1">
        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full pl-11 pr-4 py-3 rounded-full bg-white/5 border border-white/15 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-[#C47456] focus:border-transparent"
        />
      </div>
      <Button
        type="submit"
        className="bg-[#C47456] hover:bg-[#C47456]/90 text-white rounded-full px-6 py-3 h-auto whitespace-nowrap"
      >
        Notify Me
        <ArrowRight className="ml-2 w-4 h-4" />
      </Button>
    </form>
  );
}

export default function ComingSoonPage() {
  return (
    <div className="bg-[#2C2C2C]">
      <style>{`
        @keyframes draw-chair { to { stroke-dashoffset: 0; } }
        .chair-draw {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: draw-chair 2.4s cubic-bezier(0.65, 0, 0.35, 1) 0.3s forwards;
        }
        .reveal {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .reveal-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (prefers-reduced-motion: reduce) {
          .chair-draw { animation: none; stroke-dashoffset: 0; }
          .reveal { opacity: 1; transform: none; transition: none; }
        }
      `}</style>

      {/* ---------------------------------------------------------------- */}
      {/* HERO — the main event, first thing anyone sees                    */}
      {/* ---------------------------------------------------------------- */}
      <section className="min-h-screen flex flex-col items-center justify-center text-white px-6 py-24 relative">
        <div className="max-w-2xl w-full text-center">
          <div className="flex justify-center mb-2">
            <AssemblingChair className="w-40 h-40 sm:w-48 sm:h-48 text-[#C47456]/70" />
          </div>

          <p className="text-sm uppercase tracking-widest text-[#C47456] mb-4 font-semibold">
            Opening Soon
          </p>

          <h1 className="font-serif text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6">
            Something Beautiful<br />Is Being Made Ready
          </h1>

          <p className="text-gray-300 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            We&apos;re putting the finishing touches on our new home. Leave your
            email and we&apos;ll tell you the moment the doors open — or scroll
            down for a preview of what&apos;s coming.
          </p>

          <div className="flex justify-center">
            <EmailForm id="hero-email" />
          </div>

          <div className="flex items-center justify-center gap-4 mt-10">
            <a
              href="#"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-gray-300 hover:text-[#C47456] hover:border-[#C47456] transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="#"
              aria-label="Facebook"
              className="w-10 h-10 rounded-full border border-white/15 flex items-center justify-center text-gray-300 hover:text-[#C47456] hover:border-[#C47456] transition-colors"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        <a
          href="#sneak-peek"
          aria-label="Scroll to see what's coming"
          className="absolute bottom-8 text-gray-400 hover:text-[#C47456] transition-colors animate-bounce"
        >
          <ChevronDown className="w-6 h-6" />
        </a>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* SNEAK PEEK — veiled category preview                              */}
      {/* ---------------------------------------------------------------- */}
      <section id="sneak-peek" className="bg-white py-24">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-[#C47456] mb-2 font-semibold">
              Sneak Peek
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-4">
              A Peek Behind The Curtain
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              The collection is still under wraps, but here&apos;s what it&apos;s
              built from. Hover to bring each one a little more into focus.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            {CATEGORIES.map(({ name, Icon }, i) => (
              <Reveal key={name} delay={i * 80}>
                <div className="group relative aspect-square rounded-2xl bg-gradient-to-br from-[#2C2C2C] to-[#463A2E] overflow-hidden flex items-center justify-center shadow-md">
                  <Icon
                    className="w-16 h-16 text-white/45 blur-[0.5px] group-hover:blur-0 group-hover:text-white/65 group-hover:scale-110 transition-all duration-500"
                  />
                  <span className="absolute top-4 left-4 text-[10px] uppercase tracking-widest bg-[#C47456] text-white px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                  <span className="absolute bottom-4 left-4 text-white text-sm font-semibold uppercase tracking-widest">
                    {name}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CRAFTED WITH CARE — materials story                               */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-gradient-to-br from-[#221E19] to-[#2C2C2C] py-24 text-white">
        <div className="max-w-6xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-[#C47456] mb-2 font-semibold">
              Palette — Not Yet Final
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-4">
              Crafted With Care
            </h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Every piece starts as a swatch before it becomes a chair. Here&apos;s
              what&apos;s on the table right now.
            </p>
          </Reveal>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-5 max-w-4xl mx-auto">
            {SWATCHES.map((s, i) => (
              <Reveal key={s.name} delay={i * 90}>
                <div className="group">
                  <div
                    className="aspect-square rounded-xl shadow-lg ring-1 ring-white/10 group-hover:-translate-y-1 transition-transform duration-300"
                    style={s.texture}
                  />
                  <p className="text-sm font-medium text-white mt-3">{s.name}</p>
                  <p className="text-xs text-gray-500">{s.note}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FOUNDING MEMBER PERKS                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-white py-24">
        <div className="max-w-5xl mx-auto px-6">
          <Reveal className="text-center mb-16">
            <p className="text-sm uppercase tracking-widest text-[#C47456] mb-2 font-semibold">
              Worth The Wait
            </p>
            <h2 className="font-serif text-4xl lg:text-5xl font-bold text-[#2C2C2C] mb-4">
              Sign Up Now, Get More Later
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Everyone on the list before launch gets these, automatically.
            </p>
          </Reveal>

          <div className="grid sm:grid-cols-3 gap-8">
            {PERKS.map((perk, i) => (
              <Reveal key={perk.title} delay={i * 100}>
                <div className="p-8 rounded-2xl bg-gray-50 border border-gray-100 h-full">
                  <div className="w-10 h-10 rounded-full bg-[#C47456]/10 text-[#C47456] flex items-center justify-center font-serif font-bold mb-5">
                    {i + 1}
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#2C2C2C] mb-2">
                    {perk.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{perk.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* FINAL CTA                                                         */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-[#2C2C2C] text-white py-24">
        <Reveal className="max-w-2xl mx-auto px-6 text-center flex flex-col items-center">
          <h2 className="font-serif text-4xl lg:text-5xl font-bold mb-6">
            Don&apos;t Miss The Opening
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            One email, sent once — the day we open the doors.
          </p>
          <EmailForm id="footer-email" />
        </Reveal>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* TRUST STRIP                                                       */}
      {/* ---------------------------------------------------------------- */}
      <section className="bg-[#221E19] border-t border-white/10 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <Truck className="w-6 h-6 text-[#C47456] flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-white">Free Shipping</p>
                <p className="text-xs text-gray-400">On orders above ₹50,000</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <Shield className="w-6 h-6 text-[#C47456] flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-white">Secure Payment</p>
                <p className="text-xs text-gray-400">100% safe transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 justify-center sm:justify-start">
              <Award className="w-6 h-6 text-[#C47456] flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm text-white">Quality Assured</p>
                <p className="text-xs text-gray-400">Premium furniture pieces</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}