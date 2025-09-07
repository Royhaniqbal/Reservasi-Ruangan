import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

type AvailabilitySlot = { startTime: string; endTime: string };

export default function BookingTab({
  setHistory,
}: {
  setHistory: React.Dispatch<React.SetStateAction<any[]>>;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
  const [timeStart, setTimeStart] = useState<string>("");
  const [timeEnd, setTimeEnd] = useState<string>("");
  const [pic, setPic] = useState<string>("");

  const rooms = [
    { id: 1, name: "Ruang Rapat Dirjen", capacity: "24 orang", img: "/gambarsatu.jpg" },
    { id: 2, name: "Ruang Rapat Sesditjen", capacity: "10 orang", img: "/gambardua.jpeg" },
    { id: 3, name: "Command Center", capacity: "12 orang", img: "/gambarempat.jpg" },
    { id: 4, name: "Ruang Rapat Lt2", capacity: "16 orang", img: "/gambarlima.jpg" },
    { id: 5, name: "Ballroom", capacity: "300 orang", img: "/gambarenam.jpg" },
  ];

  const bookingData = {
    room: rooms.find((r) => r.id === selected)?.name || null,
    date: selectedDate || null,
    startTime: timeStart || null,
    endTime: timeEnd || null,
    pic: pic || null,
  };

  // 🔹 Fetch availability setiap kali room/date berubah
  useEffect(() => {
    const fetchAvailability = async () => {
      if (bookingData.room && bookingData.date) {
        try {
          const res = await fetch("http://localhost:5000/api/check-availability", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ room: bookingData.room, date: bookingData.date }),
          });

          if (!res.ok) {
            console.error("Availability error:", res.status, await res.text());
            setAvailability([]);
            return;
          }

          const data = await res.json();
          setAvailability(Array.isArray(data.available) ? data.available : []);
        } catch (error) {
          console.error("Error fetching availability:", error);
          setAvailability([]);
        }
      } else {
        setAvailability([]);
      }
    };

    fetchAvailability();
  }, [bookingData.room, bookingData.date]);

  const handleSubmit = async () => {
    if (!bookingData.room || !bookingData.date || !bookingData.startTime || !bookingData.endTime || !bookingData.pic) {
      toast.error("⚠️ Mohon lengkapi semua data sebelum mengajukan!", {
        style: { background: "#fee2e2", color: "#b91c1c", fontWeight: "600" },
      });
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const data = await res.json().catch(() => ({} as any));

      // 🔹 Tangani duplikasi
      if (res.status === 409) {
        toast.error(data.message || "⚠️ Ruangan sudah dibooking pada tanggal & jam yang sama", {
          style: { background: "#fee2e2", color: "#b91c1c", fontWeight: "600" },
        });
        return; // jangan reset form
      }

      if (!res.ok || data?.success === false) {
        const msg = data?.message || `Gagal menyimpan booking (HTTP ${res.status})`;
        throw new Error(msg);
      }

      const itemToAdd =
        data && data._id
          ? {
              room: data.room,
              date: data.date,
              startTime: data.startTime,
              endTime: data.endTime,
              pic: data.pic,
              _id: data._id,
            }
          : bookingData;

      setHistory((prev) => [...prev, itemToAdd]);

      toast.success("✅ Booking berhasil disimpan ke database!", {
        style: { background: "#dbeafe", color: "#1e3a8a", fontWeight: "600" },
      });

      // Reset form
      setSelected(null);
      setSelectedDate("");
      setTimeStart("");
      setTimeEnd("");
      setPic("");
    } catch (error: any) {
      console.error("Submit error:", error);
      toast.error(`❌ Terjadi kesalahan saat menyimpan ke server: ${error.message || ""}`, {
        style: { background: "#fee2e2", color: "#b91c1c", fontWeight: "600" },
      });
    }
  };

  return (
    <div className="min-h-screen text-black font-bold bg-white pt-0 px-0">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Bagian kiri: daftar ruangan */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`w-full bg-transparent border-2 rounded-xl flex flex-col justify-between items-center p-3 transition
                  ${selected === room.id ? "border-blue-500 shadow-xl" : "border-gray-300 shadow-sm"}`}
              >
                <div className="flex flex-col items-center">
                  <img
                    src={room.img}
                    alt={room.name}
                    className="w-full h-40 object-cover block mb-2 rounded-lg"
                  />
                  <p className="text-base text-center leading-tight">{room.name}</p>
                  <p className="text-sm text-center leading-tight font-normal mt-0.5">
                    (Kapasitas {room.capacity})
                  </p>
                </div>
                <button
                  onClick={() => setSelected(room.id)}
                  className={`px-4 py-1 rounded-lg transition mb-1 text-white
                    ${selected === room.id ? "bg-blue-700 hover:bg-blue-700" : "bg-blue-300 hover:bg-blue-700"}`}
                >
                  Pilih
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bagian kanan: form booking */}
        <div className="w-full lg:w-[350px] p-4 border rounded-lg shadow-md bg-white h-fit lg:ml-auto">
          <div className="mb-4">
            <label className="block text-sm mb-1">Tanggal Pemakaian</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 font-normal"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Ketersediaan</label>
            <div className="w-full border rounded-lg px-3 py-2 bg-gray-100 text-gray-700 font-normal min-h-[50px]">
              {availability.length > 0 ? (
                <ul className="list-disc list-inside text-sm">
                  {availability.map((slot, idx) => (
                    <li key={idx}>
                      {slot.startTime} - {slot.endTime}
                    </li>
                  ))}
                </ul>
              ) : (
                <span className="text-gray-500 text-sm">
                  {bookingData.room && bookingData.date ? "Tidak ada slot kosong" : "(Pilih ruangan & tanggal dulu)"}
                </span>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">Waktu Pemakaian</label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="w-1/2 border rounded-lg px-3 py-2 font-normal"
              />
              <span>-</span>
              <input
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="w-1/2 border rounded-lg px-3 py-2 font-normal"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm mb-1">PIC</label>
            <input
              type="text"
              value={pic}
              onChange={(e) => setPic(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 font-normal"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-full bg-blue-300 hover:bg-blue-700 text-white font-semibold"
          >
            Kirim Pengajuan
          </button>

          <div className="mt-4">
            <Toaster position="top-center" reverseOrder={false} gutter={8} />
          </div>
        </div>
      </div>
    </div>
  );
}
