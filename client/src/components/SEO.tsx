import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const SITE_NAME = "PNSP — Plataforma Nacional do Samba e Pagode";
const DEFAULT_DESC = "A plataforma digital do samba e pagode brasileiro — conectando artistas, produtores, estúdios, contratantes e toda a cadeia musical nacional.";
const DEFAULT_IMAGE = "/og-pnsp.jpg";

export default function SEO({ title, description, image, url }: SEOProps) {
  const fullTitle   = title ? `${title} | PNSP` : SITE_NAME;
  const desc        = description ?? DEFAULT_DESC;
  const img         = image ?? DEFAULT_IMAGE;
  const canonical   = url ?? (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:image"       content={img} />
      <meta property="og:type"        content="website" />
      <meta property="og:site_name"   content="PNSP" />
      {canonical && <link rel="canonical" href={canonical} />}
      {canonical && <meta property="og:url" content={canonical} />}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={desc} />
      <meta name="twitter:image"       content={img} />
    </Helmet>
  );
}
