import { useEffect } from "react";
import { getLoginUrl } from "@/const";
import PublicLayout from "@/components/PublicLayout";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function EntrarPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = getLoginUrl();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PublicLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Entrando na PNSP</h1>
          <p className="text-muted-foreground">Você será redirecionado para o login em instantes...</p>
        </div>
        <Button variant="outline" onClick={() => { window.location.href = getLoginUrl(); }}>
          Clique aqui se não for redirecionado
        </Button>
      </div>
    </PublicLayout>
  );
}
