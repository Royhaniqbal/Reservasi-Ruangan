import { useState } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

const API = import.meta.env.VITE_API_BASE_URL;

interface LoginProps {
  onLogin: (user: any, token: string) => void;
  onSwitchToRegister: () => void;
}

export default function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API}/api/auth/login`, {
        email,
        password,
      });
      const data = res.data as { user: any; token: string };
      localStorage.setItem("token", data.token);
      onLogin(data.user, data.token);
    } catch (err) {
      setError("E-mail atau password salah ❌");
    }
  };

  return (
    <div className="flex min-h-screen w-screen relative flex-col sm:flex-row">
      {/* Left Panel (Logo) */}
      <div className="hidden sm:flex w-3/5 bg-white flex-col justify-center items-center space-y-10">
        <img
          src="/logokemnaker.png"
          alt="Kemnaker"
          className="h-72 select-none pointer-events-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
        <hr className="w-2/3 border-t-2 border-blue-700" />
        <img
          src="/logovokasi.png"
          alt="Pelatihan Vokasi"
          className="h-32 select-none pointer-events-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      </div>

      {/* Right Panel (Form) */}
      <div className="flex-1 bg-blue-700 flex flex-col justify-center items-center text-white px-6 sm:px-10 py-12">
        <div className="w-full max-w-md">
          <div className="mb-12 sm:mb-20">
            <h2 className="text-center text-3xl sm:text-4xl font-bold">
              SELAMAT DATANG DI
            </h2>
            <h1 className="text-center text-5xl sm:text-7xl font-bold mb-2">
              SIPAMAN
            </h1>
            <p className="text-center text-lg sm:text-2xl mb-6">
              Sistem Informasi Pelayanan Peminjaman Ruangan
            </p>
          </div>

          <form
            onSubmit={handleLogin}
            className="space-y-4 flex flex-col items-center"
          >
            {error && (
              <p className="text-red-300 bg-red-800 bg-opacity-40 p-2 rounded text-center w-10/12 sm:w-8/12">
                {error}
              </p>
            )}

            <input
              type="email"
              placeholder="E-Mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-10/12 sm:w-8/12 px-4 py-3 rounded-full border bg-white border-gray-300 text-black text-base sm:text-lg"
              required
            />

            {/* Password */}
            <div className="relative w-10/12 sm:w-8/12">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-full border bg-white border-gray-300 text-black text-base sm:text-lg pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-6/12 sm:w-4/12 py-3 bg-white text-blue-700 font-semibold rounded-full 
                         hover:bg-gray-100 transition text-base sm:text-lg shadow-md active:scale-95"
            >
              Login
            </button>

            {/* Switch to Register */}
            <p className="mt-6 text-sm sm:text-base text-center">
              Belum punya akun?{" "}
              <button
                onClick={onSwitchToRegister}
                className="bg-transparent text-white underline hover:text-blue-300 font-semibold cursor-pointer"
              >
                Daftar di sini
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Credit */}
      <p className="absolute bottom-4 right-4 text-[9px] sm:text-xs text-white opacity-70">
        Dibuat oleh M. Royhan Iqbal
      </p>
    </div>
  );
}
