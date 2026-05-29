"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function Messages() {
  const [activeChat, setActiveChat] = useState<number | null>(null);

  const chats = [
    { id: 1, name: "Anand Sharma", role: "Job Giver", lastMsg: "Are you available tomorrow at 9 AM?", time: "10:30 AM", unread: 2 },
    { id: 2, name: "Priya Desai", role: "Job Giver", lastMsg: "Great work today. I have sent the payment.", time: "Yesterday", unread: 0 },
    { id: 3, name: "Rajesh Kumar", role: "Job Giver", lastMsg: "Send me some photos of your previous painting jobs.", time: "Monday", unread: 0 },
  ];

  if (activeChat) {
    const chat = chats.find(c => c.id === activeChat);
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col font-[family-name:var(--font-geist-sans)]">
        <header className="bg-teal-600 text-white p-4 shadow-sm flex items-center gap-4">
          <button onClick={() => setActiveChat(null)} className="text-white hover:opacity-80 transition font-black text-xl">←</button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center text-teal-700 font-black border border-teal-200">
               {chat?.name.charAt(0)}
            </div>
            <div>
              <h1 className="font-bold">{chat?.name}</h1>
              <p className="text-xs text-teal-100 font-medium">Online</p>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
           <div className="text-center text-xs text-slate-400 font-bold my-2 border-b border-slate-200 leading-[0.1em]">
              <span className="bg-slate-50 px-2">Today</span>
           </div>

           <div className="self-start max-w-[80%] bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-sm">
             <p className="text-slate-800 text-sm font-medium">Hello Rahul, I saw your application for the plumbing job.</p>
             <p className="text-[10px] text-slate-400 mt-1 text-right">10:28 AM</p>
           </div>

           <div className="self-end max-w-[80%] bg-teal-600 text-white p-3 rounded-2xl rounded-tr-sm shadow-sm">
             <p className="text-sm font-medium">Yes sir, I am available. I have 5 years of experience.</p>
             <p className="text-[10px] text-teal-200 mt-1 text-right">10:29 AM ✓✓</p>
           </div>

           <div className="self-start max-w-[80%] bg-white border border-slate-200 p-3 rounded-2xl rounded-tl-sm shadow-sm">
             <p className="text-slate-800 text-sm font-medium">{chat?.lastMsg}</p>
             <p className="text-[10px] text-slate-400 mt-1 text-right">{chat?.time}</p>
           </div>
        </main>

        <footer className="bg-white p-3 border-t border-slate-200 flex gap-2 items-center">
          <button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 transition">📎</button>
          <input type="text" placeholder="Type a message..." className="flex-1 px-4 py-2 bg-slate-100 rounded-full outline-none focus:ring-2 focus:ring-teal-500 text-sm font-medium text-slate-800" />
          <button className="w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center text-white shadow-md hover:bg-teal-700 transition transform active:scale-95">➤</button>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-[family-name:var(--font-geist-sans)]">
      <header className="bg-teal-600 text-white p-4 shadow-md flex items-center gap-4 sticky top-0 z-10">
        <Link href="/part-time-worker/dashboard" className="text-white hover:opacity-80 transition font-black text-xl">←</Link>
        <div className="flex-1">
          <h1 className="font-bold text-xl">Secure Messages</h1>
        </div>
        <button className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">🔍</button>
      </header>

      <main className="p-4 max-w-lg mx-auto">
        <div className="bg-teal-50 border border-teal-100 p-4 rounded-2xl flex items-center gap-3 mb-6">
          <span className="text-2xl">🔒</span>
          <p className="text-xs text-teal-800 font-bold">Your personal number is hidden until you explicitly share it. Communicate securely here.</p>
        </div>

        <div className="flex flex-col gap-2">
          {chats.map(chat => (
            <div 
              key={chat.id} 
              onClick={() => setActiveChat(chat.id)}
              className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:shadow-md transition group"
            >
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 font-black border border-slate-200 group-hover:bg-teal-50 group-hover:text-teal-600 group-hover:border-teal-200 transition">
                 {chat.name.charAt(0)}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-center mb-1">
                  <h3 className="font-bold text-slate-800 truncate">{chat.name}</h3>
                  <span className={`text-xs font-bold ${chat.unread > 0 ? 'text-teal-600' : 'text-slate-400'}`}>{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className={`text-sm truncate pr-4 ${chat.unread > 0 ? 'font-bold text-slate-800' : 'font-medium text-slate-500'}`}>
                    {chat.lastMsg}
                  </p>
                  {chat.unread > 0 && (
                    <span className="bg-teal-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
