import { useState } from 'react'
import './App.css'
import BookingTab from './components/BookingTab';
import HomeTab from './components/HomeTab';
import ListTab from './components/ListTab';
import ManageTab from './components/ManageTab';
import Login from "./components/Login";
import Register from "./components/Register";

import {
  Home,
  CalendarCheck,
  List, 
  Settings,
} from 'lucide-react';

interface User {
  username: string;
  email: string;
  role: string;
}

function App() {
  const [tab, setTab] = useState('rooms');
  const [history, setHistory] = useState<any[]>([]); // 🔹 simpan riwayat booking
  const [user, setUser] = useState<User | null>(null);
  const [authPage, setAuthPage] = useState<"login" | "register">("login");

  const renderTab = () => {
    switch (tab) {
      case 'rooms': 
        return <HomeTab />;
      case 'book': 
        return <BookingTab setHistory={setHistory} />;
      case 'booklist': 
        return <ListTab history={history} setHistory={setHistory} />; {/* ✅ diperbaiki */}
      case 'manage': 
        return <ManageTab />;
      default: 
        return <HomeTab />;
    }
  };

    // 🔑 If not logged in → show login page
  if (!user) {
    return authPage === "login" ? (
      <Login
        onLogin={(u) => setUser(u)}
        onSwitchToRegister={() => setAuthPage("register")}
      />
    ) : (
      <Register
        onRegister={(u) => setUser(u)}
        onSwitchToLogin={() => setAuthPage("login")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">

      {/* NAVBAR ATAS */}
      <div className="fixed top-0 left-0 right-0 bg-white text-black flex items-center justify-between px-4 py-1 shadow z-50">
        {/* Logo kiri */}
        <div className="flex items-center space-x-6">
          <img src="/logokemnaker.png" alt="Logo Kemnaker" className="h-12" />
          <img src="/logovokasi.png" alt="Logo Vokasi" className="h-5" />
        </div>

        {/* Navigation bar kanan */}
        <div className="flex space-x-14 text-sm">
          <button
            onClick={() => setTab('rooms')}
            className={`flex flex-col items-center justify-center min-w-[185px] px-4 py-2 rounded-lg border ${
              tab === 'rooms' ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <Home size={20} />
            <span>BERANDA</span>
          </button>

          <button
            onClick={() => setTab('book')}
            className={`flex flex-col items-center justify-center min-w-[185px] px-4 py-2 rounded-lg border ${
              tab === 'book' ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <CalendarCheck size={20} />
            <span>PINJAM RUANGAN</span>
          </button>

          <button
            onClick={() => setTab('booklist')}
            className={`flex flex-col items-center justify-center min-w-[185px] px-4 py-2 rounded-lg border ${
              tab === 'booklist' ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <List size={20} />
            <span>RIWAYAT PEMINJAMAN</span>
          </button>

          <button
            onClick={() => setTab('manage')}
            className={`flex flex-col items-center justify-center min-w-[185px] px-4 py-2 rounded-lg border ${
              tab === 'manage' ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            <Settings size={20} />
            <span>AKUN</span>
          </button>
        </div>
      </div>

      {/* ISI HALAMAN */}
      <main className="pt-24 pl-6 w-full">
        {renderTab()}
      </main>
    </div>
  )
}

export default App
