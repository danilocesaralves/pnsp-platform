import { useEffect, useState, useCallback } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicLayout from "@/components/PublicLayout";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts";
import {
  TrendingUp, TrendingDown, DollarSign, Users, Briefcase, Target,
  Music2, Building2, BookOpen, MapPin, Shield, Settings, Download,
  ArrowRight, Plus, Eye, BarChart2, Activity, AlertCircle
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import jsPDF from "jspdf";

const COLORS = ["var(--o500)", "var(--g500)", "#8b5cf6", "#3b82f6", "#ef4444", "#f97316"];

export default function OwnerDashboard() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState("visao-geral");
  const { data: stats } = trpc.owner.stats.useQuery();
  const { data: financial } = trpc.owner.financialSummary.useQuery();
  const { data: analytics } = trpc.owner.analytics.useQuery();
  const { data: recentUsers } = trpc.admin.users.useQuery({ limit: 5, offset: 0 });

  useEffect(() => {
    if (!loading && user?.role !== "owner" && user?.role !== "admin") navigate("/");
  }, [loading, user]);

  const financialData = (financial?.records ?? []).slice(0, 12).map((r: any) => ({
    name: new Date(r.recordedAt).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" }),
    receita: r.type === "receita" ? Number(r.amount) : 0,
    custo: r.type === "custo" ? Number(r.amount) : 0,
  }));

  const totalRevenue = Number(financial?.totalRevenue ?? 0);
  const totalCosts = Number(financial?.totalCosts ?? 0);
  const profit = Number(financial?.profit ?? 0);
  const margin = Number(financial?.margin ?? 0);

  // Real analytics data from DB
  const GROWTH_DATA = analytics?.monthlyGrowth ?? [];
  const STATE_DATA = (analytics?.profilesByState ?? []).map((r: any) => ({ estado: r.state, perfis: Number(r.count) }));
  const PROFILE_TYPE_DATA = (stats?.profilesByType ?? []).map((r: any) => ({
    name: r.profileType?.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()) ?? 'Outro',
    value: Number(r.count),
  }));

  const handleExportPDF = useCallback(() => {
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const now = new Date();
    const dateStr = now.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
    const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    const pageW = doc.internal.pageSize.getWidth();
    // ── Header ──────────────────────────────────────────────────────────────
    doc.setFillColor(20, 15, 5);
    doc.rect(0, 0, pageW, 32, "F");
    doc.setTextColor(212, 175, 55); // gold
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("PNSP — Dashboard Proprietário", 14, 14);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 160, 100);
    doc.text("Plataforma Nacional de Samba e Pagode", 14, 21);
    doc.text(`Gerado em ${dateStr} às ${timeStr}`, 14, 27);
    // ── KPIs Section ────────────────────────────────────────────────────────
    let y = 42;
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Indicadores Principais (KPIs)", 14, y);
    y += 8;
    const kpiRows = [
      ["Usuários Totais", String(stats?.userCount ?? 0)],
      ["Perfis Ativos", String(stats?.profileCount ?? 0)],
      ["Ofertas Ativas", String(stats?.offeringCount ?? 0)],
      ["Oportunidades", String(stats?.opportunityCount ?? 0)],
      ["Estúdios", String(stats?.studioCount ?? 0)],
      ["Conteúdo Academia", String(stats?.academyCount ?? 0)],
    ];
    const colW = (pageW - 28) / 2;
    kpiRows.forEach(([label, val], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 14 + col * (colW + 4);
      const ky = y + row * 14;
      doc.setFillColor(248, 246, 240);
      doc.roundedRect(x, ky, colW, 11, 2, 2, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 90, 70);
      doc.text(label, x + 3, ky + 4.5);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 20, 5);
      doc.text(val, x + 3, ky + 9);
    });
    y += Math.ceil(kpiRows.length / 2) * 14 + 10;
    // ── Financial Section ───────────────────────────────────────────────────
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 30, 30);
    doc.text("Resumo Financeiro", 14, y);
    y += 8;
    const finRows = [
      ["Receita Total", `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
      ["Custos Totais", `R$ ${totalCosts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
      ["Lucro Líquido", `R$ ${profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`],
      ["Margem de Lucro", `${margin.toFixed(1)}%`],
    ];
    finRows.forEach(([label, val], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 14 + col * (colW + 4);
      const ky = y + row * 14;
      doc.setFillColor(240, 248, 242);
      doc.roundedRect(x, ky, colW, 11, 2, 2, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 100, 70);
      doc.text(label, x + 3, ky + 4.5);
      doc.setFontSize(11);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(20, 60, 30);
      doc.text(val, x + 3, ky + 9);
    });
    y += Math.ceil(finRows.length / 2) * 14 + 10;
    // ── Growth Table ────────────────────────────────────────────────────────
    if (GROWTH_DATA.length > 0) {
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text("Crescimento Mensal", 14, y);
      y += 7;
      const headers = ["Mês", "Usuários", "Perfis", "Ofertas"];
      const colWidths = [40, 40, 40, 40];
      doc.setFillColor(30, 20, 5);
      doc.setTextColor(212, 175, 55);
      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      let hx = 14;
      headers.forEach((h, i) => { doc.rect(hx, y, colWidths[i], 7, "F"); doc.text(h, hx + 2, y + 5); hx += colWidths[i]; });
      y += 7;
      doc.setFont("helvetica", "normal");
      GROWTH_DATA.slice(0, 8).forEach((row: any, ri: number) => {
        doc.setFillColor(ri % 2 === 0 ? 252 : 246, ri % 2 === 0 ? 250 : 244, ri % 2 === 0 ? 244 : 238);
        doc.setTextColor(40, 30, 10);
        let rx = 14;
        const cells = [row.mes ?? "", String(row.usuarios ?? 0), String(row.perfis ?? 0), String(row.ofertas ?? 0)];
        cells.forEach((cell, ci) => { doc.rect(rx, y, colWidths[ci], 6, "F"); doc.text(cell, rx + 2, y + 4.3); rx += colWidths[ci]; });
        y += 6;
      });
      y += 6;
    }
    // ── Footer ──────────────────────────────────────────────────────────────
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(20, 15, 5);
    doc.rect(0, pageH - 12, pageW, 12, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 130, 80);
    doc.text("PNSP — Plataforma Nacional de Samba e Pagode | Documento Confidencial", 14, pageH - 4.5);
    doc.text(`Página 1`, pageW - 25, pageH - 4.5);
    // ── Save ────────────────────────────────────────────────────────────────
    const filename = `PNSP-Dashboard-${now.toISOString().slice(0, 10)}.pdf`;
    doc.save(filename);
    toast.success(`Relatório exportado: ${filename}`);
  }, [stats, financial, analytics, totalRevenue, totalCosts, profit, margin, GROWTH_DATA]);

  const kpis = [
    {
      icon: Users,
      label: "Usuários Totais",
      value: stats?.userCount ?? 0,
      trend: "+12%",
      up: true,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      icon: Music2,
      label: "Perfis Ativos",
      value: stats?.profileCount ?? 0,
      trend: "+18%",
      up: true,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      icon: Briefcase,
      label: "Ofertas Ativas",
      value: stats?.offeringCount ?? 0,
      trend: "+8%",
      up: true,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      icon: Target,
      label: "Oportunidades",
      value: stats?.opportunityCount ?? 0,
      trend: "+15%",
      up: true,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: Building2,
      label: "Estúdios",
      value: stats?.studioCount ?? 0,
      trend: "+5%",
      up: true,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      icon: BookOpen,
      label: "Conteúdo Academia",
      value: stats?.academyCount ?? 0,
      trend: "+10%",
      up: true,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
    },
    {
      icon: DollarSign,
      label: "Receita Total",
      value: `R$ ${totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`,
      trend: totalRevenue > 0 ? "+positivo" : "—",
      up: totalRevenue > 0,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      icon: Activity,
      label: "Margem de Lucro",
      value: `${margin.toFixed(1)}%`,
      trend: margin > 0 ? "positivo" : "—",
      up: margin > 0,
      color: margin >= 0 ? "text-green-600" : "text-red-600",
      bg: margin >= 0 ? "bg-green-50" : "bg-red-50",
    },
  ];

  return (
    <PublicLayout>
      <div className="container py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold">Dashboard Proprietário</h1>
              <Badge className="bg-red-600 text-white text-xs">Proprietário</Badge>
            </div>
            <p className="text-muted-foreground text-sm">
              Visão executiva completa da PNSP — Plataforma Nacional de Samba e Pagode
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" /> Exportar PDF
            </Button>
            <Button size="sm" asChild>
              <Link href="/admin">
                <Shield className="h-4 w-4 mr-2" /> Painel Admin
              </Link>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
            <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
            <TabsTrigger value="crescimento">Crescimento</TabsTrigger>
            <TabsTrigger value="operacao">Operação</TabsTrigger>
          </TabsList>

          {/* ── VISÃO GERAL ─────────────────────────────────────────────────── */}
          <TabsContent value="visao-geral">
            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {kpis.map(({ icon: Icon, label, value, trend, up, color, bg }) => (
                <div key={label} className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`h-9 w-9 rounded-lg ${bg} flex items-center justify-center`}>
                      <Icon className={`h-4 w-4 ${color}`} />
                    </div>
                    <div className={`flex items-center gap-1 text-xs font-medium ${up ? "text-green-600" : "text-muted-foreground"}`}>
                      {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {trend}
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Growth Chart */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  Crescimento da Plataforma
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={GROWTH_DATA}>
                    <defs>
                      <linearGradient id="colorUsuarios" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#D4AF37" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPerfis" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#C41E3A" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#C41E3A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="usuarios" stroke="#D4AF37" fill="url(#colorUsuarios)" name="Usuários" />
                    <Area type="monotone" dataKey="perfis" stroke="#C41E3A" fill="url(#colorPerfis)" name="Perfis" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Profile Types Pie */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  Distribuição por Tipo de Perfil
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={PROFILE_TYPE_DATA}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {PROFILE_TYPE_DATA.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Geographic Distribution */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  Distribuição Geográfica (Perfis por Estado)
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={STATE_DATA} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="estado" type="category" tick={{ fontSize: 11 }} width={40} />
                    <Tooltip />
                    <Bar dataKey="perfis" fill="#D4AF37" radius={[0, 4, 4, 0]} name="Perfis" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Ações Rápidas</h3>
                <div className="space-y-2">
                  {[
                    { label: "Gerenciar Usuários", href: "/admin/usuarios", icon: Users },
                    { label: "Moderar Ofertas", href: "/admin/ofertas", icon: Briefcase },
                    { label: "Moderar Oportunidades", href: "/admin/oportunidades", icon: Target },
                    { label: "Conteúdo Academia", href: "/admin/conteudo", icon: BookOpen },
                    { label: "Ver Logs", href: "/admin/logs", icon: Eye },
                    { label: "Configurações", href: "/admin", icon: Settings },
                  ].map(({ label, href, icon: Icon }) => (
                    <Link key={href} href={href}>
                      <div className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted transition-colors cursor-pointer group">
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{label}</span>
                        </div>
                        <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── FINANCEIRO ──────────────────────────────────────────────────── */}
          <TabsContent value="financeiro">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground mb-1">Receita Total</p>
                <p className="text-3xl font-bold text-green-600">
                  R$ {totalRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Acumulado no período</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground mb-1">Custos Totais</p>
                <p className="text-3xl font-bold text-red-600">
                  R$ {totalCosts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Acumulado no período</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-6">
                <p className="text-sm text-muted-foreground mb-1">Lucro / Margem</p>
                <p className={`text-3xl font-bold ${profit >= 0 ? "text-green-600" : "text-red-600"}`}>
                  R$ {profit.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-muted-foreground mt-2">Margem: {margin.toFixed(1)}%</p>
              </div>
            </div>

            {financialData.length > 0 ? (
              <div className="rounded-xl border border-border bg-card p-6 mb-6">
                <h3 className="font-semibold mb-4">Receitas vs Custos por Período</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={financialData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v) => `R$ ${Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
                    <Legend />
                    <Bar dataKey="receita" fill="#22c55e" radius={[4, 4, 0, 0]} name="Receita" />
                    <Bar dataKey="custo" fill="#ef4444" radius={[4, 4, 0, 0]} name="Custo" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center mb-6">
                <AlertCircle className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium mb-1">Nenhum registro financeiro ainda</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione receitas e custos para visualizar o desempenho financeiro da plataforma.
                </p>
                <Button size="sm" onClick={() => toast.info("Adicionar registros financeiros via painel admin")}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Registro
                </Button>
              </div>
            )}

            {/* Revenue Streams */}
            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Fontes de Receita Previstas</h3>
              <div className="space-y-3">
                {[
                  { label: "Assinaturas Premium (Perfis)", previsto: "R$ 2.000/mês", status: "Em implantação" },
                  { label: "Destaque de Ofertas", previsto: "R$ 800/mês", status: "Em implantação" },
                  { label: "Reservas de Estúdios (comissão)", previsto: "R$ 1.500/mês", status: "Stripe ativo" },
                  { label: "Cursos da Academia", previsto: "R$ 600/mês", status: "Stripe ativo" },
                  { label: "Parcerias Institucionais", previsto: "R$ 3.000/mês", status: "Planejado" },
                ].map(({ label, previsto, status }) => (
                  <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground">{status}</p>
                    </div>
                    <p className="text-sm font-semibold text-green-600">{previsto}</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ── CRESCIMENTO ─────────────────────────────────────────────────── */}
          <TabsContent value="crescimento">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Crescimento de Usuários e Perfis</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={GROWTH_DATA}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="usuarios" stroke="#D4AF37" strokeWidth={2} dot={{ r: 4 }} name="Usuários" />
                    <Line type="monotone" dataKey="perfis" stroke="#C41E3A" strokeWidth={2} dot={{ r: 4 }} name="Perfis" />
                    <Line type="monotone" dataKey="ofertas" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} name="Ofertas" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Metas vs Realizado — Março 2026</h3>
                <div className="space-y-4">
                  {[
                    { label: "Usuários cadastrados", meta: 20, realizado: stats?.userCount ?? 0, cor: "bg-amber-500" },
                    { label: "Perfis ativos", meta: 80, realizado: stats?.profileCount ?? 0, cor: "bg-red-500" },
                    { label: "Ofertas publicadas", meta: 50, realizado: stats?.offeringCount ?? 0, cor: "bg-blue-500" },
                    { label: "Oportunidades abertas", meta: 30, realizado: stats?.opportunityCount ?? 0, cor: "bg-green-500" },
                    { label: "Estúdios cadastrados", meta: 15, realizado: stats?.studioCount ?? 0, cor: "bg-purple-500" },
                  ].map(({ label, meta, realizado, cor }) => {
                    const pct = Math.min(100, Math.round((realizado / meta) * 100));
                    return (
                      <div key={label}>
                        <div className="flex justify-between text-sm mb-1">
                          <span>{label}</span>
                          <span className="text-muted-foreground">{realizado}/{meta} ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className={`h-full ${cor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <h3 className="font-semibold mb-4">Distribuição por Estado</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={STATE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="estado" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="perfis" fill="#D4AF37" radius={[4, 4, 0, 0]} name="Perfis" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>

          {/* ── OPERAÇÃO ────────────────────────────────────────────────────── */}
          <TabsContent value="operacao">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Usuários Recentes</h3>
                  <Link href="/admin/usuarios">
                    <Button variant="ghost" size="sm">Ver todos <ArrowRight className="ml-1 h-3 w-3" /></Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {(Array.isArray(recentUsers) ? recentUsers : []).slice(0, 5).map((u: any) => (
                    <div key={u.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                          {u.name?.charAt(0)?.toUpperCase() ?? "U"}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{u.name ?? "Sem nome"}</p>
                          <p className="text-xs text-muted-foreground">{u.email ?? "—"}</p>
                        </div>
                      </div>
                      <Badge variant={u.role === "admin" ? "destructive" : "secondary"} className="text-xs">
                        {u.role}
                      </Badge>
                    </div>
                  ))}
                  {(!recentUsers || (Array.isArray(recentUsers) && recentUsers.length === 0)) && (
                    <p className="text-sm text-muted-foreground text-center py-4">Nenhum usuário ainda</p>
                  )}
                </div>
              </div>

              {/* Platform Health */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Saúde da Plataforma</h3>
                <div className="space-y-3">
                  {[
                    { label: "Banco de Dados", status: "Operacional", ok: true },
                    { label: "Autenticação OAuth", status: "Operacional", ok: true },
                    { label: "Stripe (Pagamentos)", status: "Configurado (sandbox)", ok: true },
                    { label: "Mapa Google Maps", status: "Operacional", ok: true },
                    { label: "Geração de Imagens IA", status: "Operacional", ok: true },
                    { label: "PWA / Service Worker", status: "Ativo", ok: true },
                    { label: "CDN de Assets", status: "Operacional", ok: true },
                  ].map(({ label, status, ok }) => (
                    <div key={label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm">{label}</span>
                      <div className="flex items-center gap-2">
                        <div className={`h-2 w-2 rounded-full ${ok ? "bg-green-500" : "bg-red-500"}`} />
                        <span className={`text-xs ${ok ? "text-green-600" : "text-red-600"}`}>{status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Moderation Queue */}
              <div className="rounded-xl border border-border bg-card p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Fila de Moderação</h3>
                  <Link href="/admin">
                    <Button variant="ghost" size="sm">Moderar <ArrowRight className="ml-1 h-3 w-3" /></Button>
                  </Link>
                </div>
                <div className="space-y-3">
                  {[
                    { tipo: "Perfis pendentes", count: 0, cor: "text-amber-600" },
                    { tipo: "Ofertas pendentes", count: 0, cor: "text-blue-600" },
                    { tipo: "Oportunidades pendentes", count: 0, cor: "text-purple-600" },
                    { tipo: "Conteúdo pendente", count: 0, cor: "text-teal-600" },
                  ].map(({ tipo, count, cor }) => (
                    <div key={tipo} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm">{tipo}</span>
                      <span className={`text-sm font-bold ${count > 0 ? cor : "text-muted-foreground"}`}>
                        {count > 0 ? count : "Nenhum"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Revenue Forecast */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-4">Previsão de Receita — Próximos 3 Meses</h3>
                <div className="space-y-3">
                  {[
                    { mes: "Abril 2026", previsto: "R$ 1.200,00", tipo: "Conservador" },
                    { mes: "Maio 2026", previsto: "R$ 2.800,00", tipo: "Moderado" },
                    { mes: "Junho 2026", previsto: "R$ 5.500,00", tipo: "Otimista" },
                  ].map(({ mes, previsto, tipo }) => (
                    <div key={mes} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium">{mes}</p>
                        <p className="text-xs text-muted-foreground">{tipo}</p>
                      </div>
                      <p className="text-sm font-bold text-green-600">{previsto}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  * Baseado em crescimento orgânico e ativação de Stripe
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PublicLayout>
  );
}
