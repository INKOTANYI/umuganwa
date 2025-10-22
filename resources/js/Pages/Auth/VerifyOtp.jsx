import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function VerifyOtp({ devOtp }) {
    const form = useForm({ code: '' });
    const { post, processing, errors } = form;
    const [digits, setDigits] = useState(['', '', '', '', '', '']);
    const inputsRef = useRef([]);

    const submit = (e) => {
        if (e) e.preventDefault();
        if (processing) return; // avoid double submit
        const code = digits.join('');
        if (code.length !== 6) return; // guard
        console.info('[OTP] submitting code');
        form.transform((data) => ({ ...data, code }));
        post(route('otp.verify'), {
            onError: (errs) => console.error('[OTP] error', errs),
            onSuccess: () => console.info('[OTP] success'),
        });
    };

    useEffect(() => {
        inputsRef.current[0]?.focus();
    }, []);

    const onChange = (idx, value) => {
        const v = value.replace(/\D/g, '').slice(0, 1);
        const next = [...digits];
        next[idx] = v;
        setDigits(next);

        if (v && idx < inputsRef.current.length - 1) {
            inputsRef.current[idx + 1]?.focus();
        }
        if (v && next.every((d) => d !== '')) {
            // auto-submit on last digit
            setTimeout(() => submit(), 0);
        }
    };

    const onKeyDown = (idx, e) => {
        if (e.key === 'Backspace') {
            if (digits[idx]) {
                // clear current
                const next = [...digits];
                next[idx] = '';
                setDigits(next);
            } else if (idx > 0) {
                inputsRef.current[idx - 1]?.focus();
            }
        }
        if (e.key === 'ArrowLeft' && idx > 0) inputsRef.current[idx - 1]?.focus();
        if (e.key === 'ArrowRight' && idx < 5) inputsRef.current[idx + 1]?.focus();
    };

    const onPaste = (e) => {
        const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!text) return;
        const next = ['','','','','',''];
        for (let i = 0; i < text.length; i++) next[i] = text[i];
        setDigits(next);
        const last = Math.min(text.length, 6) - 1;
        inputsRef.current[last]?.focus();
        e.preventDefault();
    };

    return (
        <GuestLayout>
            <Head title="Verify Code" />

            {devOtp && (
                <div className="mb-4 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-800">
                    Development mode: your code is <span className="font-semibold">{devOtp}</span>
                </div>
            )}

            <form onSubmit={submit} className="mx-auto w-full max-w-md rounded-xl border border-gray-100 bg-white/90 p-6 shadow-lg backdrop-blur sm:p-8">
                <div className="mb-4">
                    <InputLabel value="Enter the 6-digit verification code" />
                    <div className="mt-3 flex justify-between gap-2" onPaste={onPaste}>
                        {digits.map((d, idx) => (
                            <input
                                key={idx}
                                ref={(el) => (inputsRef.current[idx] = el)}
                                inputMode="numeric"
                                pattern="[0-9]*"
                                className="h-12 w-12 rounded-lg border border-gray-200 bg-white text-center text-lg font-semibold text-gray-900 outline-none ring-indigo-200 transition focus:border-indigo-400 focus:ring"
                                value={d}
                                onChange={(e) => onChange(idx, e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') submit(e);
                                    else onKeyDown(idx, e);
                                }}
                                required
                            />
                        ))}
                    </div>
                    <InputError message={errors.code} className="mt-2" />
                </div>

                <PrimaryButton className="w-full justify-center" disabled={processing || digits.some((d) => d === '')}>
                    {processing ? 'Verifying…' : 'Verify'}
                </PrimaryButton>
            </form>
        </GuestLayout>
    );
}

