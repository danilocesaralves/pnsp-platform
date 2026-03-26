import { useEffect } from "react";
import PublicLayout from "@/components/PublicLayout";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function getRegisterUrl(): string {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signUp");

  return url.toString();
}

export default function CadastrarPage() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = getRegisterUrl();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <PublicLayout>
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-6 text-center px-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Criando sua conta</h1>
          <p className="text-muted-foreground">Você será redirecionado para o cadastro em instantes...</p>
        </div>
        <Button variant="outline" onClick={() => { window.location.href = getRegisterUrl(); }}>
          Clique aqui se não for redirecionado
        </Button>
      </div>
    </PublicLayout>
  );
}
