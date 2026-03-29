import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicLayout from "@/components/PublicLayout";
import { BookingCard, BookingDetail } from "@/components/BookingFlow";
import { Loader2, FileText } from "lucide-react";

type BookingStatus = "rascunho" | "proposta_enviada" | "contraproposta" | "aceito" | "recusado" | "cancelado";

const FILTERS: { label: string; value: BookingStatus | "todos" }[] = [
  { label: "Todos",            value: "todos"            },
  { label: "Pendentes",        value: "proposta_enviada" },
  { label: "Contrapropostas",  value: "contraproposta"   },
  { label: "Aceitos",          value: "aceito"           },
  { label: "Recusados",        value: "recusado"         },
  { label: "Cancelados",       value: "cancelado"        },
];

// ─── FilterPill ───────────────────────────────────────────────────────────────
function FilterPill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "6px 14px",
        borderRadius: 9999,
        border: active ? "1px solid rgba(212,146,10,0.50)" : "1px solid var(--creme-10)",
        background: active ? "var(--ouro-sutil)" : "transparent",
        color: active ? "var(--ouro)" : "var(--creme-50)",
        fontSize: "var(--text-xs)",
        fontWeight: active ? 700 : 500,
        cursor: "pointer",
        fontFamily: "var(--font-body)",
        transition: "var(--transition)",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </button>
  );
}

// ─── EmptyState ───────────────────────────────────────────────────────────────
function EmptyState({ filter }: { filter: string }) {
  return (
    <div style={{
      textAlign: "center", padding: "60px 24px",
      background: "var(--terra)", border: "1px dashed var(--creme-10)",
      borderRadius: "var(--radius-lg)",
    }}>
      <FileText style={{ width: 40, height: 40, color: "var(--creme-50)", margin: "0 auto 16px", opacity: 0.4 }} />
      <p style={{ fontWeight: 700, color: "var(--creme)", marginBottom: 6 }}>
        {filter === "todos" ? "Nenhuma negociação ainda" : "Nenhum booking neste status"}
      </p>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)" }}>
        {filter === "todos"
          ? "Acesse um perfil e clique em \"Propor contratação\" para iniciar"
          : "Tente outro filtro"}
      </p>
    </div>
  );
}

// ─── Bookings page ────────────────────────────────────────────────────────────
export default function Bookings() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const [filter, setFilter]         = useState<BookingStatus | "todos">("todos");
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const { data: myProfile } = trpc.profiles.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );
  const { data: bookingList = [], isLoading } = trpc.bookings.getMyBookings.useQuery(
    filter === "todos" ? undefined : { status: filter },
    { enabled: isAuthenticated },
  );

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/entrar");
  }, [isAuthenticated, loading, navigate]);

  if (loading) {
    return (
      <PublicLayout>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
          <Loader2 style={{ width: 28, height: 28, animation: "spin 1s linear infinite", color: "var(--ouro)" }} />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--creme)", marginBottom: 4 }}>
            Negociações
          </h1>
          <p style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)" }}>
            Gerencie suas propostas de contratação e bookings
          </p>
        </div>

        {selectedId ? (
          <BookingDetail
            bookingId={selectedId}
            currentProfileId={myProfile?.id ?? 0}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          <>
            {/* Filtros */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
              {FILTERS.map(f => (
                <FilterPill
                  key={f.value}
                  label={f.label}
                  active={filter === f.value}
                  onClick={() => setFilter(f.value)}
                />
              ))}
            </div>

            {/* Lista */}
            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                <Loader2 style={{ width: 24, height: 24, animation: "spin 1s linear infinite", color: "var(--ouro)" }} />
              </div>
            ) : bookingList.length === 0 ? (
              <EmptyState filter={filter} />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {bookingList.map((b: any) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    currentProfileId={myProfile?.id ?? 0}
                    onSelect={setSelectedId}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
