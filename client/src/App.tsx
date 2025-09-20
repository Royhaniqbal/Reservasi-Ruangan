import { useState } from 'react'
import './App.css'
import BookingTab from './components/BookingTab';
import ListTab from './components/ListTab';
import ManageTab from './components/ManageTab';
import Login from "./components/Login";
import Register from "./components/Register";

import {
  CalendarCheck,
  List,
  User,
} from 'lucide-react';

interface User {
  username: string;
  email: string;
  role: string;
}

function App() {
  const [tab, setTab] = useState('book'); 
  const [history, setHistory] = useState<any[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [authPage, setAuthPage] = useState<"login" | "register">("login");

  const renderTab = () => {
    switch (tab) {
      case 'book':
        return <BookingTab setHistory={setHistory} />;
      case 'booklist':
        return <ListTab history={history} setHistory={setHistory} />;
      case 'manage':
        return <ManageTab />;
      default:
        return <BookingTab setHistory={setHistory} />;
    }
  };

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
    <div className="min-h-screen bg-white text-black flex flex-col">

      {/* NAVBAR ATAS (desktop) */}
      <div className="hidden sm:flex fixed top-0 left-0 right-0 bg-white text-black items-center justify-between px-4 py-2 shadow z-50">
        <div className="flex items-center space-x-3">
          <img src="/logokemnaker.png" alt="Logo Kemnaker" className="h-10 sm:h-12" />
          <img src="/logovokasi.png" alt="Logo Vokasi" className="h-4 sm:h-5" />
        </div>

        <div className="flex space-x-6 text-sm">
          <button
            onClick={() => setTab('book')}
            className={`px-4 py-2 rounded-lg border transition active:scale-95 ${
              tab === 'book' ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Pinjam Ruangan
          </button>
          <button
            onClick={() => setTab('booklist')}
            className={`px-4 py-2 rounded-lg border transition active:scale-95 ${
              tab === 'booklist' ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Riwayat Peminjaman
          </button>
          <button
            onClick={() => setTab('manage')}
            className={`px-4 py-2 rounded-lg border transition active:scale-95 ${
              tab === 'manage' ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-gray-100'
            }`}
          >
            Akun
          </button>
        </div>
      </div>

      {/* ISI HALAMAN */}
      <main className="flex-1 pt-20 sm:pt-24 px-3 sm:px-6 w-full">
        {renderTab()}
      </main>

      {/* NAVBAR BAWAH (mobile) */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-inner flex justify-around py-2 z-50">
        <button
          onClick={() => setTab('book')}
          className={`flex flex-col items-center transition active:scale-95 ${
            tab === 'book' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <CalendarCheck size={22} />
          <span className="text-xs">Pinjam</span>
        </button>

        <button
          onClick={() => setTab('booklist')}
          className={`flex flex-col items-center transition active:scale-95 ${
            tab === 'booklist' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <List size={22} />
          <span className="text-xs">Riwayat</span>
        </button>

        <button
          onClick={() => setTab('manage')}
          className={`flex flex-col items-center transition active:scale-95 ${
            tab === 'manage' ? 'text-blue-600' : 'text-gray-600'
          }`}
        >
          <User size={22} />
          <span className="text-xs">Akun</span>
        </button>
      </div>
    </div>
  )
}

export default App
