import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Bell, BellOff, Check } from "lucide-react";

// ─── PermissionButton — outside export default ───────────────────────────────
function PermissionButton({ onSubscribe }: { onSubscribe: () => Promise<void> }) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        await onSubscribe();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      style={{
        display: "inline-flex", alignItems: "center", gap: 8,
        padding: "8px 16px", borderRadius: 8,
        border: "1px solid rgba(212,146,10,0.3)",
        background: "var(--terra)",
        color: "var(--creme-50)",
        fontSize: 13, fontWeight: 500,
        cursor: loading ? "not-allowed" : "pointer",
        fontFamily: "var(--font-body)",
        transition: "all 0.15s",
        opacity: loading ? 0.7 : 1,
      }}
    >
      <Bell style={{ width: 14, height: 14, color: "var(--ouro)" }} />
      {loading ? "Ativando..." : "Ativar notificações"}
    </button>
  );
}

// ─── PushNotificationManager — default export ─────────────────────────────────
export default function PushNotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");
  const [subscribed, setSubscribed] = useState(false);

  const publicKeyQuery = trpc.push.getPublicKey.useQuery(undefined, { retry: false });
  const subscribeMut   = trpc.push.subscribe.useMutation();

  useEffect(() => {
    if (!("Notification" in window) || !("serviceWorker" in navigator)) {
      setPermission("unsupported");
      return;
    }
    setPermission(Notification.permission);
  }, []);

  async function handleSubscribe() {
    const vapidKey = publicKeyQuery.data;
    if (!vapidKey) return;

    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });

      const json = sub.toJSON();
      const keys = json.keys as { p256dh: string; auth: string } | undefined;
      if (!keys) return;

      await subscribeMut.mutateAsync({
        endpoint: sub.endpoint,
        p256dh:   keys.p256dh,
        auth:     keys.auth,
      });

      setPermission("granted");
      setSubscribed(true);
    } catch (err) {
      console.warn("[Push] Subscribe error:", err);
    }
  }

  // Not supported or denied — show nothing
  if (permission === "unsupported" || permission === "denied") return null;

  // Already granted and subscribed
  if (permission === "granted" && subscribed) {
    return (
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "#10b981", fontFamily: "var(--font-body)" }}>
        <Check style={{ width: 13, height: 13 }} />
        Notificações ativas
      </div>
    );
  }

  // VAPID not configured — server side
  if (publicKeyQuery.data === null) return null;

  // Prompt to subscribe
  return <PermissionButton onSubscribe={handleSubscribe} />;
}

// ─── Utility ─────────────────────────────────────────────────────────────────
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
