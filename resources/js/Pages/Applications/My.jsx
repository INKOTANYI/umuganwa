import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function MyApplications() {
  const [rows, setRows] = useState({ data: [], links: [], total: 0, current_page: 1, per_page: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [perPage, setPerPage] = useState(10);
  const seqRef = useRef(0);
  const controllerRef = useRef(null);

  const fetchRows = async (url) => {
    const endpoint = url || route('api.my.applications', { q: q || undefined, per_page: perPage });
    try {
      const mySeq = ++seqRef.current;
      setError('');
      setLoading(true);
      if (controllerRef.current) {
        try { controllerRef.current.abort(); } catch {}
      }
      const controller = new AbortController();
      controllerRef.current = controller;
      const res = await fetch(endpoint, { signal: controller.signal });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      if (mySeq === seqRef.current) {
        setRows(json);
      }
    } catch (e) {
      if (e?.name !== 'AbortError') setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
      controllerRef.current = null;
    }
  };

  useEffect(() => { fetchRows(); }, []);
  useEffect(() => { const id = setTimeout(() => fetchRows(), 350); return () => clearTimeout(id); }, [q, perPage]);

  const StatusBadge = ({ status }) => {
    const s = String(status || '').toLowerCase();
    const map = {
      pending: 'bg-gray-100 text-gray-700',
      selected: 'bg-sky-100 text-sky-700',
      approved: 'bg-emerald-100 text-emerald-700',
      rejected: 'bg-rose-100 text-rose-700',
    };
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${map[s] || 'bg-gray-100 text-gray-700'}`}>{s || 'pending'}</span>;
  };

  const goto = (l) => {
    const target = new URL(l.url, window.location.origin);
    target.searchParams.set('per_page', String(perPage));
    fetchRows(target.toString());
  };

  return (
    <AuthenticatedLayout
      header={<h2 className="text-xl font-semibold leading-tight text-gray-800">My Applications</h2>}
    >
      <Head title="My Applications" />
      <div className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <label className="text-gray-600">Show</label>
              <select value={perPage} onChange={(e)=> setPerPage(Number(e.target.value))} className="h-10 rounded-md border-gray-300 bg-white px-2 text-sm shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
                {[10,25,50].map(n => (<option key={n} value={n}>{n}</option>))}
              </select>
              <span className="text-gray-600">entries</span>
            </div>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <input value={q} onChange={(e)=> setQ(e.target.value)} placeholder="Search by job or company" className="h-10 w-full rounded-md border-gray-300 bg-white px-3 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60 sm:w-80" />
              <button onClick={()=> setQ('')} className="h-10 rounded-md border border-gray-200 bg-white px-4 text-sm text-gray-700 hover:bg-gray-50">Clear</button>
            </div>
          </div>

          {error && (
            <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
          )}

          {loading && (
            <div className="mb-3 rounded-md border border-gray-100 bg-white p-4 shadow-sm">
              <div className="h-2 w-full overflow-hidden rounded bg-gray-100">
                <div className="h-2 w-1/3 animate-pulse rounded bg-emerald-500" />
              </div>
            </div>
          )}

          <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm sm:block">
            <table className="min-w-full text-base">
              <thead className="sticky top-0 z-[1] bg-gray-50/95 backdrop-blur">
                <tr className="text-left text-gray-800">
                  <th className="py-3 px-5">No</th>
                  <th className="py-3 px-5">Date</th>
                  <th className="py-3 px-5">Job</th>
                  <th className="py-3 px-5">Company</th>
                  <th className="py-3 px-5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows?.data?.length === 0 && (
                  <tr><td colSpan="5" className="py-10 px-6 text-center text-gray-500">No applications</td></tr>
                )}
                {rows?.data?.map((r, idx) => (
                  <tr key={r.id} className={`hover:bg-emerald-50/40 ${idx % 2 ? 'bg-gray-50/40' : ''}`}>
                    <td className="py-3 px-5 text-gray-900">{(((rows?.current_page || 1) - 1) * (rows?.per_page || 10)) + idx + 1}</td>
                    <td className="whitespace-nowrap py-3 px-5 text-gray-900">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="py-3 px-5 text-gray-900">
                      <a href={route('jobs.show', r.job_id)} className="text-emerald-700 hover:underline" target="_blank" rel="noreferrer">{r.job_title}</a>
                    </td>
                    <td className="py-3 px-5 text-gray-900">{r.company_title || '—'}</td>
                    <td className="py-3 px-5 text-gray-900"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {rows?.links && rows.links.length > 0 && (
            <div className="mt-4 flex items-center justify-end gap-2">
              {rows.links.filter(l=>l.url).map((l, idx) => (
                <button key={idx} onClick={() => goto(l)} className={`rounded border px-2 py-1 text-xs ${l.active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}>{l.label.replace('&laquo;','«').replace('&raquo;','»')}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
