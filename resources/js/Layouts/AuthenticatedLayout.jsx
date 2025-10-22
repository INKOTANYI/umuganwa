import ApplicationLogo from '@/Components/ApplicationLogo';
import Dropdown from '@/Components/Dropdown';
import NavLink from '@/Components/NavLink';
import ResponsiveNavLink from '@/Components/ResponsiveNavLink';
import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import SuccessModal from '@/Components/SuccessModal';
import { useI18n } from '@/i18n/Translator.jsx';
import ContactSupportModal from '@/Components/ContactSupportModal.jsx';

export default function AuthenticatedLayout({ header, children }) {
    const { auth, flash } = usePage().props;
    const user = auth.user;
    const { lang, setLang, t } = useI18n();

    const [showingNavigationDropdown, setShowingNavigationDropdown] =
        useState(false);

    const [showSuccess, setShowSuccess] = useState(false);
    const [notifOpen, setNotifOpen] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifs, setNotifs] = useState([]);
    const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
    const [dark, setDark] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);

    useEffect(() => {
        setShowSuccess(!!flash?.success);
    }, [flash?.success]);

    // Initialize theme on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem('theme');
            const prefers = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const isDark = saved ? saved === 'dark' : prefers;
            setDark(isDark);
            document.documentElement.classList.toggle('dark', isDark);
        } catch {}
    }, []);

    // Notifications polling (faster + on focus/visibility)
    useEffect(() => {
        let stopped = false;
        const fetchCount = async () => {
            try {
                const res = await fetch(route('notifications.unread_count'));
                const json = await res.json();
                if (!stopped) setUnreadCount(json.count || 0);
            } catch {}
        };
        fetchCount();
        const id = setInterval(fetchCount, 10000);
        const onFocus = () => fetchCount();
        const onVisibility = () => { if (document.visibilityState === 'visible') fetchCount(); };
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);
        return () => { stopped = true; clearInterval(id); window.removeEventListener('focus', onFocus); document.removeEventListener('visibilitychange', onVisibility); };
    }, []);

    const fetchList = async () => {
        try {
            const res = await fetch(route('notifications.list') + '?limit=10');
            const json = await res.json();
            setNotifs(Array.isArray(json.items) ? json.items : []);
        } catch {}
    };

    const openNotif = async () => {
        setNotifOpen((v) => !v);
        if (!notifOpen) await fetchList();
    };

    const markAllRead = async () => {
        try {
            await fetch(route('notifications.mark_all'), { method: 'POST', headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') } });
            setUnreadCount(0);
            await fetchList();
        } catch {}
    };

    const markOneRead = async (id) => {
        try {
            await fetch(route('notifications.mark_read'), { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content') }, body: JSON.stringify({ id }) });
            await fetchList();
            setUnreadCount((c) => Math.max(0, c - 1));
        } catch {}
    };

    const toggleTheme = () => {
        const next = !dark;
        setDark(next);
        try { localStorage.setItem('theme', next ? 'dark' : 'light'); } catch {}
        document.documentElement.classList.toggle('dark', next);
    };

    const Flag = ({ code }) => {
        // Inline SVG flags for better cross-platform rendering
        if (code === 'fr') {
            // France: blue, white, red vertical
            return (
                <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
                    <rect width="6" height="12" fill="#0055A4"/>
                    <rect x="6" width="6" height="12" fill="#FFFFFF"/>
                    <rect x="12" width="6" height="12" fill="#EF4135"/>
                </svg>
            );
        }
        if (code === 'rw') {
            // Rwanda (approx): blue, yellow, green horizontal (no sun emblem for simplicity)
            return (
                <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
                    <rect width="18" height="12" fill="#2066B0"/>
                    <rect y="6" width="18" height="3" fill="#FAD201"/>
                    <rect y="9" width="18" height="3" fill="#1C8A42"/>
                </svg>
            );
        }
        // England (for English): red cross on white
        return (
            <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true">
                <rect width="18" height="12" fill="#FFFFFF"/>
                <rect x="7" width="4" height="12" fill="#CF142B"/>
                <rect y="4" width="18" height="4" fill="#CF142B"/>
            </svg>
        );
    };

    return (
        <div id="app-top" className="min-h-screen bg-gray-100 dark:bg-neutral-950 transition-colors">
            {/* Sidebar (dark + greens) */}
            <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col bg-gradient-to-b from-emerald-950 to-emerald-900 p-4 text-emerald-50 sm:flex">
                <div className="mb-6 flex items-center gap-2">
                    <Link href={route('dashboard')} className="text-lg font-semibold text-white">{t('brand.name')}</Link>
                </div>
                <nav className="space-y-1 text-sm">
                    <Link
                        href={route('dashboard')}
                        aria-current={route().current('dashboard') ? 'page' : undefined}
                        className={`group flex items-center gap-3 rounded-md px-3 py-2 transition ${route().current('dashboard') ? 'bg-emerald-800/90 text-white border-l-4 border-emerald-400 -ml-3 pl-5 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]' : 'text-emerald-50/90 hover:bg-emerald-800'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 opacity-90"><path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2h-4v-6H9v6H5a2 2 0 0 1-2-2V10z"/></svg>
                        <span>{t('nav.dashboard')}</span>
                    </Link>
                    <Link
                        href={route('candidate.profile.show')}
                        aria-current={route().current('candidate.profile.show') ? 'page' : undefined}
                        className={`group flex items-center gap-3 rounded-md px-3 py-2 transition ${route().current('candidate.profile.show') ? 'bg-emerald-800/90 text-white border-l-4 border-emerald-400 -ml-3 pl-5 shadow-[0_0_0_1px_rgba(16,185,129,0.2)]' : 'text-emerald-50/90 hover:bg-emerald-800'}`}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 opacity-90"><path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5zm0 2c-4 0-7 2-7 4v2h14v-2c0-2-3-4-7-4z"/></svg>
                        <span>{t('nav.profile')}</span>
                    </Link>
                    <Link className="group flex items-center gap-3 rounded-md px-3 py-2 text-emerald-50/90 transition hover:bg-emerald-800" href={route('jobs.index')}>
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 opacity-90"><path d="M3 4h18v2H3zm0 6h18v2H3zm0 6h18v2H3z"/></svg>
                        <span>{t('nav.browse')}</span>
                    </Link>
                    <a className="group flex items-center gap-3 rounded-md px-3 py-2 text-emerald-50/90 transition hover:bg-emerald-800" href="#">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5 opacity-90"><path d="M4 4h16v2H4v12h7v2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm14 6h2v10h-2v-4h-4v-2h4V10zm-6 6H6v-2h6v2z"/></svg>
                        <span>{t('nav.applications')}</span>
                    </a>
                </nav>
                <div className="mt-auto pt-6 text-xs text-emerald-200/80">Signed in as {user.name}</div>
            </aside>
            <nav className="border-b-4 border-emerald-600 bg-gradient-to-b from-neutral-950 to-black text-white">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 justify-between">
                        <div className="flex">
                            <div className="flex shrink-0 items-center gap-3">
                                <button
                                    type="button"
                                    className="inline-flex items-center justify-center rounded-md p-2 text-white/80 hover:text-white sm:hidden"
                                    onClick={() => setMobileSidebarOpen(true)}
                                    aria-label="Open menu"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/></svg>
                                </button>
                                <Link href="/">
                                    <ApplicationLogo className="block h-9 w-auto fill-current text-white" />
                                </Link>
                            </div>

                            {/* Contact Support */}
                            <button
                                type="button"
                                onClick={() => setSupportOpen(true)}
                                className="inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm ring-1 ring-white/15 hover:bg-white/10"
                                title="Contact Support"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-2 h-4 w-4"><path d="M2 5a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H8l-4 4v-4H5a3 3 0 0 1-3-3V5Zm3-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2v2.586L9.586 16H19a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1H5Z"/></svg>
                                {t('footer.contact')}
                            </button>

                            <div className="hidden space-x-6 sm:-my-px sm:ms-10 sm:flex">
                                <Link href={route('dashboard')} className="text-sm font-medium text-white/90 hover:text-white">
                                    {t('nav.dashboard')}
                                </Link>
                            </div>
                        </div>

                        <div className="hidden sm:ms-6 sm:flex sm:items-center gap-4">
                            {/* Notifications button in header */}
                            <button type="button" onClick={openNotif} className="relative inline-flex items-center justify-center rounded-md p-2 text-white/90 ring-1 ring-white/10 hover:bg-white/10" aria-label="Notifications" title="Notifications">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 005 15h14a1 1 0 00.707-1.707L18 11.586V8a6 6 0 00-6-6zm0 20a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                                <span className="absolute -top-1 -right-1 inline-flex min-w-[1.1rem] items-center justify-center rounded-full bg-emerald-500 px-1 text-[10px] font-semibold text-white">{unreadCount > 9 ? '9+' : unreadCount}</span>
                            </button>
                            {/* Language switcher */}
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

                            {/* Dark mode toggle */}
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="inline-flex items-center justify-center rounded-md p-2 text-white/90 ring-1 ring-white/10 hover:bg-white/10"
                                aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
                                title={dark ? 'Light mode' : 'Dark mode'}
                            >
                                {dark ? (
                                    // Sun icon
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12ZM12 1a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0V2a1 1 0 0 1 1-1Zm0 18a1 1 0 0 1 1 1v2a1 1 0 1 1-2 0v-2a1 1 0 0 1 1-1Zm11-7a1 1 0 0 1-1 1h-2a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1ZM4 12a1 1 0 0 1-1 1H1a1 1 0 1 1 0-2h2a1 1 0 0 1 1 1Zm14.95 7.536a1 1 0 0 1-1.414 0l-1.414-1.414a1 1 0 0 1 1.414-1.414l1.414 1.414a1 1 0 0 1 0 1.414ZM7.879 6.293a1 1 0 1 1-1.415 1.414L5.05 6.293A1 1 0 0 1 6.464 4.88l1.415 1.414Zm10.607-1.414a1 1 0 0 1 0 1.414L17.071 7.707a1 1 0 0 1-1.414-1.414l1.414-1.414a1 1 0 0 1 1.415 0ZM7.879 17.707 6.464 19.12A1 1 0 1 1 5.05 17.707l1.414-1.414a1 1 0 1 1 1.415 1.414Z"/></svg>
                                ) : (
                                    // Moon icon
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                                )}
                            </button>
                            {/* Social icons in header */}
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
                            <div className="relative ms-3">
                                <Dropdown>
                                    <Dropdown.Trigger>
                                        <span className="inline-flex rounded-md">
                                            <button
                                                type="button"
                                                className="inline-flex items-center rounded-md border border-transparent bg-white/10 px-3 py-2 text-sm font-medium leading-4 text-white transition duration-150 ease-in-out hover:bg-white/20 focus:outline-none"
                                            >
                                                {user.name}

                                                <svg
                                                    className="-me-0.5 ms-2 h-4 w-4"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 20 20"
                                                    fill="currentColor"
                                                >
                                                    <path
                                                        fillRule="evenodd"
                                                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                                        clipRule="evenodd"
                                                    />
                                                </svg>
                                            </button>
                                        </span>
                                    </Dropdown.Trigger>

                                    <Dropdown.Content>
                                        <Dropdown.Link
                                            href={route('profile.edit')}
                                        >
                                            Profile
                                        </Dropdown.Link>
                                        <Dropdown.Link
                                            href={route('logout')}
                                            method="post"
                                            as="button"
                                        >
                                            Log Out
                                        </Dropdown.Link>
                                    </Dropdown.Content>
                                </Dropdown>
                            </div>
                        </div>

                        <div className="-me-2 flex items-center sm:hidden">
                            <button
                                onClick={() =>
                                    setShowingNavigationDropdown(
                                        (previousState) => !previousState,
                                    )
                                }
                                className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 transition duration-150 ease-in-out hover:bg-gray-100 hover:text-gray-500 focus:bg-gray-100 focus:text-gray-500 focus:outline-none"
                            >
                                <svg
                                    className="h-6 w-6"
                                    stroke="currentColor"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        className={
                                            !showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                    <path
                                        className={
                                            showingNavigationDropdown
                                                ? 'inline-flex'
                                                : 'hidden'
                                        }
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div
                    className={
                        (showingNavigationDropdown ? 'block' : 'hidden') +
                        ' sm:hidden'
                    }
                >
                    <div className="space-y-1 pb-3 pt-2">
                        <ResponsiveNavLink
                            href={route('dashboard')}
                            active={route().current('dashboard')}
                        >
                            Dashboard
                        </ResponsiveNavLink>
                    </div>

                    <div className="border-t border-gray-200 pb-1 pt-4">
                        <div className="px-4">
                            <div className="text-base font-medium text-gray-800">
                                {user.name}
                            </div>
                            <div className="text-sm font-medium text-gray-500">
                                {user.email}
                            </div>
                        </div>

                        <div className="mt-3 space-y-1">
                            <ResponsiveNavLink href={route('profile.edit')}>
                                Profile
                            </ResponsiveNavLink>
                            <ResponsiveNavLink
                                method="post"
                                href={route('logout')}
                                as="button"
                            >
                                Log Out
                            </ResponsiveNavLink>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white shadow">
                    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                        {header}
                    </div>
                </header>
            )}

            <main className="sm:pl-64">{children}</main>

            {/* Mobile sidebar drawer */}
            {mobileSidebarOpen && (
                <div className="fixed inset-0 z-50 sm:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileSidebarOpen(false)} />
                    <div className="absolute inset-y-0 left-0 w-72 bg-gradient-to-b from-emerald-950 to-emerald-900 p-4 text-emerald-50 shadow-xl">
                        <div className="mb-4 flex items-center justify-between">
                            <span className="text-base font-semibold">Menu</span>
                            <button className="rounded p-1 text-emerald-100 hover:bg-emerald-800" onClick={() => setMobileSidebarOpen(false)} aria-label="Close menu">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                        <nav className="space-y-1 text-sm">
                            <Link href={route('dashboard')} className="block rounded-md px-3 py-2 hover:bg-emerald-800" onClick={() => setMobileSidebarOpen(false)}>{t('nav.dashboard')}</Link>
                            <Link href={route('candidate.profile.show')} className="block rounded-md px-3 py-2 hover:bg-emerald-800" onClick={() => setMobileSidebarOpen(false)}>{t('nav.profile')}</Link>
                            <Link href={route('jobs.index')} className="block rounded-md px-3 py-2 hover:bg-emerald-800" onClick={() => setMobileSidebarOpen(false)}>{t('nav.browse')}</Link>
                            <a href="#" className="block rounded-md px-3 py-2 hover:bg-emerald-800" onClick={() => setMobileSidebarOpen(false)}>{t('nav.applications')}</a>
                        </nav>
                    </div>
                </div>
            )}

            {/* Footer */}
            <footer className="mt-8 border-t-4 border-emerald-600 bg-gradient-to-b from-neutral-950 to-black py-8 text-gray-300">
                <div className="mx-auto max-w-7xl px-4 text-sm">
                    <div className="flex flex-col items-center justify-between gap-6 sm:flex-row sm:items-start">
                        <div className="flex items-center gap-3">
                            <ApplicationLogo className="h-6 w-6 fill-current text-emerald-500" />
                            <span className="text-base font-semibold text-white">{t('brand.name')}</span>
                        </div>

                        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
                            <a href="#" className="inline-flex items-center gap-1 hover:text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z"/></svg>
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
                    <div className="mt-6 text-center text-xs text-white/50 sm:text-left">
                        © {new Date().getFullYear()} Ishakiro Job Solution. All rights reserved.
                    </div>
                </div>
            </footer>
            <SuccessModal
                open={showSuccess}
                message={flash?.success}
                onClose={() => setShowSuccess(false)}
            />
            {/* Floating bottom-right Notifications button */}
            <button
                type="button"
                onClick={openNotif}
                className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-sky-800 px-3 py-2 text-white shadow-lg hover:bg-sky-900 focus:outline-none focus:ring-2 focus:ring-sky-400"
                aria-label={t('notifications.button')}
                title={t('notifications.button')}
            >
                {/* Chat bubble icon */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M4 4h16a2 2 0 012 2v9a2 2 0 01-2 2H8l-4 4v-4H4a2 2 0 01-2-2V6a2 2 0 012-2z"/></svg>
                <span className="text-sm font-semibold">{t('notifications.button')}</span>
                <span className="ml-1 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white/20 px-1 text-xs font-semibold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                </span>
            </button>

            {notifOpen && (
                <div className="fixed bottom-20 right-4 z-40 w-80 overflow-hidden rounded-lg border border-white/10 bg-neutral-900 text-white shadow-xl">
                    <div className="flex items-center justify-between px-3 py-2 text-xs text-white/70">
                        <span>{t('notifications.title')} ({unreadCount})</span>
                        <button onClick={markAllRead} className="rounded px-2 py-1 hover:bg-white/10">{t('notifications.mark_all')}</button>
                    </div>
                    <div className="px-3 pb-2 text-[11px] text-white/60">{t('notifications.description')}</div>
                    <div className="max-h-80 divide-y divide-white/5 overflow-auto">
                        {notifs.length === 0 && (
                            <div className="px-4 py-6 text-sm text-white/60">{t('notifications.empty')}</div>
                        )}
                        {notifs.map((n) => (
                            <div key={n.id} className="px-4 py-3 hover:bg-white/5">
                                <div className="text-sm font-medium">{n.data?.title || n.type}</div>
                                <div className="text-xs text-white/70">{n.data?.message}</div>
                                <div className="mt-2 flex items-center gap-2">
                                    <button onClick={() => markOneRead(n.id)} className="rounded px-2 py-1 text-xs text-white/80 hover:bg-white/10">Mark read</button>
                                    {n.data?.link && (
                                        <Link href={n.data.link} className="rounded px-2 py-1 text-xs text-emerald-400 hover:bg-white/10">View</Link>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <ContactSupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
        </div>
    );
}
