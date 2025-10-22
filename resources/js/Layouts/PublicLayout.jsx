import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';

export default function PublicLayout({ title = 'Ishakiro Job Solution', hero = null, children, hideDashboard = false, largeLogo = false }) {
  const { auth, logoUrl } = usePage().props;
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <Head title={title} />

      {/* Header */}
      <header className="sticky top-0 z-40">
        {/* Top info bar */}
        <div className="bg-emerald-900 text-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-10 items-center justify-between text-[12px] sm:text-[13px]">
              <div className="flex items-center gap-4">
                <span className="inline-flex items-center gap-1 text-white/90">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 8a4 4 0 100 8 4 4 0 000-8zm0-6a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zM4.22 5.64a1 1 0 011.42 0l1.41 1.41a1 1 0 11-1.41 1.42L4.22 7.05a1 1 0 010-1.41zM3 13a1 1 0 011-1h2a1 1 0 110 2H4a1 1 0 01-1-1zm14.95-5.95l1.41-1.41a1 1 0 111.41 1.41l-1.41 1.41a1 1 0 11-1.41-1.41zM17 12a5 5 0 11-10 0 5 5 0 0110 0zm3 1h2a1 1 0 110 2h-2a1 1 0 110-2zM6.05 17.36l-1.41 1.41a1 1 0 101.41 1.41l1.41-1.41a1 1 0 10-1.41-1.41z"/></svg>
                  <span>Mon - Fri, 8:00AM–5:00PM</span>
                </span>
              </div>
              <div className="flex items-center gap-4">
                <a href="mailto:rwibutsoalbert@gmail.com" className="hover:text-emerald-200">rwibutsoalbert@gmail.com</a>
                <a href="tel:+250788793491" className="hover:text-emerald-200">+250 788 793 491</a>
                <div className="hidden items-center gap-3 sm:flex">
                  <a href="#" aria-label="Facebook" className="text-white/90 hover:text-white"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22 12a10 10 0 10-11.6 9.9v-7H8v-3h2.4V9.5c0-2.3 1.4-3.6 3.5-3.6 1 0 2 .1 2 .1v2.3h-1.1c-1.2 0-1.6.8-1.6 1.5V12H16l-.5 3h-2v7A10 10 0 0022 12z"/></svg></a>
                  <a href="#" aria-label="Twitter" className="text-white/90 hover:text-white"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.24 4.24 0 001.86-2.34 8.48 8.48 0 01-2.69 1.03 4.23 4.23 0 00-7.21 3.86A12 12 0 013 4.9a4.22 4.22 0 001.31 5.64 4.2 4.2 0 01-1.91-.53v.05a4.23 4.23 0 003.39 4.15 4.25 4.25 0 01-1.9.07 4.24 4.24 0 003.95 2.94A8.49 8.49 0 012 19.54 12 12 0 008.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18 0-.36-.01-.54A8.35 8.35 0 0022.46 6z"/></svg></a>
                  <a href="#" aria-label="Instagram" className="text-white/90 hover:text-white"><svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M7 2C4.2 2 2 4.2 2 7v10c0 2.8 2.2 5 5 5h10c2.8 0 5-2.2 5-5V7c0-2.8-2.2-5-5-5H7zm10 2c1.7 0 3 1.3 3 3v10c0 1.7-1.3 3-3 3H7c-1.7 0-3-1.3-3-3V7c0-1.7 1.3-3 3-3h10zm-5 3a5 5 0 100 10 5 5 0 000-10zm0 2.2A2.8 2.8 0 1110.2 12 2.81 2.81 0 0112 9.2zm4.8-.9a1.1 1.1 0 11-1.1 1.1 1.1 1.1 0 011.1-1.1z"/></svg></a>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Main navbar */}
        <div className="bg-gradient-to-b from-emerald-950 to-emerald-900 text-white shadow">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className={`flex ${largeLogo ? 'h-16' : 'h-14'} items-center justify-between`}>
              <div className="flex items-center gap-3">
                <button className="md:hidden -ml-2 inline-flex items-center justify-center rounded-md p-2 text-white/90 hover:bg-white/10" onClick={()=>setOpen(v=>!v)} aria-label="Toggle menu">
                  <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeWidth="2" strokeLinecap="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                </button>
                {logoUrl && <img src={logoUrl} alt="Logo" className={`${largeLogo ? 'h-10 w-10' : 'h-8 w-8'} rounded-full object-cover`} />}
                <Link href={route('jobs.index')} className="text-sm font-semibold text-white">Ishakiro Job Solution</Link>
              </div>
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                <Link href="/" className="text-white/90 hover:text-white">Home</Link>
                <Link href="/#about" className="text-white/90 hover:text-white">About us</Link>
                <Link href="/#contact" className="text-white/90 hover:text-white">Contact us</Link>
                <Link href={route('jobs.index')} className="text-white/90 hover:text-white">Jobs</Link>
              </nav>
              <div className="hidden md:flex items-center gap-3 text-sm">
                {(!auth?.user || hideDashboard) ? (
                    <Link href={route('login')} className="text-white/90 hover:text-white">Login</Link>
                ) : (
                  <Link href={route('dashboard')} className="rounded-md bg-white/10 px-2.5 py-1 text-white ring-1 ring-white/15 hover:bg-white/20">Dashboard</Link>
                )}
              </div>
            </div>
          </div>
          {/* mobile menu */}
          {open && (
            <div className="md:hidden border-t border-white/10 bg-emerald-950 text-white">
              <div className="mx-auto max-w-7xl px-4 py-3 space-y-2">
                <Link href="/" className="block rounded-md px-2 py-2 text-white/90 hover:bg-white/10">Home</Link>
                <Link href="/#about" className="block rounded-md px-2 py-2 text-white/90 hover:bg-white/10">About us</Link>
                <Link href="/#contact" className="block rounded-md px-2 py-2 text-white/90 hover:bg-white/10">Contact us</Link>
                <Link href={route('jobs.index')} className="block rounded-md px-2 py-2 text-white/90 hover:bg-white/10">Jobs</Link>
                <div className="pt-2 border-t border-white/10">
                  {(!auth?.user || hideDashboard) ? (
                      <Link href={route('login')} className="block rounded-md px-3 py-2 text-center text-white/90 ring-1 ring-white/15 hover:bg-white/10">Login</Link>
                  ) : (
                    <Link href={route('dashboard')} className="block rounded-md bg-white/10 px-3 py-2 text-center text-white ring-1 ring-white/15 hover:bg-white/20">Dashboard</Link>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero slot */}
      {hero}

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="mt-12 bg-gradient-to-b from-emerald-950 to-emerald-900 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                {logoUrl && <img src={logoUrl} className="h-8 w-8 rounded-full" />}
                <div className="font-semibold">Ishakiro Job Solution</div>
              </div>
              <p className="mt-2 text-sm text-white/70">Connecting talent with opportunity across Rwanda.</p>
            </div>
            <div>
              <div className="text-sm font-semibold">For candidates</div>
              <ul className="mt-2 space-y-2 text-sm text-white/80">
                <li><Link href={route('jobs.index')} className="hover:text-emerald-300">Browse jobs</Link></li>
                <li><Link href={route('register')} className="hover:text-emerald-300">Create profile</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold">For employers</div>
              <ul className="mt-2 space-y-2 text-sm text-white/80">
                {auth?.user?.is_admin ? (
                  <>
                    <li><Link href={route('admin.jobs.index')} className="hover:text-emerald-300">Post a job</Link></li>
                    <li><Link href={route('admin.companies.index')} className="hover:text-emerald-300">Companies</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link href={route('login')} className="hover:text-emerald-300">Employer login</Link></li>
                    <li><Link href={route('register')} className="hover:text-emerald-300">Create employer account</Link></li>
                  </>
                )}
              </ul>
            </div>
            <div>
              <div className="text-sm font-semibold">Support</div>
              <ul className="mt-2 space-y-2 text-sm text-white/80">
                {auth?.user?.is_admin ? (
                  <li><Link href={route('admin.support.index')} className="hover:text-emerald-300">Contact</Link></li>
                ) : (
                  <li><Link href={route('support.my')} className="hover:text-emerald-300">My tickets</Link></li>
                )}
                <li><a href="#" className="hover:text-emerald-300">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-4 text-center text-sm text-white/60">© {new Date().getFullYear()} Ishakiro Job Solution. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
