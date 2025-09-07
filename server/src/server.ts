// backend/server.ts
import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { connectDB } from "./db";
import Booking from "./models/Booking";
import { appendBookingToSheet, deleteBookingFromSheet } from "./syncSheets";
import authRoutes from './routes/auth';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

// ✅ Connect ke MongoDB
connectDB();

app.use('/api/auth', authRoutes);

// ✅ Endpoint: Cek ketersediaan
app.post("/api/check-availability", async (req: Request, res: Response) => {
  const { room, date } = req.body;
  if (!room || !date) {
    return res.status(400).json({ error: "Room dan date wajib diisi" });
  }

  const roomBookings = await Booking.find({ room, date });
  const WORKING_HOURS = [
    { startTime: "07:30", endTime: "17:00" },
  ];

  let availableSlots = [...WORKING_HOURS];

  roomBookings.forEach((booked: any) => {
    availableSlots = availableSlots.flatMap((slot) => {
      if (booked.startTime >= slot.endTime || booked.endTime <= slot.startTime) {
        return [slot];
      }
      const result: { startTime: string; endTime: string }[] = [];
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

// ✅ Endpoint: Buat booking dengan pengecekan double booking
app.post("/api/book", async (req: Request, res: Response) => {
  const { room, date, startTime, endTime, pic } = req.body;

  if (!room || !date || !startTime || !endTime || !pic) {
    return res.status(400).json({ success: false, message: "Data booking tidak lengkap" });
  }

  try {
    // 🔹 Cek apakah ada booking yang overlap
    const conflict = await Booking.findOne({
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

    // 🔹 Simpan booking baru
    const newBooking = new Booking({ room, date, startTime, endTime, pic });
    await newBooking.save();

    // 🔹 Sinkronisasi ke Google Sheets
    try {
      await appendBookingToSheet({ room, date, startTime, endTime, pic });
    } catch (err) {
      console.error("⚠️ Gagal sinkron ke Google Sheets:", err);
    }

    res.json({ success: true, message: "Booking berhasil dibuat", ...newBooking.toObject() });
  } catch (error) {
    console.error("❌ Error saat simpan booking:", error);
    res.status(500).json({ success: false, message: "Gagal simpan booking" });
  }
});

// ✅ Endpoint: Batalkan booking
app.post("/api/cancel-booking", async (req: Request, res: Response) => {
  const { room, date, startTime, endTime, pic } = req.body;

  try {
    const booking = await Booking.findOne({ room, date, startTime, endTime, pic });

    if (!booking) {
      return res.json({ success: false, message: "Booking tidak ditemukan" });
    }

    await Booking.deleteOne({ _id: booking._id });

    try {
      await deleteBookingFromSheet({
        room: booking.room,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        pic: booking.pic,
      });
    } catch (err) {
      console.error("⚠️ Gagal hapus dari Google Sheets:", err);
    }

    res.json({ success: true, message: "Booking berhasil dibatalkan" });
  } catch (err) {
    console.error("❌ Error saat cancel booking:", err);
    res.status(500).json({ success: false, message: "Gagal membatalkan booking" });
  }
});

// ✅ Endpoint: Lihat semua booking
app.get("/api/bookings", async (_req: Request, res: Response) => {
  const allBookings = await Booking.find();
  res.json(allBookings);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
