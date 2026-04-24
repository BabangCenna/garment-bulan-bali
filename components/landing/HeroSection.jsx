// components/landing/HeroSection.jsx
export default function HeroSection({ hero }) {
  return (
    <section className='relative min-h-screen flex items-center overflow-hidden bg-[#FDF8F5]'>
      {/* Decorative background shapes */}
      <div className='absolute inset-0 pointer-events-none'>
        <div className='absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full bg-[#F2D9D3] opacity-40' />
        <div className='absolute bottom-20 -left-16 w-[300px] h-[300px] rounded-full bg-[#EAC4B8] opacity-25' />
        <svg
          className='absolute top-1/3 left-1/4 opacity-10'
          width='200'
          height='200'
          viewBox='0 0 200 200'
        >
          {Array.from({ length: 8 }).map((_, row) =>
            Array.from({ length: 8 }).map((_, col) => (
              <circle
                key={`${row}-${col}`}
                cx={col * 28 + 4}
                cy={row * 28 + 4}
                r='2'
                fill='#C8847A'
              />
            )),
          )}
        </svg>
      </div>

      <div className='relative max-w-6xl mx-auto px-6 py-32 grid md:grid-cols-2 gap-12 items-center'>
        {/* Text */}
        <div>
          <p className='text-xs uppercase tracking-[0.25em] text-[#C8847A] mb-6 font-medium'>
            Handcrafted Garments
          </p>
          <h1
            className='text-5xl md:text-6xl lg:text-7xl leading-[1.1] mb-6 text-[#3D2B1F]'
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {hero.headline}
            <br />
            <em className='text-[#C8847A] not-italic'>{hero.headlineAccent}</em>
          </h1>
          <p className='text-[#7A5C4E] text-lg leading-relaxed mb-10 max-w-md'>
            {hero.subheadline}
          </p>
          <div className='flex flex-wrap gap-4'>
            <a
              href='#koleksi'
              className='px-8 py-3.5 bg-[#C8847A] text-white rounded-full text-sm tracking-wide hover:bg-[#B8726A] transition-colors duration-200'
            >
              {hero.cta}
            </a>
            <a
              href='#tentang'
              className='px-8 py-3.5 border border-[#C8847A] text-[#C8847A] rounded-full text-sm tracking-wide hover:bg-[#FDF0ED] transition-colors duration-200'
            >
              Cerita Kami
            </a>
          </div>
        </div>

        {/* Visual card stack */}
        <div className='relative h-[480px] hidden md:block'>
          <div className='absolute top-8 right-8 w-64 h-80 rounded-3xl bg-[#EAC4B8] opacity-50 rotate-6' />
          <div className='absolute top-4 right-4 w-64 h-80 rounded-3xl bg-[#F2D9D3] rotate-3' />
          <div className='absolute top-0 right-0 w-64 h-80 rounded-3xl bg-[#E8B4AC] flex flex-col justify-end p-6 shadow-lg'>
            <div className='w-8 h-1 bg-white/60 rounded mb-3' />
            <p className='text-white/90 text-sm font-medium'>
              Bali Whisper Dress
            </p>
            <p className='text-white/60 text-xs mt-1'>Rayon Voil Halus · O/S</p>
          </div>
          <div className='absolute bottom-10 left-8 bg-white rounded-2xl px-4 py-3 shadow-md border border-[#E8D5C8]'>
            <p className='text-xs text-[#7A5C4E]'>Bahan pilihan</p>
            <p className='text-sm font-semibold text-[#3D2B1F] mt-0.5'>
              100% Natural Fiber
            </p>
          </div>
          <div className='absolute top-20 left-12 w-12 h-12 rounded-full bg-[#C8847A] flex items-center justify-center'>
            <span className='text-white text-xs font-medium text-center leading-tight'>
              New
            </span>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className='absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#B8A09A]'>
        <span className='text-xs tracking-widest uppercase'>Scroll</span>
        <div className='w-0.5 h-8 bg-[#E8D5C8]'>
          <div className='w-full h-1/2 bg-[#C8847A] animate-bounce' />
        </div>
      </div>
    </section>
  );
}
