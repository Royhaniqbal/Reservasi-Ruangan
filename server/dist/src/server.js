"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/server.ts
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./db");
const Booking_1 = __importDefault(require("./models/Booking"));
const syncSheets_1 = require("./syncSheets");
const auth_1 = __importDefault(require("./routes/auth"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("./models/User"));
const sendWhatsAppMessage_1 = require("./sendWhatsAppMessage"); // ✅ Import WA helper
const app = (0, express_1.default)();
const PORT = 5000;
const SECRET = process.env.JWT_SECRET || "your_secret_key";
app.use((0, cors_1.default)());
app.use(body_parser_1.default.json());
// ✅ Connect ke MongoDB
(0, db_1.connectDB)();
app.use('/api/auth', auth_1.default);
// ✅ Endpoint: Cek ketersediaan
app.post("/api/check-availability", async (req, res) => {
    const { room, date } = req.body;
    if (!room || !date) {
        return res.status(400).json({ error: "Room dan date wajib diisi" });
    }
    const roomBookings = await Booking_1.default.find({ room, date });
    const WORKING_HOURS = [{ startTime: "07:30", endTime: "17:00" }];
    let availableSlots = [...WORKING_HOURS];
    roomBookings.forEach((booked) => {
        availableSlots = availableSlots.flatMap((slot) => {
            if (booked.startTime >= slot.endTime || booked.endTime <= slot.startTime) {
                return [slot];
            }
            const result = [];
            if (booked.startTime > slot.startTime) {
                result.push({ startTime: slot.startTime, endTime: booked.startTime });
            }
            if (booked.endTime < slot.endTime) {
                result.push({ startTime: booked.endTime, endTime: slot.endTime });
            }
            return result;
        });
    });
    res.json({ room, date, available: availableSlots });
});
// ✅ Endpoint: Buat booking baru
app.post("/api/book", async (req, res) => {
    // console.log("📩 Data dari frontend:", req.body);
    const { room, date, startTime, endTime, pic } = req.body;
    if (!room || !date || !startTime || !endTime || !pic) {
        return res.status(400).json({ success: false, message: "Data booking tidak lengkap" });
    }
    try {
        // 🔹 Cek overlap
        const conflict = await Booking_1.default.findOne({
            room,
            date,
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
        });
        if (conflict) {
            return res.status(409).json({
                success: false,
                message: "⚠️ Ruangan ini sudah dibooking pada tanggal dan jam yang sama",
            });
        }
        const newBooking = new Booking_1.default({ room, date, startTime, endTime, pic });
        await newBooking.save();
        try {
            await (0, syncSheets_1.appendBookingToSheet)({ room, date, startTime, endTime, pic });
        }
        catch (err) {
            console.error("⚠️ Gagal sinkron ke Google Sheets:", err);
        }
        // ✅ Notif WA
        const msg = `📢 Booking Baru!
🏢 ${room}
📅 ${date}
⏰ ${startTime} - ${endTime}
👤 ${pic}`;
        await (0, sendWhatsAppMessage_1.sendWhatsAppMessage)("6281335382726", msg);
        res.json({ success: true, message: "Booking berhasil dibuat", ...newBooking.toObject() });
    }
    catch (error) {
        // console.error("❌ Error saat simpan booking:", error);
        res.status(500).json({ success: false, message: "Gagal simpan booking" });
    }
});
// ✅ Endpoint: Update booking
app.put("/api/book/:id", async (req, res) => {
    const { id } = req.params;
    const { room, date, startTime, endTime, pic } = req.body;
    if (!room || !date || !startTime || !endTime || !pic) {
        return res.status(400).json({ success: false, message: "Data booking tidak lengkap" });
    }
    try {
        const oldBooking = await Booking_1.default.findById(id);
        if (!oldBooking) {
            return res.status(404).json({ success: false, message: "Booking tidak ditemukan" });
        }
        // 🔹 Cek overlap dengan booking lain
        const conflict = await Booking_1.default.findOne({
            _id: { $ne: id },
            room,
            date,
            startTime: { $lt: endTime },
            endTime: { $gt: startTime },
        });
        if (conflict) {
            return res.status(409).json({
                success: false,
                message: "⚠️ Ruangan ini sudah dibooking pada tanggal dan jam yang sama",
            });
        }
        const updated = await Booking_1.default.findByIdAndUpdate(id, { room, date, startTime, endTime, pic }, { new: true });
        if (!updated) {
            return res.status(404).json({ success: false, message: "Booking tidak ditemukan" });
        }
        // 🔹 Sinkronisasi ke Google Sheets
        try {
            await (0, syncSheets_1.deleteBookingFromSheet)({
                room: oldBooking.room,
                date: oldBooking.date,
                startTime: oldBooking.startTime,
                endTime: oldBooking.endTime,
                pic: oldBooking.pic,
            });
            await (0, syncSheets_1.appendBookingToSheet)({
                room: updated.room,
                date: updated.date,
                startTime: updated.startTime,
                endTime: updated.endTime,
                pic: updated.pic,
            });
        }
        catch (err) {
            console.error("⚠️ Gagal sinkron update ke Google Sheets:", err);
        }
        // ✅ Notif WA
        const msg = `✏️ Booking Diperbarui!
🏢 ${room}
📅 ${date}
⏰ ${startTime} - ${endTime}
👤 ${pic}`;
        await (0, sendWhatsAppMessage_1.sendWhatsAppMessage)("6281335382726", msg);
        res.json({ success: true, message: "Booking berhasil diupdate", ...updated.toObject() });
    }
    catch (error) {
        // console.error("❌ Error saat update booking:", error);
        res.status(500).json({ success: false, message: "Gagal update booking" });
    }
});
// ✅ Endpoint: Batalkan booking
app.post("/api/cancel-booking", async (req, res) => {
    const { room, date, startTime, endTime, pic } = req.body;
    try {
        const booking = await Booking_1.default.findOne({ room, date, startTime, endTime, pic });
        if (!booking) {
            return res.json({ success: false, message: "Booking tidak ditemukan" });
        }
        await Booking_1.default.deleteOne({ _id: booking._id });
        try {
            await (0, syncSheets_1.deleteBookingFromSheet)({
                room: booking.room,
                date: booking.date,
                startTime: booking.startTime,
                endTime: booking.endTime,
                pic: booking.pic,
            });
        }
        catch (err) {
            console.error("⚠️ Gagal hapus dari Google Sheets:", err);
        }
        // ✅ Notif WA
        const msg = `❌ Booking Dibatalkan!
🏢 ${booking.room}
📅 ${booking.date}
⏰ ${booking.startTime} - ${booking.endTime}
👤 ${booking.pic}`;
        await (0, sendWhatsAppMessage_1.sendWhatsAppMessage)("6281335382726", msg);
        res.json({ success: true, message: "Booking berhasil dibatalkan" });
    }
    catch (err) {
        // console.error("❌ Error saat cancel booking:", err);
        res.status(500).json({ success: false, message: "Gagal membatalkan booking" });
    }
});
// ✅ Endpoint: Semua booking
app.get("/api/bookings", async (_req, res) => {
    const allBookings = await Booking_1.default.find();
    res.json(allBookings);
});
// ✅ Endpoint: Booking user login
app.get("/api/my-bookings", async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "No token" });
    try {
        const decoded = jsonwebtoken_1.default.verify(token, SECRET);
        const user = await User_1.default.findById(decoded.id);
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const bookings = await Booking_1.default.find({ pic: user.username }).sort({ date: -1 });
        res.json(bookings);
    }
    catch (err) {
        // console.error("❌ Error get my bookings:", err);
        res.status(500).json({ message: "Server error" });
    }
});
// ✅ Root
app.get("/", (_req, res) => {
    res.send("✅ API running...");
});
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
