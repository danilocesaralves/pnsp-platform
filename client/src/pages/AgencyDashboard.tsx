import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicLayout from "@/components/PublicLayout";
import { 
  Target, TrendingUp, Users, DollarSign, AlertCircle, 
  CheckCircle, Zap, ArrowRight, BarChart2, MessageSquare,
  Clock, RefreshCw, Send, Globe, Award, Shield
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ─── SUBCOMPONENTS ───────────────────────────────────────────────────────────

function MetricCard({ 
  label, value, sub, trend, variant = "default" 
}: { 
  label: string; value: string | number; sub?: string; trend?: number; variant?: "default" | "gold" 
}) {
  const isPositive = trend && trend > 0;
  return (
    <div style={{
      background: "var(--terra)",
      border: `1px solid ${variant === "gold" ? "rgba(212,146,10,0.4)" : "var(--creme-10)"}`,
      borderRadius: "var(--radius-md)",
      padding: "20px",
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      <span style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
      <div style={{ 
        fontFamily: "var(--font-display)", 
        fontSize: "var(--text-3xl)", 
        fontWeight: 800, 
        color: variant === "gold" ? "var(--ouro)" : "var(--creme)",
        lineHeight: 1
      }}>
        {value}
      </div>
      {(sub || trend !== undefined) && (
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "var(--text-xs)" }}>
          {trend !== undefined && (
            <span style={{ color: isPositive ? "#22c55e" : "#ef4444", fontWeight: 600 }}>
              {isPositive ? "↑" : "↓"} {Math.abs(trend)}%
            </span>
          )}
          <span style={{ color: "var(--creme-30)" }}>{sub}</span>
        </div>
      )}
    </div>
  );
}

function RevenueChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--creme-30)" }}>Sem dados históricos</div>;
  
  const maxVal = Math.max(...data.map(d => Number(d.totalRevenue || 0)), 100);
  
  return (
    <div style={{ background: "var(--terra)", borderRadius: "var(--radius-lg)", padding: "24px", border: "1px solid var(--creme-10)" }}>
      <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--creme)", marginBottom: 24, display: "flex", alignItems: "center", gap: 8 }}>
        <BarChart2 style={{ width: 16, height: 16, color: "var(--ouro)" }} /> Receita (MRR) — últimos 7 dias
      </h3>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 200, paddingBottom: 24 }}>
        {data.slice(0, 7).reverse().map((d, i) => {
          const height = (Number(d.totalRevenue || 0) / maxVal) * 100;
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
              <div style={{ 
                width: "100%", 
                height: `${Math.max(height, 5)}%`, 
                background: "linear-gradient(to top, #8B6110, var(--ouro))",
                borderRadius: "4px 4px 0 0",
                position: "relative",
                transition: "height 0.5s ease"
              }}>
                <div style={{ position: "absolute", top: -20, left: "50%", transform: "translateX(-50%)", fontSize: 10, color: "var(--creme-50)", whiteSpace: "nowrap" }}>
                  R$ {Number(d.totalRevenue).toFixed(0)}
                </div>
              </div>
              <span style={{ fontSize: 10, color: "var(--creme-30)" }}>{d.date.split("-").slice(1).join("/")}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EcosystemMap({ scores }: { scores: any[] }) {
  const cities = scores.filter(s => s.scoreType === "por_regiao");
  
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
      {cities.map((s, i) => (
        <div key={i} style={{ 
          background: "var(--terra)", 
          padding: "16px", 
          borderRadius: "var(--radius-md)", 
          border: "1px solid var(--creme-10)",
          borderLeft: `4px solid ${s.value > 70 ? "#22c55e" : s.value > 40 ? "var(--ouro)" : "#ef4444"}`
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 8 }}>
            <span style={{ fontSize: "var(--text-xs)", fontWeight: 700, color: "var(--creme)" }}>{s.entity}</span>
            <span style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: s.value > 70 ? "#22c55e" : s.value > 40 ? "var(--ouro)" : "#ef4444" }}>{s.value}</span>
          </div>
          <div style={{ fontSize: 10, color: "var(--creme-50)", display: "flex", alignItems: "center", gap: 4 }}>
            Atividade {s.trend === "subindo" ? "↑" : s.trend === "caindo" ? "↓" : "→"}
            {s.value > 80 && <span style={{ background: "#ef4444", color: "white", padding: "1px 4px", borderRadius: 4, fontWeight: 700, marginLeft: "auto" }}>GAP CRÍTICO</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function AccumulatedBar({ current, target }: { current: number; target: number }) {
  const pct = Math.min(100, (current / target) * 100);
  return (
    <div style={{ marginTop: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--creme-50)", marginBottom: 4 }}>
        <span>R$ {current.toFixed(2)} acumulado</span>
        <span>R$ {target.toFixed(0)} threshold</span>
      </div>
      <div style={{ width: "100%", height: 6, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "var(--ouro)", transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function ContentCard({ content, onApprove, onPublish }: { content: any; onApprove: (id: number) => void; onPublish: (id: number) => void }) {
  return (
    <div style={{ background: "var(--terra)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--creme-10)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ 
          background: content.platform === "email" ? "#3b82f6" : content.platform === "whatsapp" ? "#22c55e" : "var(--ouro)", 
          color: "white", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: "uppercase" 
        }}>{content.platform}</span>
        <span style={{ fontSize: 10, color: "var(--creme-30)" }}>{content.status}</span>
      </div>
      <h4 style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--creme)", marginBottom: 8 }}>{content.title || "Sem título"}</h4>
      <p style={{ fontSize: "var(--text-xs)", color: "var(--creme-50)", lineHeight: 1.5, marginBottom: 16, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
        {content.body}
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        {content.status === "rascunho" && (
          <button onClick={() => onApprove(content.id)} style={{ flex: 1, padding: "8px", background: "var(--ouro)", color: "var(--preto)", border: "none", borderRadius: "var(--radius-sm)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            Aprovar
          </button>
        )}
        {content.status === "aprovado" && (
          <button onClick={() => onPublish(content.id)} style={{ flex: 1, padding: "8px", background: "#22c55e", color: "white", border: "none", borderRadius: "var(--radius-sm)", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
            Publicar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function AgencyDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("geral");
  const utils = trpc.useUtils();

  const { data: dashboard, isLoading } = trpc.agency.getDashboard.useQuery(undefined, {
    refetchInterval: 60000,
  });

  const { data: waitlist } = trpc.agency.getPreLaunchStats.useQuery();

  const triggerEngine = trpc.agency.triggerDailyEngine.useMutation({
    onSuccess: () => {
      toast.success("Engine diária disparada com sucesso!");
      utils.agency.getDashboard.invalidate();
    }
  });

  const approveContent = trpc.agency.approveContent.useMutation({
    onSuccess: () => {
      toast.success("Conteúdo aprovado!");
      utils.agency.getDashboard.invalidate();
    }
  });

  const publishContent = trpc.agency.publishContentManual.useMutation({
    onSuccess: () => {
      toast.success("Conteúdo publicado!");
      utils.agency.getDashboard.invalidate();
    }
  });

  const approveAll = trpc.agency.approveAllContents.useMutation({
    onSuccess: () => {
      toast.success("Todos os rascunhos aprovados!");
      utils.agency.getDashboard.invalidate();
    }
  });

  const dismissAlert = trpc.agency.dismissAlert.useMutation({
    onSuccess: () => utils.agency.getDashboard.invalidate()
  });

  // Guard: composisamba@gmail.com ou admin
  if (user && user.email !== "composisamba@gmail.com" && user.role !== "admin") {
    return <div style={{ padding: 100, textAlign: "center", color: "white" }}>Acesso restrito ao cérebro operacional da PNSP.</div>;
  }

  if (isLoading || !dashboard) return <div style={{ padding: 100, textAlign: "center", color: "white" }}>Sincronizando engine...</div>;

  return (
    <PublicLayout>
      <div style={{ maxWidth: 1200, margin: "40px auto", padding: "0 24px" }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 40 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
              <Target style={{ color: "var(--ouro)", width: 32, height: 32 }} />
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-4xl)", fontWeight: 800, color: "var(--creme)" }}>
                Agência <span style={{ color: "var(--ouro)" }}>Autônoma</span>
              </h1>
            </div>
            <p style={{ color: "var(--creme-50)", fontSize: "var(--text-base)" }}>Cérebro operacional e engine de crescimento PNSP.</p>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <button 
              onClick={() => triggerEngine.mutate()}
              disabled={triggerEngine.isPending}
              style={{ 
                padding: "12px 20px", background: "var(--ouro-sutil)", border: "1px solid rgba(212,146,10,0.3)",
                borderRadius: "var(--radius-md)", color: "var(--ouro)", fontWeight: 700, cursor: "pointer",
                display: "flex", alignItems: "center", gap: 8
              }}
            >
              <RefreshCw className={triggerEngine.isPending ? "animate-spin" : ""} style={{ width: 16, height: 16 }} />
              Rodar Engine Agora
            </button>
          </div>
        </div>

        <Tabs defaultValue="geral" onValueChange={setActiveTab} className="w-full">
          <TabsList style={{ background: "var(--terra)", border: "1px solid var(--creme-10)", padding: 4, borderRadius: 8, marginBottom: 32 }}>
            <TabsTrigger value="geral" style={{ padding: "8px 24px", color: "var(--creme-50)" }}>Visão Geral</TabsTrigger>
            <TabsTrigger value="campanhas" style={{ padding: "8px 24px", color: "var(--creme-50)" }}>Estratégia</TabsTrigger>
            <TabsTrigger value="conteudos" style={{ padding: "8px 24px", color: "var(--creme-50)" }}>Conteúdos {dashboard.pendingContents.length > 0 && `(${dashboard.pendingContents.length})`}</TabsTrigger>
            <TabsTrigger value="reinvestimento" style={{ padding: "8px 24px", color: "var(--creme-50)" }}>Financeiro</TabsTrigger>
            <TabsTrigger value="pre-lancamento" style={{ padding: "8px 24px", color: "var(--creme-50)" }}>Pré-Lançamento</TabsTrigger>
          </TabsList>

          <TabsContent value="geral">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
              <MetricCard label="Receita Estimada (MRR)" value={`R$ ${Number(dashboard.todayMetrics?.mrr || 0).toFixed(0)}`} trend={12} variant="gold" />
              <MetricCard label="Novos Cadastros" value={dashboard.todayMetrics?.newRegistrations || 0} trend={8} />
              <MetricCard label="Bookings Ativos" value={dashboard.todayMetrics?.bookingsCount || 0} trend={15} />
              <MetricCard label="ROI Médio" value={`${Number(dashboard.todayMetrics?.roiFromReinvestment || 0).toFixed(0)}%`} trend={4} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 32 }}>
              <RevenueChart data={dashboard.scores} />
              <div style={{ background: "var(--terra)", borderRadius: "var(--radius-lg)", padding: "24px", border: "1px solid var(--creme-10)" }}>
                <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--creme)", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                  <AlertCircle style={{ width: 16, height: 16, color: "#ef4444" }} /> Alertas Ativos
                </h3>
                {dashboard.activeAlerts.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px 0", color: "var(--creme-30)" }}>Engine saudável. Sem alertas.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {dashboard.activeAlerts.map(alert => (
                      <div key={alert.id} style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: 8, borderLeft: `3px solid ${alert.severity === 'critico' ? '#ef4444' : 'var(--ouro)'}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--creme)" }}>{alert.title}</span>
                          <button onClick={() => dismissAlert.mutate({ id: alert.id })} style={{ background: "none", border: "none", color: "var(--creme-30)", cursor: "pointer", fontSize: 10 }}>Ignorar</button>
                        </div>
                        <p style={{ fontSize: 10, color: "var(--creme-50)" }}>{alert.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <h3 style={{ fontSize: "var(--text-lg)", fontWeight: 800, color: "var(--creme)", marginBottom: 20 }}>Ecossistema Regional</h3>
            <EcosystemMap scores={dashboard.scores} />
          </TabsContent>

          <TabsContent value="campanhas">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
              {dashboard.activeCampaigns.map(camp => (
                <div key={camp.id} style={{ background: "var(--terra)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--creme-10)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ background: "var(--ouro-sutil)", color: "var(--ouro)", padding: "4px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700 }}>{camp.objective.toUpperCase()}</span>
                    <span style={{ fontSize: 10, color: "var(--creme-30)" }}>{camp.triggerSource}</span>
                  </div>
                  <h4 style={{ fontSize: "var(--text-lg)", fontWeight: 700, color: "var(--creme)", marginBottom: 8 }}>{camp.name}</h4>
                  <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--creme-30)" }}>Região</div>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--creme)" }}>{camp.targetRegion || "Nacional"}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--creme-30)" }}>Budget</div>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--creme)" }}>R$ {Number(camp.budget).toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--creme-30)" }}>ROI</div>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--ouro)", fontWeight: 700 }}>{camp.roiScore || "..."}%</div>
                    </div>
                  </div>
                  <div style={{ background: "rgba(0,0,0,0.2)", padding: "8px", borderRadius: 4, fontSize: 10, color: "var(--creme-50)", fontFamily: "monospace" }}>
                    Ref: {camp.attributionTag}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="conteudos">
             <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)" }}>
                  ⚠️ Semana 1: aprovação manual obrigatória para calibração.
                </div>
                <button 
                  onClick={() => approveAll.mutate()}
                  style={{ padding: "10px 20px", background: "var(--ouro)", color: "var(--preto)", border: "none", borderRadius: 8, fontWeight: 700, cursor: "pointer" }}
                >
                  Aprovar Todos os Rascunhos
                </button>
             </div>
             <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
               {dashboard.pendingContents.map(c => (
                 <ContentCard key={c.id} content={c} onApprove={(id) => approveContent.mutate({ id })} onPublish={(id) => publishContent.mutate({ id })} />
               ))}
               {dashboard.pendingContents.length === 0 && <div style={{ gridColumn: "1/-1", textAlign: "center", padding: "80px 0", color: "var(--creme-30)" }}>Nenhum conteúdo pendente de aprovação.</div>}
             </div>
          </TabsContent>

          <TabsContent value="reinvestimento">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))", gap: 24 }}>
              {dashboard.rules.map(rule => (
                <div key={rule.id} style={{ background: "var(--terra)", padding: "24px", borderRadius: "var(--radius-lg)", border: "1px solid var(--creme-10)", opacity: rule.isActive ? 1 : 0.6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <h4 style={{ fontSize: "var(--text-base)", fontWeight: 700, color: "var(--creme)" }}>{rule.name}</h4>
                    <span style={{ color: "var(--ouro)", fontWeight: 800, fontSize: "var(--text-xl)" }}>{Number(rule.reinvestmentPct).toFixed(0)}%</span>
                  </div>
                  <AccumulatedBar current={Number(rule.accumulatedRevenue)} target={Number(rule.minimumThreshold)} />
                  <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--creme-30)" }}>Total Investido</div>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--creme)" }}>R$ {Number(rule.totalInvested).toFixed(2)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: "var(--creme-30)" }}>Execuções</div>
                      <div style={{ fontSize: "var(--text-sm)", color: "var(--creme)" }}>{rule.totalExecuted} vezes</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="pre-lancamento">
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 32 }}>
              <MetricCard label="Total Inscritos" value={waitlist?.totalSubscribers || 0} variant="gold" />
              <MetricCard label="Referral Médio" value="2.4" sub="contatos p/ usuário" />
              <MetricCard label="Meta p/ Lançamento" value="500" sub="precisamos de mais 120" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
              <div style={{ background: "var(--terra)", borderRadius: "var(--radius-lg)", padding: "24px", border: "1px solid var(--creme-10)" }}>
                 <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--creme)", marginBottom: 20 }}>Top Referrers</h3>
                 <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                   {waitlist?.topReferrers.map((ref, i) => (
                     <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", background: "rgba(0,0,0,0.2)", borderRadius: 8 }}>
                       <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                         <div style={{ width: 24, height: 24, borderRadius: 12, background: "var(--ouro)", color: "var(--preto)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 800 }}>{i+1}</div>
                         <span style={{ fontSize: "var(--text-sm)", color: "var(--creme)" }}>{ref.name}</span>
                       </div>
                       <span style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--ouro)" }}>{ref.referralCount} convites</span>
                     </div>
                   ))}
                 </div>
              </div>

              <div style={{ background: "var(--terra)", borderRadius: "var(--radius-lg)", padding: "24px", border: "1px solid var(--creme-10)" }}>
                <h3 style={{ fontSize: "var(--text-sm)", fontWeight: 700, color: "var(--creme)", marginBottom: 20 }}>Checklist "Dia D"</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <CheckItem label="Anthropic API Key" done={waitlist?.checklistStatus.anthropicKey} />
                  <CheckItem label="Resend API Config" done={waitlist?.checklistStatus.resendKey} />
                  <CheckItem label="VAPID Keys Active" done={waitlist?.checklistStatus.vapidKeys} />
                  <CheckItem label="Z-API Configured" done={waitlist?.checklistStatus.zapiConfigured} />
                  <CheckItem label="Meta Waitlist (>500)" done={waitlist?.checklistStatus.waitlistTarget} />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  );
}

function CheckItem({ label, done }: { label: string; done?: boolean }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: done ? 1 : 0.4 }}>
      {done ? <CheckCircle style={{ width: 14, height: 14, color: "#22c55e" }} /> : <div style={{ width: 14, height: 14, borderRadius: 7, border: "1px solid var(--creme-30)" }} />}
      <span style={{ fontSize: 12, color: "var(--creme)" }}>{label}</span>
    </div>
  );
}
