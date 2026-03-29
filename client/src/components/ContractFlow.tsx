import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  FileText, CheckCircle, Clock, XCircle, Ban,
  Send, Printer, ChevronDown, ChevronUp,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ContractStatus = "rascunho" | "aguardando_assinatura" | "assinado" | "cancelado";

// ─── ContractStatusBadge ──────────────────────────────────────────────────────
const STATUS_CFG: Record<ContractStatus, { label: string; color: string; bg: string; border: string }> = {
  rascunho:              { label: "Rascunho",              color: "#9CA3AF", bg: "rgba(107,107,107,0.12)", border: "rgba(107,107,107,0.25)" },
  aguardando_assinatura: { label: "Aguardando Assinatura", color: "#60A5FA", bg: "rgba(37,99,235,0.12)",  border: "rgba(37,99,235,0.25)"   },
  assinado:              { label: "Assinado",              color: "#4ADE80", bg: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.25)"   },
  cancelado:             { label: "Cancelado",             color: "#9CA3AF", bg: "rgba(42,42,42,0.20)",   border: "rgba(42,42,42,0.40)"    },
};

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
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

// ─── ContractCard ─────────────────────────────────────────────────────────────
export function ContractCard({ contract, onClick }: { contract: any; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: "var(--terra)",
        border: "1px solid var(--creme-10)",
        borderRadius: "var(--radius-md)",
        padding: "16px 20px",
        cursor: "pointer",
        transition: "var(--transition)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.30)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--creme-10)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--ouro-sutil)", border: "1px solid rgba(212,146,10,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FileText style={{ width: 16, height: 16, color: "var(--ouro)" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {contract.title}
          </div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", marginTop: 2 }}>
            {contract.ownerProfile?.displayName ?? ""}
            {contract.counterpartProfile ? ` ↔ ${contract.counterpartProfile.displayName}` : ""}
          </div>
          <div style={{ fontSize: 10, color: "var(--creme-50)", marginTop: 2 }}>
            {new Date(contract.updatedAt).toLocaleDateString("pt-BR")}
          </div>
        </div>
      </div>
      <ContractStatusBadge status={contract.status as ContractStatus} />
    </div>
  );
}

// ─── TemplateSelector ─────────────────────────────────────────────────────────
export function TemplateSelector({ templates, onSelect }: { templates: any[]; onSelect: (t: any) => void }) {
  const typeLabel: Record<string, string> = {
    show: "Show", producao: "Produção Musical", aula: "Aula/Oficina",
    parceria: "Parceria", patrocinio: "Patrocínio", fornecedor: "Fornecedor", outro: "Outro",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)", marginBottom: 4, fontFamily: "var(--font-body)" }}>
        Selecione um template para começar:
      </p>
      {templates.map(t => (
        <div
          key={t.id}
          onClick={() => onSelect(t)}
          style={{
            background: "var(--terra)",
            border: "1px solid var(--creme-10)",
            borderRadius: "var(--radius-md)",
            padding: "16px 20px",
            cursor: "pointer",
            transition: "var(--transition)",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.40)"; (e.currentTarget as HTMLElement).style.background = "var(--terra-escura)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--creme-10)"; (e.currentTarget as HTMLElement).style.background = "var(--terra)"; }}
        >
          <div style={{ fontWeight: 600, fontSize: "var(--text-sm)", marginBottom: 4 }}>{t.name}</div>
          <div style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>{typeLabel[t.type] ?? t.type}</div>
        </div>
      ))}
      <div
        onClick={() => onSelect(null)}
        style={{
          background: "transparent",
          border: "1px dashed var(--creme-10)",
          borderRadius: "var(--radius-md)",
          padding: "16px 20px",
          cursor: "pointer",
          transition: "var(--transition)",
          textAlign: "center",
          fontSize: "var(--text-sm)",
          color: "var(--creme-50)",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.30)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "var(--creme-10)"; }}
      >
        Começar do zero (contrato em branco)
      </div>
    </div>
  );
}

// ─── ContractPreview ──────────────────────────────────────────────────────────
export function ContractPreview({ htmlContent }: { htmlContent: string }) {
  return (
    <div
      style={{
        background: "white",
        color: "#1a1a1a",
        borderRadius: "var(--radius-md)",
        padding: "40px 48px",
        fontFamily: "Georgia, serif",
        fontSize: 14,
        lineHeight: 1.8,
        border: "1px solid var(--creme-10)",
        maxHeight: 500,
        overflowY: "auto",
      }}
      className="contract-preview"
      dangerouslySetInnerHTML={{ __html: htmlContent }}
    />
  );
}

