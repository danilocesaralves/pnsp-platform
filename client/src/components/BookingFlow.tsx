import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FileText, CheckCircle, XCircle, RefreshCw, Clock, Ban,
  Send, ChevronRight, Bell, BellOff, Calendar, MapPin,
  DollarSign, User, ArrowRight, Package,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type BookingStatus = "rascunho" | "proposta_enviada" | "contraproposta" | "aceito" | "recusado" | "cancelado";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function fmtBRL(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function parseBRL(raw: string): number {
  const num = parseFloat(raw.replace(/[^\d,]/g, "").replace(",", "."));
  return isNaN(num) ? 0 : Math.round(num * 100);
}

function relTime(d: string | Date): string {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "agora";
  if (m < 60) return `${m}min atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

// ─── BookingStatusBadge ───────────────────────────────────────────────────────
const STATUS_CFG: Record<BookingStatus, { label: string; color: string; bg: string; border: string }> = {
  rascunho:        { label: "Rascunho",        color: "#9CA3AF", bg: "rgba(107,107,107,0.12)", border: "rgba(107,107,107,0.25)" },
  proposta_enviada:{ label: "Proposta Enviada", color: "#60A5FA", bg: "rgba(37,99,235,0.12)",  border: "rgba(37,99,235,0.25)"   },
  contraproposta:  { label: "Contraproposta",   color: "#FBBF24", bg: "rgba(217,119,6,0.12)",  border: "rgba(217,119,6,0.25)"   },
  aceito:          { label: "Aceito",           color: "#4ADE80", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.25)"   },
  recusado:        { label: "Recusado",         color: "#F87171", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)"   },
  cancelado:       { label: "Cancelado",        color: "#6B7280", bg: "rgba(42,42,42,0.20)",   border: "rgba(42,42,42,0.40)"    },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const c = STATUS_CFG[status] ?? STATUS_CFG.rascunho;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 9999,
      background: c.bg, color: c.color,
      border: `1px solid ${c.border}`,
      fontSize: 11, fontWeight: 700, letterSpacing: "0.04em",
    }}>
      {c.label}
    </span>
  );
}

// ─── TimelineItem ─────────────────────────────────────────────────────────────
const ACTION_ICONS: Record<string, React.ComponentType<any>> = {
  criado:           FileText,
  proposta_enviada: Send,
  contraproposta:   RefreshCw,
  aceito:           CheckCircle,
  recusado:         XCircle,
  cancelado:        Ban,
};

function TimelineItem({ item }: { item: { action: string; note: string | null; createdAt: string | Date; actorProfileId: number } }) {
  const Icon = ACTION_ICONS[item.action] ?? Clock;
  const actionLabel: Record<string, string> = {
    criado: "Booking criado",
    proposta_enviada: "Proposta enviada",
    contraproposta: "Contraproposta enviada",
    aceito: "Proposta aceita",
    recusado: "Proposta recusada",
    cancelado: "Booking cancelado",
  };

  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start", paddingBottom: 16, position: "relative" }}>
      <div style={{
        width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
        background: "var(--terra-escura)", border: "1px solid var(--creme-10)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1,
      }}>
        <Icon style={{ width: 13, height: 13, color: "var(--ouro)" }} />
      </div>
      <div style={{ flex: 1, paddingTop: 4 }}>
        <div style={{ fontSize: "var(--text-sm)", fontWeight: 600, color: "var(--creme)" }}>
          {actionLabel[item.action] ?? item.action}
        </div>
        {item.note && (
          <p style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", marginTop: 3, fontStyle: "italic" }}>
            "{item.note}"
          </p>
        )}
        <div style={{ fontSize: 10, color: "var(--creme-50)", marginTop: 4 }}>{relTime(item.createdAt)}</div>
      </div>
    </div>
  );
}

// ─── BookingCard ──────────────────────────────────────────────────────────────
export function BookingCard({
  booking,
  currentProfileId,
  onSelect,
}: {
  booking: any;
  currentProfileId: number;
  onSelect: (id: number) => void;
}) {
  const isContractor = booking.contractorProfileId === currentProfileId;
  const otherProfile = isContractor ? booking.artistProfile : booking.contractorProfile;

  return (
    <div
      onClick={() => onSelect(booking.id)}
      style={{
        background: "var(--terra)",
        border: "1px solid var(--creme-10)",
        borderRadius: "var(--radius-md)",
        padding: "16px 20px",
        cursor: "pointer",
        transition: "var(--transition)",
        display: "flex",
        flexDirection: "column",
        gap: 10,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.30)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--creme-10)"; }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: "var(--text-sm)", color: "var(--creme)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {booking.title}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", marginTop: 3 }}>
            {isContractor ? "↑ Você propôs para" : "↓ Proposta de"}&nbsp;
            <span style={{ color: "var(--creme-80)", fontWeight: 600 }}>{otherProfile?.displayName ?? "—"}</span>
          </div>
        </div>
        <BookingStatusBadge status={booking.status as BookingStatus} />
      </div>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {booking.eventDate && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>
            <Calendar style={{ width: 11, height: 11 }} />
            {new Date(booking.eventDate + "T12:00:00").toLocaleDateString("pt-BR")}
          </span>
        )}
        {booking.eventCity && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>
            <MapPin style={{ width: 11, height: 11 }} />
            {booking.eventCity}{booking.eventState ? `/${booking.eventState}` : ""}
          </span>
        )}
        {(booking.finalValue ?? booking.counterValue ?? booking.proposedValue) != null && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: "var(--text-xs)", color: "var(--ouro)", fontWeight: 600 }}>
            <DollarSign style={{ width: 11, height: 11 }} />
            {fmtBRL(booking.finalValue ?? booking.counterValue ?? booking.proposedValue)}
          </span>
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
        <span style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", display: "flex", alignItems: "center", gap: 4 }}>
          Ver detalhes <ChevronRight style={{ width: 12, height: 12 }} />
        </span>
      </div>
    </div>
  );
}

// ─── BookingDetail ────────────────────────────────────────────────────────────
export function BookingDetail({
  bookingId,
  currentProfileId,
  onBack,
}: {
  bookingId: number;
  currentProfileId: number;
  onBack: () => void;
}) {
  const [counterVal, setCounterVal] = useState("");
  const [counterNote, setCounterNote] = useState("");
  const [showCounterForm, setShowCounterForm] = useState(false);
  const utils = trpc.useUtils();

  const { data: booking, isLoading } = trpc.bookings.getById.useQuery({ bookingId });
  const sendCounter = trpc.bookings.sendCounter.useMutation({
    onSuccess: () => {
      toast.success("Contraproposta enviada!");
      setShowCounterForm(false);
      setCounterVal("");
      setCounterNote("");
      utils.bookings.getById.invalidate({ bookingId });
      utils.bookings.getMyBookings.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const accept = trpc.bookings.accept.useMutation({
    onSuccess: () => {
      toast.success("Proposta aceita!");
      utils.bookings.getById.invalidate({ bookingId });
      utils.bookings.getMyBookings.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const refuse = trpc.bookings.refuse.useMutation({
    onSuccess: () => {
      toast.success("Proposta recusada");
      utils.bookings.getById.invalidate({ bookingId });
      utils.bookings.getMyBookings.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const cancel = trpc.bookings.cancel.useMutation({
    onSuccess: () => {
      toast.success("Booking cancelado");
      utils.bookings.getById.invalidate({ bookingId });
      utils.bookings.getMyBookings.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
        <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid var(--ouro)", borderTopColor: "transparent", animation: "spin 1s linear infinite" }} />
      </div>
    );
  }

  if (!booking) {
    return (
      <div style={{ textAlign: "center", padding: 48, color: "var(--creme-50)" }}>
        <p>Booking não encontrado</p>
        <button onClick={onBack} style={{ marginTop: 16, color: "var(--ouro)", background: "none", border: "none", cursor: "pointer", fontSize: "var(--text-sm)" }}>
          ← Voltar
        </button>
      </div>
    );
  }

  const isArtist     = booking.artistProfileId     === currentProfileId;
  const isContractor = booking.contractorProfileId === currentProfileId;
  const status       = booking.status as BookingStatus;

  const canArtistAct     = isArtist     && status === "proposta_enviada";
  const canContractorAct = isContractor && status === "contraproposta";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <button
          onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--creme-50)", cursor: "pointer", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)" }}
        >
          ← Voltar
        </button>
        <BookingStatusBadge status={status} />
      </div>

      {/* Título + partes */}
      <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 24 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 8 }}>
          {booking.title}
        </h2>
        {booking.description && (
          <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-80)", marginBottom: 16, lineHeight: 1.6 }}>{booking.description}</p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          {/* Contratante */}
          <div style={{ background: "var(--terra-escura)", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--creme-10)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--creme-50)", textTransform: "uppercase", marginBottom: 6 }}>Contratante</div>
            <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{booking.contractorProfile?.displayName ?? "—"}</div>
          </div>
          {/* Artista */}
          <div style={{ background: "var(--terra-escura)", borderRadius: 8, padding: "12px 14px", border: "1px solid var(--creme-10)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "var(--creme-50)", textTransform: "uppercase", marginBottom: 6 }}>Artista</div>
            <div style={{ fontWeight: 600, fontSize: "var(--text-sm)" }}>{booking.artistProfile?.displayName ?? "—"}</div>
          </div>
        </div>

        {/* Info evento */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {booking.eventDate && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "var(--text-sm)", color: "var(--creme-80)" }}>
              <Calendar style={{ width: 13, height: 13, color: "var(--ouro)" }} />
              {new Date(booking.eventDate + "T12:00:00").toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </span>
          )}
          {booking.eventCity && (
            <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "var(--text-sm)", color: "var(--creme-80)" }}>
              <MapPin style={{ width: 13, height: 13, color: "var(--ouro)" }} />
              {booking.eventCity}{booking.eventState ? `/${booking.eventState}` : ""}
            </span>
          )}
        </div>
      </div>

      {/* Valores */}
      <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ouro)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
          Valores
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {[
            { label: "Proposto", value: booking.proposedValue },
            { label: "Contra",   value: booking.counterValue  },
            { label: "Final",    value: booking.finalValue    },
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign: "center", padding: "12px", background: "var(--terra-escura)", borderRadius: 8, border: "1px solid var(--creme-10)" }}>
              <div style={{ fontSize: 10, color: "var(--creme-50)", textTransform: "uppercase", marginBottom: 4 }}>{label}</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-lg)", fontWeight: 700, color: value != null ? "var(--ouro)" : "var(--creme-50)" }}>
                {fmtBRL(value)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ações */}
      {(canArtistAct || canContractorAct) && (
        <div style={{ background: "var(--terra)", border: "1px solid rgba(212,146,10,0.20)", borderRadius: "var(--radius-lg)", padding: 24 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ouro)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
            Ação necessária
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={() => accept.mutate({ bookingId })}
              disabled={accept.isPending}
              className="pnsp-btn-primary"
              style={{ padding: "10px 20px", fontSize: "var(--text-sm)" }}
            >
              <CheckCircle style={{ width: 14, height: 14 }} />
              Aceitar
            </button>
            {canArtistAct && (
              <button
                onClick={() => setShowCounterForm(v => !v)}
                style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--creme-20)", background: "none", color: "var(--creme-80)", cursor: "pointer", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)", display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <RefreshCw style={{ width: 14, height: 14 }} />
                Contraproposta
              </button>
            )}
            <button
              onClick={() => refuse.mutate({ bookingId })}
              disabled={refuse.isPending}
              style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.30)", background: "none", color: "#F87171", cursor: "pointer", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <XCircle style={{ width: 14, height: 14 }} />
              Recusar
            </button>
          </div>

          {/* Form contraproposta */}
          {showCounterForm && (
            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase" }}>
                  Valor R$
                </label>
                <input
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,146,10,0.20)", borderRadius: 8, padding: "9px 12px", fontSize: 14, color: "var(--creme)", outline: "none", fontFamily: "var(--font-body)", boxSizing: "border-box" }}
                  placeholder="Ex: 1.500,00"
                  value={counterVal}
                  onChange={e => setCounterVal(e.target.value)}
                  onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.50)"; }}
                  onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.20)"; }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase" }}>
                  Observação
                </label>
                <textarea
                  style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(212,146,10,0.20)", borderRadius: 8, padding: "9px 12px", fontSize: 14, color: "var(--creme)", outline: "none", fontFamily: "var(--font-body)", resize: "vertical", minHeight: 64, boxSizing: "border-box" }}
                  placeholder="Explique sua contraproposta..."
                  value={counterNote}
                  onChange={e => setCounterNote(e.target.value)}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => {
                    const val = parseBRL(counterVal);
                    if (!val) { toast.error("Informe um valor válido"); return; }
                    sendCounter.mutate({ bookingId, counterValue: val, artistNotes: counterNote || undefined });
                  }}
                  disabled={sendCounter.isPending}
                  className="pnsp-btn-primary"
                  style={{ padding: "9px 20px", fontSize: "var(--text-sm)" }}
                >
                  Enviar Contraproposta
                </button>
                <button
                  onClick={() => setShowCounterForm(false)}
                  style={{ padding: "9px 16px", borderRadius: 8, border: "1px solid var(--creme-20)", background: "none", color: "var(--creme-80)", cursor: "pointer", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)" }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {status === "aceito" && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 20px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "var(--radius-md)" }}>
          <CheckCircle style={{ width: 20, height: 20, color: "#4ADE80", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: "#4ADE80", fontSize: "var(--text-sm)" }}>Booking confirmado!</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>Valor final: {fmtBRL(booking.finalValue)}</div>
          </div>
        </div>
      )}

      {/* Cancelar (qualquer estado ativo) */}
      {!["aceito","recusado","cancelado"].includes(status) && (
        <div style={{ textAlign: "right" }}>
          <button
            onClick={() => cancel.mutate({ bookingId })}
            disabled={cancel.isPending}
            style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.20)", background: "none", color: "rgba(248,113,113,0.7)", cursor: "pointer", fontSize: "var(--text-xs)", fontFamily: "var(--font-body)" }}
          >
            Cancelar booking
          </button>
        </div>
      )}

      {/* Timeline */}
      <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 24 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ouro)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 16 }}>
          Histórico
        </div>
        <div style={{ borderLeft: "1px solid var(--creme-10)", paddingLeft: 16 }}>
          {(booking.timeline ?? []).map((t: any) => (
            <TimelineItem key={t.id} item={t} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── NewBookingForm ───────────────────────────────────────────────────────────
const inpSt: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(212,146,10,0.15)",
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 14,
  color: "var(--creme)",
  outline: "none",
  fontFamily: "var(--font-body)",
  boxSizing: "border-box",
};

function FieldGroup({ label, children, half }: { label: string; children: React.ReactNode; half?: boolean }) {
  return (
    <div style={{ flex: half ? "1 1 calc(50% - 6px)" : "1 1 100%", minWidth: 0 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        {label}
      </label>
      {children}
    </div>
  );
}

export function NewBookingForm({
  artistProfileId,
  onSuccess,
  onCancel,
}: {
  artistProfileId: number;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [title,       setTitle]       = useState("");
  const [description, setDescription] = useState("");
  const [eventDate,   setEventDate]   = useState("");
  const [eventCity,   setEventCity]   = useState("");
  const [eventState,  setEventState]  = useState("");
  const [valueStr,    setValueStr]    = useState("");
  const [notes,       setNotes]       = useState("");

  const utils = trpc.useUtils();
  const create = trpc.bookings.create.useMutation();
  const sendProposal = trpc.bookings.sendProposal.useMutation({
    onSuccess: () => {
      toast.success("Proposta enviada!");
      utils.bookings.getMyBookings.invalidate();
      onSuccess();
    },
    onError: (e) => toast.error(e.message),
  });

  function handleSubmit() {
    if (!title.trim()) { toast.error("Título é obrigatório"); return; }
    const proposedValue = valueStr ? parseBRL(valueStr) : undefined;
    create.mutate(
      {
        artistProfileId,
        title:         title.trim(),
        description:   description || undefined,
        eventDate:     eventDate   || undefined,
        eventCity:     eventCity   || undefined,
        eventState:    eventState  || undefined,
        proposedValue,
        notes:         notes       || undefined,
      },
      {
        onSuccess: (booking) => sendProposal.mutate({ bookingId: booking.id }),
        onError:   (e) => toast.error(e.message),
      },
    );
  }

  const busy = create.isPending || sendProposal.isPending;

  function focusBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.50)";
  }
  function blurBorder(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.15)";
  }

  return (
    <div style={{ background: "var(--terra)", border: "1px solid rgba(212,146,10,0.25)", borderRadius: "var(--radius-lg)", padding: 24 }}>
      <p style={{ fontSize: 13, fontWeight: 700, color: "var(--ouro)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 20 }}>
        Propor Contratação
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
        <FieldGroup label="Título *">
          <input style={inpSt} placeholder="Ex: Show no Festival da Cidade" value={title}
            onChange={e => setTitle(e.target.value)} onFocus={focusBorder} onBlur={blurBorder}
            onKeyDown={e => e.key === "Enter" && e.preventDefault()} />
        </FieldGroup>

        <FieldGroup label="Descrição">
          <textarea style={{ ...inpSt, resize: "vertical", minHeight: 64 } as React.CSSProperties}
            placeholder="Detalhes do evento, setlist, rider técnico..."
            value={description} onChange={e => setDescription(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
        </FieldGroup>

        <FieldGroup label="Data do Evento" half>
          <input type="date" style={inpSt} value={eventDate} onChange={e => setEventDate(e.target.value)}
            onFocus={focusBorder} onBlur={blurBorder} />
        </FieldGroup>

        <FieldGroup label="Valor R$" half>
          <input style={inpSt} placeholder="Ex: 2.500,00" value={valueStr}
            onChange={e => setValueStr(e.target.value)} onFocus={focusBorder} onBlur={blurBorder}
            onKeyDown={e => e.key === "Enter" && e.preventDefault()} />
        </FieldGroup>

        <FieldGroup label="Cidade" half>
          <input style={inpSt} placeholder="São Paulo" value={eventCity}
            onChange={e => setEventCity(e.target.value)} onFocus={focusBorder} onBlur={blurBorder}
            onKeyDown={e => e.key === "Enter" && e.preventDefault()} />
        </FieldGroup>

        <FieldGroup label="Estado" half>
          <input style={inpSt} placeholder="SP" maxLength={2} value={eventState}
            onChange={e => setEventState(e.target.value.toUpperCase())} onFocus={focusBorder} onBlur={blurBorder}
            onKeyDown={e => e.key === "Enter" && e.preventDefault()} />
        </FieldGroup>

        <FieldGroup label="Observações">
          <textarea style={{ ...inpSt, resize: "vertical", minHeight: 56 } as React.CSSProperties}
            placeholder="Informações adicionais..."
            value={notes} onChange={e => setNotes(e.target.value)} onFocus={focusBorder} onBlur={blurBorder} />
        </FieldGroup>
      </div>

      <div style={{ display: "flex", gap: 10, marginTop: 20, justifyContent: "flex-end" }}>
        <button onClick={onCancel}
          style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid var(--creme-20)", background: "none", color: "var(--creme-80)", cursor: "pointer", fontSize: 14, fontFamily: "var(--font-body)" }}>
          Cancelar
        </button>
        <button onClick={handleSubmit} disabled={busy} className="pnsp-btn-primary"
          style={{ padding: "9px 24px", fontSize: 14, opacity: busy ? 0.7 : 1 }}>
          {busy ? "Enviando..." : <><Send style={{ width: 13, height: 13 }} /> Enviar proposta</>}
        </button>
      </div>
    </div>
  );
}

// ─── NotificationDropdown ─────────────────────────────────────────────────────
const NOTIF_ICONS: Record<string, React.ComponentType<any>> = {
  nova_proposta:   Package,
  contraproposta:  RefreshCw,
  booking_aceito:  CheckCircle,
  booking_recusado: XCircle,
  nova_mensagem:   Bell,
};

export function NotificationDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data: notifs = [], refetch } = trpc.notifs.getMyNotifications.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const { data: unreadCount = 0 } = trpc.notifs.getUnreadCount.useQuery(undefined, {
    refetchInterval: 30000,
  });
  const markOne  = trpc.notifs.markAsRead.useMutation({ onSuccess: () => refetch() });
  const markAll  = trpc.notifs.markAllAsRead.useMutation({ onSuccess: () => refetch() });

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          position: "relative",
          padding: "7px 10px",
          background: open ? "var(--ouro-sutil)" : "var(--terra)",
          border: `1px solid ${open ? "rgba(212,146,10,0.40)" : "var(--creme-10)"}`,
          borderRadius: "var(--radius-md)",
          color: open ? "var(--ouro)" : "var(--creme-50)",
          cursor: "pointer",
          display: "flex", alignItems: "center",
          transition: "var(--transition)",
        }}
        onMouseEnter={e => { if (!open) { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.30)"; (e.currentTarget as HTMLElement).style.color = "var(--creme)"; } }}
        onMouseLeave={e => { if (!open) { (e.currentTarget as HTMLElement).style.borderColor = "var(--creme-10)"; (e.currentTarget as HTMLElement).style.color = "var(--creme-50)"; } }}
      >
        <Bell style={{ width: 16, height: 16 }} />
        {unreadCount > 0 && (
          <span style={{
            position: "absolute", top: -5, right: -5,
            minWidth: 16, height: 16,
            background: "#EF4444",
            color: "white",
            borderRadius: 999, fontSize: 9, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px",
          }}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 200,
          width: 340, maxHeight: 440,
          background: "rgba(20,16,8,0.98)", backdropFilter: "blur(20px)",
          border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
          display: "flex", flexDirection: "column",
          overflow: "hidden",
        }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid var(--creme-10)" }}>
            <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--creme)" }}>Notificações</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAll.mutate()}
                style={{ fontSize: "var(--text-xs)", color: "var(--ouro)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* List */}
          <div style={{ overflowY: "auto", flex: 1 }}>
            {notifs.length === 0 ? (
              <div style={{ padding: "32px 16px", textAlign: "center" }}>
                <BellOff style={{ width: 28, height: 28, color: "var(--creme-50)", margin: "0 auto 10px", opacity: 0.4 }} />
                <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)", fontFamily: "var(--font-body)" }}>
                  Nenhuma notificação
                </p>
              </div>
            ) : (
              notifs.map((n: any) => {
                const Icon = NOTIF_ICONS[n.type] ?? Bell;
                return (
                  <div
                    key={n.id}
                    onClick={() => { if (!n.isRead) markOne.mutate({ id: n.id }); if (n.link) { setOpen(false); window.location.href = n.link; } }}
                    style={{
                      display: "flex", gap: 10, padding: "12px 16px",
                      cursor: n.link ? "pointer" : "default",
                      background: n.isRead ? "transparent" : "rgba(212,146,10,0.05)",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      transition: "var(--transition)",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = n.isRead ? "transparent" : "rgba(212,146,10,0.05)"; }}
                  >
                    <div style={{
                      width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                      background: n.isRead ? "var(--terra)" : "var(--ouro-sutil)",
                      border: `1px solid ${n.isRead ? "var(--creme-10)" : "rgba(212,146,10,0.25)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <Icon style={{ width: 13, height: 13, color: n.isRead ? "var(--creme-50)" : "var(--ouro)" }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "var(--text-xs)", fontWeight: n.isRead ? 500 : 700, color: "var(--creme)", marginBottom: 2 }}>
                        {n.title}
                      </div>
                      <p style={{ fontSize: 11, color: "var(--creme-50)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {n.message}
                      </p>
                      <div style={{ fontSize: 10, color: "var(--creme-50)", marginTop: 3, opacity: 0.7 }}>
                        {relTime(n.createdAt)}
                      </div>
                    </div>
                    {!n.isRead && (
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--ouro)", flexShrink: 0, marginTop: 6 }} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
