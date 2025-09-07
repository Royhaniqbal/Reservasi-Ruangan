type ListTabProps = {
  history: {
    room: string | null;
    date: string | null;
    startTime: string | null;
    endTime: string | null;
    pic: string | null;
  }[];
  setHistory: React.Dispatch<React.SetStateAction<any[]>>;
};

export default function ListTab({ history, setHistory }: ListTabProps) {
  if (!history || history.length === 0) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Belum ada riwayat peminjaman.</p>
      </div>
    );
  }

  const handleCancel = async (index: number) => {
    const booking = history[index];

    // ✅ Konfirmasi popup
    const confirmCancel = window.confirm(
      `Apakah Anda yakin ingin membatalkan peminjaman ruangan "${booking.room}" pada tanggal ${booking.date} pukul ${booking.startTime} - ${booking.endTime}?`
    );

    if (!confirmCancel) return; // batal jika user pilih Cancel

    try {
      const res = await fetch("http://localhost:5000/api/cancel-booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          room: booking.room,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
          pic: booking.pic,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gagal batalkan booking");
      }

      // ✅ Hapus dari state jika berhasil dihapus di database
      setHistory((prev) => prev.filter((_, i) => i !== index));

      alert("✅ Peminjaman berhasil dibatalkan!");
    } catch (error) {
      console.error("❌ Error cancel booking:", error);
      alert("❌ Terjadi kesalahan saat koneksi ke server");
    }
  };

  return (
    <div className="p-3">
      <div className="space-y-4">
        {history.map((item, idx) => (
          <div
            key={idx}
            className="p-4 border rounded-lg shadow-sm bg-white flex justify-between items-start"
          >
            {/* Info booking */}
            <div className="grid grid-cols-[100px_10px_1fr] gap-y-2">
              <p className="text-sm font-semibold">Ruangan</p>
              <p className="text-sm">:</p>
              <p className="text-sm">{item.room}</p>

              <p className="text-sm font-semibold">Tanggal</p>
              <p className="text-sm">:</p>
              <p className="text-sm">{item.date}</p>

              <p className="text-sm font-semibold">Waktu</p>
              <p className="text-sm">:</p>
              <p className="text-sm">
                {item.startTime} - {item.endTime}
              </p>

              <p className="text-sm font-semibold">PIC</p>
              <p className="text-sm">:</p>
              <p className="text-sm">{item.pic}</p>
            </div>

            {/* Tombol Batalkan */}
            <button
              onClick={() => handleCancel(idx)}
              className="ml-4 mt-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-700"
            >
              Batalkan
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
