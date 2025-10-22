import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mx-auto w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl sm:p-8">
                <div className="mb-6 flex rounded-lg bg-gray-100 p-1 text-sm font-medium">
                    <div className="flex-1 rounded-md bg-green-500 px-4 py-2 text-center text-white">
                        Login
                    </div>
                    <Link
                        href={route('register')}
                        className="flex-1 rounded-md px-4 py-2 text-center text-gray-700 hover:text-gray-900"
                    >
                        Register
                    </Link>
                </div>
                {status && (
                    <div className="mb-4 rounded-md border border-green-200 bg-green-50 p-3 text-sm font-medium text-green-700">
                        {status}
                    </div>
                )}

                <h1 className="mb-1 text-center text-2xl font-semibold text-gray-900">Welcome back</h1>
                <p className="mb-6 text-center text-sm text-gray-500">Log in to continue</p>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <InputLabel htmlFor="email" value="Email" />

                        <TextInput
                            id="email"
                            type="email"
                            name="email"
                            value={data.email}
                            className="mt-1 block w-full"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('email', e.target.value)}
                        />

                        <InputError message={errors.email} className="mt-2" />
                    </div>

                    <div>
                        <InputLabel htmlFor="password" value="Password" />

                        <TextInput
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="mt-1 block w-full"
                            autoComplete="current-password"
                            onChange={(e) => setData('password', e.target.value)}
                        />

                        <InputError message={errors.password} className="mt-2" />
                    </div>

                    <div className="flex items-center justify-between">
                        <label className="flex items-center">
                            <Checkbox
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                            />
                            <span className="ms-2 text-sm text-gray-600">Remember me</span>
                        </label>

                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div>

                    <PrimaryButton className="mt-2 w-full justify-center rounded-md bg-green-500 hover:bg-green-600 focus:bg-green-600" disabled={processing}>
                        {processing ? 'Signing in…' : 'Log in'}
                    </PrimaryButton>

                    <div className="text-center text-sm text-gray-600">
                        Don’t have an account?{' '}
                        <Link href={route('register')} className="font-medium text-indigo-600 hover:text-indigo-500">
                            Register
                        </Link>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}

