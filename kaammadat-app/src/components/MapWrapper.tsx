import dynamic from 'next/dynamic';

const MapWrapper = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-400">
      <span className="text-4xl mb-4 animate-bounce">🗺️</span>
      <p className="font-bold tracking-widest uppercase text-sm animate-pulse">Loading Interactive Map...</p>
    </div>
  )
});

export default MapWrapper;
