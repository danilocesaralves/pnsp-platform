import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PublicLayout from "@/components/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/authClient";
import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { Link } from "wouter";

const loginSchema = z.object({
  email: z.string().min(1, "E-mail obrigatório").email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function EntrarPage() {
  const [, navigate] = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const utils = trpc.useUtils();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    setServerError(null);
    const result = await authClient.signIn.email({
      email: data.email,
      password: data.password,
    });

    if (result.error) {
      setServerError("E-mail ou senha incorretos.");
      return;
    }

    await utils.auth.me.invalidate();
    navigate("/");
  };

  return (
    <PublicLayout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 8 }}>
              <img src="/logo-pnsp.svg" alt="PNSP" style={{ height: 64, width: "auto" }} />
            </div>
            <p className="text-muted-foreground font-body">
              Acesse sua conta para continuar
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="seu@email.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            {serverError && (
              <p className="text-sm text-destructive text-center">{serverError}</p>
            )}

            <Button type="submit" className="w-full font-body font-semibold" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Entrar
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground font-body">
            Não tem conta?{" "}
            <Link href="/cadastrar">
              <span className="text-primary font-semibold cursor-pointer hover:underline">
                Criar conta grátis
              </span>
            </Link>
          </p>
        </div>
      </div>
    </PublicLayout>
  );
}
