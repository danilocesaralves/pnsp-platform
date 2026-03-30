import { useState } from "react";
import PublicLayout from "@/components/PublicLayout";
import SEO from "@/components/SEO";
import SchemaOrg from "@/components/SchemaOrg";
import { ChevronDown, ChevronUp } from "lucide-react";

const FAQ_ITEMS = [
  {
    q: "O que é a PNSP?",
    a: "A PNSP (Plataforma Nacional do Samba e do Pagode) é a primeira infraestrutura digital dedicada ao ecossistema profissional do samba e pagode brasileiro. Conectamos artistas, grupos, produtores, estúdios, professores e contratantes em um único ambiente digital integrado.",
  },
  {
    q: "Como a PNSP beneficia profissionais do samba e do pagode?",
    a: "A PNSP oferece ferramentas concretas para toda a cadeia do ecossistema: perfil profissional com visibilidade nacional, gestão de negociações e contratos digitais com assinatura eletrônica, oportunidades segmentadas por tipo de profissional, academia com cursos especializados, e um mapa vivo do mercado nacional.",
  },
  {
    q: "A infraestrutura digital PNSP é gratuita?",
    a: "Sim. O acesso à infraestrutura digital PNSP é gratuito para profissionais do samba e do pagode. Nosso objetivo é democratizar o acesso a ferramentas de gestão e visibilidade que antes só grandes artistas e grandes estruturas tinham.",
  },
  {
    q: "Como funciona o sistema de oportunidades?",
    a: "Contratantes publicam oportunidades segmentadas por tipo de profissional — artista solo, grupo/banda, produtor, estúdio, professor, entre outros. Profissionais compatíveis recebem notificações automáticas e podem se candidatar diretamente pela plataforma, sem intermediários.",
  },
  {
    q: "O que diferencia a PNSP de outras plataformas?",
    a: "A PNSP não é uma rede social genérica — é infraestrutura digital especializada. Inclui contratos digitais com assinatura eletrônica, gestão financeira, CRM de patrocinadores, marketing inteligente com IA, memórias de carreira e toda uma camada profissional construída especificamente para o ecossistema do samba e pagode.",
  },
];

// ─── FAQItem — outside export default ────────────────────────────────────────
function FAQItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      style={{
        background: "var(--surface)",
        border: `1px solid ${open ? "rgba(212,146,10,0.40)" : "var(--creme-10)"}`,
        borderRadius: 12,
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      <button
        type="button"
        onClick={onToggle}
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          width: "100%",
          padding: "20px 24px",
          background: "transparent",
          border: "none",
          color: "var(--creme)",
          fontSize: "var(--text-base)",
          fontWeight: 600,
          fontFamily: "var(--font-body)",
          cursor: "pointer",
          textAlign: "left",
          gap: 16,
        }}
      >
        <span>{question}</span>
        {open ? (
          <ChevronUp style={{ width: 18, height: 18, color: "var(--ouro)", flexShrink: 0 }} />
        ) : (
          <ChevronDown style={{ width: 18, height: 18, color: "var(--ouro)", flexShrink: 0 }} />
        )}
      </button>
      {open && (
        <div
          style={{
            padding: "0 24px 20px",
            color: "var(--creme-50)",
            fontSize: "var(--text-sm)",
            lineHeight: 1.7,
          }}
        >
          {answer}
        </div>
      )}
    </div>
  );
}

// ─── FAQ — default export ─────────────────────────────────────────────────────
export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  function toggle(i: number) {
    setOpenIdx((prev) => (prev === i ? null : i));
  }

  return (
    <PublicLayout>
      <SEO
        title="FAQ — Perguntas Frequentes"
        description="Tire suas dúvidas sobre a PNSP, a infraestrutura digital do ecossistema do samba e pagode brasileiro. Saiba como conectar-se ao mercado profissional da música brasileira."
      />
      <SchemaOrg type="faq" faqItems={FAQ_ITEMS} />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "60px 24px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h1
            style={{
              fontSize: "var(--text-3xl)",
              fontWeight: 800,
              fontFamily: "var(--font-display)",
              color: "var(--creme)",
              marginBottom: 12,
            }}
          >
            Perguntas Frequentes
          </h1>
          <p
            style={{
              color: "var(--creme-50)",
              fontSize: "var(--text-base)",
              maxWidth: 540,
              margin: "0 auto",
            }}
          >
            Tudo que você precisa saber sobre a infraestrutura digital do ecossistema do samba e
            pagode brasileiro.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {FAQ_ITEMS.map((item, i) => (
            <FAQItem
              key={i}
              question={item.q}
              answer={item.a}
              open={openIdx === i}
              onToggle={() => toggle(i)}
            />
          ))}
        </div>

        <div
          style={{
            marginTop: 48,
            padding: 32,
            background: "var(--surface)",
            border: "1px solid rgba(212,146,10,0.20)",
            borderRadius: 16,
            textAlign: "center",
          }}
        >
          <p
            style={{
              color: "var(--creme-50)",
              fontSize: "var(--text-sm)",
              marginBottom: 16,
            }}
          >
            A PNSP é construída com e para profissionais do ecossistema do samba e pagode.
          </p>
          <a
            href="/cadastrar"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 28px",
              background: "var(--ouro)",
              borderRadius: "var(--radius-md)",
              color: "#0A0800",
              fontSize: "var(--text-sm)",
              fontWeight: 700,
              fontFamily: "var(--font-body)",
              textDecoration: "none",
            }}
          >
            Entrar no ecossistema
          </a>
        </div>
      </div>
    </PublicLayout>
  );
}
