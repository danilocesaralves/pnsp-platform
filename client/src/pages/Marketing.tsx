import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import PublicLayout from "@/components/PublicLayout";
import MarketingDashboard from "@/components/MarketingDashboard";
import { Link } from "wouter";
import { TrendingUp } from "lucide-react";

export default function MarketingPage() {
  const { user } = useAuth();
  const profileQ = trpc.profiles.getMyProfile.useQuery(undefined, { enabled: !!user });
  const myProfile = profileQ.data;

  if (!user) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
          <TrendingUp size={48} style={{ color: "var(--ouro)", margin: "0 auto" }} />
          <h1 className="text-2xl font-display font-bold" style={{ color: "var(--creme)" }}>
            Marketing Inteligente
          </h1>
          <p style={{ color: "var(--creme-50)" }}>Faça login para acessar suas ferramentas de marketing.</p>
          <Link href="/entrar" className="pnsp-btn-primary inline-flex">Entrar</Link>
        </div>
      </PublicLayout>
    );
  }

  if (profileQ.isLoading) {
    return (
      <PublicLayout>
        <div className="text-center py-20" style={{ color: "var(--creme-50)" }}>Carregando...</div>
      </PublicLayout>
    );
  }

  if (!myProfile) {
    return (
      <PublicLayout>
        <div className="max-w-2xl mx-auto py-20 text-center space-y-4">
          <p style={{ color: "var(--creme-50)" }}>Você precisa criar um perfil primeiro.</p>
          <Link href="/criar-perfil" className="pnsp-btn-primary inline-flex">Criar Perfil</Link>
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <MarketingDashboard profileId={myProfile.id} />
      </div>
    </PublicLayout>
  );
}
