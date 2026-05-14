import Link from 'next/link';

export default function WorkerRegister() {
  return (
    <div className="min-h-screen bg-orange-50 flex flex-col items-center justify-center p-4 font-[family-name:var(--font-geist-sans)]">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-orange-100">
        <div className="bg-orange-500 p-6 text-center text-white">
          <h2 className="text-3xl font-bold">Worker Registration</h2>
          <p className="opacity-90 mt-2">Join India's largest workforce</p>
        </div>
        
        <form className="p-8 flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition" placeholder="e.g. Rahul Kumar" />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input type="tel" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition" placeholder="+91" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aadhar Number</label>
            <input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition" placeholder="xxxx-xxxx-xxxx" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition" rows={3} placeholder="Full address"></textarea>
          </div>

          <div className="flex items-start gap-3 mt-2">
            <input type="checkbox" id="terms" className="mt-1 w-5 h-5 text-orange-500 rounded focus:ring-orange-500" />
            <label htmlFor="terms" className="text-sm text-gray-600">
              I agree to the Terms & Conditions and confirm that all details provided are unique and true.
            </label>
          </div>

          <Link href="/worker/otp" className="w-full mt-4">
            <button type="button" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg hover:bg-green-700 transition transform active:scale-95">
              Get OTP
            </button>
          </Link>
        </form>
      </div>
    </div>
  );
}
