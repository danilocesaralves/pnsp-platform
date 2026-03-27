import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { PROFILE_TYPES } from "@shared/pnsp";

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
    background: "var(--preto)",
    border: "1px solid var(--creme-10)",
    borderRadius: "var(--radius-md)",
    color: "var(--creme)",
    fontSize: "var(--text-sm)",
    fontFamily: "var(--font-body)",
    outline: "none",
    transition: "border-color .2s",
    minWidth: 0,
  };

  return (
    <div style={{
      background: "var(--terra)",
      border: "1px solid var(--creme-10)",
      borderRadius: 16,
      padding: 8,
      boxShadow: "0 8px 40px rgba(0,0,0,0.50)",
      display: "flex",
      gap: 8,
      flexWrap: "wrap",
      alignItems: "center",
    }}>
      {/* Query */}
      <input
        style={{ ...inputBase, borderColor: qFocus ? "var(--ouro)" : "var(--creme-10)", flex: "2 1 200px" }}
        placeholder="Buscar artistas, produtores, estúdios..."
        value={q}
        onChange={e => setQ(e.target.value)}
        onFocus={() => setQFocus(true)}
        onBlur={() => setQFocus(false)}
        onKeyDown={e => e.key === "Enter" && handleSearch()}
      />
      {/* Tipo */}
      <select
        style={{ ...inputBase, flex: "1 1 140px", cursor: "pointer" }}
        value={type}
        onChange={e => setType(e.target.value)}
      >
        {SEARCH_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
      </select>
      {/* Cidade */}
      <input
        style={{ ...inputBase, borderColor: cityFocus ? "var(--ouro)" : "var(--creme-10)", flex: "1 1 140px" }}
        placeholder="Cidade"
        value={city}
        onChange={e => setCity(e.target.value)}
        onFocus={() => setCityFocus(true)}
        onBlur={() => setCityFocus(false)}
        onKeyDown={e => e.key === "Enter" && handleSearch()}
      />
      {/* Botão */}
      <button
        onClick={handleSearch}
        className="pnsp-btn-primary"
        style={{ padding: "12px 28px", whiteSpace: "nowrap", flex: "0 0 auto" }}
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

/* ─── Inline style helpers ──────────────────────────────────────────────────── */
const S = {
  section: (bg?: string): React.CSSProperties => ({
    padding: "96px 24px",
    background: bg ?? "var(--preto)",
  }),
  maxW: (w = 1280): React.CSSProperties => ({
    maxWidth: w,
    margin: "0 auto",
    width: "100%",
  }),
  sectionHead: (): React.CSSProperties => ({
    textAlign: "center",
    marginBottom: 56,
  }),
  h2: (): React.CSSProperties => ({
    fontFamily: "var(--font-display)",
    fontSize: "clamp(2rem, 5vw, 3.5rem)",
    fontWeight: 700,
    marginBottom: 14,
    lineHeight: 1.1,
    letterSpacing: "-0.02em",
  }),
  sub: (): React.CSSProperties => ({
    color: "var(--creme-50)",
    fontSize: "var(--text-lg)",
    maxWidth: 480,
    margin: "0 auto",
    lineHeight: 1.65,
  }),
};

/* ─── Stat item ─────────────────────────────────────────────────────────────── */
function StatItem({ num, label, enabled }: { num: number; label: string; enabled: boolean }) {
  const count = useCountUp(num, 1200, enabled);
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{
        fontFamily: "var(--font-display)",
        fontSize: "clamp(3rem, 6vw, 5rem)",
        fontWeight: 700,
        color: "var(--preto)",
        lineHeight: 1,
      }}>
        {enabled && num > 0 ? `${count}+` : num > 0 ? `${num}+` : "—"}
      </div>
      <div style={{ fontSize: "var(--text-base)", color: "rgba(12,10,8,0.65)", marginTop: 8, fontWeight: 500 }}>
        {label}
      </div>
    </div>
  );
}

