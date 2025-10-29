import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '@/i18n/Translator.jsx';

export default function CompleteProfile({ prefill, provinces, departments }) {
    const { errors } = usePage().props;
    const { t } = useI18n();
    

    const [editingIdentity, setEditingIdentity] = useState(true);
    const [districts, setDistricts] = useState([]);
    const [sectors, setSectors] = useState([]);
    const [fileErrors, setFileErrors] = useState({ cv: '', degree: '', certificates: '', identity: '' });

    const { data, setData, post, processing, progress, transform } = useForm({
        first_name: prefill.first_name || '',
        last_name: prefill.last_name || '',
        email: prefill.email || '',
        phone: prefill.phone || '',

        date_of_birth: '',
        gender: 'male',
        short_bio: '',
        education_level: 'bachelor',
        graduation_date: '',
        languages: [],

        province_id: '',
        district_id: '',
        sector_id: '',
        department_id: '',

        cv: null,
        degree: null,
        certificates: [],
        identity_doc: null,
    });

    const allowedTypes = useMemo(() => ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'], []);
    const todayISO = useMemo(() => new Date().toISOString().split('T')[0], []);
    const adultMaxISO = useMemo(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() - 18);
        return d.toISOString().split('T')[0];
    }, []);
    const maxSize = 5 * 1024 * 1024; // 5MB

    const formatBytes = (bytes) => {
        if (!bytes && bytes !== 0) return '';
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = bytes === 0 ? 0 : Math.floor(Math.log(bytes) / Math.log(1024));
        const val = bytes / Math.pow(1024, i);
        return `${val.toFixed( (i===0)?0:1 )} ${sizes[i]}`;
    };

    const normalizeDate = (val) => {
        if (!val) return '';
        // Handle ISO strings like 2007-10-03T00:00:00.000000Z
        if (typeof val === 'string' && val.includes('T')) return val.slice(0, 10);
        return val;
    };

    useEffect(() => {
        if (data.province_id) {
            fetch(`${route('locations.districts')}?province_id=${data.province_id}`)
                .then((r) => r.json())
                .then((json) => {
                    setDistricts(json);
                    setSectors([]);
                    setData('district_id', '');
                    setData('sector_id', '');
                });
        }
    }, [data.province_id]);

    useEffect(() => {
        if (data.district_id) {
            fetch(`${route('locations.sectors')}?district_id=${data.district_id}`)
                .then((r) => r.json())
                .then((json) => {
                    setSectors(json);
                    setData('sector_id', '');
                });
        }
    }, [data.district_id]);

    const langChecked = (lang) => data.languages.includes(lang);
    const toggleLang = (lang) => {
        if (langChecked(lang)) {
            setData('languages', data.languages.filter((l) => l !== lang));
        } else {
            setData('languages', [...data.languages, lang]);
        }
    };

    const canSubmit = useMemo(() => {
        return (
            data.first_name &&
            data.last_name &&
            data.email &&
            data.phone &&
            data.date_of_birth &&
            data.gender &&
            data.short_bio &&
            data.education_level &&
            data.languages.length > 0 &&
            data.graduation_date &&
            data.province_id &&
            data.district_id &&
            data.sector_id &&
            data.department_id &&
            data.cv &&
            data.degree &&
            data.identity_doc &&
            !fileErrors.cv &&
            !fileErrors.degree &&
            !fileErrors.certificates &&
            !fileErrors.identity
        );
    }, [data, fileErrors]);

    const missing = useMemo(() => {
        const m = [];
        if (!data.first_name) m.push('First name');
        if (!data.last_name) m.push('Last name');
        if (!data.email) m.push('Email');
        if (!data.phone) m.push('Phone');
        if (!data.date_of_birth) m.push('Date of birth');
        if (!data.gender) m.push('Gender');
        if (!data.short_bio) m.push('Short bio');
        if (!data.education_level) m.push('Education level');
        if (!data.languages?.length) m.push('Languages');
        if (!data.graduation_date) m.push('Graduation date');
        if (!data.province_id) m.push('Province');
        if (!data.district_id) m.push('District');
        if (!data.sector_id) m.push('Sector');
        if (!data.department_id) m.push('Department');
        if (!data.cv) m.push('CV');
        if (!data.degree) m.push('Degree');
        if (!data.identity_doc) m.push('Identity document');
        if (fileErrors.cv) m.push('CV: ' + fileErrors.cv);
        if (fileErrors.degree) m.push('Degree: ' + fileErrors.degree);
        if (fileErrors.certificates) m.push('Certificates: ' + fileErrors.certificates);
        if (fileErrors.identity) m.push('Identity document: ' + fileErrors.identity);
        return m;
    }, [data, fileErrors]);

    // Compute experience (years) from graduation_date to today for display
    const experienceYears = useMemo(() => {
        if (!data.graduation_date) return '';
        try {
            const grad = new Date(data.graduation_date);
            const now = new Date();
            const diffDays = (now - grad) / (1000 * 60 * 60 * 24);
            const years = Math.floor(diffDays / 365.25);
            return years < 0 ? 0 : years;
        } catch {
            return '';
        }
    }, [data.graduation_date]);

    const onSubmit = (e) => {
        e.preventDefault();
        console.info('[CompleteProfile] Submit start');
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        transform((d) => ({ ...d, _token: csrf }));
        post(route('profile.complete.store'), {
            forceFormData: true,
            onSuccess: () => console.info('[CompleteProfile] Submit success'),
            onError: (errs) => console.error('[CompleteProfile] Submit errors', errs),
            onFinish: () => console.info('[CompleteProfile] Submit finish'),
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{t('profile.complete_title')}</h2>}
        >
            <Head title="Complete Profile" />

            <div className="relative py-2 bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(40rem_40rem_at_120%_-20%,rgba(16,185,129,0.12),transparent),radial-gradient(35rem_35rem_at_-20%_10%,rgba(99,102,241,0.12),transparent)]"></div>
                <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                    <form onSubmit={onSubmit} noValidate encType="multipart/form-data" className="space-y-8">
                        <section className="card p-6">
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-gray-900">{t('profile.identity_title')}</h3>
                                <button
                                    type="button"
                                    onClick={() => setEditingIdentity((v) => !v)}
                                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                                >
                                    {editingIdentity ? t('profile.lock') : t('profile.edit')}
                                </button>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <div>
                                    <InputLabel htmlFor="first_name" value={t('profile.first_name')} />
                                    <TextInput
                                        id="first_name"
                                        name="first_name"
                                        value={data.first_name}
                                        className={`mt-1 block w-full ${!editingIdentity ? 'bg-gray-50 text-gray-700' : ''}`}
                                        onChange={(e) => setData('first_name', e.target.value)}
                                        disabled={!editingIdentity}
                                        required
                                    />
                                    <InputError message={errors.first_name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="last_name" value={t('profile.last_name')} />
                                    <TextInput
                                        id="last_name"
                                        name="last_name"
                                        value={data.last_name}
                                        className={`mt-1 block w-full ${!editingIdentity ? 'bg-gray-50 text-gray-700' : ''}`}
                                        onChange={(e) => setData('last_name', e.target.value)}
                                        disabled={!editingIdentity}
                                        required
                                    />
                                    <InputError message={errors.last_name} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="email" value={t('profile.email')} />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className={`mt-1 block w-full ${!editingIdentity ? 'bg-gray-50 text-gray-700' : ''}`}
                                        onChange={(e) => setData('email', e.target.value)}
                                        disabled={!editingIdentity}
                                        required
                                    />
                                    <InputError message={errors.email} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="phone" value={t('profile.phone')} />
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center">
                                            <span className="inline-flex items-center gap-2 rounded-l-md border border-r-0 border-gray-300 bg-white px-3 text-gray-700 text-sm">
                                                <span role="img" aria-label="Rwanda flag">🇷🇼</span>
                                                +250
                                            </span>
                                        </div>
                                        <input
                                            id="phone"
                                            name="phone"
                                            value={data.phone}
                                            onChange={(e) => {
                                                const v = e.target.value.replace(/[^0-9]/g, '').slice(0,10);
                                                setData('phone', v);
                                                const ok = /^07(2|3|8)\d{7}$/.test(v);
                                                e.target.setCustomValidity(ok || v.length === 0 ? '' : 'Phone must start with 072, 073, or 078 and be 10 digits');
                                            }}
                                            onBlur={(e) => {
                                                const v = e.target.value;
                                                const ok = /^07(2|3|8)\d{7}$/.test(v);
                                                e.target.setCustomValidity(ok || v.length === 0 ? '' : 'Phone must start with 072, 073, or 078 and be 10 digits');
                                            }}
                                            inputMode="numeric"
                                            pattern="^07(2|3|8)\d{7}$"
                                            maxLength={10}
                                            placeholder="07xxxxxxxx"
                                            title="Phone must start with 072, 073, or 078 and be 10 digits"
                                            disabled={!editingIdentity}
                                            required
                                            className={`block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 pl-24 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 font-medium ${!editingIdentity ? 'bg-gray-50 text-gray-700' : ''}`}
                                        />
                                    </div>
                                    <InputError message={errors.phone} className="mt-2" />
                                    <p className="mt-1 text-xs text-gray-500">Format: <strong>07xxxxxxxx</strong> (starts with 072, 073, or 078). Country code <strong>+250</strong> is added automatically.</p>
                                </div>
                                <div>
                                    <InputLabel htmlFor="date_of_birth" value={t('profile.dob')} />
                                    <TextInput
                                        id="date_of_birth"
                                        type="date"
                                        name="date_of_birth"
                                        value={normalizeDate(data.date_of_birth)}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('date_of_birth', normalizeDate(e.target.value))}
                                        max={adultMaxISO}
                                        required
                                    />
                                    <InputError message={errors.date_of_birth} className="mt-2" />
                                </div>
                                <div>
                                    <InputLabel htmlFor="gender" value={t('profile.gender')} />
                                    <select
                                        id="gender"
                                        name="gender"
                                        value={data.gender}
                                        onChange={(e) => setData('gender', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        required
                                    >
                                        <option value="male">{t('profile.male')}</option>
                                        <option value="female">{t('profile.female')}</option>
                                        <option value="other">{t('profile.other')}</option>
                                    </select>
                                    <InputError message={errors.gender} className="mt-2" />
                                </div>
                            </div>
                        </section>
                        {/* Location */}
                        <section className="space-y-6">
                            <div className="card p-6">
                                <h3 className="mb-1 text-lg font-semibold text-gray-900">{t('profile.location_title')}</h3>
                                <p className="mb-4 text-sm text-gray-500">{t('profile.location_hint')}</p>
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div>
                                        <InputLabel htmlFor="province_id" value={t('profile.province')} />
                                        <select
                                            id="province_id"
                                            name="province_id"
                                            value={data.province_id}
                                            onChange={(e) => setData('province_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            required
                                        >
                                            <option value="">{provinces?.length ? 'Select province' : 'No options available'}</option>
                                            {provinces?.map((p) => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.province_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="district_id" value={t('profile.district')} />
                                        <select
                                            id="district_id"
                                            name="district_id"
                                            value={data.district_id}
                                            onChange={(e) => setData('district_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            required
                                            disabled={!districts.length}
                                        >
                                            <option value="">{districts.length ? 'Select district' : 'Select province first'}</option>
                                            {districts.map((d) => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.district_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="sector_id" value={t('profile.sector')} />
                                        <select
                                            id="sector_id"
                                            name="sector_id"
                                            value={data.sector_id}
                                            onChange={(e) => setData('sector_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            required
                                            disabled={!sectors.length}
                                        >
                                            <option value="">{sectors.length ? 'Select sector' : 'Select district first'}</option>
                                            {sectors.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.sector_id} className="mt-2" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="card p-6">
                                <h3 className="mb-1 text-lg font-semibold text-gray-900">{t('profile.personal_title')}</h3>
                                <p className="mb-4 text-sm text-gray-500">{t('profile.personal_hint')}</p>
                                <div className="grid gap-4 sm:grid-cols-4">
                                    <div>
                                        <InputLabel htmlFor="education_level" value={t('profile.education_level')} />
                                        <select
                                            id="education_level"
                                            name="education_level"
                                            value={data.education_level}
                                            onChange={(e) => setData('education_level', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            required
                                        >
                                            <option value="phd">PhD</option>
                                            <option value="masters">Masters</option>
                                            <option value="bachelor">Bachelor</option>
                                            <option value="secondary">Secondary</option>
                                            <option value="certificates">Certificates</option>
                                        </select>
                                        <InputError message={errors.education_level} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="department_id" value={t('profile.department')} />
                                        <select
                                            id="department_id"
                                            name="department_id"
                                            value={data.department_id}
                                            onChange={(e) => setData('department_id', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            required
                                            disabled={!departments?.length}
                                        >
                                            <option value="">{departments?.length ? 'Select department' : 'No options available'}</option>
                                            {departments?.map((d) => (
                                                <option key={d.id} value={d.id}>{d.name}</option>
                                            ))}
                                        </select>
                                        <InputError message={errors.department_id} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel htmlFor="graduation_date" value={t('profile.graduation_date')} />
                                        <TextInput
                                            id="graduation_date"
                                            type="date"
                                            name="graduation_date"
                                            value={normalizeDate(data.graduation_date)}
                                            className="mt-1 block w-full"
                                            onChange={(e) => setData('graduation_date', normalizeDate(e.target.value))}
                                            max={todayISO}
                                            required
                                        />
                                        <InputError message={errors.graduation_date} className="mt-2" />
                                    </div>
                                    <div>
                                        <InputLabel value={t('profile.experience_years')} />
                                        <input
                                            readOnly
                                            value={experienceYears === '' ? '' : `${experienceYears}`}
                                            className="mt-1 block w-full rounded-md border-gray-200 bg-gray-50 text-gray-700 shadow-sm focus:border-gray-300 focus:ring-0"
                                        />
                                    </div>
                                    <div className="sm:col-span-1">
                                        <InputLabel value={t('profile.languages')} />
                                        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                                            {['english','french','kinyarwanda','swahili'].map((lang) => (
                                                <label
                                                    key={lang}
                                                    className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 capitalize transition-colors ${langChecked(lang) ? 'bg-indigo-50 border-indigo-300 text-indigo-700' : 'bg-white border-gray-200 text-gray-700'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                        checked={langChecked(lang)}
                                                        onChange={() => toggleLang(lang)}
                                                    />
                                                    <span>{lang}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <InputError message={errors.languages} className="mt-2" />
                                    </div>
                                    <div className="sm:col-span-4">
                                        <InputLabel htmlFor="short_bio" value={t('profile.short_bio')} />
                                        <textarea
                                            id="short_bio"
                                            name="short_bio"
                                            value={data.short_bio}
                                            onChange={(e) => setData('short_bio', e.target.value)}
                                            className="mt-1 block w-full rounded-md border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                            rows={4}
                                            placeholder="Briefly describe yourself, skills, and goals"
                                            required
                                        />
                                        <InputError message={errors.short_bio} className="mt-2" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="card p-6">
                                <h3 className="mb-1 text-lg font-semibold text-gray-900">{t('profile.documents_title')}</h3>
                                <p className="mb-4 text-sm text-gray-500">{t('profile.documents_hint')}</p>
                                <div className="grid gap-4 sm:grid-cols-4">
                                    <div className="rounded-lg border border-gray-100 p-4">
                                        <InputLabel htmlFor="cv" value="CV (PDF/DOC/DOCX/JPG/PNG)" />
                                        <input
                                            id="cv"
                                            type="file"
                                            className="mt-1 block w-full text-sm"
                                            onChange={(e) => {
                                                const f = e.target.files[0] || null;
                                                setData('cv', f);
                                                if (!f) { setFileErrors((fe) => ({ ...fe, cv: 'File required' })); return; }
                                                if (!allowedTypes.includes(f.type)) { setFileErrors((fe) => ({ ...fe, cv: 'Invalid file type' })); return; }
                                                if (f.size > maxSize) { setFileErrors((fe) => ({ ...fe, cv: 'File too large (max 5MB)' })); return; }
                                                setFileErrors((fe) => ({ ...fe, cv: '' }));
                                            }}
                                            required
                                        />
                                        <InputError message={errors.cv || fileErrors.cv} className="mt-2" />
                                        {data.cv && (
                                            <p className="mt-1 text-xs text-gray-500">Selected: {data.cv.name} • {formatBytes(data.cv.size)}</p>
                                        )}
                                    </div>
                                    <div className="rounded-lg border border-gray-100 p-4">
                                        <InputLabel htmlFor="degree" value="Degree (PDF/DOC/DOCX/JPG/PNG)" />
                                        <input
                                            id="degree"
                                            type="file"
                                            className="mt-1 block w-full text-sm"
                                            onChange={(e) => {
                                                const f = e.target.files[0] || null;
                                                setData('degree', f);
                                                if (!f) { setFileErrors((fe) => ({ ...fe, degree: 'File required' })); return; }
                                                if (!allowedTypes.includes(f.type)) { setFileErrors((fe) => ({ ...fe, degree: 'Invalid file type' })); return; }
                                                if (f.size > maxSize) { setFileErrors((fe) => ({ ...fe, degree: 'File too large (max 5MB)' })); return; }
                                                setFileErrors((fe) => ({ ...fe, degree: '' }));
                                            }}
                                            required
                                        />
                                        <InputError message={errors.degree || fileErrors.degree} className="mt-2" />
                                        {data.degree && (
                                            <p className="mt-1 text-xs text-gray-500">Selected: {data.degree.name} • {formatBytes(data.degree.size)}</p>
                                        )}
                                    </div>
                                    <div className="rounded-lg border border-gray-100 p-4">
                                        <InputLabel htmlFor="identity_doc" value="Identity document (PDF/DOC/DOCX/JPG/PNG)" />
                                        <input
                                            id="identity_doc"
                                            type="file"
                                            className="mt-1 block w-full text-sm"
                                            onChange={(e) => {
                                                const f = e.target.files[0] || null;
                                                setData('identity_doc', f);
                                                if (!f) { setFileErrors((fe) => ({ ...fe, identity: 'File required' })); return; }
                                                if (!allowedTypes.includes(f.type)) { setFileErrors((fe) => ({ ...fe, identity: 'Invalid file type' })); return; }
                                                if (f.size > maxSize) { setFileErrors((fe) => ({ ...fe, identity: 'File too large (max 5MB)' })); return; }
                                                setFileErrors((fe) => ({ ...fe, identity: '' }));
                                            }}
                                            required
                                        />
                                        <InputError message={errors.identity_doc || fileErrors.identity} className="mt-2" />
                                        {data.identity_doc && (
                                            <p className="mt-1 text-xs text-gray-500">Selected: {data.identity_doc.name} • {formatBytes(data.identity_doc.size)}</p>
                                        )}
                                    </div>
                                    <div className="sm:col-span-2 rounded-lg border border-gray-100 p-4">
                                        <InputLabel htmlFor="certificates" value="Certificates (optional, multiple)" />
                                        <input
                                            id="certificates"
                                            type="file"
                                            multiple
                                            className="mt-1 block w-full text-sm"
                                            onChange={(e) => {
                                                const arr = Array.from(e.target.files || []);
                                                const err = arr.find((f) => !allowedTypes.includes(f.type)) ? 'One or more files have invalid types' :
                                                    arr.find((f) => f.size > maxSize) ? 'One or more files exceed 5MB' : '';
                                                setFileErrors((fe) => ({ ...fe, certificates: err }));
                                                setData('certificates', arr);
                                            }}
                                        />
                                        <InputError message={errors.certificates || fileErrors.certificates} className="mt-2" />
                                        {data.certificates?.length > 0 && (
                                            <ul className="mt-1 list-disc pl-4 text-xs text-gray-500">
                                                {data.certificates.map((f, i) => (
                                                    <li key={i}>{f.name} • {formatBytes(f.size)}</li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <div className="sticky bottom-0 z-10 mt-4 -mx-4 border-t bg-white/80 px-4 py-3 backdrop-blur sm:mx-0 sm:rounded-b-xl">
                            <div className="flex items-center justify-end">
                                <PrimaryButton className="rounded-md bg-green-500 hover:bg-green-600 focus:bg-green-600" disabled={processing}>
                                    {processing ? 'Saving…' : t('profile.save')}
                                </PrimaryButton>
                            </div>
                            {!canSubmit && (
                                <div className="mt-2 text-xs text-gray-600">
                                    <span className="font-medium">Missing or invalid:</span>
                                    <ul className="mt-1 list-disc pl-5">
                                        {missing.slice(0,6).map((m, i) => (
                                            <li key={i}>{m}</li>
                                        ))}
                                        {missing.length > 6 && (
                                            <li>+{missing.length - 6} more…</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                        </div>

                        {progress && (
                            <div className="h-2 w-full overflow-hidden rounded bg-gray-100">
                                <div className="h-2 bg-emerald-600" style={{ width: `${progress.percentage}%` }} />
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
