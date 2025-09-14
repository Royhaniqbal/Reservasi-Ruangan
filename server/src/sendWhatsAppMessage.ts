// server/src/sendWhatsAppMessage.ts
import axios from "axios";

const FONNTE_API_URL = "https://api.fonnte.com/send";

export async function sendWhatsAppMessage(to: string, message: string) {
  try {
    // 🔑 Cek token dari .env
    // console.log("🔑 Token dipakai:", process.env.FONNTE_API_KEY);

    const res = await axios.post(
      FONNTE_API_URL,
      {
        target: to,
        message: message,
      },
      {
        headers: {
          Authorization: process.env.FONNTE_API_KEY || "",
        },
      }
    );

    // console.log(`✅ WA request ke ${to}: ${message}`);
    // console.log("📩 Response Fonnte:", res.data);
  } catch (error: any) {
    if (axios.isAxiosError(error)) {
      console.error("❌ Gagal kirim WA:", error.response?.data || error.message);
    } else {
      console.error("❌ Error tidak terduga:", error);
    }
  }
}
