import { useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicLayout from "@/components/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminLogs() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const { data: logs } = trpc.admin.logs.useQuery({ limit: 100 });

  useEffect(() => { if (!loading && user?.role !== "admin" && user?.role !== "owner") navigate("/"); }, [loading, user]);

  return (
    <PublicLayout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Logs de Auditoria</h1>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="text-left p-3">Acao</th><th className="text-left p-3">Entidade</th><th className="text-left p-3">ID</th><th className="text-left p-3">Data</th></tr></thead>
            <tbody>
              {(logs ?? []).map((log: any) => (
                <tr key={log.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-3"><Badge variant="outline" className="text-xs">{log.action}</Badge></td>
                  <td className="p-3 text-muted-foreground">{log.entityType}</td>
                  <td className="p-3 text-muted-foreground">{log.entityId}</td>
                  <td className="p-3 text-muted-foreground">{format(new Date(log.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {(logs ?? []).length === 0 && <p className="text-center py-8 text-muted-foreground">Nenhum log encontrado</p>}
        </div>
      </div>
    </PublicLayout>
  );
}
