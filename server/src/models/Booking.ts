// backend/models/Booking.ts
import mongoose, { Document, Schema } from "mongoose";

export interface IBooking extends Document {
  room: string;
  date: string;      // format YYYY-MM-DD
  startTime: string; // format HH:mm
  endTime: string;   // format HH:mm
  pic: string;
}

const BookingSchema: Schema = new Schema({
  room: { type: String, required: true },
  date: { type: String, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  pic: { type: String, required: true },
});

// ✅ Tambahkan compound index unik (supaya tidak bisa double booking)
BookingSchema.index(
  { room: 1, date: 1, startTime: 1, endTime: 1 },
  { unique: true }
);

export default mongoose.model<IBooking>("Booking", BookingSchema);
