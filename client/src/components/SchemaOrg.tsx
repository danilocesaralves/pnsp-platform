import { Helmet } from "react-helmet-async";

const BASE = "https://pnsp-platform.vercel.app";

// ─── Types ────────────────────────────────────────────────────────────────────
interface OrganizationProps {
  type: "organization";
}

interface PersonProps {
  type: "person";
  name: string;
  description?: string;
  image?: string;
  url: string;
  genres?: string[];
  city?: string;
}

interface MusicGroupProps {
  type: "musicgroup";
  name: string;
  description?: string;
  image?: string;
  url: string;
  genres?: string[];
  city?: string;
}

interface FAQProps {
  type: "faq";
  faqItems: { q: string; a: string }[];
}

interface CourseProps {
  type: "course";
  name: string;
  description?: string;
  provider?: string;
  url: string;
}

type SchemaProps = OrganizationProps | PersonProps | MusicGroupProps | FAQProps | CourseProps;

// ─── SchemaOrg — default export ───────────────────────────────────────────────
export default function SchemaOrg(props: SchemaProps) {
  let schema: object;

  switch (props.type) {
    case "organization":
      schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "PNSP — Plataforma Nacional do Samba e do Pagode",
        alternateName: "PNSP",
        url: BASE,
        logo: `${BASE}/logo-pnsp-crop.png`,
        description:
          "Infraestrutura digital nacional para profissionais do samba e pagode brasileiro. Conecta artistas, grupos, produtores, estúdios, professores e contratantes.",
        foundingDate: "2024",
        areaServed: "BR",
        knowsAbout: [
          "samba",
          "pagode",
          "música brasileira",
          "infraestrutura digital",
          "mercado musical",
        ],
      };
      break;

    case "person":
      schema = {
        "@context": "https://schema.org",
        "@type": "Person",
        name: props.name,
        description: props.description,
        image: props.image,
        url: props.url,
        genre: props.genres?.length ? props.genres : undefined,
        address: props.city
          ? { "@type": "PostalAddress", addressLocality: props.city, addressCountry: "BR" }
          : undefined,
        memberOf: { "@type": "Organization", name: "PNSP", url: BASE },
      };
      break;

    case "musicgroup":
      schema = {
        "@context": "https://schema.org",
        "@type": "MusicGroup",
        name: props.name,
        description: props.description,
        image: props.image,
        url: props.url,
        genre: props.genres?.length ? props.genres : undefined,
        address: props.city
          ? { "@type": "PostalAddress", addressLocality: props.city, addressCountry: "BR" }
          : undefined,
        memberOf: { "@type": "Organization", name: "PNSP", url: BASE },
      };
      break;

    case "faq":
      schema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: props.faqItems.map((item) => ({
          "@type": "Question",
          name: item.q,
          acceptedAnswer: { "@type": "Answer", text: item.a },
        })),
      };
      break;

    case "course":
      schema = {
        "@context": "https://schema.org",
        "@type": "Course",
        name: props.name,
        description: props.description,
        provider: {
          "@type": "Organization",
          name: props.provider ?? "PNSP Academia",
          url: BASE,
        },
        url: props.url,
      };
      break;
  }

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
