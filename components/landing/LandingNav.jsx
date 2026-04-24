// components/landing/LandingNav.jsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function LandingNav({ site }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = [
    { href: "#koleksi", label: "Koleksi" },
    { href: "#bahan", label: "Bahan" },
    { href: "#tentang", label: "Tentang" },
    { href: "#kontak", label: "Hubungi Kami" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-[#FDF8F5]/95 backdrop-blur-sm shadow-sm border-b border-[#E8D5C8]"
          : "bg-transparent"
      }`}
    >
      <div className='max-w-6xl mx-auto px-6 h-16 flex items-center justify-between'>
        {/* Logo / Brand */}
        <Link href='/' className='flex items-center gap-3 group'>
          {site.logo ? (
            <img src={site.logo} alt={site.name} className='h-8 w-auto' />
          ) : (
            <div className='flex items-center gap-2'>
              <svg width='28' height='28' viewBox='0 0 28 28' fill='none'>
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
                className='text-[#3D2B1F] font-semibold tracking-wide'
                style={{ fontFamily: "'Georgia', serif", fontSize: "1.15rem" }}
              >
                {site.name}
              </span>
            </div>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className='hidden md:flex items-center gap-8'>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className='text-sm text-[#7A5C4E] hover:text-[#C8847A] transition-colors duration-200 tracking-wide'
            >
              {l.label}
            </a>
          ))}
          <a
            href={`https://wa.me/${site.contact.whatsapp}`}
            className='ml-2 px-5 py-2 bg-[#C8847A] text-white text-sm rounded-full hover:bg-[#B8726A] transition-colors duration-200 tracking-wide'
          >
            Pesan Sekarang
          </a>
        </nav>

        {/* Mobile menu button */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className='md:hidden p-2 text-[#7A5C4E]'
          aria-label='Toggle menu'
        >
          <div
            className={`w-5 h-0.5 bg-current transition-all mb-1.5 ${menuOpen ? "rotate-45 translate-y-2" : ""}`}
          />
          <div
            className={`w-5 h-0.5 bg-current transition-all mb-1.5 ${menuOpen ? "opacity-0" : ""}`}
          />
          <div
            className={`w-5 h-0.5 bg-current transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`}
          />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className='md:hidden bg-[#FDF8F5] border-t border-[#E8D5C8] px-6 py-4 flex flex-col gap-4'>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className='text-sm text-[#7A5C4E] hover:text-[#C8847A] py-1'
            >
              {l.label}
            </a>
          ))}
          <a
            href='#kontak'
            onClick={() => setMenuOpen(false)}
            className='w-full text-center px-5 py-2.5 bg-[#C8847A] text-white text-sm rounded-full'
          >
            Pesan Sekarang
          </a>
        </div>
      )}
    </header>
  );
}
