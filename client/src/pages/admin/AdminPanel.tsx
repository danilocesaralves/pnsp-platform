import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicLayout from "@/components/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Target, BookOpen, BarChart2, FileText } from "lucide-react";

export default function AdminPanel() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: stats } = trpc.admin.stats.useQuery();

  useEffect(() => {
    if (!loading && user?.role !== "admin" && user?.role !== "owner") navigate("/");
  }, [loading, user]);

  const cards = [
    { href: "/admin/usuarios", icon: Users, label: "Usuários", value: stats?.userCount ?? 0, color: "text-blue-600 bg-blue-50" },
    { href: "/admin/ofertas", icon: Briefcase, label: "Ofertas", value: stats?.offeringCount ?? 0, color: "text-green-600 bg-green-50" },
    { href: "/admin/oportunidades", icon: Target, label: "Oportunidades", value: stats?.opportunityCount ?? 0, color: "text-purple-600 bg-purple-50" },
    { href: "/admin/conteudo", icon: BookOpen, label: "Conteúdo", value: stats?.academyCount ?? 0, color: "text-amber-600 bg-amber-50" },
    { href: "/admin/logs", icon: FileText, label: "Logs", value: "Ver", color: "text-gray-600 bg-gray-50" },
    { href: "/proprietario", icon: BarChart2, label: "Dashboard Proprietário", value: "Acessar", color: "text-red-600 bg-red-50" },
  ];

  return (
    <PublicLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div><h1 className="text-2xl font-bold">Painel Administrativo</h1><p className="text-muted-foreground">Gestão e moderação da plataforma PNSP</p></div>
          <Badge variant="default">Admin</Badge>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {cards.map(({ href, icon: Icon, label, value, color }) => (
            <Link key={href} href={href}>
              <div className="rounded-xl border border-border bg-card p-5 hover:shadow-md transition-all cursor-pointer group">
                <div className={`h-10 w-10 rounded-lg ${color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}><Icon className="h-5 w-5" /></div>
                <p className="text-2xl font-bold mb-1">{value}</p>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            </Link>
          ))}
        </div>
        {stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Perfis", value: stats.profileCount ?? 0 },
              { label: "Estudios", value: stats.studioCount ?? 0 },
              { label: "Academia", value: stats.academyCount ?? 0 },
              { label: "Oportunidades", value: stats.opportunityCount ?? 0 },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xl font-bold">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{label}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
