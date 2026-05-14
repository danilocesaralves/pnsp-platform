import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import SEO from "@/components/SEO";

/* ── SVG icons ───────────────────────────────────────────────────────────────── */
const IcoUsers = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IcoTarget = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>
  </svg>
);
const IcoGlobe = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);
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
const NAV = [
  { href: "/",              label: "Início",        on: true },
  { href: "/perfis",        label: "Talentos" },
  { href: "/oportunidades", label: "Oportunidades" },
  { href: "/estudios",      label: "Estúdios" },
  { href: "/comunidade",    label: "Comunidade" },
  { href: "/recursos",      label: "Recursos" },
];

const STATS = [
  { ico: <IcoUsers />, val: "+25 mil", lbl: "artistas" },
  { ico: <IcoTarget />, val: "+3 mil",  lbl: "oportunidades" },
  { ico: <IcoGlobe />,  val: "Todo Brasil", lbl: "conectado" },
];

const FEATS = [
  { href: "/perfis",        ico: <IcoStar />,      t: "Talentos",      d: "Mostre seu trabalho, ganhe visibilidade e conecte-se com profissionais da música." },
  { href: "/oportunidades", ico: <IcoBriefcase />, t: "Oportunidades", d: "Encontre shows, editais, audições e vagas que impulsionam sua carreira." },
  { href: "/estudios",      ico: <IcoWave />,      t: "Estúdios",      d: "Reserve estúdios, encontre produtores e grave seu próximo sucesso." },
  { href: "/comunidade",    ico: <IcoPeople />,    t: "Comunidade",    d: "Participe de grupos, troque experiências e fortaleça a cena do samba e pagode." },
  { href: "/academia",      ico: <IcoPlay />,      t: "Conteúdos",     d: "Cursos, mentorias e materiais para você evoluir como artista e profissional." },
];

const FCOLS = [
  { title: "PLATAFORMA", links: [["Perfis", "/perfis"], ["Ofertas", "/ofertas"], ["Oportunidades", "/oportunidades"], ["Estúdios", "/estudios"]] },
  { title: "CONTEÚDO",   links: [["Academia", "/academia"], ["Mapa Vivo", "/mapa"], ["FAQ", "/faq"]] },
  { title: "CONTA",      links: [["Entrar", "/entrar"], ["Criar conta", "/entrar"], ["Dashboard", "/dashboard"]] },
];

