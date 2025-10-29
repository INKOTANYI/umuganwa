import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useI18n } from '@/i18n/Translator.jsx';
import { useEffect, useMemo, useState } from 'react';

export default function Dashboard() {
    const { props } = usePage();
    const { t } = useI18n();
    const profile = props.profile || props.candidateProfile || props.user?.candidate_profile || {};
    const [unreadCount, setUnreadCount] = useState(0);
    const [totalNotif, setTotalNotif] = useState(0);

    useEffect(() => {
        let stopped = false;
        const fetchCounts = async () => {
            try {
                const r1 = await fetch(route('notifications.unread_count'));
                const j1 = await r1.json();
                if (!stopped) setUnreadCount(j1.count || 0);
            } catch {}
            try {
                const r2 = await fetch(route('notifications.list') + '?limit=50');
                const j2 = await r2.json();
                if (!stopped) setTotalNotif(Array.isArray(j2.items) ? j2.items.length : 0);
            } catch {}
        };
        fetchCounts();
        const id = setInterval(fetchCounts, 15000);
        return () => { stopped = true; clearInterval(id); };
    }, []);

    const completion = useMemo(() => {
        const checks = [
            !!profile.first_name,
            !!profile.last_name,
            !!profile.phone,
            !!profile.date_of_birth,
            !!profile.gender,
            !!profile.short_bio,
            !!profile.education_level,
            Array.isArray(profile.languages) ? profile.languages.length > 0 : !!profile.languages,
            !!profile.province_id,
            !!profile.district_id,
            !!profile.sector_id,
            !!(profile.cv || profile.cv_path || profile.cv_url),
            !!(profile.degree || profile.degree_path || profile.degree_url),
        ];
        const total = checks.length;
        const done = checks.filter(Boolean).length;
        const pct = Math.round((done / total) * 100);
        return { pct, done, total };
    }, [profile]);

    // Build robust hrefs even if Ziggy route() is not available in window scope
    const toComplete = (typeof route === 'function' ? route('profile.complete.show') : '/profile/complete');
    const toView = (typeof route === 'function' ? route('candidate.profile.show') : '/profile/view');

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-10">
                <div className="mx-auto max-w-7xl px=4 sm:px-6 lg:px-8">
                    <div className="card mb-4 p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                                <h3 className="text-base font-semibold text-gray-900">{t('dashboard.completion_title')}</h3>
                                <p className="mt-1 text-sm text-gray-600">{completion.pct}%</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                {completion.pct === 0 && (
                                    <a href={toComplete} className="btn-primary">
                                        {t('dashboard.completion_button_register')}
                                    </a>
                                )}
                                {completion.pct > 0 && completion.pct < 100 && (
                                    <a href={toComplete} className="btn-primary">
                                        {t('dashboard.completion_button_continue')}
                                    </a>
                                )}
                                {completion.pct >= 100 && (
                                    <>
                                        <Link href={toView} className="btn-primary">
                                            {t('dashboard.completion_button_view')}
                                        </Link>
                                        <Link href={route('profile.edit')} className="inline-flex items-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                            {t('dashboard.completion_button_update')}
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="mt-3 h-2 w-full overflow-hidden rounded bg-gray-100">
                            <div className="h-2 bg-emerald-600" style={{ width: `${completion.pct}%` }} />
                        </div>
                    </div>
                    <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <Link href={route('profile.edit')} className="group card p-5 ring-1 ring-transparent transition hover:shadow-md hover:ring-emerald-100">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-3.31 0-6 2.69-6 6h2a4 4 0 0 1 8 0h2c0-3.31-2.69-6-6-6Z"/></svg>
                            </div>
                            <h4 className="mt-4 text-base font-semibold text-gray-900">{t('dashboard.cards.profile.title')}</h4>
                            <p className="mt-1 text-sm text-gray-500">{t('dashboard.cards.profile.desc')}</p>
                        </Link>

                        <Link href={route('jobs.index')} className="group card p-5 ring-1 ring-transparent transition hover:shadow-md hover:ring-emerald-100">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition group-hover:bg-emerald-100">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M3 5h18v2H3V5Zm0 6h18v2H3v-2Zm0 6h18v2H3v-2Z"/></svg>
                            </div>
                            <h4 className="mt-4 text-base font-semibold text-gray-900">{t('dashboard.cards.browse.title')}</h4>
                            <p className="mt-1 text-sm text-gray-500">{t('dashboard.cards.browse.desc')}</p>
                        </Link>

                        <Link href={route('applications.my')} className="group card p-5 ring-1 ring-transparent transition hover:shadow-md hover:ring-emerald-100">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50 text-amber-600 transition group-hover:bg-amber-100">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M4 4h16v2H4V4Zm0 4h10v2H4V8Zm0 4h16v2H4v-2Zm0 4h10v2H4v-2Z"/></svg>
                            </div>
                            <h4 className="mt-4 text-base font-semibold text-gray-900">{t('dashboard.cards.applications.title')}</h4>
                            <p className="mt-1 text-sm text-gray-500">{t('dashboard.cards.applications.desc')}</p>
                        </Link>

                        <div className="group card p-5 ring-1 ring-transparent transition hover:shadow-md hover:ring-emerald-100">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-sky-50 text-sky-600 transition group-hover:bg-sky-100">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6"><path d="M12 2a6 6 0 00-6 6v3.586l-1.707 1.707A1 1 0 005 15h14a1 1 0 00.707-1.707L18 11.586V8a6 6 0 00-6-6zm0 20a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
                            </div>
                            <h4 className="mt-4 text-base font-semibold text-gray-900">Notifications</h4>
                            <p className="mt-1 text-sm text-gray-500">Total: {totalNotif} • Unread: {unreadCount}</p>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
