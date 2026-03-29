import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicLayout from "@/components/PublicLayout";
import { ProfileStrength } from "@/components/ProfileStrength";
import { OpportunityFeed } from "@/components/OpportunityFeed";
import { PROFILE_TYPES, OFFERING_CATEGORIES, OPPORTUNITY_CATEGORIES } from "@shared/pnsp";
import {
  User, Briefcase, Target, Bell, Plus, Eye, Star, TrendingUp,
  Calendar, ChevronRight, MapPin, Clock, CheckCircle, AlertCircle,
  Music2, BarChart2, Zap, Award, MessageSquare, ArrowRight,
  Settings, FileText, Mic2, BookOpen, Sparkles, Activity,
} from "lucide-react";

// ─── KPI Card ────────────────────────────────────────────────────────────────
function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ComponentType<any>;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div style={{
      background: "var(--terra)",
      border: `1px solid ${accent ? "rgba(212,146,10,0.35)" : "var(--creme-10)"}`,
      borderRadius: "var(--radius-md)",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
      transition: "var(--transition)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: accent ? "var(--ouro-sutil)" : "var(--creme-10)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon style={{ width: 16, height: 16, color: accent ? "var(--ouro)" : "var(--creme-50)" }} />
        </div>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", fontWeight: 500 }}>{label}</span>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, color: accent ? "var(--ouro)" : "var(--creme)", lineHeight: 1 }}>
        {value}
      </div>
      {sub && <div style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>{sub}</div>}
    </div>
  );
}

// ─── Tab Button ───────────────────────────────────────────────────────────────
function TabBtn({ active, onClick, children, count }: { active: boolean; onClick: () => void; children: React.ReactNode; count?: number }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 20px",
        borderRadius: "var(--radius-md)",
        fontSize: "var(--text-sm)",
        fontWeight: active ? 700 : 500,
        fontFamily: "var(--font-body)",
        cursor: "pointer",
        border: active ? "1px solid rgba(212,146,10,0.40)" : "1px solid transparent",
        background: active ? "var(--ouro-sutil)" : "transparent",
        color: active ? "var(--ouro)" : "var(--creme-50)",
        transition: "var(--transition)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
      }}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span style={{
          minWidth: 18, height: 18, borderRadius: 9999,
          background: active ? "var(--ouro)" : "var(--creme-20)",
          color: active ? "var(--preto)" : "var(--creme-50)",
          fontSize: 10, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "0 5px",
        }}>{count}</span>
      )}
    </button>
  );
}

// ─── Offering Row ─────────────────────────────────────────────────────────────
function OfferingRow({ offering }: { offering: any }) {
  const statusColor: Record<string, string> = {
    active:  "rgba(27,107,58,0.8)",
    pending: "rgba(212,146,10,0.8)",
    rejected: "rgba(184,50,50,0.8)",
    expired: "rgba(245,237,216,0.30)",
  };
  const statusLabel: Record<string, string> = {
    active:   "Ativa",
    pending:  "Pendente",
    rejected: "Rejeitada",
    expired:  "Expirada",
  };
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px",
      background: "var(--terra-escura)",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--creme-10)",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: "var(--ouro-sutil)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Briefcase style={{ width: 16, height: 16, color: "var(--ouro)" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--creme)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {offering.title}
        </div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>
          {OFFERING_CATEGORIES[offering.category as keyof typeof OFFERING_CATEGORIES] ?? offering.category}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {offering.viewCount > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>
            <Eye style={{ width: 12, height: 12 }} />{offering.viewCount}
          </span>
        )}
        <span style={{
          padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 700,
          background: statusColor[offering.status] ?? "var(--creme-10)",
          color: "var(--creme)",
        }}>
          {statusLabel[offering.status] ?? offering.status}
        </span>
      </div>
      <Link href={`/ofertas/${offering.id}`}>
        <ChevronRight style={{ width: 16, height: 16, color: "var(--creme-50)", cursor: "pointer" }} />
      </Link>
    </div>
  );
}