/* ── CSS ─────────────────────────────────────────────────────────────────────── */
const CSS = `
*, *::before, *::after { box-sizing: border-box; }
a { color: inherit; text-decoration: none; }
button { cursor: pointer; font-family: inherit; }

/* Nav */
.n { position:fixed;top:0;left:0;right:0;z-index:100;height:60px;display:flex;align-items:center;padding:0 20px;background:rgba(0,0,0,0.93);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-bottom:1px solid rgba(255,255,255,0.06); }
.ni { max-width:1280px;margin:0 auto;width:100%;display:flex;align-items:center;justify-content:space-between; }
.nl { height:48px;width:auto;display:block;mix-blend-mode:screen;max-width:none; }
.nn { display:flex;align-items:center;gap:2px; }
.na { position:relative;font-size:14px;font-weight:500;color:rgba(255,255,255,0.6);padding:8px 12px;cursor:pointer;white-space:nowrap;transition:color .2s;font-family:system-ui,-apple-system,sans-serif;display:inline-block; }
.na:hover { color:#fff; }
.na.on { color:#C9A84C; }
.na.on::after { content:'';position:absolute;bottom:2px;left:50%;transform:translateX(-50%);width:50%;height:1.5px;background:#C9A84C;border-radius:999px; }
.nc { display:flex;gap:8px;align-items:center; }
.nh { display:none;background:none;border:1px solid rgba(255,255,255,0.18);color:#fff;border-radius:8px;width:40px;height:40px;align-items:center;justify-content:center;font-size:18px;cursor:pointer;flex-shrink:0;-webkit-tap-highlight-color:transparent;line-height:1; }
.nm { position:fixed;top:60px;left:0;right:0;z-index:99;background:rgba(0,0,0,0.97);backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,0.06);padding:8px 20px 20px; }
.nml { display:flex;align-items:center;min-height:48px;font-size:16px;font-weight:500;color:rgba(255,255,255,0.8);border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;font-family:system-ui,-apple-system,sans-serif; }

/* Animations */
@keyframes heroFadeUp { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
.a1{animation:heroFadeUp .6s ease-out .05s both}
.a2{animation:heroFadeUp .6s ease-out .15s both}
.a3{animation:heroFadeUp .6s ease-out .25s both}
.a4{animation:heroFadeUp .6s ease-out .35s both}
.a5{animation:heroFadeUp .6s ease-out .45s both}

/* Hero */
.h { position:relative;background:#000;padding-top:60px;overflow:hidden; }
.h::before { content:'';position:absolute;inset:0;z-index:5;pointer-events:none;opacity:.04;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E"); }
.hp { width:100%;height:62vw;min-height:280px;max-height:420px;background:url('/hero-musicians.jpg') 78% center/cover no-repeat;position:relative;z-index:1; }
.hp::after { content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 20%,rgba(0,0,0,.6) 60%,#000 100%); }
.hc { position:relative;z-index:2;padding:28px 20px 0; }
.ey { font-size:10px;letter-spacing:.2em;color:#C9A84C;font-weight:600;text-transform:uppercase;margin-bottom:14px;display:block;font-family:system-ui,-apple-system,sans-serif; }
.h1 { font-size:clamp(30px,8.5vw,58px);line-height:1.06;font-family:Georgia,serif;font-weight:400;color:#fff;margin-bottom:16px; }
.h1 em { color:#C9A84C;font-style:italic; }
.su { font-size:14px;color:rgba(255,255,255,.6);line-height:1.65;margin-bottom:0;max-width:480px;font-family:system-ui,-apple-system,sans-serif; }
.st { display:grid;grid-template-columns:repeat(3,1fr);gap:0;border-top:1px solid rgba(255,255,255,.08);border-bottom:1px solid rgba(255,255,255,.08);padding:14px 0;margin:20px 0; }
.si { display:flex;flex-direction:column;align-items:center;gap:4px;padding:0 8px; }
.si:not(:last-child) { border-right:1px solid rgba(255,255,255,.08); }
.sic { color:#C9A84C;margin-bottom:4px;display:flex; }
.sv { font-size:14px;font-weight:800;color:#C9A84C;line-height:1;font-family:system-ui,-apple-system,sans-serif; }
.sl { font-size:10px;color:rgba(255,255,255,.45);text-align:center;font-family:system-ui,-apple-system,sans-serif; }
.cw { display:flex;flex-direction:column;align-items:stretch; }
.btn { width:100%;padding:17px;font-size:16px;font-weight:700;background:#C9A84C;color:#000;border-radius:10px;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:transform .1s,background .15s;font-family:system-ui,-apple-system,sans-serif;display:flex;align-items:center;justify-content:center;gap:8px; }
.btn:hover { background:#E8C76A; }
.btn:active { transform:scale(.97);background:#b8942f; }
.sec { font-size:13px;color:rgba(255,255,255,.45);padding:12px 0 0;cursor:pointer;text-align:center;background:none;border:none;font-family:system-ui,-apple-system,sans-serif;display:block;width:100%;-webkit-tap-highlight-color:transparent; }

/* Feature strip */
.fs { background:#0f0f0f;border-top:1px solid rgba(255,255,255,.07);border-bottom:1px solid rgba(255,255,255,.07); }
.fsc { display:flex;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;-webkit-overflow-scrolling:touch; }
.fsc::-webkit-scrollbar { display:none; }
.fsc > a { display:contents; }
.fc { flex:0 0 72vw;max-width:260px;min-width:180px;scroll-snap-align:start;padding:18px 16px;display:flex;flex-direction:column;gap:8px;min-height:150px;cursor:pointer;border-right:1px solid rgba(255,255,255,.07);background:#0f0f0f; }
.fc:last-child { border-right:none; }
.fc:hover .fca { border-color:rgba(201,168,76,.4);color:#C9A84C; }
.fi { width:32px;height:32px;border:1px solid rgba(201,168,76,.25);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#C9A84C;flex-shrink:0; }
.ft { font-size:13px;font-weight:700;color:#fff;font-family:system-ui,-apple-system,sans-serif; }
.fd { font-size:11px;color:rgba(255,255,255,.4);line-height:1.5;overflow:hidden;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;font-family:system-ui,-apple-system,sans-serif; }
.fca { width:24px;height:24px;border-radius:50%;border:1px solid rgba(255,255,255,.12);display:flex;align-items:center;justify-content:center;color:rgba(255,255,255,.4);align-self:flex-end;margin-top:auto;flex-shrink:0;transition:border-color .2s,color .2s; }
.dots { display:flex;justify-content:center;align-items:center;gap:5px;padding:10px 0;background:#0f0f0f; }
.dot { height:4px;border-radius:999px;transition:all .25s;background:rgba(255,255,255,.2); }
.dot.on { width:14px;background:#C9A84C; }
.dot:not(.on) { width:4px; }

/* CTA section */
.cs { background:#0a0a0a;padding:52px 24px;text-align:center; }
.ce { font-size:10px;color:#C9A84C;letter-spacing:.18em;text-transform:uppercase;font-weight:700;margin-bottom:14px;font-family:system-ui,-apple-system,sans-serif;display:block; }
.ch { font-size:clamp(26px,7vw,40px);font-family:Georgia,serif;color:#fff;line-height:1.1;margin-bottom:12px; }
.cp { font-size:14px;color:rgba(255,255,255,.5);line-height:1.65;max-width:360px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif; }
.cbtn { max-width:340px;width:100%;margin:24px auto 0;padding:17px;font-size:16px;font-weight:700;background:#C9A84C;color:#000;border-radius:10px;border:none;cursor:pointer;-webkit-tap-highlight-color:transparent;box-shadow:0 0 24px rgba(201,168,76,.2);transition:transform .1s,background .15s;display:flex;align-items:center;justify-content:center;gap:8px;font-family:system-ui,-apple-system,sans-serif; }
.cbtn:hover { background:#E8C76A; }
.cbtn:active { transform:scale(.97);background:#b8942f; }

/* Footer */
.fo { background:#0d0d0d;border-top:1px solid rgba(255,255,255,.06);padding:36px 20px 28px; }
.folog { height:34px;filter:brightness(0) invert(1);display:block;margin-bottom:8px;max-width:none; }
.fotag { font-size:12px;color:rgba(255,255,255,.35);margin-bottom:28px;font-family:system-ui,-apple-system,sans-serif;display:block; }
.fogrid { display:grid;grid-template-columns:repeat(2,1fr);gap:24px;margin-bottom:20px; }
.foct { font-size:10px;color:#C9A84C;font-weight:700;letter-spacing:.12em;text-transform:uppercase;margin-bottom:12px;display:block;font-family:system-ui,-apple-system,sans-serif; }
.fol { font-size:13px;color:rgba(255,255,255,.45);display:block;margin-bottom:8px;cursor:pointer;transition:color .2s;font-family:system-ui,-apple-system,sans-serif; }
.fol:hover { color:#fff; }
.fobot { border-top:1px solid rgba(255,255,255,.05);padding-top:16px;font-size:11px;color:rgba(255,255,255,.2);font-family:system-ui,-apple-system,sans-serif; }

/* Desktop ≥768px */
@media (min-width:768px) {
  .nn,.nc { display:flex !important; }
  .nh { display:none !important; }

  .h { min-height:100vh;display:flex;align-items:stretch; }
  .hp { position:absolute;right:0;top:0;width:58%;height:100%;max-height:none;min-height:0;background-position:78% center; }
  .hp::after { background:linear-gradient(to right,#000 0%,rgba(0,0,0,.75) 35%,transparent 65%); }
  .hc { flex:1;width:50%;display:flex;flex-direction:column;justify-content:center;padding:80px clamp(40px,6vw,100px);gap:0; }
  .btn { width:auto;padding:15px 36px;display:inline-flex; }
  .cw { align-items:flex-start; }
  .sec { text-align:left;display:inline-block;width:auto; }

  .fsc { display:grid !important;grid-template-columns:repeat(5,1fr);overflow-x:visible; }
  .fc { flex:none;max-width:none;min-width:0; }
  .dots { display:none; }

  .fo { padding:52px 80px 36px; }
  .fogrid { grid-template-columns:repeat(3,1fr); }
  .fobot { display:flex;justify-content:space-between;align-items:center; }
}

/* Mobile — hide desktop nav */
@media (max-width:767px) {
  .nn,.nc { display:none !important; }
  .nh { display:flex !important; }
}
`;

