import Link from 'next/link';

export default function WorkerDashboard() {
  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)]">
      {/* Header */}
      <header className="bg-orange-500 text-white p-4 shadow-md flex justify-between items-center">
        <Link href="/worker/profile" className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer">
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center overflow-hidden">
             <img src="https://ui-avatars.com/api/?name=Rahul+Kumar&background=random" alt="Profile" />
          </div>
          <h1 className="font-bold text-xl">Hi, Rahul Kumar</h1>
        </Link>
        <button className="text-sm font-semibold hover:underline">Logout</button>
      </header>

      <main className="p-4 max-w-4xl mx-auto flex flex-col gap-6 mt-6">
        
        {/* Welcome Animation Area */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 flex items-center gap-4 animate-[pulse_3s_ease-in-out_infinite]">
          <div className="text-4xl">👋</div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
            <p className="text-gray-600">Ready to find some work today?</p>
          </div>
        </div>

        {/* Loyalty Cards Section */}
        <section className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 text-9xl -mt-4 mr-4">⭐</div>
          <h3 className="text-xl font-bold mb-1">My Cards</h3>
          <p className="text-sm text-gray-300 mb-4">Your current tier and benefits</p>
          
          <div className="bg-gradient-to-br from-gray-300 to-gray-400 w-full max-w-sm rounded-xl p-4 shadow-inner text-gray-900 border border-gray-400">
             <div className="flex justify-between items-start">
               <span className="font-bold tracking-widest uppercase">Silver Tier</span>
               <span className="text-xs font-bold">KAAMMADAT</span>
             </div>
             <div className="mt-6">
                <p className="font-mono text-lg">**** **** **** 1029</p>
                <div className="flex justify-between items-end mt-2">
                   <p className="text-sm font-semibold uppercase">Rahul Kumar</p>
                   <p className="text-xs font-bold bg-white px-2 py-1 rounded">3% OFF</p>
                </div>
             </div>
          </div>
        </section>

        {/* Job Search Area */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
           <h3 className="text-xl font-bold mb-4 text-gray-800">Find Work</h3>
           <div className="flex gap-2">
             <input type="text" placeholder="e.g., Electrician, Carpenter..." className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 outline-none" />
             <Link href="/worker/search">
               <button className="bg-orange-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-orange-600 transition h-full flex items-center justify-center">Search</button>
             </Link>
           </div>
        </section>

      </main>
    </div>
  );
}
