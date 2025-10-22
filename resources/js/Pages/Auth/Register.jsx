import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        phone: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [emailTaken, setEmailTaken] = useState(false);
    const [phoneTaken, setPhoneTaken] = useState(false);
    const [checking, setChecking] = useState(false);
    const debounceRef = useRef();

    const submit = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        const email = data.email.trim();
        const phone = data.phone.trim();
        const emailLooksValid = /.+@.+\..+/.test(email);

        if (!email && !phone) {
            setEmailTaken(false);
            setPhoneTaken(false);
            return;
        }

        debounceRef.current = setTimeout(async () => {
            try {
                setChecking(true);
                const url = `${route('register.checkUnique')}?${new URLSearchParams({ email, phone }).toString()}`;
                const res = await fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } });
                if (res.ok) {
                    const json = await res.json();
                    setEmailTaken(Boolean(emailLooksValid && json.emailTaken));
                    setPhoneTaken(Boolean(phone && json.phoneTaken));
                }
            } finally {
                setChecking(false);
            }
        }, 500);

        return () => clearTimeout(debounceRef.current);
    }, [data.email, data.phone]);

    const passwordStrength = useMemo(() => {
        const pwd = data.password || '';
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[a-z]/.test(pwd)) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return score; // 0..5
    }, [data.password]);

    const strengthLabel = useMemo(() => {
        switch (passwordStrength) {
            case 0:
            case 1:
                return 'Very weak';
            case 2:
                return 'Weak';
            case 3:
                return 'Moderate';
            case 4:
                return 'Strong';
            case 5:
                return 'Very strong';
            default:
                return '';
        }
    }, [passwordStrength]);

    return (
        <GuestLayout>
            <Head title="Register" />

            <div className="mx-auto w-full max-w-xl rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-8">
                <div className="mb-6 flex rounded-lg bg-gray-100 p-1 text-sm font-medium">
                    <Link
                        href={route('login')}
                        className="flex-1 rounded-md px-4 py-2 text-center text-gray-700 hover:text-gray-900"
                    >
                        Login
                    </Link>
                    <div className="flex-1 rounded-md bg-green-500 px-4 py-2 text-center text-white">
                        Register
                    </div>
                </div>

                <h1 className="mb-2 text-center text-2xl font-semibold text-gray-900">Create Account</h1>
                <p className="mb-6 text-center text-sm text-gray-500">Join Umuganwa to post and find jobs</p>

                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="first_name" value="First name" />
                            <TextInput
                                id="first_name"
                                name="first_name"
                                value={data.first_name}
                                className="mt-1 block w-full"
                                autoComplete="given-name"
                                isFocused={true}
                                onChange={(e) => setData('first_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.first_name} className="mt-2" />
                        </div>
                        <div>
                            <InputLabel htmlFor="last_name" value="Last name" />
                            <TextInput
                                id="last_name"
                                name="last_name"
                                value={data.last_name}
                                className="mt-1 block w-full"
                                autoComplete="family-name"
                                onChange={(e) => setData('last_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.last_name} className="mt-2" />
                        </div>
                    </div>

                    <div>
                        <InputLabel htmlFor="phone" value="Phone" />
                        <TextInput
                            id="phone"
                            name="phone"
                            value={data.phone}
                            className="mt-1 block w-full"
                            autoComplete="tel"
                            onChange={(e) => setData('phone', e.target.value)}
                            required
                        />
                        <InputError message={phoneTaken ? 'The phone has already been taken.' : errors.phone} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="email" value="Email" />
                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            onChange={(e) => setData('email', e.target.value)}
                            required
                        />
                        <InputError message={emailTaken ? 'The email has already been taken.' : errors.email} className="mt-2" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <div className="mt-2">
                                <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
                                    <span>Password strength</span>
                                    <span>{strengthLabel}</span>
                                </div>
                                <div className="h-2 w-full overflow-hidden rounded bg-gray-100">
                                    <div
                                        className={`h-2 transition-all ${
                                            passwordStrength <= 1
                                                ? 'w-1/5 bg-red-400'
                                                : passwordStrength === 2
                                                ? 'w-2/5 bg-orange-400'
                                                : passwordStrength === 3
                                                ? 'w-3/5 bg-yellow-400'
                                                : passwordStrength === 4
                                                ? 'w-4/5 bg-emerald-400'
                                                : 'w-full bg-green-500'
                                        }`}
                                    />
                                </div>
                                <p className="mt-2 text-xs text-gray-500">
                                    Use at least 8 characters with upper/lowercase, numbers, and symbols.
                                </p>
                                <InputError message={errors.password} className="mt-2" />
                            </div>
                        </div>
                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>
                    </div>

                    <PrimaryButton
                        className="mt-2 w-full justify-center rounded-md bg-green-500 hover:bg-green-600 focus:bg-green-600"
                        disabled={
                            processing ||
                            checking ||
                            emailTaken ||
                            phoneTaken ||
                            passwordStrength < 3 ||
                            !data.first_name ||
                            !data.last_name ||
                            !data.phone ||
                            !data.email ||
                            !data.password ||
                            !data.password_confirmation
                        }
                    >
                        {processing ? 'Creating account…' : 'Register'}
                    </PrimaryButton>

                    <div className="text-center text-sm text-gray-600">
                        Already registered?{' '}
                        <Link
                            href={route('login')}
                            className="font-medium text-indigo-600 hover:text-indigo-500"
                        >
                            Log in
                        </Link>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}

