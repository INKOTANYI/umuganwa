import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';

export default function Index() {
  const { companies } = usePage().props;
  return (
    <AdminLayout title="Companies">
      <Head title="Companies" />
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Companies</h1>
        <Link href={route('admin.companies.create')} className="btn-primary">New Company</Link>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-700">
              <th className="py-2 px-4">ID</th>
              <th className="py-2 px-4">Title</th>
              <th className="py-2 px-4">Description</th>
              <th className="py-2 px-4">Department</th>
              <th className="py-2 px-4">Logo</th>
              <th className="py-2 px-4">Location</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {companies?.data?.length === 0 && (
              <tr><td colSpan="7" className="py-6 px-4 text-center text-gray-500">No companies</td></tr>
            )}
            {companies?.data?.map((c, idx) => (
              <tr key={c.id} className={idx % 2 ? 'bg-gray-50/60' : ''}>
                <td className="py-2 px-4 text-gray-900">{c.id}</td>
                <td className="py-2 px-4 text-gray-900">{c.title}</td>
                <td className="py-2 px-4 max-w-[320px] truncate text-gray-700" title={c.description || ''}>{c.description}</td>
                <td className="py-2 px-4 text-gray-700">{c.department}</td>
                <td className="py-2 px-4">
                  {c.logo_url ? (
                    <img src={c.logo_url} alt={`${c.title} logo`} className="h-8 w-8 rounded object-cover ring-1 ring-gray-200" />
                  ) : <span className="text-xs text-gray-400">—</span>}
                </td>
                <td className="py-2 px-4 text-xs text-gray-700">P:{c.location.province_id} D:{c.location.district_id} S:{c.location.sector_id}</td>
                <td className="py-2 px-4">
                  <Link href={route('admin.companies.edit', c.id)} className="mr-2 rounded border border-gray-200 px-2 py-1 text-xs text-gray-700 hover:bg-gray-50">Edit</Link>
                  <button onClick={() => {
                    if (confirm('Delete this company?')) router.delete(route('admin.companies.destroy', c.id));
                  }} className="rounded border border-red-200 px-2 py-1 text-xs text-red-700 hover:bg-red-50">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {companies?.links && (
        <div className="mt-4 flex items-center justify-end gap-2">
          {companies.links.filter(l=>l.url).map((l, idx) => (
            <Link key={idx} href={l.url} preserveScroll className={`rounded border px-2 py-1 text-xs ${l.active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}>{l.label.replace('&laquo;','«').replace('&raquo;','»')}</Link>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
