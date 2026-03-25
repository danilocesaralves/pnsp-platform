import PublicLayout from "@/components/PublicLayout";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Mail, LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function MyAccount() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => { logout(); navigate("/"); toast.success("Sessao encerrada"); },
  });
  return (
    <PublicLayout>
      <div className="container py-8 max-w-lg">
        <h1 className="text-2xl font-bold mb-6">Minha Conta</h1>
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-7 w-7 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-lg">{user?.name ?? "Usuario"}</p>
              <div className="flex items-center gap-1 text-sm text-muted-foreground"><Mail className="h-3 w-3" />{user?.email ?? "—"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={user?.role === "admin" ? "default" : "secondary"}>{user?.role === "admin" ? "Administrador" : "Usuario"}</Badge>
          </div>
          <Button variant="outline" className="w-full text-red-600 border-red-200 hover:bg-red-50" onClick={() => logoutMutation.mutate()} disabled={logoutMutation.isPending}>
            <LogOut className="h-4 w-4 mr-2" />{logoutMutation.isPending ? "Saindo..." : "Sair da Conta"}
          </Button>
        </div>
      </div>
    </PublicLayout>
  );
}
