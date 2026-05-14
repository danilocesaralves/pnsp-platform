import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import SEO from "@/components/SEO";

/* ── SVG feature icons (16px, stroke currentColor, 1.5) ──────────────────────── */
const IcoStar = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const IcoBriefcase = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/>
  </svg>
);
const IcoWave = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12h2.5l2-7 3 14 3-10 2 6H22"/>
  </svg>
);
const IcoPeople = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcoPlay = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>
);
const IcoChev = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);
const IcoArr = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

/* ── Data ────────────────────────────────────────────────────────────────────── */
const G = "#C9A84C";

const NAV_ITEMS = [
  { href: "/",              label: "Início",        active: true },
  { href: "/perfis",        label: "Talentos" },
  { href: "/oportunidades", label: "Oportunidades" },
  { href: "/estudios",      label: "Estúdios" },
  { href: "/comunidade",    label: "Comunidade" },
  { href: "/recursos",      label: "Recursos" },
];

const STATS = [
  {
    val: "+25 mil", lbl: "artistas",
    ico: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    val: "+3 mil", lbl: "oportunidades",
    ico: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>,
  },
  {
    val: "Todo Brasil", lbl: "conectado",
    ico: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  },
];

const FEATS = [
  { href: "/perfis",        ico: <IcoStar />,      t: "Talentos",      d: "Mostre seu trabalho, ganhe visibilidade e conecte-se com profissionais da música." },
  { href: "/oportunidades", ico: <IcoBriefcase />, t: "Oportunidades", d: "Encontre shows, editais, audições e vagas que impulsionam sua carreira." },
  { href: "/estudios",      ico: <IcoWave />,      t: "Estúdios",      d: "Reserve estúdios, encontre produtores e grave seu próximo sucesso." },
  { href: "/comunidade",    ico: <IcoPeople />,    t: "Comunidade",    d: "Participe de grupos, troque experiências e fortaleça a cena do samba e pagode." },
  { href: "/academia",      ico: <IcoPlay />,      t: "Conteúdos",     d: "Cursos, mentorias e materiais para você evoluir como artista e profissional." },
];

