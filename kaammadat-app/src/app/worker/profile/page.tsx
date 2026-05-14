"use client";
import { useState } from 'react';
import Link from 'next/link';

export default function WorkerProfile() {
  // Mock data for existing portfolio photos
  const [portfolio, setPortfolio] = useState([
    { id: 1, img: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=400&h=400&fit=crop', desc: 'Rewired a 2BHK flat in Mumbai' },
    { id: 2, img: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=400&fit=crop', desc: 'Repaired industrial motor' }
  ]);
  
  const [newDesc, setNewDesc] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleUpload = (e: any) => {
    e.preventDefault();
    if(!newDesc) return;
    
    setUploading(true);
    setTimeout(() => {
      // Add a mock new image to the portfolio
      setPortfolio([{
        id: Date.now(),
        img: 'https://images.unsplash.com/photo-1541888081622-1bc81d43a6d1?w=400&h=400&fit=crop',
        desc: newDesc
      }, ...portfolio]);
      setNewDesc('');
      setUploading(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] pb-20">
      <header className="bg-orange-500 text-white p-4 shadow-md sticky top-0 z-10 flex items-center gap-4">
        <Link href="/worker/dashboard" className="font-bold text-xl hover:bg-orange-600 p-2 rounded-full transition">←</Link>
        <h1 className="font-bold text-xl">My Portfolio</h1>
      </header>

      <main className="p-4 max-w-4xl mx-auto mt-4 flex flex-col gap-6">
        
        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center relative overflow-hidden">
           <div className="w-24 h-24 mx-auto bg-gray-200 rounded-full border-4 border-orange-100 overflow-hidden mb-4">
             <img src="https://ui-avatars.com/api/?name=Rahul+Kumar&background=random&size=128" alt="Profile" className="w-full h-full" />
           </div>
           <h2 className="text-2xl font-bold text-gray-800">Rahul Kumar</h2>
           <p className="text-gray-500">Expert Electrician</p>
           
           <div className="mt-4 flex justify-center gap-2">
             <span className="bg-gray-800 text-white text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase shadow">Silver Tier</span>
             <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">Background Verified ✓</span>
           </div>
        </div>

        {/* Upload New Work */}
        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200">
           <h3 className="font-bold text-gray-800 mb-4">Upload Past Work</h3>
           <form onSubmit={handleUpload} className="flex flex-col gap-3">
             <div className="border-2 border-dashed border-orange-300 bg-white rounded-xl p-4 text-center cursor-pointer hover:bg-orange-100 transition">
               <p className="text-orange-500 font-bold">📷 Tap to select photo</p>
             </div>
             <input 
               type="text" 
               placeholder="Write a small description (e.g., Fixed AC in 2 hours)..." 
               className="w-full px-4 py-3 rounded-lg border border-gray-300 outline-none focus:ring-2 focus:ring-orange-500 text-sm"
               value={newDesc}
               onChange={(e) => setNewDesc(e.target.value)}
               required
             />
             <button type="submit" disabled={uploading} className="bg-orange-500 text-white font-bold py-3 rounded-xl shadow hover:bg-orange-600 transition flex justify-center items-center">
               {uploading ? <span className="animate-spin text-xl">⚙️</span> : 'Upload to Portfolio'}
             </button>
           </form>
        </div>

        {/* Portfolio Grid */}
        <div>
           <h3 className="font-bold text-gray-800 mb-4 text-xl">My Work History</h3>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {portfolio.map(item => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                   <div className="h-48 w-full overflow-hidden">
                     <img src={item.img} alt={item.desc} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                   </div>
                   <div className="p-4">
                     <p className="text-gray-800 font-medium">"{item.desc}"</p>
                   </div>
                </div>
              ))}
           </div>
        </div>

      </main>
    </div>
  );
}
