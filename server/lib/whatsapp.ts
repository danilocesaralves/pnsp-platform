/**
 * 📱 WhatsApp Integration (Z-API)
 * PNSP — Digital Infrastructure
 */

const ZAPI_INSTANCE = process.env.ZAPI_INSTANCE;
const ZAPI_TOKEN = process.env.ZAPI_TOKEN;

/**
 * Sends a WhatsApp message via Z-API
 */
export async function sendWhatsApp(phone: string, message: string): Promise<{ sent: boolean; reason?: string }> {
  if (!ZAPI_INSTANCE || !ZAPI_TOKEN) {
    console.warn("⚠️ [WhatsApp] Z-API não configurado (ZAPI_INSTANCE ou ZAPI_TOKEN ausente)");
    return { sent: false, reason: "Z-API não configurado" };
  }

  // Basic validation and cleaning
  const cleanPhone = phone.replace(/\D/g, "");
  if (cleanPhone.length < 10) {
    return { sent: false, reason: "Telefone inválido" };
  }

  try {
    const response = await fetch(`https://api.z-api.io/instances/${ZAPI_INSTANCE}/token/${ZAPI_TOKEN}/send-text`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone: cleanPhone,
        message: message,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[WhatsApp] Erro ao enviar mensagem:", errorData);
      return { sent: false, reason: `Erro API: ${response.status}` };
    }

    return { sent: true };
  } catch (error) {
    console.error("[WhatsApp] Exceção ao enviar mensagem:", error);
    return { sent: false, reason: error instanceof Error ? error.message : "Erro desconhecido" };
  }
}
