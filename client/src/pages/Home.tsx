import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import SEO from "@/components/SEO";

/* ─── Constants ─────────────────────────────────────────────────────────────── */
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
    value: "+25 mil", label: "artistas",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
  },
  {
    value: "+3 mil", label: "oportunidades",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  },
  {
    value: "Todo", label: "o Brasil conectado",
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  },
];

const FEATURES = [
  {
    href: "/perfis", title: "Talentos",
    desc: "Mostre seu trabalho, ganhe visibilidade e conecte-se com profissionais da música.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  },
  {
    href: "/oportunidades", title: "Oportunidades",
    desc: "Encontre shows, editais, audições e vagas que impulsionam sua carreira.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/><line x1="12" y1="12" x2="12" y2="16"/><line x1="10" y1="14" x2="14" y2="14"/></svg>,
  },
  {
    href: "/estudios", title: "Estúdios",
    desc: "Reserve estúdios, encontre produtores e grave seu próximo sucesso.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/><line x1="8" y1="22" x2="16" y2="22"/></svg>,
  },
  {
    href: "/comunidade", title: "Comunidade",
    desc: "Participe de grupos, troque experiências e fortaleça a cena do samba e pagode.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    href: "/academia", title: "Conteúdos",
    desc: "Cursos, mentorias e materiais para você evoluir como artista e profissional.",
    icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={G} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  },
];

const FOOTER_LINKS = [
  ["Perfis",        "/perfis"],
  ["Oportunidades", "/oportunidades"],
  ["Estúdios",      "/estudios"],
  ["Academia",      "/academia"],
  ["Entrar",        "/entrar"],
] as const;

/* ─── Inline CSS ─────────────────────────────────────────────────────────────── */
const CSS = `
.pn *, .pn *::before, .pn *::after { box-sizing: border-box; }
.pn a { color: inherit; text-decoration: none; }

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
.pn-overline {
  color: #C9A84C; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.22em;
  text-transform: uppercase; font-family: var(--font-body); margin-bottom: 24px;
}
.pn-h1 {
  font-family: var(--font-display); font-weight: 400; line-height: 1.05;
  letter-spacing: -0.02em; margin-bottom: 24px;
}
.pn-h1-white { font-size: clamp(2.8rem, 5.5vw, 4.5rem); color: #fff; display: block; }
.pn-h1-gold  { font-size: clamp(2.8rem, 5.5vw, 4.5rem); color: #C9A84C; font-style: italic; display: block; }
.pn-sub {
  font-size: 1.05rem; color: rgba(255,255,255,0.6); line-height: 1.7;
  margin-bottom: 40px; max-width: 440px; font-family: var(--font-body);
}
.pn-hero-ctas { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 48px; }
.pn-btn-gold {
  display: inline-flex; align-items: center; gap: 8px; padding: 15px 36px;
  background: #C9A84C; color: #000; font-weight: 700; font-size: 1rem;
  border-radius: 12px; border: none; cursor: pointer;
  font-family: var(--font-body); box-shadow: 0 4px 24px rgba(201,168,76,0.3);
  transition: background 0.2s, transform 0.15s; white-space: nowrap;
}
.pn-btn-gold:hover { background: #dfc065; transform: translateY(-1px); }
.pn-btn-ghost {
  display: inline-flex; align-items: center; gap: 10px; padding: 15px 28px;
  border: 1px solid rgba(255,255,255,0.25); color: rgba(255,255,255,0.85);
  font-weight: 500; font-size: 1rem; border-radius: 12px; cursor: pointer;
  font-family: var(--font-body); transition: border-color 0.2s, color 0.2s;
  background: transparent;
}
.pn-btn-ghost:hover { border-color: rgba(201,168,76,0.5); color: #C9A84C; }

/* Stats strip */
.pn-stats {
  display: flex; gap: 0; padding-top: 28px;
  border-top: 1px solid rgba(255,255,255,0.08);
}
.pn-stat { display: flex; align-items: center; }
.pn-stat-divider {
  width: 1px; height: 36px; background: rgba(255,255,255,0.12);
  margin: 0 20px; flex-shrink: 0;
}
.pn-stat-val {
  font-family: var(--font-display); font-size: 1.3rem; font-weight: 700;
  color: #C9A84C; display: flex; align-items: center; gap: 6px;
}
.pn-stat-lbl {
  font-size: 0.74rem; color: rgba(255,255,255,0.45);
  margin-top: 3px; font-family: var(--font-body);
}

/* Feature section */
.pn-features { padding: 80px 24px; background: #0a0a0a; }
.pn-features-hd { text-align: center; margin-bottom: 48px; }
.pn-tag {
  color: #C9A84C; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.18em;
  text-transform: uppercase; font-family: var(--font-body); margin-bottom: 14px;
}
.pn-h2 {
  font-family: var(--font-display); font-size: clamp(1.8rem, 4vw, 2.6rem);
  font-weight: 400; color: #fff; line-height: 1.1;
}
.pn-fc-grid {
  display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px;
}
.pn-fc-card {
  background: #111; border: 1px solid rgba(255,255,255,0.08);
  border-radius: 16px; padding: 28px 20px;
  display: flex; flex-direction: column; gap: 14px;
  transition: border-color 0.25s, transform 0.25s, box-shadow 0.25s;
  cursor: pointer;
}
.pn-fc-card:hover {
  border-color: #C9A84C; transform: translateY(-4px);
  box-shadow: 0 8px 32px rgba(201,168,76,0.15);
}
.pn-icon-box {
  width: 44px; height: 44px; background: rgba(201,168,76,0.1);
  border-radius: 12px; display: flex; align-items: center;
  justify-content: center; flex-shrink: 0;
}
.pn-fc-title {
  font-family: var(--font-display); font-size: 1.1rem;
  font-weight: 600; color: #fff; margin-bottom: 6px;
}
.pn-fc-desc {
  font-size: 0.82rem; color: rgba(255,255,255,0.5);
  line-height: 1.6; font-family: var(--font-body);
}
.pn-fc-more {
  display: flex; align-items: center; gap: 4px; margin-top: auto;
  color: rgba(255,255,255,0.2); font-size: 0.78rem; font-weight: 600;
  transition: color 0.2s; font-family: var(--font-body);
}
.pn-fc-card:hover .pn-fc-more { color: #C9A84C; }

/* CTA section */
.pn-cta-wrap {
  padding: 96px 24px; background: #000; text-align: center;
  position: relative; overflow: hidden;
}
.pn-cta-glow {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%);
  width: 600px; height: 600px;
  background: radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%);
  pointer-events: none;
}
.pn-cta-body { max-width: 560px; margin: 0 auto; position: relative; }
.pn-cta-tag {
  color: #C9A84C; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.22em;
  text-transform: uppercase; font-family: var(--font-body); margin-bottom: 20px;
}
.pn-cta-h2 {
  font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3.2rem);
  font-weight: 400; color: #fff; margin-bottom: 16px; line-height: 1.1;
}
.pn-cta-p {
  color: rgba(255,255,255,0.5); font-size: 1rem; line-height: 1.7;
  max-width: 420px; margin: 0 auto 40px; font-family: var(--font-body);
}

/* Footer */
.pn-footer {
  background: #0a0a0a; border-top: 1px solid rgba(255,255,255,0.06);
  padding: 40px 24px 24px;
}
.pn-footer-inner {
  max-width: 1280px; margin: 0 auto;
  display: flex; flex-wrap: wrap; align-items: center;
  justify-content: space-between; gap: 20px;
}
.pn-footer-logo { height: 48px; width: auto; display: block; object-fit: contain; mix-blend-mode: screen; max-width: none; }
.pn-footer-links { display: flex; gap: 20px; flex-wrap: wrap; }
.pn-fl {
  color: rgba(255,255,255,0.4); font-size: 0.85rem;
  font-family: var(--font-body); transition: color 0.2s; cursor: pointer;
}
.pn-fl:hover { color: #fff; }
.pn-copy {
  color: rgba(255,255,255,0.3); font-size: 0.8rem; font-family: var(--font-body);
  width: 100%; padding-top: 20px;
  border-top: 1px solid rgba(255,255,255,0.06); text-align: center;
}

/* ── Mobile ───────────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .pn-nav, .pn-ctas { display: none !important; }
  .pn-ham { display: flex !important; }

  .pn-hero { flex-direction: column; min-height: auto; padding-top: 64px; }
  .pn-hero-text { width: 100%; padding: 28px 20px 44px; order: 2; }
  .pn-hero-img { position: relative; width: 100%; height: 55vw; order: 1; }
  .pn-hero-img::before {
    background: linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 50%, rgba(0,0,0,0.45) 100%);
  }
  .pn-hero-img::after { display: none; }
  .pn-h1-white, .pn-h1-gold { font-size: clamp(2rem, 8vw, 2.8rem) !important; }
  .pn-sub { font-size: 1rem !important; line-height: 1.6 !important; }
  .pn-hero-ctas { flex-direction: column; }
  .pn-hero-ctas > * { width: 100% !important; justify-content: center !important; }
  .pn-stats { overflow-x: auto; scrollbar-width: none; -webkit-overflow-scrolling: touch; }
  .pn-stats::-webkit-scrollbar { display: none; }

  .pn-features { padding: 56px 0 56px 20px; }
  .pn-features-hd { padding-right: 20px; }
  .pn-fc-grid {
    display: flex; overflow-x: auto; gap: 14px; scrollbar-width: none;
    -webkit-overflow-scrolling: touch; padding-right: 20px; padding-bottom: 8px;
  }
  .pn-fc-grid::-webkit-scrollbar { display: none; }
  .pn-fc-card { flex: 0 0 220px; }

  .pn-cta-wrap { padding: 64px 20px; }
  .pn-cta-glow { display: none; }
  .pn-footer { padding: 32px 20px 20px; }
  .pn-footer-inner { flex-direction: column; align-items: flex-start; }
}
`;

/* ─── Home ───────────────────────────────────────────────────────────────────── */
export default function Home() {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <style>{CSS}</style>
      <div className="pn" style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "var(--font-body)" }}>
        <SEO />

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
                transition: "border-color 0.2s",
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
            <p className="pn-overline">O RITMO QUE MOVE O BRASIL</p>

            <h1 className="pn-h1">
              <span className="pn-h1-white">A plataforma nacional do</span>
              <em className="pn-h1-gold">samba e do pagode.</em>
            </h1>

            <p className="pn-sub">
              Conectamos artistas, oportunidades, produção, visibilidade e crescimento
              profissional em um só lugar. Do talento ao palco, do estúdio ao mundo.
            </p>

            <div className="pn-hero-ctas">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <span className="pn-btn-gold">
                    Acessar Dashboard
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </span>
                </Link>
              ) : (
                <a href="/entrar" className="pn-btn-gold">
                  Criar minha conta
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </a>
              )}
              <Link href="/perfis">
                <span className="pn-btn-ghost">
                  <span style={{ width: 28, height: 28, background: "rgba(255,255,255,0.1)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="#fff" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </span>
                  Como funciona
                </span>
              </Link>
            </div>

            <div className="pn-stats">
              {STATS.map((s, i) => (
                <div key={s.label} className="pn-stat">
                  {i > 0 && <div className="pn-stat-divider" />}
                  <div>
                    <div className="pn-stat-val">{s.icon}{s.value}</div>
                    <div className="pn-stat-lbl">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pn-hero-img" role="img" aria-label="Músicos de samba e pagode" />
        </section>

        {/* ═══ FEATURE CARDS ═══ */}
        <section className="pn-features">
          <div className="pn-features-hd">
            <p className="pn-tag">Tudo em um só lugar</p>
            <h2 className="pn-h2">Uma plataforma, infinitas possibilidades</h2>
          </div>
          <div className="pn-fc-grid">
            {FEATURES.map(f => (
              <Link key={f.title} href={f.href}>
                <div className="pn-fc-card">
                  <div className="pn-icon-box">{f.icon}</div>
                  <div>
                    <div className="pn-fc-title">{f.title}</div>
                    <div className="pn-fc-desc">{f.desc}</div>
                  </div>
                  <div className="pn-fc-more">
                    <span>Explorar</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 18 15 12 9 6"/></svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ═══ CTA FINAL ═══ */}
        <section className="pn-cta-wrap">
          <div className="pn-cta-glow" />
          <div className="pn-cta-body">
            <p className="pn-cta-tag">100% gratuito</p>
            <h2 className="pn-cta-h2">Faça parte da maior plataforma do samba</h2>
            <p className="pn-cta-p">
              Artistas e profissionais já estão no ecossistema. Venha você também.
            </p>
            <a href="/entrar" className="pn-btn-gold">
              Criar perfil grátis agora
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>
        </section>

        {/* ═══ FOOTER ═══ */}
        <footer className="pn-footer">
          <div className="pn-footer-inner">
            <img src="/logo-pnsp-crop.png" alt="PNSP" className="pn-footer-logo" />
            <div className="pn-footer-links">
              {FOOTER_LINKS.map(([label, href]) => (
                <Link key={label} href={href}>
                  <span className="pn-fl">{label}</span>
                </Link>
              ))}
            </div>
            <p className="pn-copy">© 2026 PNSP — Plataforma Nacional do Samba e do Pagode</p>
          </div>
        </footer>
      </div>
    </>
  );
}
