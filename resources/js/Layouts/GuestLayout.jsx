import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const { logoUrl } = usePage().props;
    return (
        <div className="relative min-h-screen bg-gradient-to-br from-indigo-50 via-white to-violet-50">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(35rem_35rem_at_120%_-10%,rgba(99,102,241,0.15),transparent),radial-gradient(30rem_30rem_at_-10%_10%,rgba(167,139,250,0.16),transparent)]"></div>

            <div className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col items-center px-4 py-8 sm:justify-center sm:py-10">
                <div className="mb-6 sm:mb-8">
                    <Link href="/" className="flex items-center gap-3">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Ishakiro Job Solution" className="h-12 w-12 rounded-full object-cover" />
                        ) : (
                            <ApplicationLogo className="h-10 w-10 fill-current text-indigo-600" />
                        )}
                        <span className="text-lg font-semibold text-gray-900">Ishakiro Job Solution</span>
                    </Link>
                </div>

                <div className="w-full">{children}</div>
            </div>
        </div>
    );
}
