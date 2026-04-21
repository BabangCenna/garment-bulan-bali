// app/login/page.jsx
"use client";
import { useState } from "react";
import Input from "@/components/ui/form/Input";
import Button from "@/components/ui/button/Button";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Username dan password wajib diisi");
      return;
    }
    setError("");
    setLoading(true);
    try {
      // ganti dengan server action / API call kamu
      await new Promise((r) => setTimeout(r, 1500));
      // contoh: router.push('/dashboard')
    } catch {
      setError("Username atau password salah");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='login-page'>
      {/* Left panel — branding */}
      <div className='login-left'>
        <div className='login-brand-bg' />
        <div className='login-left-content'>
          <div className='login-brand-icon'>
            <i className='fa-solid fa-store' />
          </div>
          <h1 className='login-brand-name'>TokoKu</h1>
          <p className='login-brand-tagline'>Sistem Manajemen Ritel Modern</p>
          <div className='login-features'>
            {[
              { icon: "fa-cash-register", label: "Point of Sale" },
              { icon: "fa-boxes-stacked", label: "Manajemen Inventori" },
              { icon: "fa-chart-line", label: "Laporan & Analitik" },
              { icon: "fa-users", label: "Manajemen Pelanggan" },
            ].map((f) => (
              <div key={f.label} className='login-feature-item'>
                <span className='login-feature-icon'>
                  <i className={`fa-solid ${f.icon}`} />
                </span>
                <span>{f.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className='login-left-footer'>
          &copy; {new Date().getFullYear()} TokoKu. All rights reserved.
        </div>
      </div>

      {/* Right panel — form */}
      <div className='login-right'>
        <div className='login-card'>
          {/* Mobile logo */}
          <div className='login-mobile-brand'>
            <span className='login-mobile-icon'>
              <i className='fa-solid fa-store' />
            </span>
            <span className='login-mobile-name'>TokoKu</span>
          </div>

          <div className='login-card-header'>
            <h2 className='login-title'>Selamat Datang</h2>
            <p className='login-subtitle'>Masuk ke akun toko kamu</p>
          </div>

          {error && (
            <div className='login-error'>
              <i className='fa-solid fa-circle-exclamation' />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className='login-form'>
            <Input
              id='username'
              label='Username'
              placeholder='Masukkan username...'
              leftIcon={<i className='fa-solid fa-user' />}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete='username'
              autoFocus
              size='lg'
            />
            <Input
              id='password'
              label='Password'
              type='password'
              placeholder='Masukkan password...'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete='current-password'
              size='lg'
            />

            <div className='login-meta'></div>

            <Button
              type='submit'
              variant='primary'
              size='lg'
              block
              loading={loading}
              leftIcon={
                !loading && <i className='fa-solid fa-right-to-bracket' />
              }
            >
              {loading ? "Memverifikasi..." : "Masuk"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
