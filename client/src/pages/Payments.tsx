import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicLayout from "@/components/PublicLayout";
import { toast } from "sonner";
import { Loader2, DollarSign, TrendingUp, Clock, Plus, QrCode, Copy, Check, X } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

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

// ─── PIX helpers ──────────────────────────────────────────────────────────────
function crc16ccitt(data: string): string {
  let crc = 0xffff;
  for (let i = 0; i < data.length; i++) {
    crc ^= (data.charCodeAt(i) << 8);
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function emv(id: string, value: string): string {
  return id + String(value.length).padStart(2, "0") + value;
}

function buildPixPayload(pixKey: string, merchantName: string, city: string, amount?: number): string {
  const gui  = emv("00", "br.gov.bcb.pix");
  const key  = emv("01", pixKey);
  const mae  = emv("26", gui + key);          // merchant account info
  const mcc  = emv("52", "0000");
  const cur  = emv("53", "986");
  const amt  = amount && amount > 0 ? emv("54", amount.toFixed(2)) : "";
  const ctry = emv("58", "BR");
  const name = emv("59", (merchantName || "RECEBEDOR").substring(0, 25).toUpperCase());
  const cityF = emv("60", (city || "BRASIL").substring(0, 15).toUpperCase());
  const txid  = emv("05", "***");
  const addl  = emv("62", txid);
  const partial = `000201010212${mae}${mcc}${cur}${amt}${ctry}${name}${cityF}${addl}6304`;
  return partial + crc16ccitt(partial);
}

// ─── PixPayment ───────────────────────────────────────────────────────────────
function PixPayment({ defaultAmount }: { defaultAmount?: number }) {
  const [pixKey,       setPixKey]       = useState("");
  const [merchantName, setMerchantName] = useState("");
  const [city,         setCity]         = useState("SAO PAULO");
  const [payload,      setPayload]      = useState("");
  const [generated,    setGenerated]    = useState(false);
  const [copied,       setCopied]       = useState(false);
  const [open,         setOpen]         = useState(false);

  function handleGenerate() {
    if (!pixKey.trim()) { toast.error("Informe a chave PIX"); return; }
    setPayload(buildPixPayload(pixKey.trim(), merchantName.trim() || "RECEBEDOR", city.trim() || "BRASIL", defaultAmount));
    setGenerated(true);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(payload);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Não foi possível copiar");
    }
  }

  function handleReset() {
    setGenerated(false);
    setPayload("");
    setPixKey("");
  }

  const inpSt: React.CSSProperties = {
    width: "100%", background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(212,146,10,0.15)", borderRadius: 8,
    padding: "9px 12px", fontSize: 13, color: "var(--creme)",
    outline: "none", fontFamily: "var(--font-body)", boxSizing: "border-box",
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "10px 18px", borderRadius: 10,
          border: "1px solid rgba(212,146,10,0.3)", background: "var(--terra)",
          color: "var(--ouro)", fontSize: 13, fontWeight: 600, cursor: "pointer",
          fontFamily: "var(--font-body)", marginBottom: 24,
        }}
      >
        <QrCode style={{ width: 16, height: 16 }} />
        Gerar QR Code PIX
      </button>
    );
  }

  return (
    <div style={{ background: "var(--terra)", border: "1px solid rgba(212,146,10,0.25)", borderRadius: "var(--radius-lg)", padding: 24, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <QrCode style={{ width: 18, height: 18, color: "var(--ouro)" }} />
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--creme)" }}>
            PIX QR Code
          </h3>
        </div>
        <button type="button" onClick={() => { setOpen(false); handleReset(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--creme-50)", padding: 4 }}>
          <X style={{ width: 16, height: 16 }} />
        </button>
      </div>

      {!generated ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase" }}>
              Chave PIX *
            </label>
            <input
              style={inpSt}
              placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
              value={pixKey}
              onChange={e => setPixKey(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase" }}>
              Nome do Recebedor
            </label>
            <input style={inpSt} placeholder="Ex: João Silva" value={merchantName} onChange={e => setMerchantName(e.target.value)} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase" }}>
              Cidade
            </label>
            <input style={inpSt} placeholder="Ex: SAO PAULO" value={city} onChange={e => setCity(e.target.value)} />
          </div>
          {defaultAmount && (
            <div style={{ gridColumn: "1 / -1" }}>
              <p style={{ fontSize: 12, color: "var(--creme-50)" }}>
                Valor: <strong style={{ color: "var(--ouro)" }}>{fmtBRL(defaultAmount)}</strong> (será incluído no QR Code)
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={handleGenerate}
            className="pnsp-btn-primary"
            style={{ gridColumn: "1 / -1", padding: "10px" }}
          >
            Gerar QR Code
          </button>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
          <div style={{ padding: 16, background: "#fff", borderRadius: 12 }}>
            <QRCodeSVG
              value={payload}
              size={200}
              level="M"
              includeMargin={false}
            />
          </div>
          <p style={{ fontSize: 12, color: "var(--creme-50)", textAlign: "center", maxWidth: 280, wordBreak: "break-all" }}>
            {payload.substring(0, 60)}…
          </p>
          <div style={{ display: "flex", gap: 10, width: "100%", justifyContent: "center" }}>
            <button
              type="button"
              onClick={handleCopy}
              className="pnsp-btn-primary"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "10px 20px" }}
            >
              {copied ? <Check style={{ width: 14, height: 14 }} /> : <Copy style={{ width: 14, height: 14 }} />}
              {copied ? "Copiado!" : "Copiar código"}
            </button>
            <button
              type="button"
              onClick={handleReset}
              style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid var(--creme-10)", background: "none", color: "var(--creme-50)", fontSize: 13, cursor: "pointer", fontFamily: "var(--font-body)" }}
            >
              Novo QR
            </button>
          </div>
        </div>
      )}
    </div>
  );
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

        {/* PIX QR Code */}
        <PixPayment />

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
