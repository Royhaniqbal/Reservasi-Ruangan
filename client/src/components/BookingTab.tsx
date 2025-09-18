// src/components/BookingTab.tsx
import { useState, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";

type AvailabilitySlot = { startTime: string; endTime: string };

const API = import.meta.env.VITE_API_BASE_URL;

export default function BookingTab({
  setHistory,
  editingBooking = null,
  onFinishEdit,
}: {
  setHistory: React.Dispatch<React.SetStateAction<any[]>>;
  editingBooking?: any | null;
  onFinishEdit?: (updated: any) => void;
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
    { id: 5, name: "Ballroom", capacity: "400 orang", img: "/gambarenam.jpg" },
  ];

  // 🔹 BookingData untuk dikirim ke server
  const bookingData = {
    _id: editingBooking?._id || null,
    room: rooms.find((r) => r.id === selected)?.name || null,
    date: selectedDate || null,
    startTime: timeStart || null,
    endTime: timeEnd || null,
    pic: pic || null,
  };

  // 🔹 Ambil user (PIC)
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;
      try {
        const res = await fetch(`${API}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data.username) setPic(data.username);
        }
      } catch (err) {
        console.error("❌ Error fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  // 🔹 Isi form kalau sedang edit
  useEffect(() => {
    if (editingBooking) {
      const room = rooms.find((r) => r.name === editingBooking.room);
      if (room) setSelected(room.id);
      setSelectedDate(editingBooking.date || "");
      setTimeStart(editingBooking.startTime || "");
      setTimeEnd(editingBooking.endTime || "");
      setPic(editingBooking.pic || "");
    }
  }, [editingBooking]);

  // 🔹 Fetch availability
  // code lama :
  // useEffect(() => {
  //   const fetchAvailability = async () => {
  //     if (bookingData.room && bookingData.date) {
  //       try {
  //         const res = await fetch(`${API}/api/check-availability`, {
  //           method: "POST",
  //           headers: { "Content-Type": "application/json" },
  //           body: JSON.stringify({ room: bookingData.room, date: bookingData.date }),
  //         });
  //         if (!res.ok) {
  //           setAvailability([]);
  //           return;
  //         }
  //         const data = await res.json();
  //         setAvailability(Array.isArray(data.available) ? data.available : []);
  //       } catch {
  //         setAvailability([]);
  //       }
  //     } else {
  //       setAvailability([]);
  //     }
  //   };
  //   fetchAvailability();
  // }, [bookingData.room, bookingData.date]);
  // 🔹 Fetch availability
// 🔹 Fetch availability (sertakan slot user sendiri saat edit)
useEffect(() => {
  const fetchAvailability = async () => {
    if (bookingData.room && bookingData.date) {
      try {
        const res = await fetch(`${API}/api/check-availability`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ room: bookingData.room, date: bookingData.date }),
        });

        if (!res.ok) {
          setAvailability([]);
          return;
        }

        let slots: AvailabilitySlot[] = [];
        const data = await res.json();
        if (Array.isArray(data.available)) {
          slots = data.available as AvailabilitySlot[];
        }

        // 👉 kalau sedang edit, tambahkan slot waktu booking lama user
        if (editingBooking) {
          slots.push({
            startTime: editingBooking.startTime,
            endTime: editingBooking.endTime,
          });
        }

        // Urutkan biar rapi
        slots.sort((a: AvailabilitySlot, b: AvailabilitySlot) =>
          a.startTime.localeCompare(b.startTime)
        );

        setAvailability(slots);
      } catch (err) {
        console.error("❌ Error fetch availability:", err);
        setAvailability([]);
      }
    } else {
      setAvailability([]);
    }
  };

  fetchAvailability();
}, [bookingData.room, bookingData.date, editingBooking]);



  // 🔹 Generate opsi jam (30 menit)
  // code lama
  // const generateTimeOptions = () => {
  //   if (!availability.length) return [];
  //   const options: string[] = [];
  //   availability.forEach((slot) => {
  //     const [startH, startM] = slot.startTime.split(":").map(Number);
  //     const [endH, endM] = slot.endTime.split(":").map(Number);
  //     let current = startH * 60 + startM;
  //     const end = endH * 60 + endM;
  //     while (current < end) {
  //       const h = String(Math.floor(current / 60)).padStart(2, "0");
  //       const m = String(current % 60).padStart(2, "0");
  //       options.push(`${h}:${m}`);
  //       current += 30;
  //     }
  //   });
  //   return options;
  // };
  // 🔹 Generate opsi jam (30 menit) termasuk endTime slot
  const generateTimeOptions = () => {
    if (!availability.length) return [];
    const options: string[] = [];

    availability.forEach((slot: AvailabilitySlot) => {
      const [startH, startM] = slot.startTime.split(":").map(Number);
      const [endH, endM] = slot.endTime.split(":").map(Number);

      let current = startH * 60 + startM;
      const end = endH * 60 + endM;

      while (current <= end) { // ⬅️ pakai <= supaya endTime juga ikut
        const h = String(Math.floor(current / 60)).padStart(2, "0");
        const m = String(current % 60).padStart(2, "0");
        options.push(`${h}:${m}`);
        current += 30;
      }
    });
    return options;
  };
  const timeOptions = generateTimeOptions();

  // 🔹 Simpan / update booking
  const handleSubmit = async () => {
    if (!bookingData.room || !bookingData.date || !bookingData.startTime || !bookingData.endTime || !bookingData.pic) {
      toast.error("⚠️ Mohon lengkapi semua data!", {
        style: { background: "#fee2e2", color: "#b91c1c", fontWeight: "600" },
      });
      return;
    }

    try {
      const endpoint = editingBooking ? `${API}/api/book/${bookingData._id}` : `${API}/api/book`;
      const method = editingBooking ? "PUT" : "POST";

      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.success === false) {
        throw new Error(data.message || "Gagal simpan booking");
      }

      const updatedBooking = {
        _id: data._id || bookingData._id,
        room: data.room || bookingData.room,
        date: data.date || bookingData.date,
        startTime: data.startTime || bookingData.startTime,
        endTime: data.endTime || bookingData.endTime,
        pic: data.pic || bookingData.pic,
      };

      if (editingBooking && onFinishEdit) {
        onFinishEdit(updatedBooking);
        toast.success("✅ Booking berhasil diperbarui!", {
          style: { background: "#dbeafe", color: "#1e3a8a", fontWeight: "600" },
        });
      } else {
        setHistory((prev) => [...prev, updatedBooking]);
        toast.success("✅ Booking baru berhasil disimpan!", {
          style: { background: "#dbeafe", color: "#1e3a8a", fontWeight: "600" },
        });

        // reset form
        setSelected(null);
        setSelectedDate("");
        setTimeStart("");
        setTimeEnd("");
      }
    } catch (err: any) {
      console.error("Submit error:", err);
      toast.error(`❌ Error: ${err.message || ""}`, {
        style: { background: "#fee2e2", color: "#b91c1c", fontWeight: "600" },
      });
    }
  };

  return (
    <div className="min-h-screen text-black font-bold bg-white pt-0 px-0">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Ruangan */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {rooms.map((room) => (
              <div
                key={room.id}
                className={`w-full bg-transparent border-2 rounded-xl flex flex-col justify-between items-center p-3 transition
                  ${selected === room.id ? "border-blue-500 shadow-xl" : "border-gray-300 shadow-sm"}`}
              >
                <div className="flex flex-col items-center">
                  <img src={room.img} alt={room.name} className="w-full h-40 object-cover mb-2 rounded-lg" />
                  <p className="text-base text-center">{room.name}</p>
                  <p className="text-sm text-center font-normal mt-0.5">(Kapasitas {room.capacity})</p>
                </div>
                <button
                  onClick={() => setSelected(room.id)}
                  className={`px-4 py-1 rounded-lg mt-3 text-white transition
                    ${selected === room.id ? "bg-blue-700" : "bg-blue-300 hover:bg-blue-700"}`}
                >
                  Pilih
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
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
            <label className="block text-sm mb-1">Jam Kosong Ruangan</label>
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

          {/* Waktu */}
          <div className="mb-4">
            <label className="block text-sm mb-1">Waktu Pemakaian</label>
            <div className="flex items-center gap-2">
              <select
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="w-1/2 border rounded-lg px-3 py-2 font-normal"
              >
                <option value="">Pilih</option>
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <span>-</span>
              <select
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="w-1/2 border rounded-lg px-3 py-2 font-normal"
              >
                <option value="">Pilih</option>
                {timeOptions.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* PIC */}
          <div className="mb-4">
            <label className="block text-sm mb-1">PIC</label>
            <input
              type="text"
              value={pic}
              readOnly
              className="w-full border rounded-lg px-3 py-2 font-normal bg-gray-100 text-gray-700"
            />
          </div>

          <button
            onClick={handleSubmit}
            className="w-full py-3 rounded-full bg-blue-300 hover:bg-blue-700 text-white font-semibold"
          >
            {editingBooking ? "Simpan Perubahan" : "Kirim Pengajuan"}
          </button>

          <div className="mt-4">
            <Toaster position="top-center" reverseOrder={false} gutter={8} />
          </div>
        </div>
      </div>
    </div>
  );
}