// ─── SignatureModal ───────────────────────────────────────────────────────────
export function SignatureModal({ contractId, onSigned, onClose }: { contractId: number; onSigned: () => void; onClose: () => void }) {
  const [name,    setName]    = useState("");
  const [doc,     setDoc]     = useState("");
  const [agreed,  setAgreed]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [signedAt, setSignedAt] = useState<string>("");

  const sign = trpc.contracts.sign.useMutation({
    onSuccess: () => {
      setSuccess(true);
      setSignedAt(new Date().toLocaleString("pt-BR"));
      onSigned();
    },
    onError: (e) => toast.error(e.message),
  });

  const inpSt: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(212,146,10,0.20)",
    borderRadius: 8,
    padding: "10px 12px",
    fontSize: 14,
    color: "var(--creme)",
    outline: "none",
    fontFamily: "var(--font-body)",
    boxSizing: "border-box",
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.75)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 16,
    }}>
      <div style={{
        background: "var(--terra)",
        border: "1px solid rgba(212,146,10,0.25)",
        borderRadius: "var(--radius-lg)",
        padding: 32,
        width: "100%",
        maxWidth: 440,
      }}>
        {success ? (
          <div style={{ textAlign: "center" }}>
            <CheckCircle style={{ width: 48, height: 48, color: "#4ADE80", margin: "0 auto 16px" }} />
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 8, color: "var(--creme)" }}>
              Contrato Assinado!
            </h3>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)", fontFamily: "var(--font-body)", marginBottom: 8 }}>
              Assinado por: <strong style={{ color: "var(--creme)" }}>{name}</strong>
            </p>
            <p style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", fontFamily: "var(--font-body)" }}>
              {signedAt}
            </p>
            <button
              onClick={onClose}
              className="pnsp-btn-primary"
              style={{ marginTop: 24, padding: "10px 28px", fontSize: "var(--text-sm)" }}
            >
              Fechar
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 20, color: "var(--creme)" }}>
              Assinar Contrato
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase" }}>
                  Nome completo *
                </label>
                <input style={inpSt} placeholder="Seu nome completo" value={name} onChange={e => setName(e.target.value)}
                  onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.50)"; }}
                  onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.20)"; }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase" }}>
                  CPF / CNPJ *
                </label>
                <input style={inpSt} placeholder="000.000.000-00" value={doc} onChange={e => setDoc(e.target.value)}
                  onFocus={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.50)"; }}
                  onBlur={e => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.20)"; }} />
              </div>
              <div
                onClick={() => setAgreed(v => !v)}
                style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer", userSelect: "none" }}
              >
                <div style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0, marginTop: 1,
                  background: agreed ? "var(--ouro)" : "transparent",
                  border: `1.5px solid ${agreed ? "var(--ouro)" : "var(--creme-20)"}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "var(--transition)",
                }}>
                  {agreed && <span style={{ color: "var(--preto)", fontSize: 11, fontWeight: 900 }}>✓</span>}
                </div>
                <span style={{ fontSize: "var(--text-xs)", color: "var(--creme-80)", lineHeight: 1.5, fontFamily: "var(--font-body)" }}>
                  Li e concordo com todos os termos e cláusulas deste contrato, e assino com validade legal conforme MP 2.200-2/2001.
                </span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
              <button onClick={onClose}
                style={{ flex: 1, padding: "10px", borderRadius: 8, border: "1px solid var(--creme-20)", background: "none", color: "var(--creme-80)", cursor: "pointer", fontSize: 14, fontFamily: "var(--font-body)" }}>
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (!name.trim()) { toast.error("Informe seu nome"); return; }
                  if (!doc.trim())  { toast.error("Informe CPF/CNPJ"); return; }
                  if (!agreed)      { toast.error("Marque que li e concordo"); return; }
                  sign.mutate({ contractId, signerName: name.trim(), signerDocument: doc.trim() });
                }}
                disabled={sign.isPending}
                className="pnsp-btn-primary"
                style={{ flex: 1, padding: "10px", fontSize: 14, opacity: sign.isPending ? 0.7 : 1 }}
              >
                {sign.isPending ? "Assinando..." : "Assinar Contrato"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── ContractDetail ───────────────────────────────────────────────────────────
export function ContractDetail({
  contractId,
  currentProfileId,
  onBack,
}: {
  contractId: number;
  currentProfileId: number;
  onBack: () => void;
}) {
  const [showSignModal, setShowSignModal] = useState(false);
  const utils = trpc.useUtils();

  const { data: contract, isLoading } = trpc.contracts.getById.useQuery({ contractId });
  const sendForSignature = trpc.contracts.sendForSignature.useMutation({
    onSuccess: () => {
      toast.success("Enviado para assinatura!");
      utils.contracts.getById.invalidate({ contractId });
      utils.contracts.getMyContracts.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });
  const cancel = trpc.contracts.cancel.useMutation({
    onSuccess: () => {
      toast.success("Contrato cancelado");
      utils.contracts.getById.invalidate({ contractId });
      utils.contracts.getMyContracts.invalidate();
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

  if (!contract) {
    return (
      <div style={{ textAlign: "center", padding: 48, color: "var(--creme-50)" }}>
        <p>Contrato não encontrado</p>
        <button onClick={onBack} style={{ marginTop: 16, color: "var(--ouro)", background: "none", border: "none", cursor: "pointer" }}>← Voltar</button>
      </div>
    );
  }

  const isOwner       = contract.profileId       === currentProfileId;
  const isCounterpart = contract.counterpartProfileId === currentProfileId;
  const status        = contract.status as ContractStatus;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <button onClick={onBack}
          style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--creme-50)", cursor: "pointer", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)" }}>
          ← Voltar
        </button>
        <ContractStatusBadge status={status} />
      </div>

      <div style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-lg)", padding: 24 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, marginBottom: 4 }}>{contract.title}</h2>
        <div style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>
          {contract.ownerProfile?.displayName ?? ""}{contract.counterpartProfile ? ` ↔ ${contract.counterpartProfile.displayName}` : ""}
        </div>
      </div>

      {/* Preview */}
      <ContractPreview htmlContent={contract.content} />

      {/* Assinatura info */}
      {status === "assinado" && (
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 20px", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "var(--radius-md)" }}>
          <CheckCircle style={{ width: 20, height: 20, color: "#4ADE80", flexShrink: 0 }} />
          <div>
            <div style={{ fontWeight: 700, color: "#4ADE80", fontSize: "var(--text-sm)" }}>Assinado com sucesso!</div>
            <div style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)" }}>
              Por: {contract.signerName} · {contract.signerDocument} · {contract.signedAt ? new Date(contract.signedAt).toLocaleString("pt-BR") : ""}
            </div>
          </div>
        </div>
      )}

      {/* Ações */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {isOwner && status === "rascunho" && (
          <button
            onClick={() => sendForSignature.mutate({ contractId })}
            disabled={sendForSignature.isPending}
            className="pnsp-btn-primary"
            style={{ padding: "10px 20px", fontSize: "var(--text-sm)" }}
          >
            <Send style={{ width: 14, height: 14 }} />
            Enviar para Assinatura
          </button>
        )}
        {(isCounterpart || isOwner) && status === "aguardando_assinatura" && (
          <button
            onClick={() => setShowSignModal(true)}
            className="pnsp-btn-primary"
            style={{ padding: "10px 20px", fontSize: "var(--text-sm)" }}
          >
            <CheckCircle style={{ width: 14, height: 14 }} />
            Assinar Contrato
          </button>
        )}
        <button
          onClick={() => {
            const printContent = document.querySelector(".contract-preview")?.innerHTML ?? contract.content;
            const w = window.open("", "_blank");
            if (w) {
              w.document.write(`<html><head><style>body{font-family:Georgia,serif;padding:40px;color:#1a1a1a;line-height:1.8}@media print{body{padding:20px}}</style></head><body>${printContent}</body></html>`);
              w.document.close();
              w.print();
            }
          }}
          style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid var(--creme-20)", background: "none", color: "var(--creme-80)", cursor: "pointer", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          <Printer style={{ width: 14, height: 14 }} />
          Baixar / Imprimir
        </button>
        {!["assinado","cancelado"].includes(status) && (
          <button
            onClick={() => cancel.mutate({ contractId })}
            disabled={cancel.isPending}
            style={{ padding: "10px 20px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.20)", background: "none", color: "rgba(248,113,113,0.7)", cursor: "pointer", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)", display: "inline-flex", alignItems: "center", gap: 6 }}
          >
            <Ban style={{ width: 14, height: 14 }} />
            Cancelar
          </button>
        )}
      </div>

      {showSignModal && (
        <SignatureModal
          contractId={contractId}
          onSigned={() => utils.contracts.getMyContracts.invalidate()}
          onClose={() => setShowSignModal(false)}
        />
      )}
    </div>
  );
}

