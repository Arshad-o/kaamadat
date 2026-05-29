"use client";
import { useState, useEffect, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getJobs } from '@/app/actions/jobActions';

const ANIMATED_PLACEHOLDERS = [
  "Search Jobs...",
  "Carpenter 🔨",
  "Electrician ⚡",
  "Plumber 🔧",
  "Other Works 🛠️",
];

function JobSearchContent() {
  const searchParams = useSearchParams();
  const [jobs, setJobs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [activeCategory, setActiveCategory] = useState('All India');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [displayedPlaceholder, setDisplayedPlaceholder] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const charRef = useRef(0);

  useEffect(() => {
    getJobs().then((data) => setJobs(data));
  }, []);

  // Typewriter animation for placeholder
  useEffect(() => {
    if (isFocused) return; // Stop animation when user focuses

    const target = ANIMATED_PLACEHOLDERS[placeholderIndex];

    if (!isDeleting) {
      if (charRef.current < target.length) {
        intervalRef.current = setTimeout(() => {
          setDisplayedPlaceholder(target.slice(0, charRef.current + 1));
          charRef.current++;
        }, 80);
      } else {
        // Wait then start deleting
        intervalRef.current = setTimeout(() => {
          setIsDeleting(true);
        }, 1400);
      }
    } else {
      if (charRef.current > 0) {
        intervalRef.current = setTimeout(() => {
          setDisplayedPlaceholder(target.slice(0, charRef.current - 1));
          charRef.current--;
        }, 45);
      } else {
        setIsDeleting(false);
        setPlaceholderIndex((prev) => (prev + 1) % ANIMATED_PLACEHOLDERS.length);
      }
    }

    return () => {
      if (intervalRef.current) clearTimeout(intervalRef.current);
    };
  }, [displayedPlaceholder, isDeleting, placeholderIndex, isFocused]);

  const categories = ['All India', 'Electrician', 'Carpenter', 'Catering', 'Plumber', 'Painter', 'Helper'];

  const filteredJobs = jobs.filter((job) => {
    const matchesCategory =
      activeCategory === 'All India' ||
      job.title?.toLowerCase().includes(activeCategory.toLowerCase()) ||
      job.type?.toLowerCase().includes(activeCategory.toLowerCase());

    const matchesSearch =
      !searchQuery ||
      job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.type?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 font-[family-name:var(--font-geist-sans)] pb-10">
      {/* Sticky Header with animated search */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="flex gap-3 items-center max-w-4xl mx-auto">
          <Link
            href="/part-time-worker/dashboard"
            className="font-bold text-2xl hover:bg-orange-700/40 w-10 h-10 flex items-center justify-center rounded-full transition shrink-0"
          >
            ←
          </Link>
          <div className="flex-1 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isFocused ? 'Type to search...' : (displayedPlaceholder || ANIMATED_PLACEHOLDERS[0])}
              className="w-full pl-10 pr-4 py-2.5 rounded-full text-gray-800 bg-white outline-none focus:ring-3 focus:ring-orange-300 shadow-inner text-sm font-medium transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition text-lg"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="p-4 max-w-4xl mx-auto mt-2">
        {/* Category Chips */}
        <div className="flex gap-2 overflow-x-auto pb-3 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full border font-semibold text-sm transition-all ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white border-orange-500 shadow'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Result count */}
        <div className="flex items-center justify-between mt-2 mb-4">
          <h2 className="text-lg font-bold text-gray-800">
            {searchQuery
              ? `Results for "${searchQuery}"`
              : activeCategory === 'All India'
              ? 'All Available Works'
              : `${activeCategory} Jobs`}
          </h2>
          <span className="text-sm text-gray-500 bg-orange-50 px-3 py-1 rounded-full font-semibold">
            {filteredJobs.length} found
          </span>
        </div>

        {/* Job List */}
        <div className="flex flex-col gap-4">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-semibold text-lg">No jobs found</p>
              <p className="text-sm mt-1">Try searching with different keywords</p>
            </div>
          ) : (
            filteredJobs.map((job) => {
              const isFull = job.cap?.includes('FULL');
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex gap-4 relative overflow-hidden transition hover:shadow-md"
                >
                  {/* Circular Theme Image */}
                  <div className="w-20 h-20 shrink-0">
                    <img
                      src={job.img}
                      alt={job.type}
                      className="w-full h-full object-cover rounded-full shadow-inner border-2 border-orange-100"
                    />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-gray-800 leading-tight">{job.title}</h3>
                      <span className="font-bold text-green-600 text-sm">₹{job.salary}/day</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                      <span className="text-orange-500">📍</span> {job.location}
                    </p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <span className="text-blue-500">📅</span> {job.date}
                    </p>

                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`text-xs font-bold px-2 py-1 rounded ${
                          isFull ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {job.cap}
                      </span>
                      {!isFull ? (
                        <Link href="/part-time-worker/job-details">
                          <button
                            onClick={() => localStorage.setItem('kaammadat_selected_job', JSON.stringify(job))}
                            className="bg-orange-500 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow hover:bg-orange-600 cursor-pointer transition"
                          >
                            View & Apply
                          </button>
                        </Link>
                      ) : (
                        <button className="bg-gray-300 text-gray-500 px-4 py-1.5 rounded-lg text-sm font-bold cursor-not-allowed">
                          Completed
                        </button>
                      )}
                    </div>
                  </div>

                  {isFull && <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px]"></div>}
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}

export default function JobSearch() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <span className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
    </div>}>
      <JobSearchContent />
    </Suspense>
  );
}
