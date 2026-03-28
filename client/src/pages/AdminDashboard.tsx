import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicLayout from "@/components/PublicLayout";
import {
  Users, Music2, Building2, MapPin, Award, Briefcase, Star, LucideIcon,
} from "lucide-react";

// ─── Design tokens ───────────────────────────────────────────────────────────
const GOLD   = "#D4A017";
const CARD   = "#1a1200";
const BORDER = "rgba(212,160,23,0.15)";
const GREEN  = "#22C55E";

// ─── Type map ────────────────────────────────────────────────────────────────
const TYPE_LABELS: Record<string, string> = {
  artista_solo:    "Artista Solo",
  grupo_banda:     "Grupo / Banda",
  produtor:        "Produtor",
  estudio:         "Estúdio",
  professor:       "Professor",
  contratante:     "Contratante",
  luthier:         "Luthier",
  comunidade_roda: "Comunidade",
  venue:           "Venue",
};

// ─── KpiCard ─────────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon, value, label, sub,
}: {
  icon: LucideIcon;
  value: number | string;
  label: string;
  sub?: string;
}) {
  return (
    <div style={{
      background: CARD,
      border: `1px solid ${BORDER}`,
      borderRadius: 16,
      padding: "24px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 10,
        background: "rgba(212,160,23,0.12)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Icon style={{ width: 20, height: 20, color: GOLD }} />
      </div>
      <div style={{ fontFamily: "Syne, var(--font-display)", fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Inter, var(--font-body)" }}>
        {label}
      </div>
      {sub && (
        <div style={{ fontSize: 12, color: GREEN, fontWeight: 600, fontFamily: "Inter, var(--font-body)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ─── ProgressRow ─────────────────────────────────────────────────────────────
function ProgressRow({ label, value, pct }: { label: string; value: number; pct: number }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontFamily: "Inter, var(--font-body)" }}>
        <span style={{ color: "rgba(255,255,255,0.8)" }}>{label}</span>
        <span style={{ color: GOLD, fontWeight: 600 }}>
          {value} <span style={{ color: "rgba(255,255,255,0.4)" }}>({pct}%)</span>
        </span>
      </div>
      <div style={{ height: 6, background: "rgba(212,160,23,0.12)", borderRadius: 99 }}>
        <div style={{
          height: "100%",
          width: `${Math.min(pct, 100)}%`,
          background: GOLD,
          borderRadius: 99,
          transition: "width 0.8s ease",
        }} />
      </div>
    </div>
  );
}

// ─── SectionTitle ────────────────────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "Syne, var(--font-display)",
      fontSize: 13,
      fontWeight: 700,
      color: "rgba(255,255,255,0.4)",
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      marginBottom: 16,
    }}>
      {children}
    </h2>
  );
}

// ─── StripeCard ───────────────────────────────────────────────────────────────
function StripeCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: CARD,
      border: `1px solid ${BORDER}`,
      borderRadius: 14,
      padding: "22px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, var(--font-body)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div style={{ fontFamily: "Syne, var(--font-display)", fontSize: 28, fontWeight: 800, color: "#fff" }}>
        {value}
      </div>
      <div style={{
        alignSelf: "flex-start",
        padding: "3px 10px",
        borderRadius: 99,
        background: "rgba(212,160,23,0.10)",
        border: `1px solid rgba(212,160,23,0.25)`,
        color: GOLD,
        fontSize: 11,
        fontWeight: 600,
        fontFamily: "Inter, var(--font-body)",
      }}>
        Ativo quando Stripe integrado
      </div>
    </div>
  );
}

// ─── ValuationSimulator ───────────────────────────────────────────────────────
function ValuationSimulator() {
  const [payers, setPayers] = useState(100);
  const [ticket, setTicket]  = useState(49);

  const mrr       = payers * ticket;
  const arr       = mrr * 12;
  const valuation = arr * 10;
  const fmt = (n: number) =>
    `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
        <h2 style={{ fontFamily: "Syne, var(--font-display)", fontSize: 20, fontWeight: 800, color: GOLD, margin: 0 }}>
          Valuation Estimado
        </h2>
        <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 99, background: "rgba(212,160,23,0.08)", border: `1px solid rgba(212,160,23,0.20)`, color: "rgba(212,160,23,0.7)", fontFamily: "Inter, var(--font-body)", fontWeight: 600 }}>
          Estimativa SaaS Brasil 2026 · 10× ARR
        </span>
      </div>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", marginBottom: 24, fontFamily: "Inter, var(--font-body)", lineHeight: 1.5 }}>
        Com 100 pagantes a R$49/mês = R$58.800 ARR = Valuation estimado <strong style={{ color: GOLD }}>R$588.000</strong>
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 24 }}>
        <div>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 8, fontFamily: "Inter, var(--font-body)" }}>
            Usuários pagantes: <strong style={{ color: GOLD }}>{payers}</strong>
          </label>
          <input
            type="range" min={10} max={2000} step={10} value={payers}
            onChange={e => setPayers(Number(e.target.value))}
            style={{ width: "100%", accentColor: GOLD, cursor: "pointer" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "block", marginBottom: 8, fontFamily: "Inter, var(--font-body)" }}>
            Ticket médio: <strong style={{ color: GOLD }}>R$ {ticket}</strong>
          </label>
          <input
            type="range" min={19} max={299} step={10} value={ticket}
            onChange={e => setTicket(Number(e.target.value))}
            style={{ width: "100%", accentColor: GOLD, cursor: "pointer" }}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>
        {([
          { label: "MRR",            value: fmt(mrr) },
          { label: "ARR",            value: fmt(arr) },
          { label: "Valuation (10×)", value: fmt(valuation) },
        ] as const).map(item => (
          <div key={item.label} style={{
            background: "rgba(212,160,23,0.06)",
            border: `1px solid rgba(212,160,23,0.14)`,
            borderRadius: 10, padding: "14px 12px", textAlign: "center",
          }}>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, fontFamily: "Inter, var(--font-body)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {item.label}
            </div>
            <div style={{ fontFamily: "Syne, var(--font-display)", fontSize: item.label === "Valuation (10×)" ? 15 : 18, fontWeight: 800, color: "#fff" }}>
              {item.value}
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "Inter, var(--font-body)", padding: "8px 12px", background: "rgba(212,160,23,0.04)", borderRadius: 8 }}>
        Múltiplos baseados em benchmarks SaaS Brasil 2026. Valores informativos, sem garantia financeira.
      </div>
    </div>
  );
}

// ─── GrowthChart ──────────────────────────────────────────────────────────────
function GrowthChart({ data }: { data: Array<{ month: string; count: number }> }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28 }}>
      <h2 style={{ fontFamily: "Syne, var(--font-display)", fontSize: 20, fontWeight: 800, color: GOLD, marginBottom: 28 }}>
        Crescimento — Últimos 6 meses
      </h2>
      {data.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.25)", fontSize: 13, fontFamily: "Inter, var(--font-body)" }}>
          Sem dados ainda — os cadastros aparecerão aqui
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 180 }}>
          {data.map((d, i) => {
            const h = Math.max(6, Math.round((d.count / max) * 130));
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 0, height: "100%" }}>
                <span style={{ fontSize: 12, color: GOLD, fontWeight: 700, fontFamily: "Inter, var(--font-body)", marginBottom: 6 }}>
                  {d.count}
                </span>
                <div style={{
                  width: "100%",
                  height: h,
                  background: `linear-gradient(to top, ${GOLD}, rgba(212,160,23,0.35))`,
                  borderRadius: "6px 6px 0 0",
                  transition: "height 0.8s ease",
                }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, var(--font-body)", marginTop: 8, whiteSpace: "nowrap" }}>
                  {d.month}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── TypeDistribution ─────────────────────────────────────────────────────────
function TypeDistribution({
  data, total,
}: {
  data: Array<{ profileType: string | null; count: number }>;
  total: number;
}) {
  const t = total || 1;
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28 }}>
      <h2 style={{ fontFamily: "Syne, var(--font-display)", fontSize: 20, fontWeight: 800, color: GOLD, marginBottom: 20 }}>
        Distribuição por Tipo
      </h2>
      {data.map(row => (
        <ProgressRow
          key={row.profileType ?? "outro"}
          label={TYPE_LABELS[row.profileType ?? ""] ?? row.profileType?.replace(/_/g, " ") ?? "Outro"}
          value={row.count}
          pct={Math.round((row.count / t) * 100)}
        />
      ))}
      {data.length === 0 && (
        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, fontFamily: "Inter, var(--font-body)" }}>
          Sem dados
        </div>
      )}
    </div>
  );
}

// ─── GeoPresence ──────────────────────────────────────────────────────────────
function GeoPresence({ data }: { data: Array<{ state: string | null; count: number }> }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28 }}>
      <h2 style={{ fontFamily: "Syne, var(--font-display)", fontSize: 20, fontWeight: 800, color: GOLD, marginBottom: 20 }}>
        Presença Geográfica — Top 10
      </h2>
      {data.map(row => (
        <ProgressRow
          key={row.state ?? "outro"}
          label={
            row.state === "SP" ? "São Paulo (SP) ⭐" :
            row.state === "RJ" ? "Rio de Janeiro (RJ) ⭐" :
            (row.state ?? "—")
          }
          value={row.count}
          pct={Math.round((row.count / max) * 100)}
        />
      ))}
      {data.length === 0 && (
        <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, fontFamily: "Inter, var(--font-body)" }}>
          Sem dados
        </div>
      )}
    </div>
  );
}

// ─── HealthMetrics ────────────────────────────────────────────────────────────
function HealthMetrics({
  metrics,
}: {
  metrics: { total: number; withAvatar: number; withBio: number; withPhone: number; withInstagram: number; withCover: number };
}) {
  const t = metrics.total || 1;
  const pct = (n: number) => Math.round((n / t) * 100);
  const score = Math.round(
    (pct(metrics.withAvatar) + pct(metrics.withBio) + pct(metrics.withPhone) + pct(metrics.withInstagram) + pct(metrics.withCover)) / 5,
  );
  const scoreColor = score >= 60 ? GREEN : score >= 30 ? GOLD : "#ef4444";
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <h2 style={{ fontFamily: "Syne, var(--font-display)", fontSize: 20, fontWeight: 800, color: GOLD, margin: 0 }}>
          Saúde da Plataforma
        </h2>
        <div style={{ fontFamily: "Syne, var(--font-display)", fontSize: 28, fontWeight: 800, color: scoreColor }}>
          {score}%
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontWeight: 400, marginLeft: 6 }}>score geral</span>
        </div>
      </div>
      <ProgressRow label="Com foto (avatar)"  value={metrics.withAvatar}   pct={pct(metrics.withAvatar)} />
      <ProgressRow label="Com bio"             value={metrics.withBio}      pct={pct(metrics.withBio)} />
      <ProgressRow label="Com telefone"        value={metrics.withPhone}    pct={pct(metrics.withPhone)} />
      <ProgressRow label="Com Instagram"       value={metrics.withInstagram} pct={pct(metrics.withInstagram)} />
      <ProgressRow label="Com capa"            value={metrics.withCover}    pct={pct(metrics.withCover)} />
    </div>
  );
}

// ─── RecentProfilesTable ──────────────────────────────────────────────────────
function RecentProfilesTable({
  data,
}: {
  data: Array<{
    id: number;
    displayName: string;
    profileType: string;
    city: string | null;
    state: string | null;
    createdAt: string | Date;
    isVerified: boolean | null;
  }>;
}) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: 28 }}>
      <h2 style={{ fontFamily: "Syne, var(--font-display)", fontSize: 20, fontWeight: 800, color: GOLD, marginBottom: 20 }}>
        Últimos Cadastros
      </h2>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter, var(--font-body)" }}>
          <thead>
            <tr>
              {["Nome", "Tipo", "Cidade", "Data"].map(h => (
                <th key={h} style={{
                  padding: "8px 14px", textAlign: "left", fontSize: 11,
                  color: "rgba(255,255,255,0.3)", fontWeight: 600,
                  textTransform: "uppercase", letterSpacing: "0.07em",
                  borderBottom: `1px solid ${BORDER}`,
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map(p => (
              <tr
                key={p.id}
                style={{ borderBottom: "1px solid rgba(212,160,23,0.06)", transition: "background 0.15s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(212,160,23,0.04)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <td style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%",
                      background: "rgba(212,160,23,0.12)",
                      border: "1px solid rgba(212,160,23,0.25)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13, fontWeight: 700, color: GOLD, flexShrink: 0,
                    }}>
                      {p.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span style={{ color: "rgba(255,255,255,0.85)", fontWeight: 500, fontSize: 14 }}>{p.displayName}</span>
                    {p.isVerified && <Award style={{ width: 12, height: 12, color: GOLD, flexShrink: 0 }} />}
                  </div>
                </td>
                <td style={{ padding: "12px 14px", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                  {TYPE_LABELS[p.profileType] ?? p.profileType?.replace(/_/g, " ")}
                </td>
                <td style={{ padding: "12px 14px", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                  {p.city ? `${p.city}${p.state ? `, ${p.state}` : ""}` : "—"}
                </td>
                <td style={{ padding: "12px 14px", fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
                  {new Date(p.createdAt).toLocaleDateString("pt-BR")}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan={4} style={{ padding: "32px 14px", textAlign: "center", color: "rgba(255,255,255,0.25)", fontSize: 13 }}>
                  Nenhum perfil cadastrado ainda
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── StrategyCard ─────────────────────────────────────────────────────────────
function StrategyCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div style={{
      background: CARD,
      border: `1px solid ${BORDER}`,
      borderRadius: 14,
      padding: "20px 22px",
      display: "flex", gap: 14, alignItems: "flex-start",
    }}>
      <span style={{ fontSize: 22, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontFamily: "Syne, var(--font-display)", fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "Inter, var(--font-body)", lineHeight: 1.55 }}>
          {description}
        </div>
      </div>
    </div>
  );
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [, navigate]      = useLocation();
  const [now, setNow]     = useState(new Date());

  const { data: stats }          = trpc.admin.getStats.useQuery();
  const { data: recentProfiles } = trpc.admin.getRecentProfiles.useQuery();
  const { data: profilesByType } = trpc.admin.getProfilesByType.useQuery();
  const { data: profilesByState }= trpc.admin.getProfilesByState.useQuery();
  const { data: healthMetrics }  = trpc.admin.getHealthMetrics.useQuery();
  const { data: growthRaw }      = trpc.admin.getGrowthData.useQuery();
  const { data: revenueData }    = trpc.admin.getRevenueData.useQuery();

  useEffect(() => {
    if (!loading && user?.email !== "composisamba@gmail.com") navigate("/dashboard");
  }, [loading, user]);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(t);
  }, []);

  if (loading || !user) return null;

  const fmtCurrency = (n: number) =>
    `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const totalProfiles = stats?.totalProfiles ?? 0;

  const growthData = (growthRaw ?? []).map((d: any) => ({
    month: (() => {
      try {
        return new Date(String(d.month) + "-01").toLocaleDateString("pt-BR", { month: "short" });
      } catch {
        return String(d.month);
      }
    })(),
    count: Number(d.count),
  }));

  const typeData  = (profilesByType  ?? []).map((r: any) => ({ profileType: r.profileType as string | null, count: Number(r.count) }));
  const stateData = (profilesByState ?? []).map((r: any) => ({ state: r.state as string | null,            count: Number(r.count) }));
  const health    = healthMetrics ?? { total: 0, withAvatar: 0, withBio: 0, withPhone: 0, withInstagram: 0, withCover: 0 };
  const recent    = (recentProfiles ?? []) as Array<{
    id: number; displayName: string; profileType: string;
    city: string | null; state: string | null; createdAt: string | Date; isVerified: boolean | null;
  }>;

  return (
    <PublicLayout>
      <div style={{ background: "#0A0800", minHeight: "100vh", padding: "48px 24px 80px" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>

          {/* ── HEADER ──────────────────────────────────────────────────────── */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 48, flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                <h1 style={{ fontFamily: "Syne, var(--font-display)", fontSize: "clamp(1.6rem, 4vw, 2.6rem)", fontWeight: 800, color: GOLD, margin: 0 }}>
                  Painel Administrativo
                </h1>
                <span style={{
                  padding: "4px 12px", borderRadius: 99,
                  background: "rgba(212,160,23,0.12)", border: "1px solid rgba(212,160,23,0.35)",
                  fontSize: 11, fontWeight: 700, color: GOLD,
                  fontFamily: "Inter, var(--font-body)", letterSpacing: "0.1em",
                }}>
                  PROPRIETÁRIO
                </span>
              </div>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, fontFamily: "Inter, var(--font-body)", margin: 0 }}>
                PNSP — Plataforma Nacional de Samba e Pagode
              </p>
            </div>
            <div style={{ fontFamily: "Inter, var(--font-body)", textAlign: "right" }}>
              <div style={{ fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>
                {now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>
                {now.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>

          {/* ── SEÇÃO 1 — VISÃO GERAL ───────────────────────────────────────── */}
          <SectionTitle>Visão Geral</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 48 }}>
            <KpiCard icon={Users}     value={stats?.totalProfiles      ?? 0} label="Total Perfis"     sub="+2 esta semana" />
            <KpiCard icon={Users}     value={stats?.totalUsers         ?? 0} label="Usuários"         sub="+3 esta semana" />
            <KpiCard icon={Music2}    value={stats?.totalOpportunidades ?? stats?.totalOpportunities ?? 0} label="Oportunidades" />
            <KpiCard icon={Briefcase} value={stats?.totalOfferings     ?? 0} label="Ofertas" />
            <KpiCard icon={Building2} value={stats?.totalStudios       ?? 0} label="Estúdios" />
            <KpiCard icon={MapPin}    value={stats?.totalCities        ?? 0} label="Cidades" />
            <KpiCard icon={Award}     value={stats?.verifiedProfiles   ?? 0} label="Verificados" />
            <KpiCard icon={Star}      value={stats?.activeProfiles     ?? 0} label="Perfis Ativos" />
          </div>

          {/* ── SEÇÃO 2 — FINANCEIRO (Stripe-ready) ────────────────────────── */}
          <SectionTitle>Financeiro — Stripe Ready</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16, marginBottom: 48 }}>
            <StripeCard label="MRR — Receita Mensal Recorrente" value={fmtCurrency(revenueData?.mrr ?? 0)} />
            <StripeCard label="ARR — Receita Anual"             value={fmtCurrency(revenueData?.arr ?? 0)} />
            <StripeCard label="Ticket Médio"                    value={fmtCurrency(revenueData?.avgTicket ?? 0)} />
            <StripeCard label="Projeção 12 meses"               value={fmtCurrency(revenueData?.projectedRevenue ?? 0)} />
          </div>

          {/* ── SEÇÃO 3 — VALUATION ─────────────────────────────────────────── */}
          <div style={{ marginBottom: 48 }}>
            <ValuationSimulator />
          </div>

          {/* ── SEÇÃO 4 — CRESCIMENTO ───────────────────────────────────────── */}
          <div style={{ marginBottom: 48 }}>
            <GrowthChart data={growthData} />
          </div>

          {/* ── SEÇÃO 5 + 6 — TIPO + GEO ────────────────────────────────────── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 48 }}>
            <TypeDistribution data={typeData}  total={totalProfiles} />
            <GeoPresence      data={stateData} />
          </div>

          {/* ── SEÇÃO 7 — SAÚDE DA PLATAFORMA ──────────────────────────────── */}
          <div style={{ marginBottom: 48 }}>
            <HealthMetrics metrics={health} />
          </div>

          {/* ── SEÇÃO 8 — ÚLTIMOS CADASTROS ─────────────────────────────────── */}
          <div style={{ marginBottom: 48 }}>
            <RecentProfilesTable data={recent} />
          </div>

          {/* ── SEÇÃO 9 — ESTRATÉGIA ────────────────────────────────────────── */}
          <SectionTitle>Estratégia &amp; Próximos Passos</SectionTitle>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 16 }}>
            <StrategyCard
              icon="💳"
              title="Ative o Stripe"
              description="Configure o Stripe para começar a monetizar. Os dados financeiros deste painel serão populados automaticamente."
            />
            <StrategyCard
              icon="🎯"
              title="Meta: 500 perfis até jul/2026"
              description="Com campanhas de aquisição segmentadas por tipo (artistas, produtores) e estado."
            />
            <StrategyCard
              icon="🌆"
              title="Foco em SP e RJ"
              description="Maior concentração de artistas. Priorize parcerias, eventos e divulgação nessas praças."
            />
            <StrategyCard
              icon="📸"
              title="Perfis com foto têm 7× mais views"
              description="Incentive o upload de avatar com e-mail onboarding para perfis sem foto."
            />
          </div>

        </div>
      </div>
    </PublicLayout>
  );
}
