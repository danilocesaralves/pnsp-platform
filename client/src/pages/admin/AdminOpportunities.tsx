import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicLayout from "@/components/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminOpportunities() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: opportunities, refetch } = trpc.opportunities.adminList.useQuery({ limit: 50 });
  const update = trpc.opportunities.adminUpdate.useMutation({ onSuccess: () => { toast.success("Oportunidade atualizada"); refetch(); }, onError: (e) => toast.error(e.message) });

  useEffect(() => { if (!loading && user?.role !== "admin" && user?.role !== "owner") navigate("/"); }, [loading, user]);

  return (
    <PublicLayout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Moderacao de Oportunidades</h1>
        <div className="space-y-3">
          {(opportunities ?? []).map((o: any) => (
            <div key={o.id} className="rounded-xl border border-border bg-card p-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{o.title}</p>
                <p className="text-xs text-muted-foreground">{o.category} · {o.city}{o.state ? `, ${o.state}` : ""}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={o.status === "active" ? "default" : o.status === "rejected" ? "destructive" : "secondary"}>{o.status}</Badge>
                {o.status !== "active" && <Button size="sm" onClick={() => update.mutate({ id: o.id, status: "active" })}>Aprovar</Button>}
                {o.status === "active" && <Button size="sm" variant="outline" className="text-red-600" onClick={() => update.mutate({ id: o.id, status: "rejected" })}>Rejeitar</Button>}
              </div>
            </div>
          ))}
          {(opportunities ?? []).length === 0 && <p className="text-center py-8 text-muted-foreground">Nenhuma oportunidade encontrada</p>}
        </div>
      </div>
    </PublicLayout>
  );
}
