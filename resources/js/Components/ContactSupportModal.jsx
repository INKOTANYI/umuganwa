import { useEffect, useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import { useI18n } from '@/i18n/Translator.jsx';

export default function ContactSupportModal({ open, onClose }) {
  const { props } = usePage();
  const user = props?.auth?.user || {};
  const prefillPhone = props?.candidateProfile?.phone || props?.profile?.phone || '';
  const { t } = useI18n();

  const { data, setData, post, processing, reset, errors, clearErrors, transform } = useForm({
    name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
    email: user.email || '',
    phone: prefillPhone || '',
    subject: '',
    message: '',
    attachments: [],
  });

  useEffect(() => {
    if (!open) {
      reset();
      clearErrors();
    }
  }, [open]);

  const submit = (e) => {
    e.preventDefault();
    transform((d) => d);
    post(route('support.ticket'), {
      forceFormData: true,
      onSuccess: () => {
        onClose?.();
      },
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-neutral-900">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('dashboard.support.title')}</h3>
          <button className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800" onClick={onClose} aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5"><path d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.support.full_name')}</label>
              <input type="hidden" name="name" value={data.name} />
              <div className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-semibold text-gray-900 shadow-sm dark:border-neutral-800 dark:bg-neutral-800 dark:text-gray-100">
                {data.name || '-'}
              </div>
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.support.email')}</label>
              <input type="hidden" name="email" value={data.email} />
              <div className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-semibold text-gray-900 shadow-sm dark:border-neutral-800 dark:bg-neutral-800 dark:text-gray-100">
                {data.email || '-'}
              </div>
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.support.phone')}</label>
              <input type="hidden" name="phone" value={data.phone} />
              <div className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 font-semibold text-gray-900 shadow-sm dark:border-neutral-800 dark:bg-neutral-800 dark:text-gray-100">
                {data.phone || '-'}
              </div>
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.support.subject_optional')}</label>
            <input
              id="subject"
              name="subject"
              value={data.subject}
              onChange={(e)=>setData('subject', e.target.value)}
              placeholder={t('dashboard.support.subject_placeholder') || 'What is this about?'}
              maxLength={120}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
            />
            <div className="mt-1 flex justify-between text-xs text-gray-500">
              <span>{errors.subject && <span className="text-red-600">{errors.subject}</span>}</span>
              <span>{(data.subject?.length||0)}/120</span>
            </div>
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.support.describe')}</label>
            <textarea
              id="message"
              name="message"
              rows={5}
              value={data.message}
              onChange={(e)=>setData('message', e.target.value)}
              placeholder={t('dashboard.support.describe_placeholder') || 'Please include steps, expected behavior, and any error messages.'}
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200 focus:ring-opacity-50"
              required
            />
            {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message}</p>}
          </div>

          <div>
            <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('dashboard.support.attachments_optional')}</label>
            <input
              id="attachments"
              name="attachments"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 file:mr-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-50"
              onChange={(e)=>setData('attachments', Array.from(e.target.files || []))}
            />
            {data.attachments?.length > 0 && (
              <ul className="mt-2 list-disc pl-5 text-xs text-gray-600">
                {data.attachments.map((f, i) => (
                  <li key={i}>{f.name} • {(f.size/1024).toFixed(1)} KB</li>
                ))}
              </ul>
            )}
            {errors.attachments && <p className="mt-1 text-xs text-red-600">{errors.attachments}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800">{t('dashboard.support.cancel')}</button>
            <button type="submit" disabled={processing} className="btn-primary disabled:opacity-60">{processing ? 'Sending…' : t('dashboard.support.send')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