// ─── ContractEditor (variáveis) ───────────────────────────────────────────────
const VAR_FIELDS = [
  { key: "artista",     label: "Artista/Grupo"     },
  { key: "contratante", label: "Contratante"        },
  { key: "valor",       label: "Valor total"        },
  { key: "data",        label: "Data do evento"     },
  { key: "local",       label: "Local / Endereço"   },
  { key: "horario",     label: "Horário"            },
  { key: "duracao",     label: "Duração"            },
];

export function ContractEditor({
  template,
  onSave,
  onCancel,
}: {
  template: any | null;
  onSave: (title: string, content: string, templateId?: number) => void;
  onCancel: () => void;
}) {
  const [title,   setTitle]   = useState(template?.name ?? "");
  const [vars,    setVars]    = useState<Record<string, string>>(
    Object.fromEntries(VAR_FIELDS.map(f => [f.key, ""]))
  );
  const [rawHtml, setRawHtml] = useState(template?.content ?? "");
  const [preview, setPreview] = useState(false);

  function setVar(k: string, v: string) { setVars(prev => ({ ...prev, [k]: v })); }

  function applyVars(content: string): string {
    let result = content;
    for (const [k, v] of Object.entries(vars)) {
      if (v) result = result.replaceAll(`{{${k}}}`, v);
    }
    return result;
  }

  const finalContent = applyVars(rawHtml);

  const inpSt: React.CSSProperties = {
    width: "100%",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(212,146,10,0.15)",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    color: "var(--creme)",
    outline: "none",
    fontFamily: "var(--font-body)",
    boxSizing: "border-box",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Título */}
      <div>
        <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase" }}>
          Título do Contrato *
        </label>
        <input style={{ ...inpSt, fontSize: 15, padding: "10px 14px" }} placeholder="Ex: Contrato de Show — Festival Samba 2026"
          value={title} onChange={e => setTitle(e.target.value)} />
      </div>

      {/* Variáveis */}
      {template && (
        <div style={{ background: "var(--terra-escura)", border: "1px solid var(--creme-10)", borderRadius: "var(--radius-md)", padding: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ouro)", textTransform: "uppercase", marginBottom: 12 }}>
            Preencha as variáveis
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {VAR_FIELDS.map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: 10, fontWeight: 600, color: "var(--creme-50)", marginBottom: 4, textTransform: "uppercase" }}>{f.label}</label>
                <input style={inpSt} placeholder={`{{${f.key}}}`} value={vars[f.key] ?? ""} onChange={e => setVar(f.key, e.target.value)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* HTML editor */}
      {!template && (
        <div>
          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--creme-50)", marginBottom: 5, textTransform: "uppercase" }}>Conteúdo HTML</label>
          <textarea
            style={{ ...inpSt, resize: "vertical", minHeight: 200, fontFamily: "monospace" } as React.CSSProperties}
            value={rawHtml}
            onChange={e => setRawHtml(e.target.value)}
          />
        </div>
      )}

      {/* Preview toggle */}
      <button
        onClick={() => setPreview(v => !v)}
        style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "var(--ouro)", cursor: "pointer", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)", padding: 0 }}
      >
        {preview ? <ChevronUp style={{ width: 14, height: 14 }} /> : <ChevronDown style={{ width: 14, height: 14 }} />}
        {preview ? "Ocultar" : "Pré-visualizar"} contrato
      </button>

      {preview && <ContractPreview htmlContent={finalContent} />}

      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
        <button onClick={onCancel}
          style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid var(--creme-20)", background: "none", color: "var(--creme-80)", cursor: "pointer", fontSize: 14, fontFamily: "var(--font-body)" }}>
          Cancelar
        </button>
        <button
          onClick={() => {
            if (!title.trim()) { toast.error("Título é obrigatório"); return; }
            if (!finalContent.trim()) { toast.error("Conteúdo é obrigatório"); return; }
            onSave(title.trim(), finalContent, template?.id);
          }}
          className="pnsp-btn-primary"
          style={{ padding: "9px 24px", fontSize: 14 }}
        >
          <FileText style={{ width: 13, height: 13 }} /> Salvar Rascunho
        </button>
      </div>
    </div>
  );
}
