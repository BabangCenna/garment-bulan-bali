// components/landing/FabricsSection.jsx
const COLOR_MAP = {
  sand: { bg: "bg-[#F5ECD9]", dot: "#C4956A", text: "text-[#7A5030]" },
  rose: { bg: "bg-[#F5E0DC]", dot: "#C8847A", text: "text-[#7A3C30]" },
  terracotta: { bg: "bg-[#EDD8CC]", dot: "#B5674F", text: "text-[#6B3525]" },
  blush: { bg: "bg-[#FAEAF0]", dot: "#D4809A", text: "text-[#7A3C52]" },
};

export default function FabricsSection({ fabrics }) {
  return (
    <section id='bahan' className='py-24 bg-[#F7EEE8]'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='mb-14 text-center'>
          <p className='text-xs uppercase tracking-[0.25em] text-[#C8847A] mb-3 font-medium'>
            Bahan-Bahan Pilihan
          </p>
          <h2
            className='text-4xl md:text-5xl text-[#3D2B1F]'
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Kain yang Kami <em className='text-[#C8847A]'>Percaya</em>
          </h2>
          <p className='mt-4 text-[#7A5C4E] text-sm max-w-lg mx-auto leading-relaxed'>
            Kami hanya bekerja dengan bahan-bahan alami berkualitas tinggi yang
            nyaman di kulit dan ramah lingkungan.
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5'>
          {fabrics.map((fabric) => {
            const c = COLOR_MAP[fabric.color] ?? COLOR_MAP.sand;
            return (
              <div
                key={fabric.id}
                className={`${c.bg} rounded-3xl p-6 flex flex-col gap-4 border border-transparent hover:border-[#C8847A]/30 transition-all duration-300`}
              >
                <div className='relative h-20 rounded-2xl overflow-hidden bg-white/50 flex items-center justify-center'>
                  <svg width='80' height='60' viewBox='0 0 80 60'>
                    {Array.from({ length: 10 }).map((_, i) => (
                      <line
                        key={`h${i}`}
                        x1='0'
                        y1={i * 7}
                        x2='80'
                        y2={i * 7}
                        stroke={c.dot}
                        strokeWidth={i % 2 === 0 ? "2" : "1"}
                        opacity={i % 2 === 0 ? 0.5 : 0.2}
                      />
                    ))}
                    {Array.from({ length: 12 }).map((_, i) => (
                      <line
                        key={`v${i}`}
                        x1={i * 7}
                        y1='0'
                        x2={i * 7}
                        y2='60'
                        stroke={c.dot}
                        strokeWidth={i % 2 === 0 ? "2" : "1"}
                        opacity={i % 2 === 0 ? 0.4 : 0.15}
                      />
                    ))}
                  </svg>
                  <div
                    className='absolute bottom-2 right-2 w-3 h-3 rounded-full'
                    style={{ backgroundColor: c.dot }}
                  />
                </div>

                <div>
                  <p
                    className={`text-xs font-medium uppercase tracking-wider ${c.text} mb-1`}
                  >
                    {fabric.material}
                  </p>
                  <h3
                    className='text-base font-semibold text-[#3D2B1F] mb-2'
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    {fabric.name}
                  </h3>
                  <p className='text-xs text-[#7A5C4E] leading-relaxed'>
                    {fabric.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <p className='mt-10 text-center text-xs text-[#B8A09A] tracking-wide'>
          Semua bahan bersertifikat bebas bahan berbahaya · Dipilih langsung
          dari produsen terpercaya
        </p>
      </div>
    </section>
  );
}
