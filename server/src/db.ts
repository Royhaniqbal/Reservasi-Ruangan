import mongoose from "mongoose";

const MONGO_URI = "mongodb+srv://royhaniqbal:<mRi140597>@sipamancluster.na6ztxj.mongodb.net/?retryWrites=true&w=majority&appName=SipamanCluster"; 
// 👉 ganti kalau pakai Mongo Atlas

export async function connectDB() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  }
}
