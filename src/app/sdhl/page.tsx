import Link from 'next/link';
import Image from 'next/image';

export default function SDHLPage() {
  return (
    <main className="min-h-screen flex items-center justify-center relative" style={{ backgroundColor: 'rgba(50,0,208,1)' }}>
      {/* Background SDHL Logo */}
      <div className="absolute top-0 right-0 z-0">
        <Image 
          src="https://sportality.cdn.s8y.se/team-logos/sdhl1_sdhl.svg"
          alt="SDHL Background"
          width={400}
          height={400}
          className="opacity-10 transform rotate-12"
        />
      </div>
      
      <div className="text-center relative z-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-6">
          Coming Soon...
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          SDHL content is under development
        </p>
        <Link 
          href="/" 
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </main>
  );
}
