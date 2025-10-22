import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function ApplicationsIndex() {
  const [query, setQuery] = useState('');
  const [perPage, setPerPage] = useState(25);
  const [data, setData] = useState({ data: [], total: 0, links: [], current_page: 1, per_page: 25 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const controllerRef = useRef(null);
  const seqRef = useRef(0);
  const [sort, setSort] = useState('id');
  const [dir, setDir] = useState('desc');
  const [savingId, setSavingId] = useState(null);
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

  const fetchRows = async (url) => {
    const endpoint = url || route('admin.api.applications', { q: query || undefined, per_page: perPage, sort: sort || undefined, dir: dir || undefined });
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
        setData(json);
      }
    } catch (e) {
      if (e?.name === 'AbortError') return;
      setError(e?.message || 'Failed to load applications');
    } finally {
      if (seqRef.current === 0 || controllerRef.current === null) return;
      if (controllerRef.current && controllerRef.current.signal && controllerRef.current.signal.aborted) {
        // a newer request already started and aborted this one
      } else {
        setLoading(false);
        controllerRef.current = null;
      }
    }
  };

  const updateStatus = async (id, status) => {
    try {
      setSavingId(id);
      const res = await fetch(route('admin.applications.status', id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(csrfToken ? { 'X-CSRF-TOKEN': csrfToken } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error(`Failed (${res.status})`);
      // Refresh current page
      await fetchRows();
    } catch (e) {
      setError(e?.message || 'Failed to update status');
    } finally {
      setSavingId(null);
    }
  };

  useEffect(() => { fetchRows(); }, []);
  useEffect(() => { const id = setTimeout(() => fetchRows(), 350); return () => clearTimeout(id); }, [query, perPage, sort, dir]);

  const toggleSort = (column) => {
    if (sort === column) {
      setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(column);
      setDir('asc');
    }
  };

  return (
    <AdminLayout title="Applications">
      <Head title="Applications" />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <label className="text-gray-600">Show</label>
            <select value={perPage} onChange={(e)=> setPerPage(Number(e.target.value))} className="rounded-md border-gray-300 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
              {[10,25,50,100,500].map(n => (<option key={n} value={n}>{n}</option>))}
            </select>
            <span className="text-gray-600">entries</span>
          </div>
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
            Total: {data?.total || 0}
          </span>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search user, email, job, company" className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60 sm:w-72" />
          <button onClick={()=>{ setQuery(''); }} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Clear</button>
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

      <div className="hidden overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm sm:block">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-[1] bg-gray-50/95 backdrop-blur">
            <tr className="text-left text-gray-700">
              <th className="py-2 px-4">No</th>
              <th className="py-2 px-4">
                <button type="button" onClick={() => toggleSort('created_at')} className="inline-flex items-center gap-1 hover:underline">
                  Date
                  {sort==='created_at' && (<span className="text-xs">{dir==='asc' ? '▲' : '▼'}</span>)}
                </button>
              </th>
              <th className="py-2 px-4">
                <button type="button" onClick={() => toggleSort('user')} className="inline-flex items-center gap-1 hover:underline">
                  User
                  {sort==='user' && (<span className="text-xs">{dir==='asc' ? '▲' : '▼'}</span>)}
                </button>
              </th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">
                <button type="button" onClick={() => toggleSort('job')} className="inline-flex items-center gap-1 hover:underline">
                  Job
                  {sort==='job' && (<span className="text-xs">{dir==='asc' ? '▲' : '▼'}</span>)}
                </button>
              </th>
              <th className="py-2 px-4">
                <button type="button" onClick={() => toggleSort('company')} className="inline-flex items-center gap-1 hover:underline">
                  Company
                  {sort==='company' && (<span className="text-xs">{dir==='asc' ? '▲' : '▼'}</span>)}
                </button>
              </th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Motivation</th>
              <th className="hidden lg:table-cell py-2 px-4">Documents</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.data?.length === 0 && (
              <tr><td colSpan="7" className="py-8 px-4 text-center text-gray-500">No applications</td></tr>
            )}
            {data?.data?.map((r, idx) => (
              <tr key={r.id} className={`hover:bg-emerald-50/40 ${idx % 2 ? 'bg-gray-50/40' : ''}`}>
                <td className="py-2 px-4 text-gray-900">{(((data?.current_page || 1) - 1) * (data?.per_page || perPage)) + idx + 1}</td>
                <td className="whitespace-nowrap py-2 px-4 text-gray-900">{new Date(r.created_at).toLocaleString()}</td>
                <td className="py-2 px-4 text-gray-900">
                  <a href={route('admin.users.index', { q: r.user_email })} className="text-emerald-700 hover:underline">{r.user_name || '—'}</a>
                </td>
                <td className="whitespace-nowrap py-2 px-4 text-gray-900">{r.user_email}</td>
                <td className="py-2 px-4 text-gray-900">
                  <a href={route('jobs.show', r.job_id)} className="text-emerald-700 hover:underline" target="_blank" rel="noreferrer">{r.job_title}</a>
                </td>
                <td className="py-2 px-4 text-gray-900">{r.company_title || '—'}</td>
                <td className="py-2 px-4 text-gray-900">
                  <select
                    value={r.status}
                    onChange={(e) => updateStatus(r.id, e.target.value)}
                    disabled={savingId === r.id}
                    className="rounded-md border-gray-300 text-sm shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60"
                  >
                    {['pending','selected','approved','rejected'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="py-2 px-4 text-gray-700 max-w-md">
                  <div title={r.motivation || ''} className="line-clamp-2">{r.motivation || '—'}</div>
                </td>
                <td className="hidden lg:table-cell py-2 px-4 text-xs text-sky-700">
                  <div className="flex flex-col gap-1">
                    {r.cv_path && (
                      <a href={'/storage/' + r.cv_path} target="_blank" rel="noreferrer" className="hover:underline">CV</a>
                    )}
                    {r.degree_path && (
                      <a href={'/storage/' + r.degree_path} target="_blank" rel="noreferrer" className="hover:underline">Degree</a>
                    )}
                    {(() => {
                      try {
                        const arr = Array.isArray(r.certificates_paths) ? r.certificates_paths : (r.certificates_paths ? JSON.parse(r.certificates_paths) : []);
                        return (arr || []).slice(0,3).map((p, i) => (
                          <a key={i} href={'/storage/' + p} target="_blank" rel="noreferrer" className="hover:underline">Cert {i+1}</a>
                        ));
                      } catch { return null; }
                    })()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.links && (
        <div className="mt-4 flex items-center justify-end gap-2">
          {data.links.filter(l=>l.url).map((l, idx) => (
            <button key={idx} onClick={() => {
              const target = new URL(l.url, window.location.origin);
              target.searchParams.set('per_page', String(perPage));
              if (sort) target.searchParams.set('sort', sort);
              if (dir) target.searchParams.set('dir', dir);
              fetchRows(target.toString());
            }} className={`rounded border px-2 py-1 text-xs ${l.active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}>{l.label.replace('&laquo;','«').replace('&raquo;','»')}</button>
          ))}
        </div>
      )}
      <div className="mt-2 text-right text-xs text-gray-500">Showing {data?.data?.length ? (((data.current_page-1)*(data.per_page))+1) : 0}–{(((data?.current_page||1)-1)*(data?.per_page||perPage)) + (data?.data?.length||0)} of {data?.total || 0}</div>
    </AdminLayout>
  );
}
