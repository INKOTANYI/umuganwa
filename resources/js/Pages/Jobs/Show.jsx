import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';

export default function JobShow() {
  const { job, company, location, qualification } = usePage().props;
  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">{job.title}</h2>}>
      <Head title={job.title} />
      <div className="py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm text-gray-600">{company?.title}</div>
                <div className="text-base text-gray-500">{[location?.province, location?.district, location?.sector].filter(Boolean).join(', ')}</div>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">Deadline: {job.deadline}</span>
            </div>
            <div className="prose mt-4 max-w-none" dangerouslySetInnerHTML={{ __html: job.description }} />

            {(job.education_level || job.experience_years || qualification) && (
              <div className="mt-6 rounded-lg border border-gray-100 p-4">
                <div className="text-sm font-semibold text-gray-900">Job qualifications</div>
                <dl className="mt-2 grid gap-3 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-500">Department</dt>
                    <dd className="text-sm text-gray-800">{qualification || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-500">Education level</dt>
                    <dd className="text-sm text-gray-800">{job.education_level || 'Not specified'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs uppercase tracking-wide text-gray-500">Experience</dt>
                    <dd className="text-sm text-gray-800">{typeof job.experience_years === 'number' ? `${job.experience_years} year${job.experience_years === 1 ? '' : 's'}` : (job.experience_years || 'Not specified')}</dd>
                  </div>
                </dl>
              </div>
            )}
          </div>
          <div className="mt-4 text-right">
            <Link href={route('jobs.index')} className="text-emerald-600 hover:underline">Back to Jobs</Link>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
