import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { PROFILE_TYPES } from "@shared/pnsp";
import SEO from "@/components/SEO";
import {
  Play, ArrowRight, Music2, Target, Mic2, Users, BookOpen,
  MapPin, ChevronRight,
} from "lucide-react";

/* ─── Smart Search ──────────────────────────────────────────────────────────── */
const SEARCH_TYPES = [
  { value: "", label: "Todos" },
  { value: "artista_solo", label: "Artista" },
  { value: "grupo_banda", label: "Grupo" },
  { value: "produtor", label: "Produtor" },
  { value: "estudio", label: "Estúdio" },
  { value: "contratante", label: "Contratante" },
];

function SmartSearch() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [city, setCity] = useState("");
  const [qFocus, setQFocus] = useState(false);
  const [cityFocus, setCityFocus] = useState(false);

  function handleSearch() {
    const params = new URLSearchParams();
    if (q.trim())    params.set("q",    q.trim());
    if (type)        params.set("type", type);
    if (city.trim()) params.set("city", city.trim());
    window.location.href = `/perfis${params.toString() ? `?${params}` : ""}`;
  }

  const inputBase: React.CSSProperties = {
    flex: 1,
    padding: "12px 16px",
    background: "#0a0a0a",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    color: "#fff",
    fontSize: "0.875rem",
    fontFamily: "var(--font-body)",
    outline: "none",
    transition: "border-color .2s",
    minWidth: 0,
  };

  return (
    <div style={{
      background: "#1a1a1a",
      border: "1px solid #2a2a2a",
      borderRadius: 16,
      padding: 8,
      boxShadow: "0 8px 40px rgba(0,0,0,0.60)",
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      alignItems: "center",
    }}>
      <input
        data-testid="search-input"
        style={{ ...inputBase, borderColor: qFocus ? "#d4a817" : "rgba(255,255,255,0.08)", flex: "2 1 200px" }}
        placeholder="Buscar artistas, produtores, estúdios..."
        value={q}
        onChange={e => setQ(e.target.value)}
        onFocus={() => setQFocus(true)}
        onBlur={() => setQFocus(false)}
        onKeyDown={e => e.key === "Enter" && handleSearch()}
      />
      <select
        style={{ ...inputBase, flex: "1 1 140px", cursor: "pointer" }}
        value={type}
        onChange={e => setType(e.target.value)}
      >
        {SEARCH_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      <input
        style={{ ...inputBase, borderColor: cityFocus ? "#d4a817" : "rgba(255,255,255,0.08)", flex: "1 1 140px" }}
        placeholder="Cidade"
        value={city}
        onChange={e => setCity(e.target.value)}
        onFocus={() => setCityFocus(true)}
        onBlur={() => setCityFocus(false)}
        onKeyDown={e => e.key === "Enter" && handleSearch()}
      />
      <button
        onClick={handleSearch}
        style={{
          padding: "12px 28px",
          background: "#d4a817",
          color: "#0a0a0a",
          fontWeight: 700,
          fontFamily: "var(--font-body)",
          fontSize: "0.875rem",
          borderRadius: 10,
          border: "none",
          cursor: "pointer",
          whiteSpace: "nowrap",
          flex: "0 0 auto",
          transition: "background 0.2s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#e8c042"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#d4a817"; }}
      >
        Buscar
      </button>
    </div>
  );
}

/* ─── Counter hook ──────────────────────────────────────────────────────────── */
function useCountUp(target: number, duration = 1200, enabled = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!enabled || target === 0) { setCount(target); return; }
    let start = 0;
    const step = Math.max(1, Math.ceil(target / (duration / 16)));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration, enabled]);
  return count;
}

/* ─── Feature cards ─────────────────────────────────────────────────────────── */
const FEATURES = [
  { icon: Music2,   title: "Talentos",      desc: "Artistas, grupos e músicos de todo o Brasil", href: "/perfis" },
  { icon: Target,   title: "Oportunidades", desc: "Shows, gravações e parcerias em aberto",       href: "/oportunidades" },
  { icon: Mic2,     title: "Estúdios",      desc: "Os melhores estúdios do samba nacional",       href: "/estudios" },
  { icon: Users,    title: "Comunidade",    desc: "Conecte-se e colabore com o ecossistema",      href: "/comunidade" },
  { icon: BookOpen, title: "Conteúdos",     desc: "Academia, tutoriais e material exclusivo",      href: "/academia" },
];

