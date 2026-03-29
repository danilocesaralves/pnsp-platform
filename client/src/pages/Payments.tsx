import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicLayout from "@/components/PublicLayout";
import { toast } from "sonner";
import { Loader2, DollarSign, TrendingUp, Clock, Plus } from "lucide-react";

type PaymentMethod = "pix" | "transferencia" | "dinheiro" | "outro";
type PaymentStatus = "pendente" | "confirmado" | "cancelado";

const METHOD_LABEL: Record<PaymentMethod, string> = {
  pix: "PIX", transferencia: "Transferência", dinheiro: "Dinheiro", outro: "Outro",
};

const STATUS_COLOR: Record<PaymentStatus, string> = {
  pendente: "#f59e0b", confirmado: "#10b981", cancelado: "#6b7280",
};

function fmtBRL(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

// ─── KpiCard ──────────────────────────────────────────────────────────────────
function KpiCard({ icon: Icon, label, value, accent }: {
  icon: React.ComponentType<any>; label: string; value: string; accent?: boolean;
}) {
  return (
    <div style={{
      background: "var(--terra)",
      border: `1px solid ${accent ? "rgba(212,146,10,0.35)" : "var(--creme-10)"}`,
      borderRadius: "var(--radius-md)", padding: "20px",
      display: "flex", flexDirection: "column", gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: accent ? "var(--ouro-sutil)" : "var(--creme-10)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <Icon style={{ width: 16, height: 16, color: accent ? "var(--ouro)" : "var(--creme-50)" }} />
        </div>
        <span style={{ fontSize: "var(--text-xs)", fontWeight: 600, color: "var(--creme-50)", fontFamily: "var(--font-body)" }}>
          {label}
        </span>
      </div>
      <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", fontWeight: 700, color: accent ? "var(--ouro)" : "var(--creme)" }}>
        {value}
      </div>
    </div>
  );
}

// ─── PaymentRow ───────────────────────────────────────────────────────────────
function PaymentRow({ pay, onConfirm }: { pay: any; onConfirm: (id: number) => void }) {
  const isIncoming = pay.isIncoming;
  const status = pay.status as PaymentStatus;

  return (
    <div style={{
      background: "var(--terra)", border: "1px solid var(--creme-10)",
      borderRadius: "var(--radius-md)", padding: "16px 20px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 8, flexShrink: 0,
          background: isIncoming ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.10)",
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <DollarSign style={{ width: 16, height: 16, color: isIncoming ? "#10b981" : "#f87171" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: isIncoming ? "#10b981" : "#f87171" }}>
            {isIncoming ? "+" : "-"}{fmtBRL(pay.amount)}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", marginTop: 2 }}>
            {isIncoming
              ? `De: ${pay.payerProfile?.displayName ?? "—"}`
              : `Para: ${pay.payeeProfile?.displayName ?? "—"}`
            }{" · "}{METHOD_LABEL[pay.method as PaymentMethod] ?? pay.method}
          </div>
          {pay.reference && (
            <div style={{ fontSize: 10, color: "var(--creme-50)", marginTop: 2 }}>Ref: {pay.reference}</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        <span style={{
          fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 9999,
          background: STATUS_COLOR[status] + "22",
          color: STATUS_COLOR[status],
          border: `1px solid ${STATUS_COLOR[status]}44`,
        }}>
          {status === "pendente" ? "Pendente" : status === "confirmado" ? "Confirmado" : "Cancelado"}
        </span>
        {status === "pendente" && (
          <button
            onClick={() => onConfirm(pay.id)}
            style={{
              padding: "4px 10px", borderRadius: 6,
              border: "1px solid rgba(16,185,129,0.4)", background: "none",
              color: "#10b981", cursor: "pointer", fontSize: 10, fontWeight: 600,
            }}
          >
            Confirmar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Payments page ────────────────────────────────────────────────────────────
export default function Payments() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [showNew,    setShowNew]    = useState(false);
  const [payeeId,    setPayeeId]    = useState("");
  const [amount,     setAmount]     = useState("");
  const [method,     setMethod]     = useState<PaymentMethod>("pix");
  const [reference,  setReference]  = useState("");
  const [notes,      setNotes]      = useState("");

  const { data: payments = [], isLoading } = trpc.pay.getMyPayments.useQuery(
    undefined, { enabled: isAuthenticated },
  );
  const { data: stats = { totalReceived: 0, totalPending: 0, avgTicket: 0, count: 0 } } =
    trpc.pay.getStats.useQuery(undefined, { enabled: isAuthenticated });

  const create = trpc.pay.create.useMutation({
    onSuccess: () => {
      toast.success("Pagamento registrado!");
      utils.pay.getMyPayments.invalidate();
      utils.pay.getStats.invalidate();
      setShowNew(false);
      setPayeeId(""); setAmount(""); setReference(""); setNotes("");
    },
    onError: (e) => toast.error(e.message),
  });

  const confirm = trpc.pay.confirm.useMutation({
    onSuccess: () => {
      toast.success("Pagamento confirmado!");
      utils.pay.getMyPayments.invalidate();
      utils.pay.getStats.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

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

  const inpSt: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(212,146,10,0.15)", borderRadius: 8,
    padding: "9px 12px", fontSize: 13, color: "var(--creme)",
    outline: "none", fontFamily: "var(--font-body)", boxSizing: "border-box",
  };

  return (
    <PublicLayout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--creme)", marginBottom: 4 }}>
              Pagamentos
            </h1>
            <p style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)" }}>
              Registro manual de pagamentos recebidos e enviados
            </p>
          </div>
          <button
            onClick={() => setShowNew(v => !v)}
            className="pnsp-btn-primary"
            style={{ padding: "10px 20px", fontSize: "var(--text-sm)", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Plus style={{ width: 14, height: 14 }} />
            {showNew ? "Cancelar" : "Registrar Pagamento"}
          </button>
        </div>

        {/* KPIs */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          <KpiCard icon={TrendingUp} label="Total Recebido"  value={fmtBRL(stats.totalReceived)} accent />
          <KpiCard icon={Clock}      label="Pendente"        value={fmtBRL(stats.totalPending)} />
          <KpiCard icon={DollarSign} label="Ticket Médio"    value={fmtBRL(stats.avgTicket)} />
        </div>

        {/* Formulário novo pagamento */}
        {showNew && (
          <div style={{ background: "var(--terra)", border: "1px solid rgba(212,146,10,0.25)", borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 24 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--creme)", marginBottom: 20 }}>
              Registrar Pagamento
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase" }}>
                  ID do Perfil Destinatário *
                </label>
                <input style={inpSt} type="number" placeholder="Ex: 42" value={payeeId} onChange={e => setPayeeId(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase" }}>Valor R$ *</label>
                <input style={inpSt} type="number" placeholder="150.00" value={amount} onChange={e => setAmount(e.target.value)} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase" }}>Método</label>
                <select
                  style={{ ...inpSt, appearance: "none" } as React.CSSProperties}
                  value={method}
                  onChange={e => setMethod(e.target.value as PaymentMethod)}
                >
                  <option value="pix">PIX</option>
                  <option value="transferencia">Transferência</option>
                  <option value="dinheiro">Dinheiro</option>
                  <option value="outro">Outro</option>
                </select>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase" }}>Referência</label>
                <input style={inpSt} placeholder="Comprovante, nota fiscal..." value={reference} onChange={e => setReference(e.target.value)} />
              </div>
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase" }}>Observações</label>
                <textarea
                  style={{ ...inpSt, resize: "vertical", minHeight: 60 } as React.CSSProperties}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                />
              </div>
            </div>
            <button
              onClick={() => {
                if (!payeeId) { toast.error("Informe o ID do destinatário"); return; }
                const cents = Math.round(parseFloat(amount.replace(",", ".")) * 100);
                if (!cents || cents < 1) { toast.error("Informe um valor válido"); return; }
                create.mutate({ payeeId: parseInt(payeeId), amount: cents, method, reference: reference || undefined, notes: notes || undefined });
              }}
              disabled={create.isPending}
              className="pnsp-btn-primary"
              style={{ width: "100%", padding: "10px" }}
            >
              {create.isPending ? "Registrando..." : "Registrar Pagamento"}
            </button>
          </div>
        )}

        {/* Lista */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
            <Loader2 style={{ width: 24, height: 24, animation: "spin 1s linear infinite", color: "var(--ouro)" }} />
          </div>
        ) : (payments as any[]).length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 24px", background: "var(--terra)", border: "1px dashed var(--creme-10)", borderRadius: "var(--radius-lg)" }}>
            <DollarSign style={{ width: 40, height: 40, color: "var(--creme-50)", margin: "0 auto 16px", opacity: 0.4 }} />
            <p style={{ fontWeight: 700, color: "var(--creme)", marginBottom: 6 }}>Nenhum pagamento registrado</p>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)" }}>
              Registre pagamentos manuais recebidos ou enviados
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {(payments as any[]).map((p) => (
              <PaymentRow
                key={p.id}
                pay={p}
                onConfirm={(id) => confirm.mutate({ paymentId: id })}
              />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
