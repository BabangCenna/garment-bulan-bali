// components/landing/LandingFooter.jsx
export default function LandingFooter({ site }) {
  const year = new Date().getFullYear();

  return (
    <footer className='bg-[#2A1D14] text-[#B8A09A] py-12'>
      <div className='max-w-6xl mx-auto px-6'>
        <div className='grid md:grid-cols-3 gap-10 mb-10'>
          {/* Brand */}
          <div>
            <div className='flex items-center gap-2 mb-3'>
              <svg width='22' height='22' viewBox='0 0 28 28' fill='none'>
                <path
                  d='M14 3C14 3 5 8 5 16C5 21 9 25 14 25C19 25 23 21 23 16C23 8 14 3 14 3Z'
                  fill='#C8847A'
                  opacity='0.85'
                />
                <path
                  d='M14 3C14 3 14 12 14 25'
                  stroke='#FDF8F5'
                  strokeWidth='1.5'
                  strokeLinecap='round'
                />
              </svg>
              <span
                className='text-[#FDF8F5] font-semibold'
                style={{ fontFamily: "'Georgia', serif" }}
              >
                {site.name}
              </span>
            </div>
            <p className='text-sm leading-relaxed text-[#7A6559]'>
              {site.tagline}
            </p>
          </div>

          {/* Nav links */}
          <div>
            <p className='text-[#FDF8F5] text-xs uppercase tracking-widest mb-4 font-medium'>
              Navigasi
            </p>
            <ul className='space-y-2 text-sm'>
              {["Koleksi", "Bahan", "Tentang", "Hubungi Kami"].map((l) => (
                <li key={l}>
                  <a
                    href={`#${l.toLowerCase().replace(/\s/g, "-")}`}
                    className='hover:text-[#C8847A] transition-colors duration-200'
                  >
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className='text-[#FDF8F5] text-xs uppercase tracking-widest mb-4 font-medium'>
              Kontak
            </p>
            <ul className='space-y-2 text-sm'>
              <li>
                <a
                  href={`https://wa.me/${site.contact.whatsapp}`}
                  className='hover:text-[#C8847A] transition-colors duration-200'
                >
                  WhatsApp
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.contact.email}`}
                  className='hover:text-[#C8847A] transition-colors duration-200'
                >
                  {site.contact.email}
                </a>
              </li>
              <li>
                <a
                  href={`https://instagram.com/${site.contact.instagram.replace("@", "")}`}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='hover:text-[#C8847A] transition-colors duration-200'
                >
                  {site.contact.instagram}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className='border-t border-[#3D2B1F] pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#5C4A40]'>
          <p>
            © {year} {site.name}. Seluruh hak cipta dilindungi.
          </p>
          <p>Dibuat dengan ♥ di Indonesia</p>
        </div>
      </div>
    </footer>
  );
}
