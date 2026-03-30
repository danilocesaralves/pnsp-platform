import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Link, useLocation } from "wouter";
import { 
  Users, ArrowRight, CheckCircle, Share2, Copy, 
  MapPin, Music2, Star, Target, Zap, Clock
} from "lucide-react";
import { toast } from "sonner";

// ─── SUBCOMPONENTS ───────────────────────────────────────────────────────────

function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const targetDate = new Date("2026-06-01T00:00:00-03:00").getTime();
    
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 40 }}>
      {[
        { val: timeLeft.days, label: "dias" },
        { val: timeLeft.hours, label: "horas" },
        { val: timeLeft.mins, label: "min" },
        { val: timeLeft.secs, label: "seg" }
      ].map((item, i) => (
        <div key={i} style={{ 
          background: "#1a1200", 
          border: "1px solid rgba(212,146,10,0.3)", 
          borderRadius: 8, 
          padding: "12px", 
          minWidth: 70, 
          textAlign: "center" 
        }}>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--ouro)", fontFamily: "var(--font-display)" }}>{item.val}</div>
          <div style={{ fontSize: 10, color: "var(--creme-50)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{item.label}</div>
        </div>
      ))}
    </div>
  );
}

function WaitlistForm({ referralCode, onResult }: { referralCode?: string; onResult: (res: any) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [profileType, setProfileType] = useState("");
  const [loading, setLoading] = useState(false);

  const mutation = trpc.agency.joinWaitlist.useMutation({
    onSuccess: (data) => {
      setLoading(false);
      onResult(data);
      toast.success("Sua vaga no ecossistema está garantida!");
    },
    onError: (err) => {
      setLoading(false);
      toast.error(err.message);
    }
  });

  const handleSubmit = () => {
    if (!name || !email) return toast.error("Preencha ao menos nome e e-mail.");
    setLoading(true);
    mutation.mutate({ name, email, city, profileType, referralCode });
  };

  return (
    <div style={{ background: "#1a1200", padding: "32px", borderRadius: 16, border: "1px solid rgba(212,146,10,0.15)", maxWidth: 460, margin: "0 auto" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "var(--creme-50)", marginBottom: 6 }}>Nome Completo</label>
          <input 
            value={name} onChange={e => setName(e.target.value)}
            style={{ width: "100%", background: "#0A0800", border: "1px solid var(--creme-10)", borderRadius: 8, padding: "12px", color: "white", outline: "none" }}
            placeholder="Ex: Danilo Cesar"
          />
        </div>
        <div>
          <label style={{ display: "block", fontSize: 12, color: "var(--creme-50)", marginBottom: 6 }}>E-mail Profissional</label>
          <input 
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            style={{ width: "100%", background: "#0A0800", border: "1px solid var(--creme-10)", borderRadius: 8, padding: "12px", color: "white", outline: "none" }}
            placeholder="contato@seuexemplo.com"
          />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--creme-50)", marginBottom: 6 }}>Cidade</label>
            <input 
              value={city} onChange={e => setCity(e.target.value)}
              style={{ width: "100%", background: "#0A0800", border: "1px solid var(--creme-10)", borderRadius: 8, padding: "12px", color: "white", outline: "none" }}
              placeholder="Ex: São Paulo"
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, color: "var(--creme-50)", marginBottom: 6 }}>Perfil</label>
            <select 
              value={profileType} onChange={e => setProfileType(e.target.value)}
              style={{ width: "100%", background: "#0A0800", border: "1px solid var(--creme-10)", borderRadius: 8, padding: "12px", color: "white", outline: "none" }}
            >
              <option value="">Selecione...</option>
              <option value="artista">Artista / Músico</option>
              <option value="produtor">Produtor</option>
              <option value="escola">Escola de Samba</option>
              <option value="venue">Casa de Show</option>
            </select>
          </div>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={loading}
          style={{ width: "100%", padding: "16px", background: "var(--ouro)", color: "var(--preto)", border: "none", borderRadius: 8, fontWeight: 800, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 12 }}
        >
          {loading ? "Processando..." : (
            <>Entrar no Ecossistema <ArrowRight style={{ width: 18, height: 18 }} /></>
          )}
        </button>
      </div>
    </div>
  );
}

