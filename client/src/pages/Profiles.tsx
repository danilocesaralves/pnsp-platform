import { useState } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import { PROFILE_TYPES, BRAZIL_STATES } from "@shared/pnsp";
import { Search, MapPin, Star, Award, AlertCircle, Users, X } from "lucide-react";

const TYPE_PILLS = [
  { value: "all",             label: "Todos" },
  { value: "artista_solo",    label: "Artista" },
  { value: "grupo_banda",     label: "Grupo" },
  { value: "produtor",        label: "Produtor" },
  { value: "estudio",         label: "Estúdio" },
  { value: "professor",       label: "Professor" },
  { value: "contratante",     label: "Contratante" },
  { value: "luthier",         label: "Luthier" },
  { value: "comunidade_roda", label: "Comunidade" },
  { value: "venue",           label: "Venue / Casa de Show" },
];

/* ─── Profile Card ──────────────────────────────────────────────────────────── */
function ProfileCard({ profile }: { profile: any }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link href={`/perfil/${profile.slug?.toLowerCase()}`}>
      <div
        className="profile-card"
        style={{
          borderColor: hovered ? "rgba(212,146,10,0.40)" : "var(--creme-10)",
          transform: hovered ? "translateY(-8px)" : "translateY(0)",
          boxShadow: hovered ? "0 20px 60px rgba(0,0,0,0.70), 0 4px 32px rgba(212,146,10,0.25)" : "none",
          transition: "all 0.3s cubic-bezier(0.34,1.56,0.64,1)",
          cursor: "pointer",
        }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {/* Avatar — 1:1 */}
        <div style={{
          aspectRatio: "1/1",
          background: "linear-gradient(135deg, var(--terra-escura), var(--terra-clara))",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}>
          <img
            src={profile.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profile.displayName)}&backgroundColor=D4A017&textColor=0a0a0a&fontWeight=700&fontSize=40&radius=50`}
            alt={profile.displayName}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s ease", transform: hovered ? "scale(1.06)" : "scale(1)" }}
          />
          {/* Hover overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.78), transparent)",
            opacity: hovered ? 1 : 0,
            transition: "opacity 0.3s ease",
            display: "flex", alignItems: "flex-end", padding: "14px",
          }}>
            <span style={{ color: "var(--creme)", fontSize: "var(--text-sm)", fontWeight: 600 }}>
              Ver perfil →
            </span>
          </div>
          {/* Badges top-right */}
          {(profile.isFeatured || profile.isVerified) && (
            <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 4 }}>
              {profile.isVerified && (
                <div style={{ background: "rgba(0,0,0,0.55)", borderRadius: "50%", padding: 4, backdropFilter: "blur(4px)" }}>
                  <Award style={{ width: 12, height: 12, color: "white" }} />
                </div>
              )}
              {profile.isFeatured && (
                <div style={{ background: "rgba(0,0,0,0.55)", borderRadius: "50%", padding: 4, backdropFilter: "blur(4px)" }}>
                  <Star style={{ width: 12, height: 12, color: "var(--ouro)" }} />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: "18px" }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, marginBottom: 8, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {profile.displayName}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: "var(--text-xs)", padding: "3px 10px", borderRadius: 9999, background: "rgba(212,160,23,0.15)", border: "1px solid rgba(212,160,23,0.4)", color: "#D4A017", fontFamily: "var(--font-body)", fontWeight: 600 }}>
              {PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES] || profile.profileType?.replace(/_/g, " ")}
            </span>
          </div>
          {profile.city && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--creme-50)", fontSize: "var(--text-xs)", marginBottom: 8 }}>
              <MapPin style={{ width: 11, height: 11, flexShrink: 0 }} />
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile.city}, {profile.state}
              </span>
            </div>
          )}
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
      <div className="skeleton" style={{ aspectRatio: "1/1" }} />
      <div style={{ padding: "18px" }}>
        <div className="skeleton" style={{ height: 22, width: "70%", marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 16, width: "40%", borderRadius: 9999, marginBottom: 10 }} />
        <div className="skeleton" style={{ height: 13, width: "55%", marginBottom: 6 }} />
        <div className="skeleton" style={{ height: 13, width: "90%", marginBottom: 4 }} />
        <div className="skeleton" style={{ height: 13, width: "70%" }} />
      </div>
    </div>
  );
}

/* ─── Profiles Page ──────────────────────────────────────────────────────────── */
export default function Profiles() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [profileType, setProfileType] = useState("all");
  const [state, setState] = useState("all");
  const [offset, setOffset] = useState(0);
  const limit = 24;

  const { data: profiles, isLoading, isError } = trpc.profiles.list.useQuery({
    search: search || undefined,
    profileType: profileType !== "all" ? profileType : undefined,
    state: state !== "all" ? state : undefined,
    limit,
    offset,
  });

  const hasFilters = !!(search || profileType !== "all" || state !== "all");

  function clearFilters() {
    setSearch(""); setSearchInput(""); setProfileType("all"); setState("all"); setOffset(0);
  }
  function handleSearch(e: React.FormEvent) {
    e.preventDefault(); setSearch(searchInput); setOffset(0);
  }

  return (
    <PublicLayout>
      {/* Header */}
      <div style={{
        padding: "72px 24px 56px",
        background: "linear-gradient(160deg, #0C0A08 0%, #1C160C 50%, #0C0A08 100%)",
        borderBottom: "1px solid rgba(212,146,10,0.10)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Blob */}
        <div style={{
          position: "absolute", top: "-30%", right: "-10%",
          width: 500, height: 500,
          background: "radial-gradient(circle, rgba(212,146,10,0.10) 0%, transparent 70%)",
          filter: "blur(60px)", pointerEvents: "none",
        }} />
        <div style={{ maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div className="section-tag" style={{ display: "inline-flex", marginBottom: 20 }}>
            <span className="section-tag-dot" /><span className="section-tag-text">Diretório</span>
          </div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 700, marginBottom: 12, lineHeight: 1.1, letterSpacing: "-0.02em" }}>
            Perfis &amp; Vitrines
          </h1>
          <p style={{ color: "var(--creme-50)", fontSize: "var(--text-lg)", marginBottom: 32, maxWidth: 520 }}>
            Descubra artistas, grupos, produtores, professores e parceiros do ecossistema nacional
          </p>
          {/* Search */}
          <form onSubmit={handleSearch} style={{ display: "flex", gap: 12, maxWidth: 560 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 16, height: 16, color: "var(--creme-50)" }} />
              <input
                className="search-input"
                placeholder="Buscar por nome, cidade, estilo..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="pnsp-btn-primary" style={{ padding: "12px 24px", whiteSpace: "nowrap" }}>
              Buscar
            </button>
          </form>
        </div>
      </div>

      {/* Body */}
      <div style={{ padding: "40px 24px 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          {/* Pills + filters */}
          <div style={{ marginBottom: 32 }}>
            {/* Type pills */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, overflowX: "auto", paddingBottom: 4 }}>
              {TYPE_PILLS.map(pill => (
                <button
                  key={pill.value}
                  type="button"
                  className={`pill ${profileType === pill.value ? "active" : ""}`}
                  onClick={() => { setProfileType(pill.value); setOffset(0); }}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            {/* State + count */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <select
                value={state}
                onChange={e => { setState(e.target.value); setOffset(0); }}
                style={{
                  padding: "8px 14px",
                  background: "var(--terra)",
                  border: "1px solid var(--creme-10)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--creme)",
                  fontSize: "var(--text-sm)",
                  fontFamily: "var(--font-body)",
                  cursor: "pointer",
                  outline: "none",
                }}
              >
                <option value="all">Todos os estados</option>
                {BRAZIL_STATES.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px",
                    border: "1px solid var(--creme-10)",
                    borderRadius: "var(--radius-md)",
                    color: "var(--creme-50)",
                    fontSize: "var(--text-sm)",
                    fontFamily: "var(--font-body)",
                    background: "none",
                    cursor: "pointer",
                    transition: "var(--transition)",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "var(--creme)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "var(--creme-50)"; }}
                >
                  <X style={{ width: 13, height: 13 }} /> Limpar
                </button>
              )}

              <span style={{ marginLeft: "auto", color: "var(--creme-50)", fontSize: "var(--text-sm)" }}>
                {isLoading ? "Carregando..." : `${profiles?.length ?? 0} perfis`}
              </span>
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
              {Array.from({ length: 12 }).map((_, i) => <ProfileSkeleton key={i} />)}
            </div>
          ) : profiles && profiles.length > 0 ? (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 20 }}>
                {profiles.map(p => <ProfileCard key={p.id} profile={p} />)}
              </div>
              <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 48 }}>
                {offset > 0 && (
                  <button type="button" className="pnsp-btn-ghost" style={{ padding: "10px 24px" }}
                    onClick={() => setOffset(o => Math.max(0, o - limit))}>
                    ← Anterior
                  </button>
                )}
                {profiles.length === limit && (
                  <button type="button" className="pnsp-btn-ghost" style={{ padding: "10px 24px" }}
                    onClick={() => setOffset(o => o + limit)}>
                    Próxima →
                  </button>
                )}
              </div>
            </>
          ) : isError ? (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ width: 64, height: 64, borderRadius: "var(--radius-lg)", background: "var(--terra)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <AlertCircle style={{ width: 28, height: 28, color: "var(--ouro)" }} />
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", marginBottom: 10 }}>Erro ao carregar perfis</h3>
              <p style={{ color: "var(--creme-50)", marginBottom: 24 }}>Verifique sua conexão e tente novamente.</p>
              <button type="button" className="pnsp-btn-ghost" style={{ padding: "10px 24px" }}
                onClick={() => window.location.reload()}>
                Tentar novamente
              </button>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "80px 0" }}>
              <div style={{ width: 72, height: 72, borderRadius: "var(--radius-lg)", background: "var(--terra)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", border: "1px solid var(--creme-10)" }}>
                <Users style={{ width: 32, height: 32, color: "var(--ouro)" }} />
              </div>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", marginBottom: 10 }}>
                {hasFilters ? "Nenhum perfil encontrado" : "Seja o primeiro!"}
              </h3>
              <p style={{ color: "var(--creme-50)", marginBottom: 28, maxWidth: 360, margin: "0 auto 28px" }}>
                {hasFilters ? "Ajuste os filtros ou limpe a busca." : "Crie seu perfil e apareça para artistas e contratantes de todo o Brasil."}
              </p>
              {hasFilters ? (
                <button type="button" className="pnsp-btn-ghost" style={{ padding: "10px 24px" }} onClick={clearFilters}>
                  <X style={{ width: 14, height: 14 }} /> Limpar filtros
                </button>
              ) : (
                <Link href="/criar-perfil">
                  <span className="pnsp-btn-primary">Criar meu perfil</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
}