// ─── Opportunity Row ──────────────────────────────────────────────────────────
function OpportunityRow({ opportunity }: { opportunity: any }) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 12,
      padding: "12px 16px",
      background: "var(--terra-escura)",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--creme-10)",
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: "rgba(27,107,58,0.15)",
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        <Target style={{ width: 16, height: 16, color: "var(--verde)" }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--creme)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {opportunity.title}
        </div>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>
          {opportunity.city && `${opportunity.city}, `}
          {OPPORTUNITY_CATEGORIES[opportunity.category as keyof typeof OPPORTUNITY_CATEGORIES] ?? opportunity.category}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {opportunity.applicationCount > 0 && (
          <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>
            <User style={{ width: 12, height: 12 }} />{opportunity.applicationCount}
          </span>
        )}
        <span style={{
          padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 700,
          background: opportunity.status === "active" ? "rgba(27,107,58,0.8)" : "var(--creme-20)",
          color: "var(--creme)",
        }}>
          {opportunity.status === "active" ? "Ativa" : opportunity.status}
        </span>
      </div>
      <Link href={`/oportunidades/${opportunity.id}`}>
        <ChevronRight style={{ width: 16, height: 16, color: "var(--creme-50)", cursor: "pointer" }} />
      </Link>
    </div>
  );
}

