import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_BASE_URL;

interface LoginProps {
  onLogin: (user: any, token: string) => void;
  onSwitchToRegister: () => void; // 👈 add this
}

export default function Login({ onLogin, onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:5000/api/auth/register/auth/login`, { email, password });
      const data = res.data as { user: any; token: string };
      localStorage.setItem("token", data.token);
      onLogin(data.user, data.token);
    } catch (err) {
      setError("E-mail atau password salah ❌");
    }
  };

  return (
    <div className="flex min-h-screen w-screen">
      {/* Left Panel (60%) */}
      <div className="w-3/5 bg-white flex flex-col justify-center items-center space-y-10">
        <img src="/logokemnaker.png" alt="Kemnaker" className="h-80" />
        <hr className="w-3/4 border-t-2 border-blue-600" />
        <img
          src="/logovokasi.png"
          alt="Pelatihan Vokasi"
          className="h-40"
        />
      </div>

      {/* Right Panel (40%) */}
      <div className="w-2/5 bg-blue-800 flex flex-col justify-center items-center text-white px-10">
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
              className="w-8/12 px-4 py-3 rounded-full border bg-white border-gray-300 text-black text-2xl"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-8/12 px-4 py-3 rounded-full border bg-white border-gray-300 text-black text-2xl"
              required
            />
            <button
              type="submit"
              className="w-4/12 py-3 bg-white text-blue-700 font-semibold rounded-full 
                        hover:bg-gray-100 transition text-2xl shadow-md active:scale-95"
            >
              Login
            </button>

            {/* Switch to Register */}
            <p className="mt-6 text-sm">
                Belum punya akun?{" "}
                <button
                onClick={onSwitchToRegister}
                className="underline font-semibold hover:text-blue-500"
                >
                Daftar di sini
                </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