function FeatureCard({ feat }: { feat: typeof FEATURES[0] }) {
  const [h, setH] = useState(false);
  const Icon = feat.icon;
  return (
    <Link href={feat.href}>
      <div
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
        style={{
          background: "#1a1a1a",
          border: `1px solid ${h ? "#d4a817" : "#2a2a2a"}`,
          borderRadius: 16,
          padding: "32px 24px",
          cursor: "pointer",
          transition: "border-color 0.25s ease, box-shadow 0.25s ease, transform 0.25s ease",
          display: "flex",
          flexDirection: "column",
          gap: 16,
          flex: "1 1 180px",
          transform: h ? "translateY(-4px)" : "translateY(0)",
          boxShadow: h ? "0 8px 32px rgba(212,168,23,0.15)" : "none",
        }}
      >
        <div style={{
          width: 48, height: 48,
          background: "rgba(212,168,23,0.10)",
          borderRadius: 12,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon style={{ width: 22, height: 22, color: "#d4a817" }} />
        </div>
        <div>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.15rem", fontWeight: 600, color: "#fff", marginBottom: 6 }}>
            {feat.title}
          </div>
          <div style={{ fontSize: "0.82rem", color: "rgba(255,255,255,0.50)", lineHeight: 1.6 }}>
            {feat.desc}
          </div>
        </div>
        <div style={{
          display: "flex", alignItems: "center", gap: 4,
          color: h ? "#d4a817" : "rgba(255,255,255,0.20)",
          transition: "color 0.2s",
          fontSize: "0.78rem", fontWeight: 600, marginTop: "auto",
        }}>
          <span>Explorar</span>
          <ChevronRight style={{ width: 13, height: 13 }} />
        </div>
      </div>
    </Link>
  );
}

/* ─── Profile card ──────────────────────────────────────────────────────────── */
function ProfileCard({ profile }: { profile: any }) {
  const [h, setH] = useState(false);
  return (
    <Link href={`/perfil/${profile.slug?.toLowerCase()}`}>
      <div
        style={{
          background: "#1a1a1a",
          border: `1px solid ${h ? "#d4a817" : "#2a2a2a"}`,
          borderRadius: 16,
          overflow: "hidden",
          transition: "all 0.3s ease",
          transform: h ? "translateY(-8px)" : "translateY(0)",
          boxShadow: h ? "0 20px 60px rgba(0,0,0,0.7), 0 4px 32px rgba(212,168,23,0.20)" : "none",
          cursor: "pointer",
        }}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
      >
        <div style={{
          aspectRatio: "4/3",
          background: "linear-gradient(135deg, #111, #2a2a2a)",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
          {profile.avatarUrl ? (
            <img
              src={profile.avatarUrl}
              alt={profile.displayName}
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", transform: h ? "scale(1.06)" : "scale(1)" }}
            />
          ) : (
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "linear-gradient(135deg, #d4a817, #8B6110)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontSize: "1.8rem", fontWeight: 700, color: "#0a0a0a",
            }}>
              {profile.displayName?.[0]?.toUpperCase()}
            </div>
          )}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.80), transparent)",
            opacity: h ? 1 : 0,
            transition: "opacity 0.3s ease",
            display: "flex", alignItems: "flex-end", padding: 16,
          }}>
            <span style={{ color: "#fff", fontSize: "0.82rem", fontWeight: 600 }}>Ver perfil →</span>
          </div>
        </div>
        <div style={{ padding: 20 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", color: "#fff" }}>
            {profile.displayName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 4,
              padding: "3px 10px", borderRadius: 999,
              fontSize: "0.72rem", fontWeight: 600,
              background: "rgba(212,168,23,0.10)", color: "#d4a817",
              border: "1px solid rgba(212,168,23,0.25)",
            }}>
              {PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES] || profile.profileType?.replace(/_/g, " ")}
            </span>
            {profile.city && (
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 3 }}>
                <MapPin style={{ width: 11, height: 11 }} />{profile.city}
              </span>
            )}
          </div>
          {profile.bio && (
            <p style={{
              color: "rgba(255,255,255,0.45)", fontSize: "0.82rem", lineHeight: 1.5,
              display: "-webkit-box", WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical", overflow: "hidden",
            }}>
              {profile.bio}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function ProfileSkeleton() {
  return (
    <div style={{ background: "#1a1a1a", borderRadius: 16, overflow: "hidden", border: "1px solid #2a2a2a" }}>
      <div className="skeleton" style={{ aspectRatio: "4/3" }} />
      <div style={{ padding: 20 }}>
        <div className="skeleton" style={{ height: 20, width: "70%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 14, width: "40%", borderRadius: 999, marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 12, width: "90%", marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 12, width: "65%" }} />
      </div>
    </div>
  );
}

/* ─── HowItWorksCard ────────────────────────────────────────────────────────── */
function HowItWorksCard({ step }: { step: { num: string; title: string; desc: string } }) {
  const [h, setH] = useState(false);
  return (
    <div
      style={{
        background: "#1a1a1a",
        border: `1px solid ${h ? "#d4a817" : "#2a2a2a"}`,
        borderRadius: 16,
        padding: "40px 32px",
        transition: "all 0.3s ease",
        transform: h ? "translateY(-8px)" : "translateY(0)",
        boxShadow: h ? "0 8px 32px rgba(212,168,23,0.15)" : "none",
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
    >
      <div style={{ fontFamily: "var(--font-display)", fontSize: "4.5rem", fontWeight: 900, color: "rgba(212,168,23,0.10)", lineHeight: 1, marginBottom: 24, userSelect: "none" }}>
        {step.num}
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 600, marginBottom: 12, color: "#fff" }}>{step.title}</h3>
      <p style={{ color: "rgba(255,255,255,0.50)", lineHeight: 1.7, fontSize: "0.9rem" }}>{step.desc}</p>
    </div>
  );
}

const HOW_IT_WORKS = [
  { num: "01", title: "Crie seu perfil",   desc: "Monte sua vitrine profissional em minutos. Artista, produtor, estúdio ou contratante — todos têm espaço aqui." },
  { num: "02", title: "Conecte-se",        desc: "Descubra oportunidades, publique ofertas e conecte-se com todo o ecossistema do samba nacional." },
  { num: "03", title: "Cresça",            desc: "Feche contratos, agende shows, encontre músicos, estúdios e parceiros. Tudo em um só lugar." },
];

/* ─── OfferingCard ──────────────────────────────────────────────────────────── */
function OfferingCard({ offering }: { offering: any }) {
  const [h, setH] = useState(false);
  return (
    <Link href={`/ofertas/${offering.id}`}>
      <div
        style={{
          background: "#1a1a1a",
          border: `1px solid ${h ? "#d4a817" : "#2a2a2a"}`,
          borderRadius: 16,
          padding: 24,
          cursor: "pointer",
          transition: "all 0.3s ease",
          transform: h ? "translateY(-6px)" : "translateY(0)",
          boxShadow: h ? "0 8px 32px rgba(212,168,23,0.15)" : "none",
          display: "flex", flexDirection: "column", gap: 12,
        }}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{
            display: "inline-flex", padding: "3px 10px", borderRadius: 999,
            fontSize: "0.72rem", fontWeight: 600,
            background: "rgba(212,168,23,0.10)", color: "#d4a817",
            border: "1px solid rgba(212,168,23,0.25)",
          }}>
            {offering.category?.replace(/_/g, " ")}
          </span>
          {offering.price && (
            <span style={{ color: "#1B6B3A", fontSize: "0.85rem", fontWeight: 700 }}>
              R$ {Number(offering.price).toLocaleString("pt-BR")}
            </span>
          )}
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "1.1rem", fontWeight: 600, lineHeight: 1.25, color: "#fff" }}>
          {offering.title}
        </h3>
        {offering.city && (
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: 4 }}>
            <MapPin style={{ width: 12, height: 12 }} />{offering.city}, {offering.state}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ─── Stat item ─────────────────────────────────────────────────────────────── */
function StatItem({ num, label, enabled }: { num: number; label: string; enabled: boolean }) {
  const count = useCountUp(num, 1200, enabled);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,5vw,4rem)", fontWeight: 700, color: "#0a0a0a", lineHeight: 1 }}>
        {enabled && num > 0 ? `${count}+` : num > 0 ? `${num}+` : "—"}
      </div>
      <div style={{ fontSize: "0.9rem", color: "rgba(10,10,10,0.60)", marginTop: 8, fontWeight: 500 }}>{label}</div>
    </div>
  );
}

/* ─── Home ──────────────────────────────────────────────────────────────────── */
export default function Home() {
  const { isAuthenticated } = useAuth();
  const { data: stats } = trpc.platform.publicStats.useQuery();
  const { data: featuredProfiles, isLoading: loadingProfiles } = trpc.profiles.listFeatured.useQuery({ limit: 6 });
  const { data: recentOfferings, isLoading: loadingOfferings } = trpc.offerings.listRecent.useQuery({ limit: 3 });

  const statsRef = useRef<HTMLDivElement>(null);
  const [counted, setCounted] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setCounted(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div style={{ background: "#0a0a0a", minHeight: "100vh" }}>
      <SEO />

      {/* ═══ HEADER ═══ */}
      <header style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        zIndex: 50,
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(212,168,23,0.12)",
        minHeight: 72,
        display: "flex",
        alignItems: "center",
        padding: "0 24px",
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
            <img
              src="/logo-pnsp-crop.png"
              alt="PNSP"
              style={{ height: 56, width: "auto", objectFit: "contain", filter: "none", cursor: "pointer", mixBlendMode: "screen" }}
            />
          </Link>

          {/* Nav desktop */}
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
            {[
              { href: "/",             label: "Início",        active: true },
              { href: "/perfis",       label: "Talentos" },
              { href: "/oportunidades", label: "Oportunidades" },
              { href: "/estudios",     label: "Estúdios" },
              { href: "/comunidade",   label: "Comunidade" },
              { href: "/recursos",     label: "Recursos" },
            ].map(({ href, label, active }) => (
              <Link key={href} href={href}>
                <span className={`nav-link${active ? " active" : ""}`}>{label}</span>
              </Link>
            ))}
          </nav>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href="/entrar" style={{
              padding: "9px 20px",
              color: "rgba(255,255,255,0.80)",
              fontSize: "0.875rem",
              fontWeight: 500,
              fontFamily: "var(--font-body)",
              border: "1px solid rgba(255,255,255,0.20)",
              borderRadius: 10,
              transition: "all 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.50)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.20)"; }}
            >
              Entrar
            </a>
            <a href="/entrar" style={{
              padding: "9px 20px",
              background: "#d4a817",
              color: "#0a0a0a",
              fontSize: "0.875rem",
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              borderRadius: 10,
              whiteSpace: "nowrap",
              transition: "background 0.2s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#e8c042"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#d4a817"; }}
            >
              Criar conta
            </a>
          </div>
        </div>
      </header>

      {/* ═══ HERO (duas colunas) ═══ */}
      <section className="hero-section" style={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        overflow: "hidden",
        paddingTop: 72,
      }}>
        {/* Coluna esquerda — texto */}
        <div className="hero-text-col" style={{
          width: "45%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 0 80px clamp(24px, 4vw, 80px)",
          position: "relative",
          zIndex: 2,
          flexShrink: 0,
        }}>
          {/* Overline */}
          <div className="animate-fade-up" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 28,
          }}>
            <span style={{
              color: "#d4a817",
              fontSize: "0.72rem",
              fontWeight: 700,
              letterSpacing: "0.20em",
              textTransform: "uppercase",
              fontFamily: "var(--font-body)",
            }}>
              O RITMO QUE MOVE O BRASIL
            </span>
          </div>

          {/* Título */}
          <h1 className="animate-fade-up delay-1" style={{
            fontFamily: "var(--font-display)",
            fontWeight: 400,
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            marginBottom: 28,
          }}>
            <span style={{ fontSize: "clamp(2.8rem,5.5vw,4.5rem)", color: "#ffffff", display: "block" }}>
              A plataforma nacional do
            </span>
            <em style={{ fontSize: "clamp(2.8rem,5.5vw,4.5rem)", color: "#d4a817", fontStyle: "italic", display: "block" }}>
              samba e do pagode.
            </em>
          </h1>

          {/* Subtítulo */}
          <p className="animate-fade-up delay-2" style={{
            fontSize: "1.1rem",
            color: "rgba(255,255,255,0.60)",
            lineHeight: 1.70,
            marginBottom: 44,
            maxWidth: 460,
            fontFamily: "var(--font-body)",
          }}>
            Conectamos artistas, oportunidades, produção, visibilidade e crescimento profissional em um só lugar. Do talento ao palco, do estúdio ao mundo.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up delay-3" style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 56 }}>
            {isAuthenticated ? (
              <Link href="/dashboard">
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "15px 36px",
                  background: "#d4a817", color: "#0a0a0a",
                  fontWeight: 700, fontSize: "1rem",
                  borderRadius: 12, border: "none", cursor: "pointer",
                  fontFamily: "var(--font-body)",
                  boxShadow: "0 4px 24px rgba(212,168,23,0.30)",
                  transition: "background 0.2s, transform 0.2s",
                }}>
                  Acessar Dashboard <ArrowRight style={{ width: 16, height: 16 }} />
                </span>
              </Link>
            ) : (
              <a href="/entrar" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "15px 36px",
                background: "#d4a817", color: "#0a0a0a",
                fontWeight: 700, fontSize: "1rem",
                borderRadius: 12, border: "none", cursor: "pointer",
                fontFamily: "var(--font-body)",
                boxShadow: "0 4px 24px rgba(212,168,23,0.30)",
                textDecoration: "none",
                transition: "background 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#e8c042"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#d4a817"; }}
              >
                Criar minha conta <ArrowRight style={{ width: 16, height: 16 }} />
              </a>
            )}
            <Link href="/perfis">
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "15px 32px",
                border: "1px solid rgba(255,255,255,0.25)", color: "rgba(255,255,255,0.85)",
                fontWeight: 500, fontSize: "1rem",
                borderRadius: 12, cursor: "pointer",
                fontFamily: "var(--font-body)",
                transition: "border-color 0.2s, color 0.2s",
                background: "transparent",
              }}>
                <div style={{
                  width: 28, height: 28,
                  background: "rgba(255,255,255,0.12)",
                  borderRadius: "50%",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <Play style={{ width: 10, height: 10, fill: "#fff" }} />
                </div>
                Como funciona
              </span>
            </Link>
          </div>

          {/* Stats strip */}
          <div className="animate-fade-up delay-4 hero-stats-strip" style={{
            display: "flex", gap: 0, flexWrap: "wrap",
            paddingTop: 28,
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}>
            {[
              { icon: "🎵", stat: "+25 mil", label: "artistas" },
              { icon: "🎯", stat: "+3 mil",  label: "oportunidades" },
              { icon: "🗺️", stat: "Todo",    label: "o Brasil conectado" },
            ].map((s, i) => (
              <div key={s.label} style={{ display: "flex", alignItems: "center" }}>
                {i > 0 && (
                  <div style={{ width: 1, height: 36, background: "rgba(255,255,255,0.12)", margin: "0 20px" }} />
                )}
                <div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                    <span style={{ fontSize: "1.1rem" }}>{s.icon}</span>
                    <span style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", fontWeight: 700, color: "#d4a817" }}>
                      {s.stat}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.45)", marginTop: 2 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Coluna direita — imagem */}
        <div className="hero-image-col">
          <img
            src="/hero-musicians.jpg"
            alt="Músicos de samba"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "right center" }}
          />
          {/* Gradiente da esquerda (preto) para transparente */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to right, #0a0a0a 0%, #0a0a0a 8%, rgba(10,10,10,0.85) 30%, rgba(10,10,10,0.40) 60%, transparent 100%)",
          }} />
          {/* Gradiente do topo para escurecer */}
          <div style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(10,10,10,0.5) 0%, transparent 30%)",
          }} />
        </div>
      </section>

      {/* ═══ FEATURE CARDS ═══ */}
      <section style={{ padding: "80px 24px", background: "#111111" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16 }}>
              <span style={{
                color: "#d4a817",
                fontSize: "0.72rem", fontWeight: 700,
                letterSpacing: "0.18em", textTransform: "uppercase",
                fontFamily: "var(--font-body)",
              }}>
                Tudo em um só lugar
              </span>
            </div>
            <h2 style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem,4vw,2.8rem)",
              fontWeight: 400,
              color: "#fff",
              lineHeight: 1.1,
            }}>
              Uma plataforma, infinitas possibilidades
            </h2>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {FEATURES.map(feat => <FeatureCard key={feat.title} feat={feat} />)}
          </div>
        </div>
      </section>

      {/* ═══ SMART SEARCH ═══ */}
      <section style={{ padding: "0 24px", marginTop: -32, position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <SmartSearch />
        </div>
      </section>

      {/* ═══ DESTAQUES DA PLATAFORMA ═══ */}
      <section style={{ padding: "96px 24px 80px", background: "#0a0a0a" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ marginBottom: 12 }}>
                <span style={{
                  color: "#d4a817",
                  fontSize: "0.72rem", fontWeight: 700,
                  letterSpacing: "0.20em", textTransform: "uppercase",
                  fontFamily: "var(--font-body)",
                }}>
                  EM ALTA NA PNSP
                </span>
              </div>
              <h2 style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.8rem,4vw,2.8rem)",
                fontWeight: 400,
                color: "#fff",
                lineHeight: 1.1,
                marginBottom: 8,
              }}>
                Destaques da plataforma
              </h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem" }}>
                Artistas, produtores e estúdios do ecossistema nacional
              </p>
            </div>
            <Link href="/perfis">
              <span
                data-testid="filter-artista"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "10px 22px",
                  border: "1px solid rgba(255,255,255,0.20)",
                  borderRadius: 10,
                  color: "rgba(255,255,255,0.80)",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  transition: "border-color 0.2s, color 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "#d4a817";
                  (e.currentTarget as HTMLElement).style.color = "#d4a817";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.20)";
                  (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.80)";
                }}
              >
                Ver todos <ArrowRight style={{ width: 14, height: 14 }} />
              </span>
            </Link>
          </div>
          <div data-testid="search-results" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {loadingProfiles
              ? Array.from({ length: 6 }).map((_, i) => <ProfileSkeleton key={i} />)
              : featuredProfiles?.length
              ? featuredProfiles.map(p => <ProfileCard key={p.id} profile={p} />)
              : (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.35)" }}>
                  Nenhum perfil em destaque ainda.
                </div>
              )}
          </div>
        </div>
      </section>

      {/* ═══ COMO FUNCIONA ═══ */}
      <section style={{ padding: "80px 24px", background: "#111111" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <div style={{ marginBottom: 12 }}>
              <span style={{ color: "#d4a817", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
                Como funciona
              </span>
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 400, color: "#fff", marginBottom: 14, lineHeight: 1.1 }}>
              Três passos para o ecossistema
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "1rem", maxWidth: 440, margin: "0 auto", lineHeight: 1.65 }}>
              Da criação do perfil às oportunidades reais — simples e direto.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {HOW_IT_WORKS.map(step => <HowItWorksCard key={step.num} step={step} />)}
          </div>
        </div>
      </section>

      {/* ═══ OFERTAS ═══ */}
      {(loadingOfferings || (recentOfferings && recentOfferings.length > 0)) && (
        <section style={{ padding: "80px 24px", background: "#0a0a0a" }}>
          <div style={{ maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
              <div>
                <div style={{ marginBottom: 12 }}>
                  <span style={{ color: "#d4a817", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
                    Marketplace
                  </span>
                </div>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem,4vw,2.8rem)", fontWeight: 400, color: "#fff", marginBottom: 8, lineHeight: 1.1 }}>
                  Ofertas recentes
                </h2>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: "0.9rem" }}>Serviços disponíveis no ecossistema</p>
              </div>
              <Link href="/ofertas">
                <span style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  padding: "10px 22px",
                  border: "1px solid rgba(255,255,255,0.20)",
                  borderRadius: 10,
                  color: "rgba(255,255,255,0.80)",
                  fontSize: "0.875rem", fontWeight: 500,
                  fontFamily: "var(--font-body)", cursor: "pointer",
                }}>
                  Ver todas <ArrowRight style={{ width: 14, height: 14 }} />
                </span>
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {loadingOfferings
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ background: "#1a1a1a", borderRadius: 16, border: "1px solid #2a2a2a", padding: 24 }}>
                      {[80, 60, 40, 32].map((h, j) => (
                        <div key={j} className="skeleton" style={{ height: h, marginBottom: 12, borderRadius: 8 }} />
                      ))}
                    </div>
                  ))
                : recentOfferings?.map(offering => <OfferingCard key={offering.id} offering={offering} />)}
            </div>
          </div>
        </section>
      )}

      {/* ═══ STATS — fundo dourado ═══ */}
      <section ref={statsRef} style={{
        padding: "64px 24px",
        background: "linear-gradient(135deg, #d4a817 0%, #8B6110 100%)",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, textAlign: "center" }}>
          <StatItem num={stats?.profileCount ?? 0} label="Artistas cadastrados" enabled={counted} />
          <StatItem num={stats?.studioCount ?? 0} label="Estúdios parceiros" enabled={counted} />
          <StatItem num={stats?.opportunityCount ?? 0} label="Oportunidades abertas" enabled={counted} />
          <StatItem num={stats?.cityCount ?? 0} label="Cidades cobertas" enabled={counted} />
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section style={{ padding: "96px 24px", background: "#0a0a0a", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%,-50%)",
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(212,168,23,0.10) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 640, margin: "0 auto", position: "relative" }}>
          <div style={{ marginBottom: 24 }}>
            <span style={{ color: "#d4a817", fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.20em", textTransform: "uppercase", fontFamily: "var(--font-body)" }}>
              100% gratuito
            </span>
          </div>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,5vw,3.2rem)", fontWeight: 400, color: "#fff", marginBottom: 16, lineHeight: 1.1 }}>
            Faça parte da maior plataforma do samba
          </h2>
          <p style={{ color: "rgba(255,255,255,0.50)", fontSize: "1rem", lineHeight: 1.7, maxWidth: 480, margin: "0 auto 44px" }}>
            Artistas e profissionais já estão no ecossistema. Venha você também.
          </p>
          <a href="/entrar" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "18px 48px",
            background: "#d4a817", color: "#0a0a0a",
            fontWeight: 700, fontSize: "1.05rem",
            borderRadius: 12, border: "none", cursor: "pointer",
            fontFamily: "var(--font-body)", textDecoration: "none",
            boxShadow: "0 4px 32px rgba(212,168,23,0.30)",
            animation: "pulse-ring 3s ease-out infinite",
          }}>
            Criar perfil grátis agora <ArrowRight style={{ width: 18, height: 18 }} />
          </a>
        </div>
      </section>

      {/* ═══ BANNER PRÉ-LANÇAMENTO ═══ */}
      <section style={{
        background: "rgba(212,168,23,0.06)",
        borderTop: "1px solid rgba(212,168,23,0.12)",
        padding: "20px 24px",
        textAlign: "center",
      }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "center", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ color: "rgba(255,255,255,0.70)", fontSize: "0.875rem", fontWeight: 400 }}>
            A primeira infraestrutura digital do samba e pagode chega em breve.
          </span>
          <Link href="/pre-lancamento">
            <span style={{ color: "#d4a817", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              Garanta seu lugar agora <ArrowRight style={{ width: 13, height: 13 }} />
            </span>
          </Link>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: "#111111", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "56px 24px 32px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 40, marginBottom: 48 }}>
            <div style={{ gridColumn: "span 2" }}>
              <img src="/logo-pnsp-crop.png" alt="PNSP" style={{ height: 64, width: "auto", marginBottom: 14, filter: "none", objectFit: "contain", display: "block" }} />
              <p style={{ color: "rgba(255,255,255,0.40)", fontSize: "0.85rem", lineHeight: 1.7, maxWidth: 260 }}>
                Plataforma Nacional do Samba e do Pagode — o ecossistema digital que conecta toda a cadeia do samba brasileiro.
              </p>
            </div>
            {[
              { title: "Plataforma", links: [["Perfis", "/perfis"], ["Ofertas", "/ofertas"], ["Oportunidades", "/oportunidades"], ["Estúdios", "/estudios"]] },
              { title: "Conteúdo",  links: [["Academia", "/academia"], ["Mapa Vivo", "/mapa"], ["FAQ", "/faq"]] },
              { title: "Conta",     links: [["Entrar", "/entrar"], ["Dashboard", "/dashboard"]] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: "0.72rem", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#d4a817", marginBottom: 16, fontFamily: "var(--font-body)" }}>
                  {col.title}
                </div>
                {col.links.map(([label, href]) => (
                  <div key={label} style={{ marginBottom: 10 }}>
                    <Link href={href}>
                      <span style={{ color: "rgba(255,255,255,0.40)", fontSize: "0.875rem", cursor: "pointer", transition: "color 0.2s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.40)"; }}
                      >{label}</span>
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <span style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.82rem" }}>
              © 2026 PNSP — Plataforma Nacional do Samba e do Pagode
            </span>
            <span style={{ color: "#d4a817", fontSize: "0.82rem", fontWeight: 600 }}>
              Feito com 🥁 no Brasil
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}




