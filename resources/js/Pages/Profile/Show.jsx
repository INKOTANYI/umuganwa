import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

export default function Show({ profile }) {
  const p = profile || {};
  const lang = Array.isArray(p.languages) ? p.languages : (p.languages ? [p.languages] : []);

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">My Profile</h2>}
    >
      <Head title="My Profile" />
      <div className="py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Identity</h3>
              <Link href={route('profile.edit')} className="text-sm font-medium text-indigo-600 hover:underline">Edit account</Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">First name</p>
                <p className="font-medium text-gray-900">{p.first_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Last name</p>
                <p className="font-medium text-gray-900">{p.last_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-gray-900">{p.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone</p>
                <p className="font-medium text-gray-900">{p.phone}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">About</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">Gender</p>
                <p className="font-medium text-gray-900 capitalize">{p.gender}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date of birth</p>
                <p className="font-medium text-gray-900">{p.date_of_birth}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500">Short bio</p>
                <p className="font-medium text-gray-900 whitespace-pre-line">{p.short_bio}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Education level</p>
                <p className="font-medium text-gray-900 capitalize">{p.education_level}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Languages</p>
                <p className="font-medium text-gray-900">{lang.join(', ')}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Location</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm text-gray-500">Province</p>
                <p className="font-medium text-gray-900">{p.province?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">District</p>
                <p className="font-medium text-gray-900">{p.district?.name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Sector</p>
                <p className="font-medium text-gray-900">{p.sector?.name}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
              <Link href={route('profile.complete.show')} className="text-sm font-medium text-indigo-600 hover:underline">Update documents</Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-gray-500">CV</p>
                {p.cv_path ? (
                  <a className="text-indigo-600 hover:underline" href={"/storage/" + p.cv_path} target="_blank" rel="noreferrer">Download CV</a>
                ) : (
                  <p className="text-gray-500">—</p>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500">Degree</p>
                {p.degree_path ? (
                  <a className="text-indigo-600 hover:underline" href={"/storage/" + p.degree_path} target="_blank" rel="noreferrer">Download Degree</a>
                ) : (
                  <p className="text-gray-500">—</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <p className="text-sm text-gray-500">Certificates</p>
                {Array.isArray(p.certificates_paths) && p.certificates_paths.length > 0 ? (
                  <ul className="list-disc pl-5 text-sm">
                    {p.certificates_paths.map((c, i) => (
                      <li key={i}><a className="text-indigo-600 hover:underline" href={"/storage/" + c} target="_blank" rel="noreferrer">Certificate {i + 1}</a></li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">—</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