/* ── Home ────────────────────────────────────────────────────────────────────── */
export default function Home() {
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDot, setActiveDot] = useState(0);
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

  return (
    <>
      <style>{CSS}</style>
      <div style={{ background: "#000", color: "#fff", minHeight: "100vh", fontFamily: "system-ui,-apple-system,sans-serif" }}>
        <SEO />

        {/* ══ NAV ══ */}
        <header className="n">
          <div className="ni">
            <Link href="/"><img src="/logo-pnsp-crop.png" alt="PNSP" className="nl" /></Link>
            <nav className="nn">
              {NAV.map(({ href, label, on }) => (
                <Link key={href} href={href}>
                  <span className={`na${on ? " on" : ""}`}>{label}</span>
                </Link>
              ))}
            </nav>
            <div className="nc">
              <a href="/entrar" style={{ padding: "8px 18px", color: "rgba(255,255,255,0.8)", fontSize: 14, fontWeight: 500, border: "1px solid rgba(255,255,255,0.18)", borderRadius: 8, fontFamily: "system-ui,-apple-system,sans-serif" }}>
                Entrar
              </a>
              <a href="/entrar" style={{ padding: "8px 18px", background: "#C9A84C", color: "#000", fontSize: 14, fontWeight: 700, borderRadius: 8, fontFamily: "system-ui,-apple-system,sans-serif", whiteSpace: "nowrap" }}>
                Criar conta
              </a>
            </div>
            <button className="nh" onClick={() => setMenuOpen(o => !o)} aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}>
              {menuOpen ? "✕" : "☰"}
            </button>
          </div>
        </header>

        {/* ══ MOBILE MENU ══ */}
        {menuOpen && (
          <div className="nm">
            {NAV.map(({ href, label }) => (
              <Link key={href} href={href} onClick={() => setMenuOpen(false)}>
                <span className="nml">{label}</span>
              </Link>
            ))}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 14 }}>
              <a href="/entrar" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 48, padding: "12px 20px", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 10, color: "rgba(255,255,255,0.8)", fontSize: 16, fontWeight: 500, fontFamily: "system-ui,-apple-system,sans-serif" }}>
                Entrar
              </a>
              <a href="/entrar" style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 48, padding: "12px 20px", background: "#C9A84C", color: "#000", fontSize: 16, fontWeight: 700, borderRadius: 10, fontFamily: "system-ui,-apple-system,sans-serif" }}>
                Criar conta
              </a>
            </div>
          </div>
        )}

        {/* ══ HERO ══ */}
        <section className="h">
          <div className="hp" role="img" aria-label="Músicos de samba e pagode" />
          <div className="hc">
            <span className="ey a1">O RITMO QUE MOVE O BRASIL</span>
            <h1 className="h1 a2">
              A plataforma nacional do<br />
              <em>samba e do pagode.</em>
            </h1>
            <p className="su a3">
              Músicos perdem shows por falta de visibilidade. Contratantes perdem dinheiro em acordos sem garantia. A PNSP resolve os dois lados.
            </p>
            <div className="st a4">
              {STATS.map((s, i) => (
                <div key={i} className="si">
                  <span className="sic">{s.ico}</span>
                  <span className="sv">{s.val}</span>
                  <span className="sl">{s.lbl}</span>
                </div>
              ))}
            </div>
            <div className="cw a5">
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <button className="btn">Acessar Dashboard <IcoArr /></button>
                </Link>
              ) : (
                <button className="btn" onClick={() => { window.location.href = "/entrar"; }}>
                  Criar minha conta grátis <IcoArr />
                </button>
              )}
              <Link href="/perfis">
                <span className="sec">&#9654; Como funciona</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ══ FEATURE STRIP ══ */}
        <div className="fs">
          <div className="fsc" ref={stripRef}>
            {FEATS.map((f, i) => (
              <Link key={i} href={f.href}>
                <div className="fc">
                  <div className="fi">{f.ico}</div>
                  <div className="ft">{f.t}</div>
                  <div className="fd">{f.d}</div>
                  <div className="fca"><IcoChev /></div>
                </div>
              </Link>
            ))}
          </div>
          <div className="dots">
            {FEATS.map((_, i) => (
              <div key={i} className={`dot${i === activeDot ? " on" : ""}`} />
            ))}
          </div>
        </div>

        {/* ══ CTA FINAL ══ */}
        <section className="cs">
          <span className="ce">100% GRATUITO</span>
          <h2 className="ch">Faça parte da maior plataforma do samba</h2>
          <p className="cp">Artistas e profissionais já estão no ecossistema. Venha você também.</p>
          <button className="cbtn" onClick={() => { window.location.href = "/entrar"; }}>
            Criar perfil grátis agora <IcoArr />
          </button>
        </section>

        {/* ══ FOOTER ══ */}
        <footer className="fo">
          <img src="/logo-pnsp-crop.png" alt="PNSP" className="folog" />
          <span className="fotag">Plataforma Nacional do Samba e do Pagode</span>
          <div className="fogrid">
            {FCOLS.map(col => (
              <div key={col.title}>
                <span className="foct">{col.title}</span>
                {col.links.map(([l, h]) => (
                  <Link key={l} href={h}><span className="fol">{l}</span></Link>
                ))}
              </div>
            ))}
          </div>
          <div className="fobot">
            <span>© 2026 PNSP — Plataforma Nacional do Samba e do Pagode</span>
          </div>
        </footer>
      </div>
    </>
  );
}
