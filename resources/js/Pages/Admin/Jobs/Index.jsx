import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function JobsIndex() {
  const { jobs, filters } = usePage().props;
  const [q, setQ] = useState(filters?.q || '');
  const [per, setPer] = useState(filters?.per_page || 10);
  useEffect(() => {
    const id = setTimeout(() => {
      router.get(route('admin.jobs.index'), { q: q || undefined, per_page: per }, { preserveState: true, replace: true, preserveScroll: true });
    }, 300);
    return () => clearTimeout(id);
  }, [q, per]);

  return (
    <AdminLayout title="Jobs">
      <Head title="Jobs" />
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="text-xl font-semibold text-gray-900">Jobs</div>
        <Link href={route('admin.jobs.create')} className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">New Job</Link>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search..." className="w-64 rounded-md border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 text-sm shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60" />
        <select value={per} onChange={(e)=>setPer(Number(e.target.value))} className="rounded-md border-gray-300 bg-white text-gray-900 text-sm shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
          {[10,25,50].map(n => <option key={n} value={n}>{n}/page</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-700">
              <th className="py-2 px-4 w-16">No.</th>
              <th className="py-2 px-4">Title</th>
              <th className="py-2 px-4">Company</th>
              <th className="py-2 px-4">Department</th>
              <th className="py-2 px-4">Category</th>
              <th className="py-2 px-4">Deadline</th>
              <th className="py-2 px-4">Location</th>
              <th className="py-2 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-900">
            {jobs?.data?.map((j, idx) => {
              const page = Number(jobs?.current_page || 1);
              const perPage = Number(jobs?.per_page || 10);
              const no = (page - 1) * perPage + idx + 1;
              const location = [j.province, j.district, j.sector].filter(Boolean).join(', ');
              return (
                <tr key={j.id} className="hover:bg-gray-50/80">
                  <td className="py-2 px-4 text-gray-600">{no}</td>
                  <td className="py-2 px-4 font-medium">{j.title}</td>
                  <td className="py-2 px-4">{j.company}</td>
                  <td className="py-2 px-4">{j.department}</td>
                  <td className="py-2 px-4 capitalize">{j.category?.replace('_',' ')}</td>
                  <td className="py-2 px-4 whitespace-nowrap">{j.deadline}</td>
                  <td className="py-2 px-4">{location || '—'}</td>
                  <td className="py-2 px-4 text-right space-x-3">
                    <Link href={route('admin.jobs.edit', { job: j.id })} className="text-emerald-600 hover:underline">Edit</Link>
                    <button
                      onClick={() => {
                        if (confirm('Delete this job?')) {
                          router.delete(route('admin.jobs.destroy', { job: j.id }), { preserveScroll: true });
                        }
                      }}
                      className="text-red-600 hover:underline"
                    >Delete</button>
                  </td>
                </tr>
              );
            })}
            {(!jobs?.data || jobs?.data.length === 0) && (
              <tr><td colSpan="6" className="py-6 px-4 text-center text-gray-500">No jobs</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {jobs?.links && (
        <div className="mt-4 flex items-center justify-end gap-2">
          {jobs.links.map((l, i) => (
            <Link key={i} href={l.url || '#'} className={`rounded-md px-3 py-1.5 text-sm ${l.active ? 'bg-emerald-600 text-white' : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'}`} dangerouslySetInnerHTML={{ __html: l.label }} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
