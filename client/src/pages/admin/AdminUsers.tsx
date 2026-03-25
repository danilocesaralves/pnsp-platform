import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import PublicLayout from "@/components/PublicLayout";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminUsers() {
  const { user, loading } = useAuth();
  const [, navigate] = useLocation();
  const [offset] = useState(0);
  const { data: users, refetch } = trpc.admin.users.useQuery({ limit: 50, offset });
  const updateUser = trpc.admin.updateUser.useMutation({ onSuccess: () => { toast.success("Usuario atualizado"); refetch(); }, onError: (e) => toast.error(e.message) });

  useEffect(() => { if (!loading && user?.role !== "admin" && user?.role !== "owner") navigate("/"); }, [loading, user]);

  return (
    <PublicLayout>
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-6">Gestão de Usuários</h1>
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="text-left p-3">Nome</th><th className="text-left p-3">Email</th><th className="text-left p-3">Papel</th><th className="text-left p-3">Cadastro</th><th className="text-left p-3">Acoes</th></tr></thead>
            <tbody>
              {(users ?? []).map((u: any) => (
                <tr key={u.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">{u.name ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{u.email ?? "—"}</td>
                  <td className="p-3"><Badge variant={u.role === "admin" ? "default" : "secondary"}>{u.role}</Badge></td>
                  <td className="p-3 text-muted-foreground">{format(new Date(u.createdAt), "dd/MM/yyyy", { locale: ptBR })}</td>
                  <td className="p-3">
                    <Select value={u.role} onValueChange={(v) => updateUser.mutate({ id: u.id, role: v as any })}>
                      <SelectTrigger className="h-7 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="user">user</SelectItem><SelectItem value="admin">admin</SelectItem></SelectContent>
                    </Select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PublicLayout>
  );
}
