import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react"; // 👈 import ikon

const API = import.meta.env.VITE_API_BASE_URL;

interface RegisterProps {
  onRegister: (user: any, token: string) => void;
  onSwitchToLogin: () => void;
}

export default function Register({ onRegister, onSwitchToLogin }: RegisterProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/auth/register`, {
        username,
        email,
        password,
        role,
      });
      const data = res.data as { user: any; token: string };

      localStorage.setItem("token", data.token);
      onRegister(data.user, data.token);

      setError("");
      setSuccess("✅ Pendaftaran berhasil! Silakan login.");
    } catch {
      setSuccess("");
      setError("Pendaftaran gagal ❌. Coba gunakan email lain.");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen w-screen relative">
      {/* Left Panel (logo) */}
      <div className="w-full md:w-3/5 bg-white flex flex-col justify-center items-center space-y-8 p-6">
        <img
          src="/logokemnaker.png"
          alt="Kemnaker"
          className="h-40 md:h-80 select-none pointer-events-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
        <hr className="w-2/3 border-t-2 border-blue-700" />
        <img
          src="/logovokasi.png"
          alt="Pelatihan Vokasi"
          className="h-20 md:h-40 select-none pointer-events-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      {/* Right Panel (form) */}
      <div className="w-full md:w-2/5 bg-blue-700 flex flex-col justify-center items-center text-white px-6 py-10">
        <div className="max-w-md w-full flex flex-col items-center">
          {/* Heading */}
          <div className="mb-10 text-center">
            <h2 className="text-2xl md:text-4xl font-bold">BUAT AKUN BARU</h2>
            <h1 className="text-5xl md:text-8xl font-bold mb-2">SIPAMAN</h1>
            <p className="text-lg md:text-2xl">
              Sistem Informasi Pelayanan Peminjaman Ruangan
            </p>
          </div>

          {/* Form */}
          <form
            onSubmit={handleRegister}
            className="space-y-4 flex flex-col items-center w-full"
          >
            {error && (
              <p className="text-red-300 bg-red-800 bg-opacity-40 p-2 rounded text-center w-10/12">
                {error}
              </p>
            )}

            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-10/12 px-3 py-2 rounded-full border bg-white border-gray-300 text-black text-base md:text-lg"
              required
            />
            <input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-10/12 px-3 py-2 rounded-full border bg-white border-gray-300 text-black text-base md:text-lg"
              required
            />

            {/* Password + eye button */}
            <div className="relative w-10/12">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-full border bg-white border-gray-300 text-black text-base md:text-lg pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 
                           bg-transparent border-none p-0 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {/* Dropdown Role */}
            <div className="relative w-10/12">
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="appearance-none w-full px-5 py-2 rounded-full border border-gray-300 bg-white text-black text-base md:text-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer transition"
                required
              >
                <option value="user">👤 User</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-6 flex items-center text-gray-500">
                ▼
              </div>
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-5/12 md:w-3/12 py-2 bg-white text-blue-700 font-semibold rounded-full 
                        hover:bg-gray-100 transition text-lg shadow-md active:scale-95"
            >
              Register
            </button>

            {/* Success Notification */}
            {success && (
              <p className="mt-4 text-green-300 bg-green-800 bg-opacity-40 p-2 rounded text-center w-10/12">
                {success}
              </p>
            )}
          </form>

          {/* Switch to Login */}
          <p className="mt-6 text-sm">
            Sudah punya akun?{" "}
            <button
              onClick={onSwitchToLogin}
              className="bg-transparent p-0 text-white underline hover:text-blue-300 font-semibold cursor-pointer focus:outline-none"
              style={{ display: "inline", border: "none" }}
            >
              Login di sini
            </button>
          </p>
        </div>
      </div>

      {/* Credit text */}
      <p className="absolute bottom-3 right-3 text-[9px] text-gray-300 md:text-white">
        Dibuat oleh M. Royhan Iqbal
      </p>
    </div>
  );
}
