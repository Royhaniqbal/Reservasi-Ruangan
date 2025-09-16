"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWhatsAppMessage = sendWhatsAppMessage;
// server/src/sendWhatsAppMessage.ts
const axios_1 = __importDefault(require("axios"));
const FONNTE_API_URL = "https://api.fonnte.com/send";
async function sendWhatsAppMessage(to, message) {
    try {
        // 🔑 Cek token dari .env
        // console.log("🔑 Token dipakai:", process.env.FONNTE_API_KEY);
        const res = await axios_1.default.post(FONNTE_API_URL, {
            target: to,
            message: message,
        }, {
            headers: {
                Authorization: process.env.FONNTE_API_KEY || "",
            },
        });
        // console.log(`✅ WA request ke ${to}: ${message}`);
        // console.log("📩 Response Fonnte:", res.data);
    }
    catch (error) {
        if (axios_1.default.isAxiosError(error)) {
            console.error("❌ Gagal kirim WA:", error.response?.data || error.message);
        }
        else {
            console.error("❌ Error tidak terduga:", error);
        }
    }
}
