import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicLayout from "@/components/PublicLayout";
import {
  ContractCard, ContractDetail, TemplateSelector, ContractEditor,
} from "@/components/ContractFlow";
import { toast } from "sonner";
import { Loader2, FileText, Plus } from "lucide-react";

type Step = "list" | "template" | "editor" | "detail";

export default function Contracts() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();

  const [step, setStep]                 = useState<Step>("list");
  const [selectedId, setSelectedId]     = useState<number | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);

  const { data: myProfile } = trpc.profiles.getMyProfile.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );
  const { data: contracts = [], isLoading } = trpc.contracts.getMyContracts.useQuery(
    undefined,
    { enabled: isAuthenticated },
  );
  const { data: templates = [] } = trpc.contracts.getTemplates.useQuery();

  const create = trpc.contracts.create.useMutation({
    onSuccess: (c) => {
      toast.success("Contrato criado!");
      utils.contracts.getMyContracts.invalidate();
      setSelectedId(c.id);
      setStep("detail");
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

  return (
    <PublicLayout>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 80px" }}>

        {/* Header */}
        {step === "list" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28, gap: 16 }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-3xl)", fontWeight: 800, color: "var(--creme)", marginBottom: 4 }}>
                Contratos
              </h1>
              <p style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)" }}>
                Gerencie seus contratos e assinaturas digitais
              </p>
            </div>
            <button
              onClick={() => setStep("template")}
              className="pnsp-btn-primary"
              style={{ padding: "10px 20px", fontSize: "var(--text-sm)", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <Plus style={{ width: 14, height: 14 }} />
              Novo Contrato
            </button>
          </div>
        )}

        {/* ─── LISTA ────────────────────────────────────────────────────────── */}
        {step === "list" && (
          <>
            {isLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
                <Loader2 style={{ width: 24, height: 24, animation: "spin 1s linear infinite", color: "var(--ouro)" }} />
              </div>
            ) : contracts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 24px", background: "var(--terra)", border: "1px dashed var(--creme-10)", borderRadius: "var(--radius-lg)" }}>
                <FileText style={{ width: 40, height: 40, color: "var(--creme-50)", margin: "0 auto 16px", opacity: 0.4 }} />
                <p style={{ fontWeight: 700, color: "var(--creme)", marginBottom: 6 }}>Nenhum contrato ainda</p>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--creme-50)" }}>
                  Crie um contrato ou gere automaticamente a partir de um booking aceito
                </p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {(contracts as any[]).map((c) => (
                  <ContractCard
                    key={c.id}
                    contract={c}
                    onClick={() => { setSelectedId(c.id); setStep("detail"); }}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ─── TEMPLATE ─────────────────────────────────────────────────────── */}
        {step === "template" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <button
                onClick={() => setStep("list")}
                style={{ background: "none", border: "none", color: "var(--creme-50)", cursor: "pointer", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)" }}
              >
                ← Voltar
              </button>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--creme)" }}>
                Escolher Template
              </h2>
            </div>
            <TemplateSelector
              templates={templates as any[]}
              onSelect={(t) => {
                setSelectedTemplate(t);
                setStep("editor");
              }}
            />
          </div>
        )}

        {/* ─── EDITOR ───────────────────────────────────────────────────────── */}
        {step === "editor" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <button
                onClick={() => setStep("template")}
                style={{ background: "none", border: "none", color: "var(--creme-50)", cursor: "pointer", fontSize: "var(--text-sm)", fontFamily: "var(--font-body)" }}
              >
                ← Voltar
              </button>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-xl)", fontWeight: 700, color: "var(--creme)" }}>
                {selectedTemplate ? `Template: ${selectedTemplate.name}` : "Contrato em branco"}
              </h2>
            </div>
            <ContractEditor
              template={selectedTemplate}
              onSave={(title, content, templateId) => {
                create.mutate({
                  title,
                  content,
                  type: (selectedTemplate?.type ?? "outro") as any,
                  templateId: templateId ?? undefined,
                });
              }}
              onCancel={() => setStep("template")}
            />
          </div>
        )}

        {/* ─── DETALHE ──────────────────────────────────────────────────────── */}
        {step === "detail" && selectedId !== null && (
          <ContractDetail
            contractId={selectedId}
            currentProfileId={myProfile?.id ?? 0}
            onBack={() => { setStep("list"); setSelectedId(null); }}
          />
        )}
      </div>
    </PublicLayout>
  );
}
