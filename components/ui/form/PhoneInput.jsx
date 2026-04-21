// components/ui/form/PhoneInput.jsx
'use client'
import { useState, useRef, useEffect, forwardRef } from 'react'

const COUNTRIES = [
  { code: 'ID', dial: '+62',  flag: '🇮🇩', name: 'Indonesia' },
  { code: 'MY', dial: '+60',  flag: '🇲🇾', name: 'Malaysia'  },
  { code: 'SG', dial: '+65',  flag: '🇸🇬', name: 'Singapura' },
  { code: 'US', dial: '+1',   flag: '🇺🇸', name: 'Amerika'   },
  { code: 'GB', dial: '+44',  flag: '🇬🇧', name: 'Inggris'   },
  { code: 'AU', dial: '+61',  flag: '🇦🇺', name: 'Australia' },
  { code: 'JP', dial: '+81',  flag: '🇯🇵', name: 'Jepang'    },
  { code: 'CN', dial: '+86',  flag: '🇨🇳', name: 'China'     },
  { code: 'IN', dial: '+91',  flag: '🇮🇳', name: 'India'     },
  { code: 'SA', dial: '+966', flag: '🇸🇦', name: 'Arab Saudi' },
]

const PhoneInput = forwardRef(({
  label,
  hint,
  error,
  required,
  value        = '',
  onChange,
  defaultCountry = 'ID',
  size         = 'md',
  placeholder  = '812-3456-7890',
  id,
  className    = '',
  ...props
}, ref) => {
  const [country,    setCountry]    = useState(COUNTRIES.find(c => c.code === defaultCountry) ?? COUNTRIES[0])
  const [dropOpen,   setDropOpen]   = useState(false)
  const [search,     setSearch]     = useState('')
  const wrapRef = useRef(null)

  useEffect(() => {
    const handler = (e) => { if (!wrapRef.current?.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filtered = search
    ? COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.dial.includes(search)
      )
    : COUNTRIES

  const sizeClass = { sm: 'input-sm', md: 'input-md', lg: 'input-lg' }[size] ?? 'input-md'

  const fullValue = value ? `${country.dial}${value}` : ''

  return (
    <div className={['form-group', className].filter(Boolean).join(' ')} ref={wrapRef}>
      {label && (
        <label htmlFor={id} className="form-label">
          {label}{required && <span className="req"> *</span>}
        </label>
      )}

      <div className="phone-wrap">
        {/* country selector */}
        <div className="phone-country-btn-wrap">
          <button
            type="button"
            className={['phone-country-btn input-base input-default', sizeClass].join(' ')}
            onClick={() => setDropOpen(v => !v)}
          >
            <span className="phone-flag">{country.flag}</span>
            <span className="phone-dial">{country.dial}</span>
            <i className={`fa-solid fa-chevron-${dropOpen ? 'up' : 'down'}`} style={{ fontSize: 10, color: 'var(--color-text-muted)' }} />
          </button>

          {dropOpen && (
            <div className="phone-dropdown">
              <div className="phone-dropdown-search">
                <i className="fa-solid fa-magnifying-glass" style={{ fontSize: 12, color: 'var(--color-text-muted)' }} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Cari negara..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="phone-search-input"
                />
              </div>
              <ul className="phone-country-list">
                {filtered.map(c => (
                  <li
                    key={c.code}
                    className={['phone-country-item', c.code === country.code ? 'phone-country-item-active' : ''].filter(Boolean).join(' ')}
                    onClick={() => { setCountry(c); setDropOpen(false); setSearch('') }}
                  >
                    <span className="phone-flag">{c.flag}</span>
                    <span className="phone-country-name">{c.name}</span>
                    <span className="phone-country-dial">{c.dial}</span>
                    {c.code === country.code && <i className="fa-solid fa-check" style={{ fontSize: 11, color: 'var(--color-primary)', marginLeft: 'auto' }} />}
                  </li>
                ))}
                {filtered.length === 0 && (
                  <li className="phone-country-empty">Tidak ditemukan</li>
                )}
              </ul>
            </div>
          )}
        </div>

        {/* number input */}
        <input
          ref={ref}
          id={id}
          type="tel"
          value={value}
          placeholder={placeholder}
          onChange={e => onChange?.(e.target.value.replace(/\D/g, ''))}
          className={['input-base input-default phone-number-input', sizeClass, error ? 'is-error' : ''].filter(Boolean).join(' ')}
          {...props}
        />
      </div>

      {fullValue && (
        <div className="form-hint" style={{ fontFamily: 'monospace' }}>{fullValue}</div>
      )}
      {error && <div className="form-error"><i className="fa-solid fa-circle-exclamation" />{error}</div>}
      {hint && !error && <div className="form-hint">{hint}</div>}
    </div>
  )
})

PhoneInput.displayName = 'PhoneInput'
export default PhoneInput