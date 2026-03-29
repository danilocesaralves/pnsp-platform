import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import {
  TrendingUp, Lightbulb, Megaphone, FileText, Plus, X, Sparkles,
  Instagram, Youtube, ChevronRight, AlertCircle, Trophy, Target,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────
type MarketingCampaign = {
  id: number; title: string; objective: string; status: string;
  startDate?: string | null; endDate?: string | null; budget?: number | null;
};
type MarketingContent = {
  id: number; contentType: string; platform: string; status: string;
  title?: string | null; body?: string | null; isAiGenerated?: boolean | null;
  createdAt: string | Date;
};
type MarketingScore = { id: number; scoreType: string; score: number };
type MarketingInsight = {
  id: number; insightType: string; priority: string; title: string;
  description?: string | null; actionLabel?: string | null; actionUrl?: string | null;
};

// ─── ScoreGauge ──────────────────────────────────────────────────────────────
function ScoreGauge({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 80 ? "var(--verde)" : score >= 50 ? "var(--ouro)" : "#e55";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="130" height="80" viewBox="0 0 130 80">
        <path d="M 15 75 A 54 54 0 0 1 115 75" fill="none" stroke="var(--terra)" strokeWidth="10" />
        <path
          d="M 15 75 A 54 54 0 0 1 115 75"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={`${(score / 100) * (Math.PI * r)} ${Math.PI * r}`}
          strokeLinecap="round"
        />
        <text x="65" y="72" textAnchor="middle" fontSize="22" fontWeight="700" fill={color}>
          {score}
        </text>
      </svg>
      <span className="text-xs font-body" style={{ color: "var(--creme-50)" }}>Score de Marketing</span>
    </div>
  );
}

// ─── InsightCard ─────────────────────────────────────────────────────────────
function InsightCard({
  insight,
  onDismiss,
}: {
  insight: MarketingInsight;
  onDismiss: (id: number) => void;
}) {
  const priorityColor =
    insight.priority === "alta" ? "#e55" :
    insight.priority === "media" ? "var(--ouro)" : "var(--verde)";
  const icon =
    insight.insightType === "conquista" ? <Trophy size={16} style={{ color: "var(--verde)" }} /> :
    insight.insightType === "alerta" ? <AlertCircle size={16} style={{ color: "#e55" }} /> :
    insight.insightType === "oportunidade" ? <Target size={16} style={{ color: "var(--ouro)" }} /> :
    <Lightbulb size={16} style={{ color: "var(--ouro)" }} />;

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl" style={{ background: "var(--terra)", border: "1px solid var(--terra-200, #2a1f00)" }}>
      <div className="flex-shrink-0 mt-0.5">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-bold" style={{ color: "var(--creme)" }}>{insight.title}</span>
          <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: priorityColor + "22", color: priorityColor }}>
            {insight.priority}
          </span>
        </div>
        {insight.description && (
          <p className="text-xs leading-relaxed" style={{ color: "var(--creme-50)" }}>{insight.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(insight.id)}
        className="flex-shrink-0 p-1 rounded hover:opacity-70 transition-opacity"
        style={{ color: "var(--creme-50)" }}
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ─── CampaignCard ─────────────────────────────────────────────────────────────
function CampaignCard({ campaign }: { campaign: MarketingCampaign }) {
  const statusColor =
    campaign.status === "ativa" ? "var(--verde)" :
    campaign.status === "finalizada" ? "var(--creme-50)" :
    campaign.status === "pausada" ? "var(--ouro)" : "var(--creme-50)";

  return (
    <div className="p-3 rounded-xl flex items-center gap-3" style={{ background: "var(--terra)", border: "1px solid var(--terra-200, #2a1f00)" }}>
      <Megaphone size={18} style={{ color: "var(--ouro)", flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate" style={{ color: "var(--creme)" }}>{campaign.title}</p>
        <p className="text-xs" style={{ color: "var(--creme-50)" }}>{campaign.objective}</p>
      </div>
      <span className="text-xs font-semibold capitalize" style={{ color: statusColor }}>{campaign.status}</span>
    </div>
  );
}

// ─── ContentCard ─────────────────────────────────────────────────────────────
function ContentCard({ content }: { content: MarketingContent }) {
  const platformIcon =
    content.platform === "instagram" ? <Instagram size={14} /> :
    content.platform === "youtube" ? <Youtube size={14} /> :
    <FileText size={14} />;

  return (
    <div className="p-3 rounded-xl" style={{ background: "var(--terra)", border: "1px solid var(--terra-200, #2a1f00)" }}>
      <div className="flex items-center gap-2 mb-2">
        <span style={{ color: "var(--ouro)" }}>{platformIcon}</span>
        <span className="text-xs font-semibold capitalize" style={{ color: "var(--creme)" }}>{content.platform}</span>
        <span className="text-xs px-1.5 py-0.5 rounded-full ml-auto" style={{ background: "var(--n800)", color: "var(--creme-50)" }}>{content.contentType}</span>
        {content.isAiGenerated && (
          <span className="text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1" style={{ background: "var(--ouro)22", color: "var(--ouro)" }}>
            <Sparkles size={10} /> IA
          </span>
        )}
      </div>
      {content.body && (
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "var(--creme-50)" }}>{content.body}</p>
      )}
    </div>
  );
}

// ─── ContentGenerator ────────────────────────────────────────────────────────
function ContentGenerator({ profileId, onGenerated }: { profileId: number; onGenerated: () => void }) {
  const [contentType, setContentType] = useState<"post" | "story" | "reels" | "video" | "artigo" | "email">("post");
  const [platform, setPlatform] = useState<"instagram" | "facebook" | "youtube" | "tiktok" | "twitter" | "email" | "whatsapp">("instagram");

  const generate = trpc.marketing.generateContent.useMutation({
    onSuccess: () => {
      toast.success("Conteúdo gerado com IA!");
      onGenerated();
    },
    onError: (e) => toast.error(e.message),
  });

  return (
    <div className="p-4 rounded-xl" style={{ background: "var(--terra)", border: "1px solid var(--ouro)44" }}>
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={16} style={{ color: "var(--ouro)" }} />
        <span className="text-sm font-bold" style={{ color: "var(--ouro)" }}>Gerar com IA</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="text-xs mb-1 block" style={{ color: "var(--creme-50)" }}>Tipo</label>
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value as typeof contentType)}
            className="w-full text-sm px-2 py-1.5 rounded-lg border-0 outline-none"
            style={{ background: "var(--n900)", color: "var(--creme)" }}
          >
            {["post","story","reels","video","artigo","email"].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: "var(--creme-50)" }}>Plataforma</label>
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as typeof platform)}
            className="w-full text-sm px-2 py-1.5 rounded-lg border-0 outline-none"
            style={{ background: "var(--n900)", color: "var(--creme)" }}
          >
            {["instagram","facebook","youtube","tiktok","twitter","email","whatsapp"].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>
      <button
        onClick={() => generate.mutate({ profileId, contentType, platform })}
        disabled={generate.isPending}
        className="pnsp-btn-primary w-full text-sm py-2 flex items-center justify-center gap-2"
      >
        <Sparkles size={14} />
        {generate.isPending ? "Gerando..." : "Gerar Conteúdo"}
      </button>
    </div>
  );
}

