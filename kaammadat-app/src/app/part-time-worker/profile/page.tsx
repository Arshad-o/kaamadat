"use client";
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface WorkPhoto {
  id: number;
  dataUrl: string;
  desc: string;
  uploadedAt: string;
}

export default function WorkerProfile() {
  const [workerName, setWorkerName] = useState('');
  const [workerEmail, setWorkerEmail] = useState('');
  const [portfolio, setPortfolio] = useState<WorkPhoto[]>([]);
  const [newDesc, setNewDesc] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const name = localStorage.getItem('kaammadat_user_name') || 'Worker';
    const email = localStorage.getItem('kaammadat_user_email') || '';
    setWorkerName(name);
    setWorkerEmail(email);
    // Load saved work photos
    const saved = localStorage.getItem('kaammadat_work_photos');
    if (saved) setPortfolio(JSON.parse(saved));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setPreviewUrl(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!previewUrl || !newDesc.trim()) return;
    setUploading(true);
    setTimeout(() => {
      const newPhoto: WorkPhoto = {
        id: Date.now(),
        dataUrl: previewUrl,
        desc: newDesc.trim(),
        uploadedAt: new Date().toISOString(),
      };
      const updated = [newPhoto, ...portfolio];
      setPortfolio(updated);
      localStorage.setItem('kaammadat_work_photos', JSON.stringify(updated));
      setNewDesc('');
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setUploading(false);
      setUploadMsg('✅ Photo uploaded to your portfolio!');
      setTimeout(() => setUploadMsg(''), 3000);
    }, 800);
  };

  const handleDelete = (id: number) => {
    const updated = portfolio.filter(p => p.id !== id);
    setPortfolio(updated);
    localStorage.setItem('kaammadat_work_photos', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] pb-20">
      <header className="bg-orange-500 text-white p-4 shadow-md sticky top-0 z-10 flex items-center gap-4">
        <Link href="/part-time-worker/dashboard" className="font-bold text-xl hover:bg-orange-600 p-2 rounded-full transition">←</Link>
        <h1 className="font-bold text-xl">My Work Portfolio</h1>
      </header>

      <main className="p-4 max-w-4xl mx-auto mt-4 flex flex-col gap-6">

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
          <div className="w-24 h-24 mx-auto bg-orange-100 rounded-full border-4 border-orange-200 overflow-hidden mb-4 flex items-center justify-center text-4xl font-black text-orange-500">
            {workerName.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-gray-800">{workerName}</h2>
          <p className="text-gray-400 text-sm font-medium mt-1">{workerEmail}</p>
          <div className="mt-3 flex justify-center gap-2">
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full">👷 Worker</span>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full">📸 {portfolio.length} Work Photos</span>
          </div>
        </div>

        {/* Upload New Work Photo */}
        <div className="bg-orange-50 rounded-2xl p-6 border border-orange-200 shadow-sm">
          <h3 className="font-extrabold text-gray-800 mb-4 text-lg">📷 Upload Work Photo</h3>
          <form onSubmit={handleUpload} className="flex flex-col gap-3">
            {/* File picker */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-orange-300 bg-white rounded-xl p-4 text-center cursor-pointer hover:bg-orange-50 transition overflow-hidden"
            >
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
              ) : (
                <div className="py-4">
                  <p className="text-orange-500 font-extrabold text-base">📷 Tap to select photo from your device</p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP supported</p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
            <input
              type="text"
              placeholder="Describe this work (e.g., Fixed AC wiring in 2BHK flat, Mumbai)"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 outline-none focus:ring-2 focus:ring-orange-500 text-sm font-medium text-gray-800"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={uploading || !previewUrl || !newDesc.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold py-3.5 rounded-xl shadow transition flex justify-center items-center gap-2 disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
            >
              {uploading ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span> : '⬆️ Upload to Portfolio'}
            </button>
            {uploadMsg && <p className="text-green-600 font-bold text-sm text-center">{uploadMsg}</p>}
          </form>
        </div>

        {/* Portfolio Grid */}
        <div>
          <h3 className="font-extrabold text-gray-800 mb-4 text-xl">🏗️ My Work History ({portfolio.length} photos)</h3>
          {portfolio.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-200 text-gray-400 shadow-inner">
              <p className="text-4xl mb-3">📷</p>
              <p className="font-bold">No work photos yet</p>
              <p className="text-sm mt-1">Upload your first work photo above to build your portfolio!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {portfolio.map(item => (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group">
                  <div className="h-52 w-full overflow-hidden">
                    <img src={item.dataUrl} alt={item.desc} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  </div>
                  <div className="p-4 flex justify-between items-start gap-2">
                    <div>
                      <p className="text-gray-800 font-semibold text-sm">"{item.desc}"</p>
                      <p className="text-xs text-gray-400 mt-1">{new Date(item.uploadedAt).toLocaleDateString('en-IN')}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="text-red-400 hover:text-red-600 text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
