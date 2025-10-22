import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ContactSupportModal from '@/Components/ContactSupportModal.jsx';
import ApplicationLogo from '@/Components/ApplicationLogo';
import { useI18n } from '@/i18n/Translator.jsx';

export default function AdminLayout({ title = 'Admin', children }) {
    const { auth, flash = {} } = usePage().props;
    const { t, lang, setLang } = useI18n();
    const [dark, setDark] = useState(false);
    const [flashOpen, setFlashOpen] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('theme');
            const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = saved ? saved === 'dark' : prefers;
            setDark(isDark);
            document.documentElement.classList.toggle('dark', isDark);
        } catch {}
    }, []);

    // Open flash toast when server sends a message
    useEffect(() => {
        if (flash?.success || flash?.error) {
            setFlashOpen(true);
            const t = setTimeout(() => setFlashOpen(false), 2500);
            return () => clearTimeout(t);
        }
    }, [flash?.success, flash?.error]);

    const toggleTheme = () => {
        const next = !dark;
        setDark(next);
        try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
        document.documentElement.classList.toggle('dark', next);
    };

    const Flag = ({ code }) => {
        if (code === 'fr') {
            return (
                <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
                    <rect width="6" height="12" fill="#0055A4"/>
                    <rect x="6" width="6" height="12" fill="#FFFFFF"/>
                    <rect x="12" width="6" height="12" fill="#EF4135"/>
                </svg>
            );
        }
        if (code === 'rw') {
            return (
                <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
                    <rect width="18" height="12" fill="#2066B0"/>
                    <rect y="6" width="18" height="3" fill="#FAD201"/>
                    <rect y="9" width="18" height="3" fill="#1C8A42"/>
                </svg>
            );
        }
        return (
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
                <rect width="18" height="12" fill="#FFFFFF"/>
                <rect x="7" width="4" height="12" fill="#CF142B"/>
                <rect y="4" width="18" height="4" fill="#CF142B"/>
            </svg>
        );
    };
    return (
        <div className="min-h-screen bg-gray-100">
            {/* Sidebar matches user layout emerald gradient */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-gradient-to-b from-emerald-950 to-emerald-900 p-4 text-emerald-50 sm:flex">
                <div className="mb-6 flex items-center gap-2">
                    <Link href={route('admin.dashboard')} className="text-lg font-semibold text-white">{title}</Link>
                </div>
                <nav className="grid gap-2 text-sm">
                    <Link
                        href={route('admin.dashboard')}
                        className={`group flex items-center gap-3 rounded-xl border p-3 transition shadow-sm ${route().current('admin.dashboard') ? 'border-emerald-500/60 bg-emerald-800/70 text-white ring-2 ring-emerald-400' : 'border-emerald-700/30 bg-emerald-800/40 text-emerald-50/90 hover:bg-emerald-800/60'}`}
                    >
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900/70 text-emerald-300">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M3 12l7-9 7 9-7 9-7-9z"/></svg>
                        </span>
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link
                        href={route('admin.users.index')}
                        className={`group flex items-center gap-3 rounded-xl border p-3 transition shadow-sm ${route().current('admin.users.index') ? 'border-emerald-500/60 bg-emerald-800/70 text-white ring-2 ring-emerald-400' : 'border-emerald-700/30 bg-emerald-800/40 text-emerald-50/90 hover:bg-emerald-800/60'}`}
                    >
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900/70 text-emerald-300">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 12a5 5 0 100-10 5 5 0 000 10zm-7 9a7 7 0 1114 0H5z"/></svg>
                        </span>
                        <span className="font-medium">Users</span>
                    </Link>
                    <Link
                        href={route('admin.companies.index')}
                        className={`group flex items-center gap-3 rounded-xl border p-3 transition shadow-sm ${route().current('admin.companies.*') ? 'border-emerald-500/60 bg-emerald-800/70 text-white ring-2 ring-emerald-400' : 'border-emerald-700/30 bg-emerald-800/40 text-emerald-50/90 hover:bg-emerald-800/60'}`}
                    >
                        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900/70 text-emerald-300">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M3 3h8v18H3V3zm10 4h8v14h-8V7z"/></svg>
                        </span>
                        <span className="font-medium">Companies</span>
                    </Link>

                    {/* Jobs (link only if route exists) */}
                    {route().has('admin.jobs.index') ? (
                        <Link
                            href={route('admin.jobs.index')}
                            className={`group flex items-center gap-3 rounded-xl border p-3 transition shadow-sm ${route().current('admin.jobs.*') ? 'border-emerald-500/60 bg-emerald-800/70 text-white ring-2 ring-emerald-400' : 'border-emerald-700/30 bg-emerald-800/40 text-emerald-50/90 hover:bg-emerald-800/60'}`}
                        >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900/70 text-emerald-300">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M4 7h16a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2zm5-4h6a2 2 0 012 2v2H7V5a2 2 0 012-2z"/></svg>
                            </span>
                            <span className="font-medium">Jobs</span>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-700/30 bg-emerald-800/30 p-3 text-emerald-50/50 opacity-70">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900/50 text-emerald-300/70">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M4 7h16a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V9a2 2 0 012-2zm5-4h6a2 2 0 012 2v2H7V5a2 2 0 012-2z"/></svg>
                            </span>
                            <div className="flex flex-col">
                                <span className="font-medium">Jobs</span>
                                <span className="text-[11px] opacity-75">Coming soon</span>
                            </div>
                        </div>
                    )}

                    {/* Applications (link only if route exists) */}
                    {route().has('admin.applications.index') ? (
                        <Link
                            href={route('admin.applications.index')}
                            className={`group flex items-center gap-3 rounded-xl border p-3 transition shadow-sm ${route().current('admin.applications.*') ? 'border-emerald-500/60 bg-emerald-800/70 text-white ring-2 ring-emerald-400' : 'border-emerald-700/30 bg-emerald-800/40 text-emerald-50/90 hover:bg-emerald-800/60'}`}
                        >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900/70 text-emerald-300">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M4 4h16v2H4V4zm0 4h16v12H4V8zm4 2v2h8v-2H8z"/></svg>
                            </span>
                            <span className="font-medium">Applications</span>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-700/30 bg-emerald-800/30 p-3 text-emerald-50/50 opacity-70">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900/50 text-emerald-300/70">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M4 4h16v2H4V4zm0 4h16v12H4V8zm4 2v2h8v-2H8z"/></svg>
                            </span>
                            <div className="flex flex-col">
                                <span className="font-medium">Applications</span>
                                <span className="text-[11px] opacity-75">Coming soon</span>
                            </div>
                        </div>
                    )}

                    {/* Support Inbox (link only if page route exists) */}
                    {route().has('admin.support.index') ? (
                        <Link
                            href={route('admin.support.index')}
                            className={`group flex items-center gap-3 rounded-xl border p-3 transition shadow-sm ${route().current('admin.support.*') ? 'border-emerald-500/60 bg-emerald-800/70 text-white ring-2 ring-emerald-400' : 'border-emerald-700/30 bg-emerald-800/40 text-emerald-50/90 hover:bg-emerald-800/60'}`}
                        >
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900/70 text-emerald-300">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M4 4h16v12H5.17L4 17.17V4zm2 3h12v2H6V7zm0 4h12v2H6v-2z"/></svg>
                            </span>
                            <span className="font-medium">Support</span>
                        </Link>
                    ) : (
                        <div className="flex items-center gap-3 rounded-xl border border-emerald-700/30 bg-emerald-800/30 p-3 text-emerald-50/50 opacity-70">
                            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-900/50 text-emerald-300/70">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M4 4h16v12H5.17L4 17.17V4zm2 3h12v2H6V7zm0 4h12v2H6v-2z"/></svg>
                            </span>
                            <div className="flex flex-col">
                                <span className="font-medium">Support</span>
                                <span className="text-[11px] opacity-75">Coming soon</span>
                            </div>
                        </div>
                    )}
                </nav>
                <div className="mt-auto pt-6 text-xs text-emerald-200/80">Signed in as {auth?.user?.name}</div>
            </aside>

            <div className="sm:pl-64 flex min-h-screen flex-col">
                {/* Header bar matches user layout colors with icons */}
                <header className="border-b-4 border-emerald-600 bg-gradient-to-b from-neutral-950 to-black text-white">
                    <div className="flex h-16 w-full items-center justify-between px-4">
                        <div className="flex items-center gap-3">
                            <Link href="/">
                                <ApplicationLogo className="block h-8 w-auto fill-current text-white" />
                            </Link>
                            <div className="text-base font-semibold text-white">{title}</div>
                        </div>
                        <div className="flex items-center gap-3">
                            {/* Language switcher with flags */}
                            <div className="hidden items-center gap-2 sm:flex">
                                {[
                                    { code: 'en', label: 'English' },
                                    { code: 'fr', label: 'Français' },
                                    { code: 'rw', label: 'Kinyarwanda' },
                                ].map(({code, label}) => (
                                    <button
                                        key={code}
                                        onClick={() => setLang(code)}
                                        aria-label={label}
                                        title={label}
                                        className={`inline-flex items-center justify-center rounded-md px-2 py-1 ${lang===code ? 'bg-white/20' : 'hover:bg-white/10'}`}
                                    >
                                        <Flag code={code} />
                                    </button>
                                ))}
                            </div>
                            {/* Social icons */}
                            <div className="hidden items-center gap-3 sm:flex">
                                <a href="#" aria-label="LinkedIn" className="text-white/90 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5zM.5 8h4V24h-4V8zm7.5 0h3.8v2.2h.1c.5-1 1.9-2.2 3.9-2.2 4.2 0 5 2.8 5 6.5V24h-4v-7.3c0-1.7 0-3.8-2.3-3.8s-2.6 1.8-2.6 3.7V24h-4V8z"/></svg>
                                </a>
                                <a href="#" aria-label="X" className="text-white/90 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M18 1h3l-7.5 8.6L22 23h-7l-4.4-6-4.7 6H3l8-9.3L2 1h7l4 5.6L18 1z"/></svg>
                                </a>
                                <a href="#" aria-label="Facebook" className="text-white/90 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M22 12a10 10 0 10-11.6 9.9v-7h-2.8V12h2.8V9.7c0-2.8 1.6-4.4 4-4.4 1.2 0 2.5.2 2.5.2v2.7h-1.4c-1.4 0-1.8.9-1.8 1.8V12h3.1l-.5 2.9h-2.6v7A10 10 0 0022 12z"/></svg>
                                </a>
                            </div>
                            {/* Dark mode toggle */}
                            <button type="button" onClick={toggleTheme} className="inline-flex items-center justify-center rounded-md p-2 text-white/90 ring-1 ring-white/10 hover:bg-white/10" aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
                                {dark ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 1a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1Zm0 18a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Z"/></svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                                )}
                            </button>
                            <Link href={route('dashboard')} className="text-sm text-white/90 hover:text-white">User dashboard</Link>
                            <Link href={route('logout')} method="post" as="button" className="rounded-md bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20">Logout</Link>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
                    {children}
                </main>
                {/* Footer mirrors user layout */}
                <footer className="mt-8 border-t-4 border-emerald-600 bg-gradient-to-b from-neutral-950 to-black py-8 text-gray-300">
                    <div className="w-full px-4 text-sm">
                        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
                            <div className="flex items-center gap-3">
                                <ApplicationLogo className="h-6 w-6 fill-current text-emerald-500" />
                                <span className="text-base font-semibold text-white">{t('brand.name')}</span>
                            </div>

                            <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                                <a href="#" className="inline-flex items-center gap-1 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2a7 7 0 10-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z"/></svg>
                                    <span>{t('footer.privacy')}</span>
                                </a>
                                <a href="#" className="inline-flex items-center gap-1 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2zm1 3v2h8V7H8zm0 4v2h8v-2H8zm0 4v2h5v-2H8z"/></svg>
                                    <span>{t('footer.terms')}</span>
                                </a>
                                <button type="button" onClick={() => setSupportOpen(true)} className="inline-flex items-center gap-1 hover:text-white">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M2 5a2 2 0 012-2h3l2 3h8a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.5 3A1.5 1.5 0 104 9.5 1.5 1.5 0 005.5 8zm2.086 6.243l1.94-1.94a1 1 0 011.414 0l2.121 2.121 3.536-3.536a1 1 0 011.414 0L19 12.414V16H7.586l.999-1.757z"/></svg>
                                    <span>{t('footer.contact')}</span>
                                </button>
                            </div>

                            <button
                                type="button"
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/20"
                                aria-label="Back to top"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 4l-7 7h4v9h6v-9h4l-7-7z"/></svg>
                                Top
                            </button>
                        </div>
                        <div className="mt-6 text-center text-xs text-white/50 sm:text-left">© {new Date().getFullYear()} Ishakiro Job Solution. All rights reserved.</div>
                    </div>
                </footer>
            </div>
            {/* Global flash toast */}
            {flashOpen && (flash?.success || flash?.error) && (
                <div className="fixed bottom-4 right-4 z-[60]">
                    <div className={`flex items-start gap-3 rounded-lg px-4 py-3 shadow-lg ring-1 ring-black/5 ${flash?.success ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                        <span className="text-sm font-semibold">{flash?.success ? 'Success' : 'Error'}</span>
                        <span className="text-sm opacity-90">{flash?.success || flash?.error}</span>
                        <button onClick={()=>setFlashOpen(false)} className="ml-2 text-white/80 hover:text-white">✕</button>
                    </div>
                </div>
            )}
            <ContactSupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
        </div>
    );
}
