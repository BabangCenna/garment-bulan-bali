const BADGE_COLORS = {
  Bestseller: "bg-[#C8847A] text-white",
  New: "bg-[#3D2B1F] text-[#FDF8F5]",
  Favorite: "bg-[#EAC4B8] text-[#7A3C30]",
};

export default function StylesSection({ styles }) {
  return (
    <section id='koleksi' className='py-24 bg-[#FDF8F5]'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-6'>
          <div>
            <p className='text-xs uppercase tracking-[0.25em] text-[#C8847A] mb-3 font-medium'>
              Koleksi Kami
            </p>
            <h2
              className='text-4xl md:text-5xl text-[#3D2B1F]'
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Pilihan untuk Setiap
              <br />
              <em className='text-[#C8847A]'>Momen</em>
            </h2>
          </div>
          <p className='text-[#7A5C4E] max-w-xs text-sm leading-relaxed'>
            Dari dress mengalir hingga kulot lapang — setiap potongan dirancang
            untuk kenyamanan dan keanggunan sehari-hari.
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
          {styles.map((style, i) => (
            <div
              key={style.id}
              className='group relative bg-white rounded-3xl p-6 border border-[#EDE0D9] hover:border-[#C8847A] hover:shadow-lg transition-all duration-300'
            >
              <div
                className='w-full h-48 rounded-2xl mb-5 overflow-hidden'
                style={{
                  background: `hsl(${(i * 37 + 10) % 360}, ${20 + (i % 3) * 5}%, ${88 + (i % 2) * 4}%)`,
                }}
              />

              {style.badge && (
                <span
                  className={`absolute top-5 right-5 text-xs px-3 py-1 rounded-full font-medium ${
                    BADGE_COLORS[style.badge] ?? "bg-[#EAC4B8] text-[#7A3C30]"
                  }`}
                >
                  {style.badge}
                </span>
              )}

              <h3
                className='text-lg font-semibold text-[#3D2B1F] mb-2'
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {style.name}
              </h3>
              <p className='text-sm text-[#7A5C4E] leading-relaxed'>
                {style.description}
              </p>
            </div>
          ))}
        </div>

        <div className='mt-14 text-center'>
          <p className='text-[#7A5C4E] text-sm mb-5'>
            Ingin melihat seluruh koleksi atau memesan custom?
          </p>
          <a
            href='#kontak'
            className='inline-flex items-center gap-2 px-8 py-3.5 border border-[#C8847A] text-[#C8847A] rounded-full text-sm tracking-wide hover:bg-[#FDF0ED] transition-colors duration-200'
          >
            Hubungi Kami
            <svg width='14' height='14' viewBox='0 0 14 14' fill='none'>
              <path
                d='M3 7h8M8 4l3 3-3 3'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