// ─── Review Card ──────────────────────────────────────────────────────────────
function ReviewCard({ review }: { review: any }) {
  return (
    <div style={{
      padding: "16px",
      background: "var(--terra-escura)",
      borderRadius: "var(--radius-sm)",
      border: "1px solid var(--creme-10)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%",
          background: "var(--ouro-sutil)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ouro)",
        }}>
          {review.reviewerName?.[0]?.toUpperCase() ?? "?"}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--creme)" }}>
            {review.reviewerName ?? "Avaliador anônimo"}
          </div>
          <div style={{ display: "flex", gap: 2, marginTop: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                style={{ width: 12, height: 12, fill: i < review.rating ? "var(--ouro)" : "transparent", color: i < review.rating ? "var(--ouro)" : "var(--creme-50)" }}
              />
            ))}
          </div>
        </div>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>
          {new Date(review.createdAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
        </span>
      </div>
      {review.comment && (
        <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-80)", lineHeight: 1.5, margin: 0 }}>
          "{review.comment}"
        </p>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, desc, href, cta }: { icon: React.ComponentType<any>; title: string; desc: string; href?: string; cta?: string }) {
  return (
    <div style={{ textAlign: "center", padding: "40px 20px", background: "var(--terra-escura)", borderRadius: "var(--radius-md)", border: "1px dashed var(--creme-10)" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--creme-10)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
        <Icon style={{ width: 20, height: 20, color: "var(--creme-50)" }} />
      </div>
      <p style={{ fontWeight: 600, marginBottom: 6, color: "var(--creme)" }}>{title}</p>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)", marginBottom: href ? 20 : 0 }}>{desc}</p>
      {href && cta && (
        <Link href={href}>
          <span className="pnsp-btn-primary" style={{ padding: "10px 24px", fontSize: "var(--text-sm)", display: "inline-flex" }}>
            <Plus style={{ width: 14, height: 14 }} />
            {cta}
          </span>
        </Link>
      )}
    </div>
  );
}

// ─── Coming Soon ──────────────────────────────────────────────────────────────
function ComingSoon({ icon: Icon, title, desc, items }: { icon: React.ComponentType<any>; title: string; desc: string; items: string[] }) {
  return (
    <div style={{
      background: "var(--terra)",
      border: "1px solid var(--creme-10)",
      borderRadius: "var(--radius-lg)",
      padding: 32,
      textAlign: "center",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "var(--radius-md)",
        background: "var(--ouro-sutil)",
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 20px",
      }}>
        <Icon style={{ width: 24, height: 24, color: "var(--ouro)" }} />
      </div>
      <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", marginBottom: 8 }}>{title}</h3>
      <p style={{ color: "var(--creme-50)", marginBottom: 28, maxWidth: 400, margin: "0 auto 28px" }}>{desc}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
        {items.map(item => (
          <span key={item} className="pnsp-badge">{item}</span>
        ))}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="skeleton" style={{ height: 40, width: 300, marginBottom: 32 }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 16, marginBottom: 32 }}>
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 12 }} />)}
        </div>
        <div className="skeleton" style={{ height: 400, borderRadius: 16 }} />
      </div>
    </PublicLayout>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"visao-geral" | "operacao" | "reputacao" | "agenda" | "marketing">("visao-geral");

  const { data: summary, isLoading } = trpc.dashboard.summary.useQuery(undefined, { enabled: isAuthenticated });

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/");
  }, [loading, isAuthenticated]);

  if (loading || isLoading) return <DashboardSkeleton />;

  const profile = summary?.profile;
  const firstName = user?.name?.split(" ")[0] ?? "Artista";

  const kpis = [
    { icon: Eye,         label: "Visualizações do perfil", value: summary?.profileViewCount ?? 0,        sub: "total acumulado",    accent: false },
    { icon: Star,        label: "Avaliação média",         value: (summary?.reviewStats?.avg ?? 0) > 0 ? `${summary?.reviewStats?.avg}★` : "—", sub: `${summary?.reviewStats?.total ?? 0} avaliações`, accent: true },
    { icon: Briefcase,   label: "Minhas ofertas",          value: summary?.offeringsCount ?? 0,           sub: "publicadas",         accent: false },
    { icon: Target,      label: "Oportunidades",           value: summary?.opportunitiesCount ?? 0,       sub: "abertas por mim",    accent: false },
    { icon: User,        label: "Candidaturas",            value: summary?.applicationsCount ?? 0,        sub: "enviadas",           accent: false },
    { icon: Bell,        label: "Notificações",            value: summary?.unreadNotifications ?? 0,      sub: "não lidas",          accent: (summary?.unreadNotifications ?? 0) > 0 },
  ];

  return (
    <PublicLayout>
      <div className="container py-8">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 32 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 700, lineHeight: 1 }}>
                Dashboard Proprietário
              </h1>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 4,
                padding: "3px 9px", borderRadius: 9999,
                background: "rgba(27,107,58,0.20)", border: "1px solid rgba(27,107,58,0.40)",
                color: "#4ade80", fontSize: 10, fontWeight: 700,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", animation: "pulse 2s ease-in-out infinite" }} />
                LIVE
              </span>
            </div>
            <p style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)" }}>
              Olá, {firstName} — central de operações da sua presença na PNSP
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {!profile && (
              <Link href="/criar-perfil">
                <span className="pnsp-btn-primary" style={{ padding: "10px 20px", fontSize: "var(--text-sm)" }}>
                  <Plus style={{ width: 14, height: 14 }} />Criar Perfil
                </span>
              </Link>
            )}
            <Link href="/criar-oferta">
              <span className="pnsp-btn-ghost" style={{ padding: "10px 20px", fontSize: "var(--text-sm)" }}>
                <Plus style={{ width: 14, height: 14 }} />Nova Oferta
              </span>
            </Link>
            <Link href="/criar-oportunidade">
              <span className="pnsp-btn-ghost" style={{ padding: "10px 20px", fontSize: "var(--text-sm)" }}>
                <Plus style={{ width: 14, height: 14 }} />Nova Oportunidade
              </span>
            </Link>
          </div>
        </div>

        {/* ── KPIs ────────────────────────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12, marginBottom: 28 }}>
          {kpis.map(kpi => <KpiCard key={kpi.label} {...kpi} />)}
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", gap: 4, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
          <TabBtn active={activeTab === "visao-geral"}   onClick={() => setActiveTab("visao-geral")}>
            <Activity style={{ width: 14, height: 14 }} />Visão Geral
          </TabBtn>
          <TabBtn active={activeTab === "operacao"} onClick={() => setActiveTab("operacao")} count={(summary?.offeringsCount ?? 0) + (summary?.opportunitiesCount ?? 0)}>
            <Briefcase style={{ width: 14, height: 14 }} />Operação
          </TabBtn>
          <TabBtn active={activeTab === "reputacao"} onClick={() => setActiveTab("reputacao")} count={summary?.reviewStats.total}>
            <Star style={{ width: 14, height: 14 }} />Reputação
          </TabBtn>
          <TabBtn active={activeTab === "agenda"}     onClick={() => setActiveTab("agenda")}>
            <Calendar style={{ width: 14, height: 14 }} />Agenda
          </TabBtn>
          <TabBtn active={activeTab === "marketing"}  onClick={() => setActiveTab("marketing")}>
            <Sparkles style={{ width: 14, height: 14 }} />Marketing
          </TabBtn>
        </div>

        {/* ═══════════════════════════ VISÃO GERAL ═══════════════════════════ */}
        {activeTab === "visao-geral" && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)", gap: 20, alignItems: "start" }}>

            {/* Coluna esquerda */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Perfil */}
              {profile ? (
                <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--ouro)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Meu Perfil</span>
                    <Link href={`/editar-perfil/${profile.id}`}>
                      <span style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", cursor: "pointer", borderBottom: "1px solid var(--creme-20)" }}>Editar</span>
                    </Link>
                  </div>
                  <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
                    {profile.avatarUrl ? (
                      <img src={profile.avatarUrl} alt="" style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid var(--ouro)" }} />
                    ) : (
                      <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--ouro-sutil)", border: "2px solid var(--ouro)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--ouro)" }}>
                        {profile.displayName?.[0]?.toUpperCase()}
                      </div>
                    )}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile.displayName}</div>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>
                        {PROFILE_TYPES[profile.profileType as keyof typeof PROFILE_TYPES] ?? profile.profileType}
                      </div>
                      {profile.city && (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)", color: "var(--creme-50)", marginTop: 2 }}>
                          <MapPin style={{ width: 10, height: 10 }} />{profile.city}, {profile.state}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Link href={`/perfil/${profile.slug}`}>
                      <span style={{ flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "8px 12px", background: "var(--ouro-sutil)", border: "1px solid rgba(212,146,10,0.30)", borderRadius: 8, fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--ouro)", cursor: "pointer", textDecoration: "none" }}>
                        <Eye style={{ width: 12, height: 12 }} />Ver público
                      </span>
                    </Link>
                    {profile.isVerified ? (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "8px 12px", background: "rgba(27,107,58,0.15)", border: "1px solid rgba(27,107,58,0.30)", borderRadius: 8, fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--verde)" }}>
                        <CheckCircle style={{ width: 12, height: 12 }} />Verificado
                      </span>
                    ) : (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "8px 12px", background: "var(--creme-10)", borderRadius: 8, fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>
                        <AlertCircle style={{ width: 12, height: 12 }} />Não verificado
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ background: "var(--terra)", border: "1px dashed var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 24, textAlign: "center" }}>
                  <User style={{ width: 32, height: 32, color: "var(--creme-50)", margin: "0 auto 12px" }} />
                  <p style={{ fontWeight: 600, marginBottom: 8 }}>Crie seu perfil</p>
                  <p style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", marginBottom: 16 }}>Para aparecer no ecossistema</p>
                  <Link href="/criar-perfil">
                    <span className="pnsp-btn-primary" style={{ padding: "10px 20px", fontSize: "var(--text-sm)", display: "inline-flex" }}>
                      <Plus style={{ width: 14, height: 14 }} />Criar Agora
                    </span>
                  </Link>
                </div>
              )}

              {/* Profile Strength */}
              {profile && <ProfileStrength profile={profile} />}

              {/* Quick Actions */}
              <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 20 }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--ouro)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 12 }}>Ações Rápidas</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    { href: "/criar-imagem",     icon: Sparkles, label: "Gerar Imagem com IA" },
                    { href: "/estudios",          icon: Mic2,     label: "Reservar Estúdio" },
                    { href: "/academia",          icon: BookOpen, label: "Academia PNSP" },
                    { href: "/minha-conta",       icon: Settings, label: "Configurações da conta" },
                  ].map(({ href, icon: Icon, label }) => (
                    <Link key={href} href={href}>
                      <div style={{
                        display: "flex", alignItems: "center", gap: 10,
                        padding: "10px 12px", borderRadius: 8,
                        border: "1px solid var(--creme-10)",
                        background: "var(--terra-escura)",
                        cursor: "pointer", transition: "var(--transition)",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.30)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--creme-10)"; }}
                      >
                        <Icon style={{ width: 14, height: 14, color: "var(--ouro)", flexShrink: 0 }} />
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--creme)" }}>{label}</span>
                        <ArrowRight style={{ width: 12, height: 12, color: "var(--creme-50)", marginLeft: "auto" }} />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Coluna direita */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Oportunidades — Feed */}
              <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--ouro)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    Feed de Oportunidades
                  </span>
                  <Link href="/oportunidades">
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", cursor: "pointer", borderBottom: "1px solid var(--creme-20)" }}>Ver todas →</span>
                  </Link>
                </div>
                <OpportunityFeed />
              </div>

              {/* Candidaturas recentes */}
              {(summary?.recentApplications?.length ?? 0) > 0 && (
                <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--ouro)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                      Candidaturas Recentes
                    </span>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>{summary?.applicationsCount} enviadas</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {summary?.recentApplications?.map((app: any) => (
                      <div key={app.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "var(--terra-escura)", borderRadius: 8, border: "1px solid var(--creme-10)" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: app.status === "accepted" ? "var(--verde)" : app.status === "rejected" ? "var(--vermelho)" : "var(--ouro)", flexShrink: 0 }} />
                        <span style={{ fontSize: "var(--text-sm)", color: "var(--creme)", flex: 1 }}>Candidatura #{app.id}</span>
                        <span style={{ fontSize: 10, color: "var(--creme-50)", fontWeight: 700, textTransform: "uppercase" }}>{app.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═════════════════════════════ OPERAÇÃO ════════════════════════════ */}
        {activeTab === "operacao" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Minhas Ofertas */}
            <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700 }}>Minhas Ofertas</h2>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)", marginTop: 2 }}>{summary?.offeringsCount ?? 0} ofertas publicadas</p>
                </div>
                <Link href="/criar-oferta">
                  <span className="pnsp-btn-primary" style={{ padding: "8px 16px", fontSize: "var(--text-sm)" }}>
                    <Plus style={{ width: 14, height: 14 }} />Nova
                  </span>
                </Link>
              </div>
              {(summary?.recentOfferings?.length ?? 0) === 0 ? (
                <EmptyState
                  icon={Briefcase}
                  title="Nenhuma oferta ainda"
                  desc="Publique sua primeira oferta para aparecer no marketplace"
                  href="/criar-oferta"
                  cta="Criar Oferta"
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {summary?.recentOfferings?.map((o: any) => <OfferingRow key={o.id} offering={o} />)}
                  {(summary?.offeringsCount ?? 0) > 8 && (
                    <Link href="/ofertas">
                      <div style={{ textAlign: "center", padding: "12px", color: "var(--creme-50)", fontSize: "var(--text-sm)", cursor: "pointer" }}>
                        Ver todas as {summary?.offeringsCount} ofertas →
                      </div>
                    </Link>
                  )}
                </div>
              )}
            </div>

            {/* Minhas Oportunidades */}
            <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700 }}>Oportunidades Publicadas</h2>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)", marginTop: 2 }}>
                    {summary?.opportunitiesCount ?? 0} publicadas · {summary?.receivedApplicationsCount ?? 0} candidaturas recebidas
                  </p>
                </div>
                <Link href="/criar-oportunidade">
                  <span className="pnsp-btn-primary" style={{ padding: "8px 16px", fontSize: "var(--text-sm)" }}>
                    <Plus style={{ width: 14, height: 14 }} />Nova
                  </span>
                </Link>
              </div>
              {(summary?.recentOpportunities?.length ?? 0) === 0 ? (
                <EmptyState
                  icon={Target}
                  title="Nenhuma oportunidade ainda"
                  desc="Publique uma oportunidade para encontrar artistas e profissionais"
                  href="/criar-oportunidade"
                  cta="Criar Oportunidade"
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {summary?.recentOpportunities?.map((o: any) => <OpportunityRow key={o.id} opportunity={o} />)}
                </div>
              )}
            </div>

            {/* Candidaturas Enviadas */}
            <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700 }}>Candidaturas Enviadas</h2>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)", marginTop: 2 }}>{summary?.applicationsCount ?? 0} candidaturas</p>
              </div>
              {(summary?.applicationsCount ?? 0) === 0 ? (
                <EmptyState
                  icon={Music2}
                  title="Nenhuma candidatura ainda"
                  desc="Candidate-se a oportunidades para expandir sua rede"
                  href="/oportunidades"
                  cta="Explorar Oportunidades"
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {summary?.recentApplications?.map((app: any) => (
                    <div key={app.id} style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 16px",
                      background: "var(--terra-escura)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--creme-10)",
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%", flexShrink: 0,
                        background: app.status === "accepted" ? "var(--verde)" : app.status === "rejected" ? "var(--vermelho)" : app.status === "shortlisted" ? "var(--ouro)" : "var(--creme-50)",
                      }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: 500, color: "var(--creme)" }}>Candidatura #{app.id}</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>
                          {new Date(app.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <span style={{
                        padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 700,
                        background: app.status === "accepted" ? "rgba(27,107,58,0.8)" : app.status === "rejected" ? "rgba(184,50,50,0.8)" : app.status === "shortlisted" ? "var(--ouro-sutil)" : "var(--creme-10)",
                        color: app.status === "shortlisted" ? "var(--ouro)" : "var(--creme)",
                        border: app.status === "shortlisted" ? "1px solid rgba(212,146,10,0.30)" : "none",
                      }}>
                        {app.status === "pending" ? "Pendente" : app.status === "viewed" ? "Visualizada" : app.status === "shortlisted" ? "Selecionada" : app.status === "accepted" ? "Aceita" : "Rejeitada"}
                      </span>
                      <Link href={`/oportunidades/${app.opportunityId}`}>
                        <ChevronRight style={{ width: 16, height: 16, color: "var(--creme-50)", cursor: "pointer" }} />
                      </Link>
                    </div>
                  ))}
                  {(summary?.applicationsCount ?? 0) > 5 && (
                    <div style={{ textAlign: "center", color: "var(--creme-50)", fontSize: "var(--text-sm)", padding: "8px 0" }}>
                      +{(summary?.applicationsCount ?? 0) - 5} candidaturas mais antigas
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════ REPUTAÇÃO ════════════════════════════ */}
        {activeTab === "reputacao" && (
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,2fr)", gap: 20, alignItems: "start" }}>

            {/* Stats de avaliação */}
            <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 24 }}>
              <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--ouro)", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 20 }}>
                Reputação na Plataforma
              </span>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 8vw, 5rem)", fontWeight: 700, color: "var(--ouro)", lineHeight: 1 }}>
                  {(summary?.reviewStats?.avg ?? 0) > 0 ? (summary?.reviewStats?.avg ?? 0).toFixed(1) : "—"}
                </div>
                <div style={{ display: "flex", justifyContent: "center", gap: 4, margin: "8px 0" }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} style={{ width: 20, height: 20, fill: i < Math.round(summary?.reviewStats.avg ?? 0) ? "var(--ouro)" : "transparent", color: i < Math.round(summary?.reviewStats.avg ?? 0) ? "var(--ouro)" : "var(--creme-50)" }} />
                  ))}
                </div>
                <div style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)" }}>
                  {summary?.reviewStats.total ?? 0} avaliações recebidas
                </div>
              </div>

              {/* Indicadores de confiança */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  { label: "Perfil verificado", ok: profile?.isVerified },
                  { label: "Perfil ativo",      ok: profile?.isActive },
                  { label: "Tem avaliações",    ok: (summary?.reviewStats.total ?? 0) > 0 },
                  { label: "Tem ofertas",       ok: (summary?.offeringsCount ?? 0) > 0 },
                  { label: "Perfil com foto",   ok: !!profile?.avatarUrl },
                ].map(({ label, ok }) => (
                  <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: ok ? "rgba(27,107,58,0.25)" : "var(--creme-10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {ok ? <CheckCircle style={{ width: 10, height: 10, color: "var(--verde)" }} /> : <AlertCircle style={{ width: 10, height: 10, color: "var(--creme-50)" }} />}
                    </div>
                    <span style={{ fontSize: "var(--text-sm)", color: ok ? "var(--creme)" : "var(--creme-50)" }}>{label}</span>
                  </div>
                ))}
              </div>

              {profile && (
                <Link href={`/perfil/${profile.slug}`}>
                  <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 20, padding: "10px 16px", background: "var(--ouro-sutil)", border: "1px solid rgba(212,146,10,0.30)", borderRadius: 8, fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--ouro)", cursor: "pointer", textDecoration: "none" }}>
                    <Eye style={{ width: 14, height: 14 }} />Ver perfil público
                  </span>
                </Link>
              )}
            </div>

            {/* Avaliações recentes */}
            <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 24 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--ouro)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                  Avaliações Recebidas
                </span>
                {profile && (
                  <Link href={`/perfil/${profile.slug}`}>
                    <span style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", cursor: "pointer", borderBottom: "1px solid var(--creme-20)" }}>Ver todas →</span>
                  </Link>
                )}
              </div>
              {(summary?.recentReviews?.length ?? 0) === 0 ? (
                <EmptyState
                  icon={Star}
                  title="Nenhuma avaliação ainda"
                  desc="Avaliações aparecem aqui quando clientes avaliarem seu perfil"
                />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {summary?.recentReviews?.map((r: any) => <ReviewCard key={r.id} review={r} />)}
                  {(summary?.reviewStats.total ?? 0) > 3 && (
                    <div style={{ textAlign: "center", color: "var(--creme-50)", fontSize: "var(--text-sm)", padding: "8px 0" }}>
                      +{(summary?.reviewStats.total ?? 0) - 3} avaliações no perfil público
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ════════════════════════════ AGENDA ═══════════════════════════════ */}
        {activeTab === "agenda" && (
          <ComingSoon
            icon={Calendar}
            title="Agenda Inteligente"
            desc="Central de controle de shows, ensaios, gravações e reuniões. Com conflitos de agenda, convocação de membros, setlist e checklist pré e pós-evento."
            items={["Shows agendados", "Ensaios", "Gravações", "Reuniões", "Setlist", "Checklist pré-show", "Conflitos de agenda", "Convocação de equipe"]}
          />
        )}

        {/* ═══════════════════════════ MARKETING ════════════════════════════ */}
        {activeTab === "marketing" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <ComingSoon
              icon={Sparkles}
              title="Marketing Inteligente Autônomo"
              desc="Loop contínuo de crescimento: sensoriamento de tendências → estratégia → criação automática de conteúdo → distribuição → conversão → receita → reinvestimento."
              items={["Termômetro do ecossistema", "Geração de conteúdo", "Calendário editorial", "Distribuição omnichannel", "CRM e leads", "Mídia paga", "Creator engine", "Reinvestimento programável"]}
            />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              {[
                { icon: BarChart2, title: "Analytics de Perfil", desc: "Visualizações, cliques, taxa de resposta, conversão e ROI por canal", status: "Em breve" },
                { icon: TrendingUp, title: "Geração de Conteúdo", desc: "Posts, stories, reels e copies gerados automaticamente com IA", status: "Em breve" },
                { icon: Award,     title: "Dossiê Institucional", desc: "Apresentação profissional automática para marcas e patrocinadores", status: "Em breve" },
              ].map(({ icon: Icon, title, desc, status }) => (
                <div key={title} style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 20 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--ouro-sutil)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Icon style={{ width: 16, height: 16, color: "var(--ouro)" }} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{title}</div>
                      <span style={{ fontSize: 10, color: "var(--creme-50)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>{status}</span>
                    </div>
                  </div>
                  <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)", lineHeight: 1.5 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </PublicLayout>
  );
}