function SuccessState({ result }: { result: any }) {
  const link = `https://pnsp-platform.vercel.app/pre-lancamento?ref=${result.referralCode}`;

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    toast.success("Link de convite copiado!");
  };

  return (
    <div style={{ background: "#1a1200", padding: "40px", borderRadius: 16, border: "1px solid var(--ouro)", maxWidth: 460, margin: "0 auto", textAlign: "center" }}>
      <CheckCircle style={{ width: 48, height: 48, color: "var(--ouro)", margin: "0 auto 24px" }} />
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", color: "white", marginBottom: 12 }}>
        Você está na fila!
      </h2>
      <div style={{ fontSize: 32, fontWeight: 800, color: "var(--ouro)", marginBottom: 8 }}>#{result.position}</div>
      <p style={{ color: "var(--creme-50)", fontSize: "var(--text-sm)", marginBottom: 32 }}>
        Sua posição no ecossistema profissional do samba.
      </p>

      <div style={{ background: "rgba(0,0,0,0.3)", padding: "16px", borderRadius: 12, marginBottom: 24 }}>
        <p style={{ fontSize: 12, color: "var(--creme-70)", marginBottom: 12 }}>Indique 3 colegas e suba na fila:</p>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ flex: 1, background: "#0A0800", border: "1px solid var(--creme-10)", borderRadius: 8, padding: "10px", color: "var(--ouro)", fontSize: 11, overflow: "hidden", textOverflow: "ellipsis" }}>
            {link}
          </div>
          <button onClick={copyLink} style={{ background: "var(--ouro)", color: "var(--preto)", border: "none", borderRadius: 8, padding: "0 12px", cursor: "pointer" }}>
            <Copy style={{ width: 16, height: 16 }} />
          </button>
        </div>
      </div>
      
      <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", color: "var(--creme-30)", fontSize: 11 }}>
        <Users style={{ width: 14, height: 14 }} />
        [N] profissionais já garantiram seu lugar
      </div>
    </div>
  );
}

// ─── MAIN PAGE ───────────────────────────────────────────────────────────────

export default function PreLaunch() {
  const [search] = useState(new URLSearchParams(window.location.search));
  const referralCode = search.get("ref") || undefined;
  const [result, setResult] = useState<any>(null);

  return (
    <div style={{ minHeight: "100vh", background: "#0A0800", color: "var(--creme)", padding: "60px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        
        {/* Brand */}
        <div style={{ marginBottom: 40 }}>
           <img src="/logo-pnsp-crop.png" alt="PNSP" style={{ height: 100, margin: "0 auto 24px", filter: "invert(1) brightness(1.2)" }} />
           <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-5xl)", fontWeight: 800, lineHeight: 1, marginBottom: 16 }}>
             O ecossistema profissional do <span style={{ color: "var(--ouro)" }}>samba e pagode</span> chegou.
           </h1>
           <p style={{ fontSize: "var(--text-xl)", color: "var(--creme-50)", maxWidth: 540, margin: "0 auto" }}>
             A infraestrutura digital que conecta artistas, contratantes e o mercado em um só lugar.
           </p>
        </div>

        <CountdownTimer />

        {result ? (
          <SuccessState result={result} />
        ) : (
          <WaitlistForm referralCode={referralCode} onResult={setResult} />
        )}

        {/* Footer */}
        <div style={{ marginTop: 80, borderTop: "1px solid var(--creme-10)", paddingTop: 32 }}>
           <Link href="/faq">
             <span style={{ color: "var(--creme-30)", fontSize: "var(--text-sm)", cursor: "pointer" }}>Perguntas Frequentes</span>
           </Link>
           <div style={{ color: "var(--creme-20)", fontSize: 11, marginTop: 12 }}>
             © 2026 PNSP — Plataforma Nacional do Samba e Pagode
           </div>
        </div>
      </div>
    </div>
  );
}