// ─── Termômetro de Score ──────────────────────────────────────────────────────
function Termometro({ score }: { score: number }) {
  const bars = 10;
  const filled = Math.round((score / 100) * bars);
  return (
    <div className="flex items-end gap-1 h-8">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          className="rounded-t"
          style={{
            width: 6,
            height: 8 + i * 2.5,
            background: i < filled ? "var(--ouro)" : "var(--terra)",
          }}
        />
      ))}
    </div>
  );
}

// ─── MarketingDashboard (default export) ─────────────────────────────────────
export default function MarketingDashboard({ profileId }: { profileId: number }) {
  const [activeSection, setActiveSection] = useState<"overview" | "campaigns" | "contents">("overview");

  const campaignsQ = trpc.marketing.getMyCampaigns.useQuery({ profileId }, { enabled: !!profileId });
  const contentsQ = trpc.marketing.getMyContents.useQuery({ profileId }, { enabled: !!profileId });
  const insightsQ = trpc.marketing.getMyInsights.useQuery({ profileId }, { enabled: !!profileId });
  const scoresQ = trpc.marketing.getMyScores.useQuery({ profileId }, { enabled: !!profileId });

  const seedInsights = trpc.marketing.seedInsights.useMutation({
    onSuccess: (data) => {
      toast.success(`Score calculado: ${data.score}/100`);
      insightsQ.refetch();
      scoresQ.refetch();
    },
    onError: (e) => toast.error(e.message),
  });

  const dismissInsight = trpc.marketing.dismissInsight.useMutation({
    onSuccess: () => insightsQ.refetch(),
  });

  const overallScore = scoresQ.data?.find((s) => s.scoreType === "perfil")?.score ?? 0;
  const insights = insightsQ.data ?? [];
  const campaigns = campaignsQ.data ?? [];
  const contents = contentsQ.data ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-display font-bold" style={{ color: "var(--ouro)" }}>
            Marketing Inteligente
          </h2>
          <p className="text-sm" style={{ color: "var(--creme-50)" }}>
            Estratégia autônoma para sua carreira
          </p>
        </div>
        <button
          onClick={() => seedInsights.mutate({ profileId })}
          disabled={seedInsights.isPending}
          className="pnsp-btn-secondary text-xs px-3 py-1.5 flex items-center gap-1.5"
        >
          <TrendingUp size={13} />
          {seedInsights.isPending ? "Calculando..." : "Analisar perfil"}
        </button>
      </div>

      {/* Score overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-1 flex flex-col items-center justify-center p-4 rounded-2xl" style={{ background: "var(--terra)" }}>
          <ScoreGauge score={overallScore} />
          <Termometro score={overallScore} />
        </div>
        <div className="md:col-span-2 grid grid-cols-2 gap-3">
          {[
            { label: "Campanhas", value: campaigns.length, icon: <Megaphone size={16} /> },
            { label: "Conteúdos", value: contents.length, icon: <FileText size={16} /> },
            { label: "Ativas", value: campaigns.filter((c) => c.status === "ativa").length, icon: <TrendingUp size={16} /> },
            { label: "Gerados por IA", value: contents.filter((c) => c.isAiGenerated).length, icon: <Sparkles size={16} /> },
          ].map((kpi) => (
            <div key={kpi.label} className="p-3 rounded-xl" style={{ background: "var(--terra)" }}>
              <div className="flex items-center gap-2 mb-1" style={{ color: "var(--ouro)" }}>
                {kpi.icon}
                <span className="text-xs" style={{ color: "var(--creme-50)" }}>{kpi.label}</span>
              </div>
              <p className="text-2xl font-display font-bold" style={{ color: "var(--creme)" }}>{kpi.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Insights */}
      {insights.length > 0 && (
        <div>
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: "var(--creme)" }}>
            <Lightbulb size={14} style={{ color: "var(--ouro)" }} />
            Insights de Marketing
          </h3>
          <div className="space-y-2">
            {insights.slice(0, 4).map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onDismiss={(id) => dismissInsight.mutate({ id })}
              />
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: "var(--terra)" }}>
        {(["overview", "campaigns", "contents"] as const).map((tab) => {
          const labels = { overview: "Gerador IA", campaigns: "Campanhas", contents: "Conteúdos" };
          return (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className="pb-2 text-sm font-semibold transition-colors"
              style={{
                color: activeSection === tab ? "var(--ouro)" : "var(--creme-50)",
                borderBottom: activeSection === tab ? "2px solid var(--ouro)" : "2px solid transparent",
              }}
            >
              {labels[tab]}
            </button>
          );
        })}
      </div>

      {/* Content */}
      {activeSection === "overview" && (
        <ContentGenerator profileId={profileId} onGenerated={() => contentsQ.refetch()} />
      )}

      {activeSection === "campaigns" && (
        <div className="space-y-2">
          {campaigns.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--creme-50)" }}>
              Nenhuma campanha ainda. Crie sua primeira campanha!
            </p>
          ) : (
            campaigns.map((c) => <CampaignCard key={c.id} campaign={c} />)
          )}
        </div>
      )}

      {activeSection === "contents" && (
        <div className="space-y-2">
          {contents.length === 0 ? (
            <p className="text-sm text-center py-8" style={{ color: "var(--creme-50)" }}>
              Nenhum conteúdo ainda. Use o Gerador IA para criar!
            </p>
          ) : (
            contents.map((c) => <ContentCard key={c.id} content={c} />)
          )}
        </div>
      )}
    </div>
  );
}
