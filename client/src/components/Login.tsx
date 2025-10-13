import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react"; // 👈 ikon mata

// const API = import.meta.env.VITE_API_BASE_URL;

interface LoginProps {
  onLogin: (user: any, token: string) => void;
  onSwitchToRegister: () => void; // 👈 add this
}

export default function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false); // 👈 state toggle

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/api/auth/login`, { email, password });
      const data = res.data as { user: any; token: string };
      localStorage.setItem("token", data.token);
      onLogin(data.user, data.token);
    } catch (err) {
      setError("E-mail atau password salah ❌");
    }
  };

  return (
    <div className="flex min-h-screen w-screen relative">
      {/* Left Panel (60%) */}
      <div className="w-3/5 bg-white flex flex-col justify-center items-center space-y-10">
        <img 
          src="/logokemnaker.png" 
          alt="Kemnaker" 
          className="h-80 select-none pointer-events-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
        <hr className="w-2/3 border-t-2 border-blue-700" />
        <img 
          src="/logovokasi.png"
          alt="Pelatihan Vokasi"
          className="h-40 select-none pointer-events-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      {/* Right Panel (40%) */}
      <div className="w-2/5 bg-blue-700 flex flex-col justify-center items-center text-white px-10">
        <div className="max-w-xl w-full">
          <div className="mb-40">
            <h2 className="text-center text-4xl font-bold">SELAMAT DATANG DI</h2>
            <h1 className="text-center text-8xl font-bold mb-2">SIPAMAN</h1>
            <p className="text-center text-2xl mb-6">
                Sistem Informasi Pelayanan Peminjaman Ruangan
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 flex flex-col items-center">
            {error && (
              <p className="text-red-300 bg-red-800 bg-opacity-40 p-2 rounded text-center w-8/12">
                {error}
              </p>
            )}

            <input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-7/12 px-3 py-2 rounded-full border bg-white border-gray-300 text-black text-lg"
              required
            />

            {/* Password dengan tombol mata */}
            <div className="relative w-7/12">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-full border bg-white border-gray-300 text-black text-lg pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 bg-transparent border-none p-0 focus:outline-none"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-3/12 py-2 bg-white text-blue-700 font-semibold rounded-full 
                        hover:bg-gray-100 transition text-lg shadow-md active:scale-95"
            >
              Login
            </button>

            {/* Switch to Register */}
            <p className="mt-6 text-sm">
              Belum punya akun?{" "}
              <button
                onClick={onSwitchToRegister}
                className="bg-transparent p-0 text-white underline hover:text-blue-300 font-semibold cursor-pointer focus:outline-none"
                style={{ display: "inline", border: "none" }}
              >
                Daftar di sini
              </button>
            </p>
          </form>
        </div>
      </div>
      {/* Credit text di pojok kanan bawah */}
      <p className="absolute bottom-6 right-[15.5rem] text-[9px] text-white">
        Dibuat oleh M. Royhan Iqbal
      </p>
    </div>
  );
}
