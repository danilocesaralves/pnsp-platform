import { useState } from "react";
import { trpc } from "@/lib/trpc";

// ─── Types ────────────────────────────────────────────────────────────────────
type SponsorStatus = "prospecto" | "proposta_enviada" | "em_negociacao" | "fechado" | "recusado";

interface Sponsor {
  id: number;
  companyName: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  website?: string | null;
  logoUrl?: string | null;
  proposalValue?: number | null;
  finalValue?: number | null;
  status: SponsorStatus;
  notes?: string | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
}

interface Deliverable {
  id: number;
  sponsorId: number;
  description: string;
  dueDate?: string | null;
  isDone: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtBRL(cents: number | null | undefined): string {
  if (cents == null) return "—";
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

const STATUS_ORDER: SponsorStatus[] = [
  "prospecto",
  "proposta_enviada",
  "em_negociacao",
  "fechado",
  "recusado",
];

const STATUS_LABEL: Record<SponsorStatus, string> = {
  prospecto: "Prospecto",
  proposta_enviada: "Proposta Enviada",
  em_negociacao: "Em Negociação",
  fechado: "Fechado",
  recusado: "Recusado",
};

const STATUS_COLOR: Record<SponsorStatus, string> = {
  prospecto: "#6b7280",
  proposta_enviada: "#3b82f6",
  em_negociacao: "#f59e0b",
  fechado: "#10b981",
  recusado: "#ef4444",
};

// ─── SponsorStatusBadge ───────────────────────────────────────────────────────
export function SponsorStatusBadge({ status }: { status: SponsorStatus }) {
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "4px",
      padding: "2px 10px",
      borderRadius: "999px",
      fontSize: "0.72rem",
      fontWeight: 600,
      letterSpacing: "0.03em",
      background: STATUS_COLOR[status] + "22",
      color: STATUS_COLOR[status],
      border: `1px solid ${STATUS_COLOR[status]}44`,
    }}>
      {STATUS_LABEL[status]}
    </span>
  );
}

