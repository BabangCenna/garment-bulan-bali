// components/landing/AboutSection.jsx
const stats = [
  { value: "8+", label: "Tahun Pengalaman" },
  { value: "50+", label: "Model Desain" },
  { value: "100%", label: "Bahan Alami" },
  { value: "Lokal", label: "Pengrajin Indonesia" },
];

const values = [
  "Setiap busana dikerjakan oleh pengrajin lokal berpengalaman",
  "Bahan dipilih langsung — tidak pernah kompromi kualitas",
  "Potongan yang inklusif dan nyaman untuk semua bentuk tubuh",
];

export default function AboutSection({ about }) {
  return (
    <section id='tentang' className='py-24 bg-[#FDF8F5]'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid md:grid-cols-2 gap-16 items-center'>
          {/* Left: visual */}
          <div className='relative'>
            <div className='relative w-full max-w-sm mx-auto md:mx-0'>
              <div className='w-full aspect-[3/4] rounded-3xl bg-[#EAC4B8] flex items-center justify-center overflow-hidden'>
                <svg
                  width='100%'
                  height='100%'
                  viewBox='0 0 300 400'
                  preserveAspectRatio='xMidYMid slice'
                >
                  {Array.from({ length: 20 }).map((_, i) =>
                    Array.from({ length: 15 }).map((_, j) => (
                      <circle
                        key={`${i}-${j}`}
                        cx={j * 22 + (i % 2 === 0 ? 11 : 0)}
                        cy={i * 22}
                        r='3'
                        fill='#C8847A'
                        opacity='0.3'
                      />
                    )),
                  )}
                  <text
                    x='150'
                    y='200'
                    textAnchor='middle'
                    fill='#7A3C30'
                    fontSize='14'
                    fontFamily='Georgia, serif'
                    opacity='0.7'
                  >
                    {about.highlight}
                  </text>
                </svg>
              </div>

              {/* Stats card */}
              <div className='absolute -bottom-8 -right-4 md:-right-10 bg-white rounded-2xl p-5 shadow-md border border-[#EDE0D9]'>
                <div className='grid grid-cols-2 gap-4'>
                  {stats.map((s) => (
                    <div key={s.label} className='text-center'>
                      <p
                        className='text-2xl font-bold text-[#C8847A]'
                        style={{ fontFamily: "'Georgia', serif" }}
                      >
                        {s.value}
                      </p>
                      <p className='text-xs text-[#B8A09A] mt-0.5 leading-tight'>
                        {s.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className='absolute -top-6 -left-6 w-24 h-24 rounded-full border-2 border-[#EAC4B8] opacity-60' />
          </div>

          {/* Right: text */}
          <div className='md:pl-4'>
            <p className='text-xs uppercase tracking-[0.25em] text-[#C8847A] mb-4 font-medium'>
              {about.title}
            </p>
            <h2
              className='text-4xl md:text-5xl text-[#3D2B1F] mb-6 leading-tight'
              style={{ fontFamily: "'Georgia', serif" }}
            >
              Dibuat dengan
              <br />
              <em className='text-[#C8847A]'>Tangan & Hati</em>
            </h2>
            <p className='text-[#7A5C4E] leading-relaxed mb-8 text-base'>
              {about.body}
            </p>

            <ul className='space-y-4 mb-8'>
              {values.map((text) => (
                <li key={text} className='flex items-start gap-3'>
                  <span className='text-[#C8847A] text-xs mt-1.5'>◆</span>
                  <span className='text-sm text-[#7A5C4E] leading-relaxed'>
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <blockquote className='border-l-4 border-[#C8847A] pl-5 py-1'>
              <p
                className='text-lg text-[#3D2B1F] italic'
                style={{ fontFamily: "'Georgia', serif" }}
              >
                "{about.highlight}"
              </p>
            </blockquote>
          </div>
        </div>
      </div>
    </section>
  );
}