/* ── CSS ─────────────────────────────────────────────────────────────────────── */
const CSS = `
.pn *, .pn *::before, .pn *::after { box-sizing: border-box; }
.pn a { color: inherit; text-decoration: none; }
button { cursor: pointer; font-family: inherit; }

/* Header */
.pn-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 50; height: 72px;
  display: flex; align-items: center; padding: 0 24px;
  background: rgba(0,0,0,0.93); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(201,168,76,0.15);
}
.pn-header-inner {
  max-width: 1280px; margin: 0 auto; width: 100%;
  display: flex; align-items: center; justify-content: space-between;
}
.pn-logo { height: 64px; width: auto; display: block; object-fit: contain; mix-blend-mode: screen; max-width: none; }
.pn-nav { display: flex; align-items: center; gap: 2px; }
.pn-nl {
  position: relative; color: rgba(255,255,255,0.65); font-size: 0.875rem;
  font-weight: 500; padding: 10px 12px; border-radius: 8px; cursor: pointer;
  white-space: nowrap; transition: color 0.2s; font-family: var(--font-body);
  display: inline-block;
}
.pn-nl:hover { color: #C9A84C; }
.pn-nl.on { color: #C9A84C; }
.pn-nl.on::after {
  content: ''; position: absolute; bottom: 3px; left: 50%;
  transform: translateX(-50%); width: 60%; height: 1.5px;
  background: #C9A84C; border-radius: 999px;
}
.pn-ctas { display: flex; gap: 10px; align-items: center; }
.pn-ham {
  display: none; background: none; border: 1px solid rgba(255,255,255,0.2);
  color: #fff; border-radius: 8px; width: 44px; height: 44px;
  align-items: center; justify-content: center; font-size: 1.25rem;
  cursor: pointer; flex-shrink: 0; line-height: 1;
  -webkit-tap-highlight-color: transparent;
}

/* Mobile menu */
.pn-mmenu {
  position: fixed; top: 72px; left: 0; right: 0; z-index: 49;
  background: rgba(0,0,0,0.98); backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(201,168,76,0.15);
  padding: 8px 20px 24px; display: flex; flex-direction: column;
}
.pn-mml {
  display: flex; align-items: center; min-height: 52px; padding: 0 4px;
  color: rgba(255,255,255,0.8); font-size: 1rem; font-weight: 500;
  font-family: var(--font-body); border-bottom: 1px solid rgba(255,255,255,0.06);
  cursor: pointer;
}

/* Hero */
.pn-hero {
  min-height: 100vh; display: flex; position: relative;
  overflow: hidden; padding-top: 72px;
}
.pn-hero-text {
  width: 45%; display: flex; flex-direction: column; justify-content: center;
  padding: 60px 0 60px clamp(24px, 4vw, 80px);
  position: relative; z-index: 2; flex-shrink: 0;
}

/* ═══ FOTO HERO — ABSOLUTAMENTE INTOCÁVEL ═══ */
.pn-hero-img {
  position: absolute; top: 0; right: 0; width: 100%; height: 100%;
  background: url('/hero-musicians.jpg') 78% center / cover no-repeat;
}
.pn-hero-img::before {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(to right, #000 0%, #000 12%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.2) 60%, transparent 100%);
}
.pn-hero-img::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 28%);
}
/* ═══════════════════════════════════════════ */

.pn-overline {
  color: #C9A84C; font-size: 9px; font-weight: 700; letter-spacing: 0.22em;
  text-transform: uppercase; font-family: var(--font-body); margin-bottom: 6px;
  display: block;
}
.pn-h1 {
  font-family: var(--font-display); font-weight: 400; line-height: 1.06;
  letter-spacing: -0.02em; margin-bottom: 8px;
}
.pn-h1-white { font-size: clamp(26px, 7.5vw, 56px); color: #fff; display: block; }
.pn-h1-gold  { font-size: clamp(26px, 7.5vw, 56px); color: #C9A84C; font-style: italic; display: block; }
.pn-sub {
  font-size: 13px; color: rgba(255,255,255,0.58); line-height: 1.5;
  margin-bottom: 14px; max-width: 460px; font-family: var(--font-body);
}

/* Stats grid */
.pn-stats {
  display: grid; grid-template-columns: repeat(3,1fr); gap: 0;
  border-top: 1px solid rgba(255,255,255,0.08);
  border-bottom: 1px solid rgba(255,255,255,0.08);
  padding: 10px 0; margin: 12px 0;
}
.pn-stat {
  display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 0 8px;
}
.pn-stat:not(:last-child) { border-right: 1px solid rgba(255,255,255,0.08); }
.pn-stat-ico { color: #C9A84C; margin-bottom: 4px; display: flex; }
.pn-stat-ico svg { width: 18px; height: 18px; }
.pn-stat-val {
  font-size: 14px; font-weight: 800; color: #C9A84C; line-height: 1;
  font-family: system-ui,-apple-system,sans-serif; white-space: nowrap;
}
.pn-stat-lbl {
  font-size: 9px; color: rgba(255,255,255,0.45); text-align: center;
  font-family: system-ui,-apple-system,sans-serif;
}

/* Hero CTA */
.pn-hero-ctas { display: flex; flex-direction: column; align-items: stretch; }
.pn-btn-primary {
  width: 100%; padding: 14px 20px; font-size: 14px; font-weight: 700;
  background: linear-gradient(135deg, #E8C76A 0%, #C9A84C 60%, #A8832A 100%); color: #000; border-radius: 10px; border: none;
  cursor: pointer; -webkit-tap-highlight-color: transparent;
  transition: transform 0.1s, background 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-family: system-ui,-apple-system,sans-serif; margin-bottom: 8px;
}
.pn-btn-primary:hover { background: #E8C76A; }
.pn-btn-primary:active { transform: scale(0.97); }
.pn-sec-link {
  font-size: 12px; color: rgba(255,255,255,0.4); padding: 6px 0;
  cursor: pointer; text-align: center; display: block;
  font-family: system-ui,-apple-system,sans-serif;
}

/* Feature strip */
.pn-strip {
  background: #0f0f0f;
  border-top: 1px solid rgba(255,255,255,0.07);
  border-bottom: 1px solid rgba(255,255,255,0.07);
}
.pn-strip-scroll {
  display: flex; overflow-x: auto; scroll-snap-type: x mandatory;
  scrollbar-width: none; -webkit-overflow-scrolling: touch;
}
.pn-strip-scroll::-webkit-scrollbar { display: none; }
.pn-strip-scroll > a { display: contents; }
.pn-fc {
  flex: 0 0 75vw; max-width: 270px; min-width: 200px;
  scroll-snap-align: start; padding: 18px 16px;
  display: flex; flex-direction: column; gap: 8px;
  min-height: 150px; cursor: pointer;
  border-right: 1px solid rgba(255,255,255,0.07);
  background: #0f0f0f;
}
.pn-fc:last-child { border-right: none; }
.pn-fc:hover .pn-fa { border-color: rgba(201,168,76,0.4); color: #C9A84C; }
.pn-fi {
  width: 32px; height: 32px; border: 1px solid rgba(201,168,76,0.25);
  border-radius: 8px; display: flex; align-items: center;
  justify-content: center; color: #C9A84C; flex-shrink: 0;
}
.pn-ft { font-size: 13px; font-weight: 700; color: #fff; font-family: system-ui,-apple-system,sans-serif; }
.pn-fd {
  font-size: 11px; color: rgba(255,255,255,0.4); line-height: 1.5;
  overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3;
  -webkit-box-orient: vertical; font-family: system-ui,-apple-system,sans-serif;
}
.pn-fa {
  width: 24px; height: 24px; border-radius: 50%;
  border: 1px solid rgba(255,255,255,0.12);
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.4); align-self: flex-end; margin-top: auto;
  flex-shrink: 0; transition: border-color 0.2s, color 0.2s;
}
.pn-dots {
  display: flex; justify-content: center; align-items: center; gap: 5px;
  padding: 10px 0; background: #0f0f0f;
}
.pn-dot { height: 4px; border-radius: 999px; transition: all 0.25s; background: rgba(255,255,255,0.2); }
.pn-dot.on { width: 14px; background: #C9A84C; }
.pn-dot:not(.on) { width: 4px; }

/* CTA final */
.pn-cta-sec { background: #0a0a0a; padding: 52px 24px; text-align: center; }
.pn-cta-ey {
  font-size: 10px; color: #C9A84C; letter-spacing: 0.18em; text-transform: uppercase;
  font-weight: 700; margin-bottom: 14px; font-family: system-ui,-apple-system,sans-serif;
  display: block;
}
.pn-cta-h2 {
  font-size: clamp(26px,7vw,40px); font-family: Georgia,serif;
  color: #fff; line-height: 1.1; margin-bottom: 12px;
}
.pn-cta-p {
  font-size: 14px; color: rgba(255,255,255,0.5); line-height: 1.65;
  max-width: 360px; margin: 0 auto; font-family: system-ui,-apple-system,sans-serif;
}
.pn-cta-btn {
  max-width: 340px; width: 100%; margin: 24px auto 0; padding: 16px;
  font-size: 15px; font-weight: 700; background: linear-gradient(135deg, #E8C76A 0%, #C9A84C 60%, #A8832A 100%); color: #000;
  border-radius: 10px; border: none; cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 0 24px rgba(201,168,76,0.2);
  transition: transform 0.1s, background 0.15s;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font-family: system-ui,-apple-system,sans-serif;
}
.pn-cta-btn:hover { background: #E8C76A; }
.pn-cta-btn:active { transform: scale(0.97); }

/* Footer */
.pn-footer {
  background: #0d0d0d; border-top: 1px solid rgba(255,255,255,0.06);
  padding: 36px 20px 28px;
}
.pn-footer-inner { max-width: 1280px; margin: 0 auto; }
.pn-footer-logo { height: 34px; filter: brightness(0) invert(1); display: block; margin-bottom: 8px; max-width: none; }
.pn-footer-tag {
  font-size: 12px; color: rgba(255,255,255,0.35); margin-bottom: 28px;
  font-family: system-ui,-apple-system,sans-serif; display: block;
}
.pn-footer-grid {
  display: grid; grid-template-columns: repeat(2,1fr); gap: 24px; margin-bottom: 20px;
}
.pn-footer-conta { grid-column: 1 / -1; }
.pn-footer-col-title {
  font-size: 10px; color: #C9A84C; font-weight: 700; letter-spacing: 0.12em;
  text-transform: uppercase; margin-bottom: 12px; display: block;
  font-family: system-ui,-apple-system,sans-serif;
}
.pn-fl {
  font-size: 13px; color: rgba(255,255,255,0.45); display: block;
  margin-bottom: 8px; cursor: pointer; transition: color 0.2s;
  font-family: system-ui,-apple-system,sans-serif;
}
.pn-fl:hover { color: #fff; }
.pn-footer-bottom {
  border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px;
  font-size: 11px; color: rgba(255,255,255,0.2);
  font-family: system-ui,-apple-system,sans-serif;
}

/* Sticky CTA */
.pn-sticky {
  position: fixed; top: 0; left: 0; right: 0; z-index: 999;
  background: rgba(0,0,0,0.92); backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  padding: 10px 20px; display: flex; justify-content: space-between; align-items: center;
  border-bottom: 1px solid rgba(255,255,255,0.07);
  transform: translateY(-100%); transition: transform 0.3s ease;
}
.pn-sticky.show { transform: translateY(0); }
.pn-sticky-logo { color: #fff; font-size: 14px; font-weight: 700; font-family: system-ui,-apple-system,sans-serif; }
.pn-sticky-btn {
  padding: 8px 16px; font-size: 12px; font-weight: 700;
  background: linear-gradient(135deg, #E8C76A 0%, #C9A84C 60%, #A8832A 100%);
  color: #000; border-radius: 6px; border: none; cursor: pointer;
  font-family: system-ui,-apple-system,sans-serif;
  -webkit-tap-highlight-color: transparent;
}

/* Animations */
@keyframes heroFadeUp {
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0); }
}
.anim-1 { animation: heroFadeUp 0.6s ease-out 0.05s both; }
.anim-2 { animation: heroFadeUp 0.6s ease-out 0.15s both; }
.anim-3 { animation: heroFadeUp 0.6s ease-out 0.25s both; }
.anim-4 { animation: heroFadeUp 0.6s ease-out 0.35s both; }
.anim-5 { animation: heroFadeUp 0.6s ease-out 0.45s both; }

/* Desktop ≥768px */
@media (min-width: 768px) {
  .pn-nav, .pn-ctas { display: flex !important; }
  .pn-ham { display: none !important; }

  .pn-strip-scroll {
    display: grid !important; grid-template-columns: repeat(5,1fr);
    overflow-x: visible;
  }
  .pn-fc { flex: none; max-width: none; min-width: 0; }
  .pn-dots { display: none; }

  .pn-btn-primary { width: auto; padding: 15px 36px; display: inline-flex; }
  .pn-hero-ctas { align-items: flex-start; }
  .pn-sec-link { text-align: left; }

  .pn-cta-sec { padding: 64px 24px; }

  .pn-footer { padding: 52px 80px 36px; }
  .pn-footer-grid { grid-template-columns: repeat(3,1fr); }
  .pn-footer-conta { grid-column: auto; }
  .pn-footer-bottom { display: flex; justify-content: space-between; align-items: center; }
}

/* Mobile ≤768px */
@media (max-width: 768px) {
  .pn-nav, .pn-ctas { display: none !important; }
  .pn-ham { display: flex !important; }

  .pn-hero { flex-direction: column; min-height: auto; padding-top: 64px; }
  .pn-hero-text { width: 100%; padding: 18px 20px 20px; order: 2; }

  /* ═══ FOTO HERO MOBILE — ABSOLUTAMENTE INTOCÁVEL ═══ */
  .pn-hero-img { position: relative; width: 100%; height: 55vw; order: 1; }
  .pn-hero-img::before {
    background: linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 50%, rgba(0,0,0,0.45) 100%);
  }
  .pn-hero-img::after { display: none; }
  /* ════════════════════════════════════════════════ */

  .pn-h1-white, .pn-h1-gold { font-size: clamp(2rem, 8vw, 2.8rem) !important; }
  .pn-sub { font-size: 14px !important; line-height: 1.65 !important; }

  .pn-cta-sec { padding: 48px 20px; }
}
`;