// ─── SponsorPipeline ──────────────────────────────────────────────────────────
export function SponsorPipeline({ stats }: {
  stats: { status: SponsorStatus; count: number; total: number }[];
}) {
  const byStatus = Object.fromEntries(
    STATUS_ORDER.map(s => [s, stats.find(r => r.status === s) ?? { status: s, count: 0, total: 0 }])
  );

  return (
    <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
      {STATUS_ORDER.map(s => (
        <div key={s} style={{
          flex: "1 0 140px",
          minWidth: "140px",
          background: "var(--terra-escura, #120e00)",
          border: `1px solid ${STATUS_COLOR[s]}44`,
          borderTop: `3px solid ${STATUS_COLOR[s]}`,
          borderRadius: "var(--radius-md, 8px)",
          padding: "12px",
        }}>
          <div style={{ fontSize: "0.72rem", color: STATUS_COLOR[s], fontWeight: 600, marginBottom: "6px" }}>
            {STATUS_LABEL[s]}
          </div>
          <div style={{ fontSize: "1.4rem", fontWeight: 700, color: "var(--creme, #f5e6c8)" }}>
            {byStatus[s].count}
          </div>
          <div style={{ fontSize: "0.72rem", color: "var(--creme-50, rgba(245,230,200,0.5))", marginTop: "2px" }}>
            {fmtBRL(byStatus[s].total)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── DeliverableItem ──────────────────────────────────────────────────────────
function DeliverableItem({ d, onToggle }: { d: Deliverable; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "8px 12px",
        borderRadius: "var(--radius-md, 8px)",
        background: d.isDone ? "rgba(16,185,129,0.08)" : "var(--terra-escura, #120e00)",
        border: `1px solid ${d.isDone ? "rgba(16,185,129,0.3)" : "rgba(212,160,23,0.15)"}`,
        cursor: "pointer",
        transition: "opacity 0.15s",
      }}
    >
      <div style={{
        width: "18px",
        height: "18px",
        borderRadius: "4px",
        border: `2px solid ${d.isDone ? "#10b981" : "rgba(212,160,23,0.4)"}`,
        background: d.isDone ? "#10b981" : "transparent",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px",
        color: "#fff",
      }}>
        {d.isDone ? "✓" : ""}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{
          fontSize: "0.85rem",
          color: d.isDone ? "var(--creme-50, rgba(245,230,200,0.5))" : "var(--creme, #f5e6c8)",
          textDecoration: d.isDone ? "line-through" : "none",
        }}>
          {d.description}
        </div>
        {d.dueDate && (
          <div style={{ fontSize: "0.72rem", color: "var(--creme-50, rgba(245,230,200,0.5))", marginTop: "2px" }}>
            Prazo: {new Date(d.dueDate + "T12:00:00").toLocaleDateString("pt-BR")}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SponsorCard ──────────────────────────────────────────────────────────────
export function SponsorCard({ sponsor, onClick }: { sponsor: Sponsor; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--terra-escura, #120e00)",
        border: "1px solid rgba(212,160,23,0.15)",
        borderRadius: "var(--radius-md, 8px)",
        padding: "16px",
        cursor: "pointer",
        transition: "border-color 0.15s",
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(212,160,23,0.4)")}
      onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(212,160,23,0.15)")}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {sponsor.logoUrl ? (
            <img
              src={sponsor.logoUrl}
              alt={sponsor.companyName}
              style={{ width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover" }}
            />
          ) : (
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "var(--ouro-sutil, rgba(212,160,23,0.1))",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.1rem",
              fontWeight: 700,
              color: "var(--ouro, #D4A017)",
            }}>
              {sponsor.companyName.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 600, color: "var(--creme, #f5e6c8)", fontSize: "0.95rem" }}>
              {sponsor.companyName}
            </div>
            {sponsor.contactName && (
              <div style={{ fontSize: "0.8rem", color: "var(--creme-50, rgba(245,230,200,0.5))" }}>
                {sponsor.contactName}
              </div>
            )}
          </div>
        </div>
        <SponsorStatusBadge status={sponsor.status} />
      </div>
      {(sponsor.proposalValue || sponsor.finalValue) && (
        <div style={{
          marginTop: "12px",
          paddingTop: "10px",
          borderTop: "1px solid rgba(212,160,23,0.1)",
          display: "flex",
          gap: "16px",
        }}>
          {sponsor.proposalValue != null && (
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--creme-50, rgba(245,230,200,0.5))", marginBottom: "2px" }}>Proposta</div>
              <div style={{ fontSize: "0.85rem", color: "var(--ouro, #D4A017)", fontWeight: 600 }}>
                {fmtBRL(sponsor.proposalValue)}
              </div>
            </div>
          )}
          {sponsor.finalValue != null && (
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--creme-50, rgba(245,230,200,0.5))", marginBottom: "2px" }}>Fechado</div>
              <div style={{ fontSize: "0.85rem", color: "#10b981", fontWeight: 600 }}>
                {fmtBRL(sponsor.finalValue)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── SponsorDetail ────────────────────────────────────────────────────────────
export function SponsorDetail({ sponsorId, onBack }: { sponsorId: number; onBack: () => void }) {
  const utils = trpc.useUtils();
  const [newDesc, setNewDesc] = useState("");
  const [newDue, setNewDue] = useState("");
  const [showAddDel, setShowAddDel] = useState(false);
  const [editStatus, setEditStatus] = useState(false);
  const [editNotes, setEditNotes] = useState(false);
  const [notesVal, setNotesVal] = useState("");

  const { data: sponsor, isLoading } = trpc.sponsors.getById.useQuery({ sponsorId });

  const addDeliverable = trpc.sponsors.addDeliverable.useMutation({
    onSuccess: () => {
      utils.sponsors.getById.invalidate({ sponsorId });
      setNewDesc("");
      setNewDue("");
      setShowAddDel(false);
    },
  });

  const toggleDeliverable = trpc.sponsors.toggleDeliverable.useMutation({
    onSuccess: () => utils.sponsors.getById.invalidate({ sponsorId }),
  });

  const updateSponsor = trpc.sponsors.update.useMutation({
    onSuccess: () => {
      utils.sponsors.getById.invalidate({ sponsorId });
      utils.sponsors.getMySponsors.invalidate();
      utils.sponsors.getPipelineStats.invalidate();
      setEditStatus(false);
      setEditNotes(false);
    },
  });

  if (isLoading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--creme-50, rgba(245,230,200,0.5))" }}>
        Carregando...
      </div>
    );
  }

  if (!sponsor) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "var(--creme-50, rgba(245,230,200,0.5))" }}>
        Patrocinador não encontrado.
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
        <button
          onClick={onBack}
          style={{ background: "none", border: "none", color: "var(--ouro, #D4A017)", cursor: "pointer", fontSize: "1.2rem", padding: "4px" }}
        >
          ←
        </button>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, color: "var(--creme, #f5e6c8)", fontSize: "1.1rem", fontWeight: 700 }}>
            {sponsor.companyName}
          </h3>
          <SponsorStatusBadge status={sponsor.status} />
        </div>
      </div>

      {/* Info */}
      <div style={{
        background: "var(--terra-escura, #120e00)",
        border: "1px solid rgba(212,160,23,0.15)",
        borderRadius: "var(--radius-md, 8px)",
        padding: "16px",
        marginBottom: "16px",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "12px" }}>
          {sponsor.contactName && (
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--creme-50, rgba(245,230,200,0.5))", marginBottom: "2px" }}>Contato</div>
              <div style={{ fontSize: "0.85rem", color: "var(--creme, #f5e6c8)" }}>{sponsor.contactName}</div>
            </div>
          )}
          {sponsor.contactEmail && (
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--creme-50, rgba(245,230,200,0.5))", marginBottom: "2px" }}>E-mail</div>
              <div style={{ fontSize: "0.85rem", color: "var(--creme, #f5e6c8)" }}>{sponsor.contactEmail}</div>
            </div>
          )}
          {sponsor.contactPhone && (
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--creme-50, rgba(245,230,200,0.5))", marginBottom: "2px" }}>Telefone</div>
              <div style={{ fontSize: "0.85rem", color: "var(--creme, #f5e6c8)" }}>{sponsor.contactPhone}</div>
            </div>
          )}
          {sponsor.website && (
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--creme-50, rgba(245,230,200,0.5))", marginBottom: "2px" }}>Website</div>
              <div style={{ fontSize: "0.85rem", color: "var(--ouro, #D4A017)" }}>{sponsor.website}</div>
            </div>
          )}
        </div>

        {/* Valores */}
        <div style={{ display: "flex", gap: "16px", paddingTop: "10px", borderTop: "1px solid rgba(212,160,23,0.1)" }}>
          {sponsor.proposalValue != null && (
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--creme-50, rgba(245,230,200,0.5))", marginBottom: "2px" }}>Proposta</div>
              <div style={{ fontSize: "1rem", color: "var(--ouro, #D4A017)", fontWeight: 700 }}>{fmtBRL(sponsor.proposalValue)}</div>
            </div>
          )}
          {sponsor.finalValue != null && (
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--creme-50, rgba(245,230,200,0.5))", marginBottom: "2px" }}>Valor Fechado</div>
              <div style={{ fontSize: "1rem", color: "#10b981", fontWeight: 700 }}>{fmtBRL(sponsor.finalValue)}</div>
            </div>
          )}
        </div>
      </div>

      {/* Status */}
      <div style={{
        background: "var(--terra-escura, #120e00)",
        border: "1px solid rgba(212,160,23,0.15)",
        borderRadius: "var(--radius-md, 8px)",
        padding: "16px",
        marginBottom: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: editStatus ? "12px" : 0 }}>
          <span style={{ fontSize: "0.8rem", color: "var(--creme-50, rgba(245,230,200,0.5))", fontWeight: 600 }}>
            STATUS DO PIPELINE
          </span>
          <button
            onClick={() => setEditStatus(v => !v)}
            style={{ background: "none", border: "none", color: "var(--ouro, #D4A017)", cursor: "pointer", fontSize: "0.8rem" }}
          >
            {editStatus ? "Cancelar" : "Alterar"}
          </button>
        </div>
        {editStatus && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {STATUS_ORDER.map(s => (
              <button
                key={s}
                onClick={() => updateSponsor.mutate({ sponsorId, data: { status: s } })}
                style={{
                  padding: "4px 12px",
                  borderRadius: "999px",
                  border: `1px solid ${STATUS_COLOR[s]}`,
                  background: sponsor.status === s ? STATUS_COLOR[s] + "33" : "transparent",
                  color: STATUS_COLOR[s],
                  cursor: "pointer",
                  fontSize: "0.78rem",
                  fontWeight: 600,
                }}
              >
                {STATUS_LABEL[s]}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Notas */}
      <div style={{
        background: "var(--terra-escura, #120e00)",
        border: "1px solid rgba(212,160,23,0.15)",
        borderRadius: "var(--radius-md, 8px)",
        padding: "16px",
        marginBottom: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: editNotes ? "10px" : 0 }}>
          <span style={{ fontSize: "0.8rem", color: "var(--creme-50, rgba(245,230,200,0.5))", fontWeight: 600 }}>
            NOTAS
          </span>
          <button
            onClick={() => {
              if (!editNotes) setNotesVal(sponsor.notes ?? "");
              setEditNotes(v => !v);
            }}
            style={{ background: "none", border: "none", color: "var(--ouro, #D4A017)", cursor: "pointer", fontSize: "0.8rem" }}
          >
            {editNotes ? "Cancelar" : "Editar"}
          </button>
        </div>
        {editNotes ? (
          <div>
            <textarea
              value={notesVal}
              onChange={e => setNotesVal(e.target.value)}
              rows={4}
              style={{
                width: "100%",
                background: "rgba(212,160,23,0.05)",
                border: "1px solid rgba(212,160,23,0.25)",
                borderRadius: "6px",
                padding: "8px",
                color: "var(--creme, #f5e6c8)",
                fontSize: "0.85rem",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={() => updateSponsor.mutate({ sponsorId, data: { notes: notesVal } })}
              disabled={updateSponsor.isPending}
              className="pnsp-btn-primary"
              style={{ marginTop: "8px", width: "100%", padding: "8px" }}
            >
              Salvar Notas
            </button>
          </div>
        ) : (
          <div style={{ fontSize: "0.85rem", color: "var(--creme, #f5e6c8)", whiteSpace: "pre-wrap", marginTop: editNotes ? 0 : "8px" }}>
            {sponsor.notes || <span style={{ color: "var(--creme-50, rgba(245,230,200,0.5))" }}>Sem notas.</span>}
          </div>
        )}
      </div>

      {/* Contrapartidas */}
      <div style={{
        background: "var(--terra-escura, #120e00)",
        border: "1px solid rgba(212,160,23,0.15)",
        borderRadius: "var(--radius-md, 8px)",
        padding: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
          <span style={{ fontSize: "0.8rem", color: "var(--creme-50, rgba(245,230,200,0.5))", fontWeight: 600 }}>
            CONTRAPARTIDAS ({sponsor.deliverables?.length ?? 0})
          </span>
          <button
            onClick={() => setShowAddDel(v => !v)}
            style={{ background: "none", border: "none", color: "var(--ouro, #D4A017)", cursor: "pointer", fontSize: "0.8rem" }}
          >
            {showAddDel ? "Cancelar" : "+ Adicionar"}
          </button>
        </div>

        {showAddDel && (
          <div style={{
            background: "rgba(212,160,23,0.05)",
            border: "1px solid rgba(212,160,23,0.2)",
            borderRadius: "6px",
            padding: "12px",
            marginBottom: "12px",
          }}>
            <input
              type="text"
              placeholder="Descrição da contrapartida..."
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid rgba(212,160,23,0.25)",
                borderRadius: "6px",
                padding: "7px 10px",
                color: "var(--creme, #f5e6c8)",
                fontSize: "0.85rem",
                marginBottom: "8px",
                boxSizing: "border-box",
              }}
            />
            <input
              type="date"
              value={newDue}
              onChange={e => setNewDue(e.target.value)}
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid rgba(212,160,23,0.25)",
                borderRadius: "6px",
                padding: "7px 10px",
                color: "var(--creme, #f5e6c8)",
                fontSize: "0.85rem",
                marginBottom: "8px",
                boxSizing: "border-box",
              }}
            />
            <button
              onClick={() => {
                if (!newDesc.trim()) return;
                addDeliverable.mutate({
                  sponsorId,
                  description: newDesc.trim(),
                  dueDate: newDue || undefined,
                });
              }}
              disabled={addDeliverable.isPending || !newDesc.trim()}
              className="pnsp-btn-primary"
              style={{ width: "100%", padding: "8px" }}
            >
              Adicionar
            </button>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {sponsor.deliverables?.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--creme-50, rgba(245,230,200,0.5))", fontSize: "0.85rem", padding: "12px 0" }}>
              Nenhuma contrapartida cadastrada.
            </div>
          )}
          {sponsor.deliverables?.map(d => (
            <DeliverableItem
              key={d.id}
              d={d}
              onToggle={() => toggleDeliverable.mutate({ deliverableId: d.id })}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── NewSponsorForm ───────────────────────────────────────────────────────────
export function NewSponsorForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const utils = trpc.useUtils();
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [proposalValue, setProposalValue] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const create = trpc.sponsors.create.useMutation({
    onSuccess: () => {
      utils.sponsors.getMySponsors.invalidate();
      utils.sponsors.getPipelineStats.invalidate();
      onSuccess();
    },
    onError: (e) => setError(e.message),
  });

  function parseBRL(val: string): number | undefined {
    const n = parseFloat(val.replace(",", "."));
    if (isNaN(n)) return undefined;
    return Math.round(n * 100);
  }

  function handleSubmit() {
    setError("");
    if (!companyName.trim()) { setError("Nome da empresa é obrigatório."); return; }
    create.mutate({
      companyName: companyName.trim(),
      contactName: contactName.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
      website: website.trim() || undefined,
      proposalValue: parseBRL(proposalValue),
      notes: notes.trim() || undefined,
    });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "transparent",
    border: "1px solid rgba(212,160,23,0.25)",
    borderRadius: "6px",
    padding: "8px 12px",
    color: "var(--creme, #f5e6c8)",
    fontSize: "0.85rem",
    boxSizing: "border-box",
  };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "10px" }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--creme-50, rgba(245,230,200,0.5))", display: "block", marginBottom: "4px" }}>
            Empresa *
          </label>
          <input
            type="text"
            value={companyName}
            onChange={e => setCompanyName(e.target.value)}
            placeholder="Nome da empresa"
            style={inputStyle}
          />
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--creme-50, rgba(245,230,200,0.5))", display: "block", marginBottom: "4px" }}>
            Contato
          </label>
          <input type="text" value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Nome do contato" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--creme-50, rgba(245,230,200,0.5))", display: "block", marginBottom: "4px" }}>
            E-mail
          </label>
          <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="email@empresa.com" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--creme-50, rgba(245,230,200,0.5))", display: "block", marginBottom: "4px" }}>
            Telefone
          </label>
          <input type="tel" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="(11) 99999-9999" style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--creme-50, rgba(245,230,200,0.5))", display: "block", marginBottom: "4px" }}>
            Website
          </label>
          <input type="url" value={website} onChange={e => setWebsite(e.target.value)} placeholder="https://..." style={inputStyle} />
        </div>
        <div>
          <label style={{ fontSize: "0.75rem", color: "var(--creme-50, rgba(245,230,200,0.5))", display: "block", marginBottom: "4px" }}>
            Valor da proposta (R$)
          </label>
          <input type="number" value={proposalValue} onChange={e => setProposalValue(e.target.value)} placeholder="5000.00" style={inputStyle} />
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <label style={{ fontSize: "0.75rem", color: "var(--creme-50, rgba(245,230,200,0.5))", display: "block", marginBottom: "4px" }}>
            Notas
          </label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={3}
            placeholder="Informações adicionais..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
      </div>

      {error && (
        <div style={{ color: "#ef4444", fontSize: "0.8rem", marginBottom: "10px" }}>{error}</div>
      )}

      <div style={{ display: "flex", gap: "8px" }}>
        <button
          onClick={handleSubmit}
          disabled={create.isPending}
          className="pnsp-btn-primary"
          style={{ flex: 1, padding: "10px" }}
        >
          {create.isPending ? "Salvando..." : "Adicionar Patrocinador"}
        </button>
        <button
          onClick={onCancel}
          style={{
            flex: 1,
            padding: "10px",
            background: "transparent",
            border: "1px solid rgba(212,160,23,0.3)",
            borderRadius: "var(--radius-md, 8px)",
            color: "var(--creme-50, rgba(245,230,200,0.5))",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}