/* ─── Profile card (home featured) ─────────────────────────────────────────── */
function ProfileCard({ profile }: { profile: any }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/perfil/${profile.slug?.toLowerCase()}`}>
      <div
        style={{
          display: "block",
          background: "var(--terra)",
          border: `1px solid ${hovered ? "rgba(212,146,10,0.40)" : "var(--creme-10)"}`,
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          transition: "var(--transition-slow)",
          transform: hovered ? "translateY(-8px)" : "translateY(0)",
          boxShadow: hovered ? "0 20px 60px rgba(0,0,0,0.7), 0 4px 32px rgba(212,146,10,0.25)" : "none",
          cursor: "pointer",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Avatar */}
        <div style={{
          aspectRatio: "4/3",
          background: "linear-gradient(135deg, var(--terra-escura), var(--terra-clara))",
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
              style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", transform: hovered ? "scale(1.06)" : "scale(1)" }}
            />
          ) : (
            <div style={{
              width: 80, height: 80, borderRadius: "50%",
              background: "linear-gradient(135deg, var(--ouro), var(--vermelho))",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "var(--font-display)", fontSize: "2rem", fontWeight: 700, color: "var(--preto)",
            }}>
              {profile.displayName?.[0]?.toUpperCase()}
            </div>
          )}
          {/* hover overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.75), transparent)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
            display: "flex", alignItems: "flex-end", padding: "16px",
          }}>
            <span style={{ color: "var(--creme)", fontSize: "var(--text-sm)", fontWeight: 600 }}>
              Ver perfil →
            </span>
          </div>
        </div>
        {/* Info */}
        <div style={{ padding: "20px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {profile.displayName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <span className="pnsp-badge" style={{ fontSize: "var(--text-xs)" }}>
              {PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES] || profile.profileType?.replace(/_/g, " ")}
            </span>
            {profile.city && (
              <span style={{ color: "var(--creme-50)", fontSize: "var(--text-xs)" }}>📍 {profile.city}</span>
            )}
          </div>
          {profile.bio && (
            <p style={{
              color: "var(--creme-50)", fontSize: "var(--text-sm)", lineHeight: 1.5,
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
    <div style={{ background: "var(--terra)", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--creme-10)" }}>
      <div className="skeleton" style={{ aspectRatio: "4/3" }} />
      <div style={{ padding: "20px" }}>
        <div className="skeleton" style={{ height: 22, width: "70%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 16, width: "40%", borderRadius: 9999, marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 13, width: "90%", marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 13, width: "65%" }} />
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
        background: "var(--terra)",
        border: `1px solid ${h ? "rgba(212,146,10,0.35)" : "var(--creme-10)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "40px 36px",
        transition: "var(--transition)",
        transform: h ? "translateY(-8px)" : "translateY(0)",
        boxShadow: h ? "var(--shadow-ouro)" : "none",
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
    >
      <div style={{ fontFamily: "var(--font-display)", fontSize: "5rem", fontWeight: 700, color: "var(--ouro-sutil)", lineHeight: 1, marginBottom: 24, userSelect: "none" }}>
        {step.num}
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", marginBottom: 12 }}>{step.title}</h3>
      <p style={{ color: "var(--creme-50)", lineHeight: 1.65 }}>{step.desc}</p>
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
          background: "var(--terra)",
          border: `1px solid ${h ? "rgba(212,146,10,0.40)" : "var(--creme-10)"}`,
          borderRadius: "var(--radius-lg)",
          padding: 24,
          cursor: "pointer",
          transition: "var(--transition-slow)",
          transform: h ? "translateY(-6px)" : "translateY(0)",
          boxShadow: h ? "var(--shadow-ouro)" : "none",
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
        onMouseEnter={() => setH(true)}
        onMouseLeave={() => setH(false)}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="pnsp-badge" style={{ fontSize: "var(--text-xs)" }}>
            {offering.category?.replace(/_/g, " ")}
          </span>
          {offering.price && (
            <span style={{ color: "var(--verde)", fontSize: "var(--text-sm)", fontWeight: 700 }}>
              R$ {Number(offering.price).toLocaleString("pt-BR")}
            </span>
          )}
        </div>
        <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, lineHeight: 1.2 }}>
          {offering.title}
        </h3>
        {offering.city && (
          <span style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)" }}>
            📍 {offering.city}, {offering.state}
          </span>
        )}
      </div>
    </Link>
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
    <div style={{ background: "var(--preto)", minHeight: "100vh" }}>

      {/* ═══ HERO ═══ */}
      <section style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        padding: "120px 24px 80px",
      }}>
        {/* Blob ouro */}
        <div className="float" style={{
          position: "absolute", top: "10%", left: "-10%",
          width: 700, height: 700,
          background: "radial-gradient(circle, rgba(212,146,10,0.14) 0%, transparent 70%)",
          filter: "blur(80px)", pointerEvents: "none",
        }} />
        {/* Blob vermelho */}
        <div className="float-slow" style={{
          position: "absolute", bottom: "5%", right: "-15%",
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(184,50,50,0.10) 0%, transparent 70%)",
          filter: "blur(100px)", pointerEvents: "none",
        }} />
        {/* Linha decorativa */}
        <div style={{
          position: "absolute", top: "50%", left: 0, right: 0, height: 1,
          background: "linear-gradient(90deg, transparent, rgba(212,146,10,0.15), transparent)",
          pointerEvents: "none",
        }} />
        {/* Wave bottom */}
        <svg style={{ position: "absolute", bottom: 0, left: 0, right: 0, width: "100%" }}
          viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <path d="M0 30 C360 60 720 0 1080 30 C1260 45 1350 40 1440 30 L1440 60 L0 60 Z"
            fill="var(--terra-escura)" />
        </svg>

        <div style={{ ...S.maxW(), display: "grid", gridTemplateColumns: "1fr", gap: 80, alignItems: "center", position: "relative", zIndex: 1 }}>
          <div>
            {/* Tag */}
            <div className="animate-fade-up section-tag" style={{ marginBottom: 32 }}>
              <span className="section-tag-dot" />
              <span className="section-tag-text">A revolução digital do samba brasileiro</span>
            </div>

            {/* H1 */}
            <h1 className="animate-fade-up delay-1" style={{
              fontSize: "var(--text-hero)",
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              lineHeight: 1.0,
              marginBottom: 28,
              letterSpacing: "-0.03em",
              color: "var(--creme)",
            }}>
              O ecossistema digital do{" "}
              <em style={{ color: "var(--ouro)", fontStyle: "italic" }}>samba</em>
              {" "}e do{" "}
              <em style={{ color: "var(--verde)", fontStyle: "italic" }}>pagode</em>
              {" "}brasileiro
            </h1>

            {/* Sub */}
            <p className="animate-fade-up delay-2" style={{
              fontSize: "var(--text-xl)",
              color: "var(--creme-50)",
              maxWidth: 560,
              lineHeight: 1.65,
              marginBottom: 44,
            }}>
              Conectamos artistas, grupos, produtores, estúdios, contratantes e toda a cadeia do samba nacional em uma única plataforma.
            </p>

            {/* CTAs */}
            <div className="animate-fade-up delay-3" style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 56 }}>
              {isAuthenticated ? (
                <Link href="/dashboard">
                  <span className="pnsp-btn-primary">Acessar Dashboard →</span>
                </Link>
              ) : (
                <a href="/entrar" className="pnsp-btn-primary">
                  Criar meu perfil grátis →
                </a>
              )}
              <Link href="/perfis">
                <span className="pnsp-btn-ghost">Explorar a plataforma</span>
              </Link>
            </div>

            {/* Stats strip */}
            <div className="animate-fade-up delay-4" style={{
              display: "flex", gap: 40, flexWrap: "wrap",
              paddingTop: 32,
              borderTop: "1px solid var(--creme-10)",
            }}>
              {[
                { num: stats?.profileCount ?? 0, label: "Artistas" },
                { num: stats?.studioCount ?? 0, label: "Estúdios" },
                { num: stats?.opportunityCount ?? 0, label: "Oportunidades" },
                { num: stats?.cityCount ?? 0, label: "Cidades" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{ fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--ouro)", fontFamily: "var(--font-display)" }}>
                    {s.num > 0 ? `${s.num}+` : "—"}
                  </div>
                  <div style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)", marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SMART SEARCH ═══ */}
      <section style={{ padding: "0 24px", marginTop: -40, position: "relative", zIndex: 10 }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <SmartSearch />
        </div>
      </section>

      {/* ═══ COMO FUNCIONA ═══ */}
      <section style={{ ...S.section("var(--terra-escura)") }}>
        <div style={S.maxW(1100)}>
          <div style={S.sectionHead()}>
            <div className="section-tag" style={{ display: "inline-flex", marginBottom: 20 }}>
              <span className="section-tag-dot" /><span className="section-tag-text">Como funciona</span>
            </div>
            <h2 style={S.h2()}>Três passos para o ecossistema</h2>
            <p style={S.sub()}>Da criação do perfil às oportunidades reais — simples e direto.</p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24 }}>
            {HOW_IT_WORKS.map(step => <HowItWorksCard key={step.num} step={step} />)}
          </div>
        </div>
      </section>

      {/* ═══ PERFIS EM DESTAQUE ═══ */}
      <section style={S.section()}>
        <div style={S.maxW()}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div className="section-tag" style={{ display: "inline-flex", marginBottom: 16 }}>
                <span className="section-tag-dot" /><span className="section-tag-text">Destaques</span>
              </div>
              <h2 style={{ ...S.h2(), marginBottom: 8 }}>Quem está transformando o samba</h2>
              <p style={{ color: "var(--creme-50)", marginTop: 8 }}>Artistas, produtores e estúdios do ecossistema nacional</p>
            </div>
            <Link href="/perfis">
              <span style={{ color: "var(--ouro)", fontSize: "var(--text-sm)", fontWeight: 600, borderBottom: "1px solid rgba(212,146,10,0.4)", paddingBottom: 2 }}>
                Ver todos os perfis →
              </span>
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 20 }}>
            {loadingProfiles
              ? Array.from({ length: 6 }).map((_, i) => <ProfileSkeleton key={i} />)
              : featuredProfiles?.length
              ? featuredProfiles.map(p => <ProfileCard key={p.id} profile={p} />)
              : (
                <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "48px 0", color: "var(--creme-50)" }}>
                  Nenhum perfil em destaque ainda.
                </div>
              )}
          </div>
        </div>
      </section>

      {/* ═══ OFERTAS ═══ */}
      {(loadingOfferings || (recentOfferings && recentOfferings.length > 0)) && (
        <section style={{ ...S.section("var(--terra-escura)") }}>
          <div style={S.maxW()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
              <div>
                <div className="section-tag" style={{ display: "inline-flex", marginBottom: 16 }}>
                  <span className="section-tag-dot" /><span className="section-tag-text">Marketplace</span>
                </div>
                <h2 style={{ ...S.h2(), marginBottom: 8 }}>Ofertas recentes</h2>
                <p style={{ color: "var(--creme-50)" }}>Serviços disponíveis no ecossistema</p>
              </div>
              <Link href="/ofertas">
                <span style={{ color: "var(--ouro)", fontSize: "var(--text-sm)", fontWeight: 600, borderBottom: "1px solid rgba(212,146,10,0.4)", paddingBottom: 2 }}>
                  Ver todas →
                </span>
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {loadingOfferings
                ? Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} style={{ background: "var(--terra)", borderRadius: "var(--radius-lg)", border: "1px solid var(--creme-10)", padding: 24 }}>
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

      {/* ═══ STATS — fundo ouro ═══ */}
      <section ref={statsRef} style={{
        padding: "64px 24px",
        background: "linear-gradient(135deg, var(--ouro) 0%, #8B6110 100%)",
      }}>
        <div style={{ ...S.maxW(1100), display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 40, textAlign: "center" }}>
          <StatItem num={stats?.profileCount ?? 0} label="Artistas cadastrados" enabled={counted} />
          <StatItem num={stats?.studioCount ?? 0} label="Estúdios parceiros" enabled={counted} />
          <StatItem num={stats?.opportunityCount ?? 0} label="Oportunidades abertas" enabled={counted} />
          <StatItem num={stats?.cityCount ?? 0} label="Cidades cobertas" enabled={counted} />
        </div>
      </section>

      {/* ═══ CTA FINAL ═══ */}
      <section style={{ ...S.section(), textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 600, height: 600,
          background: "radial-gradient(circle, rgba(212,146,10,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ ...S.maxW(680), position: "relative" }}>
          <div className="section-tag" style={{ display: "inline-flex", marginBottom: 24 }}>
            <span className="section-tag-dot" /><span className="section-tag-text">100% gratuito</span>
          </div>
          <h2 style={S.h2()}>Faça parte da maior plataforma do samba</h2>
          <p style={{ ...S.sub(), maxWidth: "none", marginBottom: 44 }}>
            Mais de 50 artistas e profissionais já estão no ecossistema. Venha você também.
          </p>
          <a href="/entrar" className="pnsp-btn-primary" style={{ animation: "pulse-ring 3s ease-out infinite", fontSize: "var(--text-lg)", padding: "20px 48px" }}>
            Criar perfil grátis agora →
          </a>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer style={{ background: "var(--terra-escura)", borderTop: "1px solid var(--creme-10)", padding: "56px 24px 32px" }}>
        <div style={S.maxW()}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 40, marginBottom: 48 }}>
            <div style={{ gridColumn: "span 2" }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 700, color: "var(--ouro)", marginBottom: 12 }}>
                PNSP
              </div>
              <p style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)", lineHeight: 1.6, maxWidth: 260 }}>
                Plataforma Nacional do Samba e do Pagode — o ecossistema digital que conecta toda a cadeia do samba brasileiro.
              </p>
            </div>
            {[
              { title: "Plataforma", links: [["Perfis", "/perfis"], ["Ofertas", "/ofertas"], ["Oportunidades", "/oportunidades"], ["Estúdios", "/estudios"]] },
              { title: "Conteúdo", links: [["Academia", "/academia"], ["Mapa Vivo", "/mapa"]] },
              { title: "Conta", links: [["Entrar", "/entrar"], ["Dashboard", "/dashboard"]] },
            ].map(col => (
              <div key={col.title}>
                <div style={{ fontSize: "var(--text-xs)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--ouro)", marginBottom: 16 }}>
                  {col.title}
                </div>
                {col.links.map(([label, href]) => (
                  <div key={label} style={{ marginBottom: 10 }}>
                    <Link href={href}>
                      <span style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)", cursor: "pointer", transition: "color 0.2s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--creme)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--creme-50)"; }}
                      >{label}</span>
                    </Link>
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid var(--creme-10)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <span style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)" }}>
              © 2025 PNSP — Plataforma Nacional do Samba e do Pagode
            </span>
            <span style={{ color: "var(--ouro)", fontSize: "var(--text-sm)", fontWeight: 600 }}>
              Feito com 🥁 no Brasil
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
