import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicLayout from "@/components/PublicLayout";
import {
  SponsorPipeline, SponsorCard, SponsorDetail, NewSponsorForm,
} from "@/components/SponsorFlow";
import { Loader2, Users, Plus } from "lucide-react";

type SponsorStatus = "prospecto" | "proposta_enviada" | "em_negociacao" | "fechado" | "recusado";

const STATUS_FILTERS: { label: string; value: SponsorStatus | "todos" }[] = [
  { label: "Todos",            value: "todos"            },
  { label: "Prospectos",       value: "prospecto"        },
  { label: "Proposta Enviada", value: "proposta_enviada" },
  { label: "Em Negociação",    value: "em_negociacao"    },
  { label: "Fechados",         value: "fechado"          },
  { label: "Recusados",        value: "recusado"         },
];

export default function Sponsors() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  const [filter, setFilter]       = useState<SponsorStatus | "todos">("todos");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showNew, setShowNew]     = useState(false);

  const { data: sponsors = [], isLoading } = trpc.sponsors.getMySponsors.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );
  const { data: stats = [] } = trpc.sponsors.getPipelineStats.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/entrar");
  }, [isAuthenticated, loading, navigate]);

  const filtered = filter === "todos"
    ? (sponsors as any[])
    : (sponsors as any[]).filter((s) => s.status === filter);

  if (loading) {
    return (
      <PublicLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <Loader2 style={{ width: 28, height: 28, animation: "spin 1s linear infinite", color: "var(--ouro)" }} />
        </div>
      </PublicLayout>
    );
  }

  if (selectedId !== null) {
    return (
      <PublicLayout>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 80px" }}>
          <SponsorDetail sponsorId={selectedId} onBack={() => setSelectedId(null)} />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--creme)", marginBottom: 4 }}>
              Patrocinadores
            </h1>
            <p style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)" }}>
              Gerencie seu pipeline de patrocínios e parcerias
            </p>
          </div>
          <button
            onClick={() => setShowNew(v => !v)}
            className="pnsp-btn-primary"
            style={{ padding: "10px 20px", fontSize: "var(--text-sm)", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            {showNew ? "Cancelar" : "Novo Patrocinador"}
          </button>
        </div>

        {/* Pipeline visual */}
        <div style={{ marginBottom: 24 }}>
          <SponsorPipeline stats={stats as any} />
        </div>

        {/* Formulário novo patrocinador */}
        {showNew && (
          <div style={{ background: "var(--terra)", border: "1px solid rgba(212,146,10,0.25)", borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--creme)", marginBottom: 20 }}>
              Novo Patrocinador
            </h3>
            <NewSponsorForm onSuccess={() => setShowNew(false)} onCancel={() => setShowNew(false)} />
          </div>
        )}

        {/* Filtros pills */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              style={{
                padding: "6px 14px", borderRadius: 9999,
                border: filter === f.value ? "1px solid rgba(212,146,10,0.50)" : "1px solid var(--creme-10)",
                background: filter === f.value ? "var(--ouro-sutil)" : "transparent",
                color: filter === f.value ? "var(--ouro)" : "var(--creme-50)",
                fontSize: "var(--text-xs)", fontWeight: filter === f.value ? 700 : 500,
                cursor: "pointer", fontFamily: "var(--font-body)", whiteSpace: "nowrap",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Lista */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Loader2 style={{ width: 24, height: 24, animation: "spin 1s linear infinite", color: "var(--ouro)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "var(--terra)", border: "1px dashed var(--creme-10)", borderRadius: "var(--radius-lg)" }}>
            <Users style={{ width: 40, height: 40, color: "var(--creme-50)", margin: "0 auto 16px", opacity: 0.4 }} />
            <p style={{ fontWeight: 700, color: "var(--creme)", marginBottom: 6 }}>
              {filter === "todos" ? "Nenhum patrocinador ainda" : "Nenhum patrocinador neste status"}
            </p>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)" }}>
              {filter === "todos" ? "Adicione seu primeiro prospecto de patrocínio" : "Tente outro filtro"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {filtered.map((s: any) => (
              <SponsorCard
                key={s.id}
                sponsor={s}
                onClick={() => setSelectedId(s.id)}
              />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
