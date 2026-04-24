// components/landing/ContactSection.jsx
export default function ContactSection({ contact, siteName }) {
  return (
    <section
      id='kontak'
      className='py-24 bg-[#3D2B1F] relative overflow-hidden'
    >
      <div className='absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#C8847A] opacity-10' />
      <div className='absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-[#EAC4B8] opacity-10' />
      <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-[#C8847A]/10' />

      <div className='relative max-w-3xl mx-auto px-6 text-center'>
        <p className='text-xs uppercase tracking-[0.25em] text-[#C8847A] mb-4 font-medium'>
          Hubungi Kami
        </p>
        <h2
          className='text-4xl md:text-5xl text-[#FDF8F5] mb-6 leading-tight'
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Siap Menciptakan
          <br />
          <em className='text-[#EAC4B8]'>Busana Impian Anda?</em>
        </h2>
        <p className='text-[#B8A09A] text-base leading-relaxed mb-12 max-w-xl mx-auto'>
          Hubungi kami untuk konsultasi desain, pemesanan custom, atau sekedar
          bertanya — kami dengan senang hati membantu.
        </p>

        <div className='flex flex-col sm:flex-row gap-4 justify-center mb-14'>
          <a
            href={`https://wa.me/${contact.whatsapp}`}
            target='_blank'
            rel='noopener noreferrer'
            className='flex items-center justify-center gap-3 px-8 py-4 bg-[#C8847A] text-white rounded-full text-sm tracking-wide hover:bg-[#D8948A] transition-colors duration-200'
          >
            <svg width='18' height='18' viewBox='0 0 24 24' fill='currentColor'>
              <path d='M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z' />
            </svg>
            Chat di WhatsApp
          </a>
          <a
            href={`mailto:${contact.email}`}
            className='flex items-center justify-center gap-3 px-8 py-4 border border-[#EAC4B8]/40 text-[#EAC4B8] rounded-full text-sm tracking-wide hover:bg-[#EAC4B8]/10 transition-colors duration-200'
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 24 24'
              fill='none'
              stroke='currentColor'
              strokeWidth='1.5'
            >
              <path
                d='M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            Kirim Email
          </a>
        </div>

        <div className='w-16 h-px bg-[#C8847A]/30 mx-auto mb-8' />
        <p className='text-[#B8A09A] text-sm mb-3'>Ikuti kami di Instagram</p>
        <a
          href={`https://instagram.com/${contact.instagram.replace("@", "")}`}
          target='_blank'
          rel='noopener noreferrer'
          className='text-[#EAC4B8] text-lg hover:text-white transition-colors'
          style={{ fontFamily: "'Georgia', serif" }}
        >
          {contact.instagram}
        </a>
      </div>
    </section>
  );
}