/* ── Home ────────────────────────────────────────────────────────────────────── */
export default function Home() {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = stripRef.current;
    if (!el) return;
    const onScroll = () => {
      const step = el.scrollWidth / FEATS.length;
      setActiveDot(Math.min(FEATS.length - 1, Math.round(el.scrollLeft / step)));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 300);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div className="pn" style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
        <SEO />

        {/* ═══ STICKY CTA ═══ */}
        <div className={`pn-sticky${scrolled ? " show" : ""}`}>
          <img src="/logo-pnsp-crop.png" alt="PNSP" style={{ height: 28, width: "auto", display: "block", filter: "brightness(0) invert(1)" }} />
          <button className="pn-sticky-btn" onClick={() => { window.location.href = "/entrar"; }}>
            Criar conta →
          </button>
        </div>

        {/* ═══ HEADER ═══ */}
        <header className="pn-header">
          <div className="pn-header-inner">
            <Link href="/">
              <img src="/logo-pnsp-crop.png" alt="PNSP" className="pn-logo" />
            </Link>
            <nav className="pn-nav">
              {NAV_ITEMS.map(({ href, label, active }) => (
                <Link key={href} href={href}>
                  <span className={`pn-nl${active ? " on" : ""}`}>{label}</span>
                </Link>
              ))}
            </nav>
            <div className="pn-ctas">
              <a href="/entrar" style={{
                padding: "9px 20px", color: "rgba(255,255,255,0.8)",
                fontSize: "0.875rem", fontWeight: 500, fontFamily: "var(--font-body)",
                border: "1px solid rgba(255,255,255,0.2)", borderRadius: 10,
              }}>Entrar</a>
              <a href="/entrar" style={{
                padding: "9px 20px", background: G, color: "#000",
                fontSize: "0.875rem", fontWeight: 700, fontFamily: "var(--font-body)",
                borderRadius: 10, whiteSpace: "nowrap",
              }}>Criar conta</a>
            </div>
            <button
              className="pn-ham"
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </header>

        {/* ═══ MOBILE MENU ═══ */}
        {menuOpen && (
          <div className="pn-mmenu">
            {NAV_ITEMS.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
                <span className="pn-mml">{label}</span>
              </Link>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 16 }}>
              <a href="/entrar" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: 48, padding: "12px 20px",
                border: "1px solid rgba(255,255,255,0.2)", borderRadius: 12,
                color: "rgba(255,255,255,0.8)", fontSize: "1rem",
                fontWeight: 500, fontFamily: "var(--font-body)",
              }}>Entrar</a>
              <a href="/entrar" style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: 48, padding: "12px 20px",
                background: G, color: "#000", fontSize: "1rem",
                fontWeight: 700, fontFamily: "var(--font-body)", borderRadius: 12,
              }}>Criar conta</a>
            </div>
          </div>
        )}

        {/* ═══ HERO ═══ */}
        <section className="pn-hero">
          <div className="pn-hero-text">
            <span className="pn-overline anim-1">O RITMO QUE MOVE O BRASIL</span>

            <h1 className="pn-h1 anim-2">
              <span className="pn-h1-white">A plataforma nacional do</span>
              <em className="pn-h1-gold">samba e do pagode.</em>
            </h1>

            <p className="pn-sub anim-3">
              Músicos perdem shows por falta de visibilidade. Contratantes perdem dinheiro em acordos sem garantia. A PNSP resolve os dois lados.
            </p>

            <div className="pn-stats anim-4">
              {STATS.map((s, i) => (
                <div key={i} className="pn-stat">
                  <span className="pn-stat-ico">{s.ico}</span>
                  <span className="pn-stat-val" style={i === 2 ? { fontSize: 14, fontWeight: 800, color: "#C9A84C", whiteSpace: "nowrap" } : undefined}>{s.val}</span>
                  <span className="pn-stat-lbl">{s.lbl}</span>
                </div>
              ))}
            </div>

            <div className="pn-hero-ctas anim-5">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <button className="pn-btn-primary">Acessar Dashboard <IcoArr /></button>
                </Link>
              ) : (
                <button className="pn-btn-primary" onClick={() => { window.location.href = "/entrar"; }}>
                  Criar minha conta grátis <IcoArr />
                </button>
              )}
              <Link href="/perfis">
                <span className="pn-sec-link">&#9654; Como funciona</span>
              </Link>
            </div>
          </div>

          <div className="pn-hero-img" role="img" aria-label="Músicos de samba e pagode" />
        </section>

        {/* ═══ FEATURE STRIP ═══ */}
        <div className="pn-strip">
          <div className="pn-strip-scroll" ref={stripRef}>
            {FEATS.map((f, i) => (
              <Link key={i} href={f.href}>
                <div className="pn-fc">
                  <div className="pn-fi">{f.ico}</div>
                  <div className="pn-ft">{f.t}</div>
                  <div className="pn-fd">{f.d}</div>
                  <div className="pn-fa"><IcoChev /></div>
                </div>
              </Link>
            ))}
          </div>
          <div className="pn-dots">
            {FEATS.map((_, i) => (
              <div key={i} className={`pn-dot${i === activeDot ? " on" : ""}`} />
            ))}
          </div>
        </div>

        {/* ═══ CTA FINAL ═══ */}
        <section className="pn-cta-sec">
          <span className="pn-cta-ey">100% GRATUITO</span>
          <h2 className="pn-cta-h2">Faça parte da maior plataforma do samba</h2>
          <p className="pn-cta-p">Artistas e profissionais já estão no ecossistema. Venha você também.</p>
          <button className="pn-cta-btn" onClick={() => { window.location.href = "/entrar"; }}>
            Criar perfil grátis agora <IcoArr />
          </button>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="pn-footer">
          <div className="pn-footer-inner">
            <img src="/logo-pnsp-crop.png" alt="PNSP" className="pn-footer-logo" />
            <span className="pn-footer-tag">Plataforma Nacional do Samba e do Pagode</span>
            <div className="pn-footer-grid">
              <div>
                <span className="pn-footer-col-title">PLATAFORMA</span>
                {[["Perfis", "/perfis"], ["Ofertas", "/ofertas"], ["Oportunidades", "/oportunidades"], ["Estúdios", "/estudios"]].map(([l, h]) => (
                  <Link key={l} href={h}><span className="pn-fl">{l}</span></Link>
                ))}
              </div>
              <div>
                <span className="pn-footer-col-title">CONTEÚDO</span>
                {[["Academia", "/academia"], ["Mapa Vivo", "/mapa"], ["FAQ", "/faq"]].map(([l, h]) => (
                  <Link key={l} href={h}><span className="pn-fl">{l}</span></Link>
                ))}
              </div>
              <div className="pn-footer-conta">
                <span className="pn-footer-col-title">CONTA</span>
                {[["Entrar", "/entrar"], ["Criar conta", "/entrar"], ["Dashboard", "/dashboard"]].map(([l, h]) => (
                  <Link key={l} href={h}><span className="pn-fl">{l}</span></Link>
                ))}
              </div>
            </div>
            <div className="pn-footer-bottom">
              <span>© 2026 PNSP — Plataforma Nacional do Samba e do Pagode</span>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
