import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";

const OG_BASE = "https://pnsp-platform-production.up.railway.app";
const FRONTEND = "https://pnsp-platform.vercel.app";

// ─── ShareOption — outside export default ────────────────────────────────────
function ShareOption({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        width: "100%",
        padding: "10px 14px",
        background: "transparent",
        border: "none",
        borderRadius: 8,
        color: "var(--creme-80)",
        fontSize: 13,
        fontWeight: 500,
        fontFamily: "var(--font-body)",
        cursor: "pointer",
        transition: "background 0.15s",
        textAlign: "left",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background = "rgba(212,146,10,0.10)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background = "transparent";
      }}
    >
      {icon}
      {label}
    </button>
  );
}

// ─── ShareButton — default export ────────────────────────────────────────────
export default function ShareButton({ slug, name }: { slug: string; name: string }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const ogUrl = `${OG_BASE}/og/perfil/${slug}`;
  const directUrl = `${FRONTEND}/perfil/${slug}`;
  const text = `Confira o perfil de ${name} na PNSP — infraestrutura digital do samba e pagode:`;

  function handleWhatsApp() {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${text} ${ogUrl}`)}`,
      "_blank",
    );
    setOpen(false);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(directUrl);
    } catch {
      // ignore
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setOpen(false);
  }

  function handleNative() {
    if (navigator.share) {
      navigator.share({ title: `${name} — PNSP`, text, url: ogUrl }).catch(() => {});
    }
    setOpen(false);
  }

  const hasNativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          padding: "10px 16px",
          background: "var(--terra)",
          border: "1px solid var(--creme-20)",
          borderRadius: "var(--radius-md)",
          color: "var(--creme-80)",
          fontSize: "var(--text-sm)",
          fontWeight: 600,
          fontFamily: "var(--font-body)",
          cursor: "pointer",
          transition: "var(--transition)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "rgba(212,146,10,0.40)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.borderColor = "var(--creme-20)";
        }}
      >
        {copied ? (
          <Check style={{ width: 14, height: 14, color: "#10b981" }} />
        ) : (
          <Share2 style={{ width: 14, height: 14 }} />
        )}
        Compartilhar
      </button>

      {open && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 40 }}
            onClick={() => setOpen(false)}
          />
          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              zIndex: 50,
              minWidth: 210,
              background: "var(--surface)",
              border: "1px solid var(--creme-10)",
              borderRadius: 12,
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
              padding: 6,
            }}
          >
            <ShareOption
              icon={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              }
              label="Compartilhar no WhatsApp"
              onClick={handleWhatsApp}
            />
            <ShareOption
              icon={<Copy style={{ width: 15, height: 15, color: "var(--ouro)" }} />}
              label="Copiar link"
              onClick={handleCopy}
            />
            {hasNativeShare && (
              <ShareOption
                icon={<Share2 style={{ width: 15, height: 15, color: "var(--ouro)" }} />}
                label="Compartilhar..."
                onClick={handleNative}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
