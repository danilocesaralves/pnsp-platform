import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import PublicLayout from "@/components/PublicLayout";
import { User, Briefcase, Target, Bell, Plus, Mic2, BookOpen } from "lucide-react";

export default function Dashboard() {
  const { isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: summary, isLoading } = trpc.dashboard.summary.useQuery(undefined, { enabled: isAuthenticated });

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate("/");
  }, [loading, isAuthenticated]);

  if (loading || isLoading) return (
    <PublicLayout>
      <div className="container py-16 text-center animate-pulse text-muted-foreground">Carregando dashboard...</div>
    </PublicLayout>
  );

  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold">Meu Dashboard</h1>
            <p className="text-muted-foreground">Gerencie sua presença na PNSP</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {!summary?.profile && <Button asChild><Link href="/criar-perfil"><Plus className="h-4 w-4 mr-1" />Criar Perfil</Link></Button>}
            <Button variant="outline" asChild><Link href="/criar-oferta"><Plus className="h-4 w-4 mr-1" />Nova Oferta</Link></Button>
            <Button variant="outline" asChild><Link href="/criar-oportunidade"><Plus className="h-4 w-4 mr-1" />Nova Oportunidade</Link></Button>
          </div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: User, label: "Perfil", value: summary?.profile ? "Ativo" : "Pendente", color: summary?.profile ? "text-green-600" : "text-amber-600" },
            { icon: Briefcase, label: "Ofertas", value: summary?.offeringsCount ?? 0, color: "text-blue-600" },
            { icon: Target, label: "Oportunidades", value: summary?.opportunitiesCount ?? 0, color: "text-purple-600" },
            { icon: Bell, label: "Notificações", value: summary?.unreadNotifications ?? 0, color: "text-red-600" },
          ].map(({ icon: Icon, label, value, color }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-2"><Icon className={`h-5 w-5 ${color}`} /><span className="text-sm text-muted-foreground">{label}</span></div>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
        {summary?.profile ? (
          <div className="rounded-xl border border-border bg-card p-5 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Meu Perfil</h2>
              <Button variant="outline" size="sm" asChild><Link href={`/editar-perfil/${summary.profile.id}`}>Editar</Link></Button>
            </div>
            <div className="flex items-center gap-3">
              {summary.profile.avatarUrl ? <img src={summary.profile.avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" /> : <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center"><span className="font-bold text-primary">{summary.profile.displayName.charAt(0)}</span></div>}
              <div>
                <p className="font-medium">{summary.profile.displayName}</p>
                <p className="text-sm text-muted-foreground">{summary.profile.city}{summary.profile.state ? `, ${summary.profile.state}` : ""}</p>
              </div>
              <div className="ml-auto flex gap-2">
                <Badge variant={summary.profile.status === "active" ? "default" : "secondary"}>{summary.profile.status === "active" ? "Ativo" : "Pendente"}</Badge>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center mb-6">
            <User className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
            <p className="font-medium mb-1">Voce ainda nao tem um perfil</p>
            <p className="text-sm text-muted-foreground mb-4">Crie seu perfil para aparecer na plataforma</p>
            <Button asChild><Link href="/criar-perfil">Criar Perfil Agora</Link></Button>
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/criar-imagem">
            <div className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all cursor-pointer group">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3"><BookOpen className="h-5 w-5 text-primary" /></div>
              <p className="font-medium">Gerar Imagem</p>
              <p className="text-xs text-muted-foreground mt-1">Crie material visual com IA</p>
            </div>
          </Link>
          <Link href="/estudios">
            <div className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all cursor-pointer group">
              <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center mb-3"><Mic2 className="h-5 w-5 text-indigo-600" /></div>
              <p className="font-medium">Reservar Estúdio</p>
              <p className="text-xs text-muted-foreground mt-1">Encontre estúdios disponiveis</p>
            </div>
          </Link>
          <Link href="/oportunidades">
            <div className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-all cursor-pointer group">
              <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center mb-3"><Target className="h-5 w-5 text-green-600" /></div>
              <p className="font-medium">Ver Oportunidades</p>
              <p className="text-xs text-muted-foreground mt-1">Vagas e projetos disponiveis</p>
            </div>
          </Link>
        </div>
      </div>
    </PublicLayout>
  );
}
