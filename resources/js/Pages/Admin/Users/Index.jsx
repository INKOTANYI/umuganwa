import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function UsersIndex() {
  const [query, setQuery] = useState('');
  const [perPage, setPerPage] = useState(25);
  const [data, setData] = useState({ data: [], total: 0, links: [], current_page: 1, per_page: 25 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const controllerRef = useRef(null);
  const seqRef = useRef(0);
  const [sort, setSort] = useState('id');
  const [dir, setDir] = useState('desc');

  const fetchUsers = async (url) => {
    const endpoint = url || route('admin.api.users', { q: query || undefined, per_page: perPage, sort: sort || undefined, dir: dir || undefined });
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
      if (e?.name === 'AbortError') {
        return; // ignore aborted requests quietly
      }
      setError(e?.message || 'Failed to load users');
    } finally {
      // Only clear loading/controller if this is the latest request
      if (seqRef.current === 0 || controllerRef.current === null) return;
      if (controllerRef.current && controllerRef.current.signal && controllerRef.current.signal.aborted) {
        // a newer request already started and aborted this one; don't flip loading here
      } else {
        setLoading(false);
        controllerRef.current = null;
      }
    }
  };

  useEffect(() => { fetchUsers(); }, []);
  useEffect(() => { const id = setTimeout(() => fetchUsers(), 350); return () => clearTimeout(id); }, [query, perPage, sort, dir]);

  const toggleSort = (column) => {
    if (sort === column) {
      setDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSort(column);
      setDir('asc');
    }
  };

  return (
    <AdminLayout title="Users">
      <Head title="Users" />

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
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search first, last, email, phone, province, district, sector" className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60 sm:w-72" />
          <button onClick={()=>{ setQuery(''); }} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Clear</button>
          <a href={route('admin.api.users.export', { q: query || undefined })} className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">Export CSV</a>
          <div className="ml-1 inline-flex overflow-hidden rounded-md border border-gray-200">
            <button onClick={()=>setViewMode('table')} className={`px-2 py-2 text-xs ${viewMode==='table' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Table</button>
            <button onClick={()=>setViewMode('grid')} className={`px-2 py-2 text-xs ${viewMode==='grid' ? 'bg-gray-100 text-gray-900' : 'bg-white text-gray-700 hover:bg-gray-50'}`}>Cards</button>
          </div>
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

      <div className={`grid grid-cols-1 gap-3 ${viewMode==='grid' ? '' : 'sm:hidden'}`}>
        {(!data?.data || data.data.length === 0) && !loading && (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm">
            <div className="mx-auto mb-2 h-10 w-10 rounded-full bg-emerald-100 text-emerald-600">🙂</div>
            <div className="text-sm font-medium text-gray-900">No users found</div>
            <div className="text-xs text-gray-500">Try clearing the search or changing filters</div>
            <div className="mt-3">
              <button onClick={()=>setQuery('')} className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50">Clear search</button>
            </div>
          </div>
        )}
        {data?.data?.map((u, idx) => (
          <div key={u.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                  {(u.first_name?.[0] || '').toUpperCase()}{(u.last_name?.[0] || '').toUpperCase()}
                </div>
                <div className="text-sm font-semibold text-gray-900">{u.first_name} {u.last_name}</div>
              </div>
              <span className="text-xs text-gray-500">#{(((data?.current_page || 1) - 1) * (data?.per_page || perPage)) + idx + 1}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Phone</div><div className="text-gray-900">{u.phone}</div>
              <div className="text-gray-600">Email</div><div className="text-gray-900 break-all">{u.email}</div>
              <div className="text-gray-600">Education</div><div className="text-gray-900">{u.education_level || '-'}</div>
              <div className="text-gray-600">Exp</div><div className="text-gray-900">{u.experience_years ?? '-'}</div>
              <div className="text-gray-600">Gender</div><div className="text-gray-900">{u.gender || '-'}</div>
              <div className="text-gray-600">Location</div><div className="text-gray-900">{[u.province,u.district,u.sector].filter(Boolean).join(', ') || '-'}</div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {u.cv_path && (<a href={'/storage/' + u.cv_path} target="_blank" rel="noreferrer" className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100">CV</a>)}
              {u.degree_path && (<a href={'/storage/' + u.degree_path} target="_blank" rel="noreferrer" className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100">Degree</a>)}
              {(() => { try { const arr = Array.isArray(u.certificates_paths) ? u.certificates_paths : (u.certificates_paths ? JSON.parse(u.certificates_paths) : []); return (arr || []).slice(0,3).map((p, i) => (<a key={i} href={'/storage/' + p} target="_blank" rel="noreferrer" className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700 hover:bg-sky-100">Cert {i+1}</a>)); } catch { return null; } })()}
            </div>
          </div>
        ))}
      </div>

      <div className={`${viewMode==='grid' ? 'hidden' : ''} hidden overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm sm:block`}>        
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-[1] bg-gray-50/95 backdrop-blur">
            <tr className="text-left text-gray-700">
              <th className="py-2 px-4">No</th>
              <th className="py-2 px-4">
                <button type="button" onClick={() => toggleSort('first_name')} className="inline-flex items-center gap-1 hover:underline">
                  First
                  {sort==='first_name' && (<span className="text-xs">{dir==='asc' ? '▲' : '▼'}</span>)}
                </button>
              </th>
              <th className="py-2 px-4">
                <button type="button" onClick={() => toggleSort('last_name')} className="inline-flex items-center gap-1 hover:underline">
                  Last
                  {sort==='last_name' && (<span className="text-xs">{dir==='asc' ? '▲' : '▼'}</span>)}
                </button>
              </th>
              <th className="py-2 px-4">Phone</th>
              <th className="py-2 px-4">
                <button type="button" onClick={() => toggleSort('email')} className="inline-flex items-center gap-1 hover:underline">
                  Email
                  {sort==='email' && (<span className="text-xs">{dir==='asc' ? '▲' : '▼'}</span>)}
                </button>
              </th>
              <th className="hidden sm:table-cell py-2 px-4">Education</th>
              <th className="hidden sm:table-cell py-2 px-4">Exp</th>
              <th className="hidden md:table-cell py-2 px-4">Gender</th>
              <th className="hidden lg:table-cell py-2 px-4">Attachments</th>
              <th className="hidden md:table-cell py-2 px-4">Province</th>
              <th className="hidden md:table-cell py-2 px-4">District</th>
              <th className="hidden md:table-cell py-2 px-4">Sector</th>
              
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.data?.length === 0 && (
              <tr><td colSpan="12" className="py-8 px-4 text-center text-gray-500">No users</td></tr>
            )}
            {data?.data?.map((u, idx) => (
              <tr key={u.id} className={`hover:bg-emerald-50/40 ${idx % 2 ? 'bg-gray-50/40' : ''}`}>
                <td className="py-2 px-4 text-gray-900">{(((data?.current_page || 1) - 1) * (data?.per_page || perPage)) + idx + 1}</td>
                <td className="py-2 px-4 text-gray-900">{u.first_name}</td>
                <td className="py-2 px-4 text-gray-900">{u.last_name}</td>
                <td className="whitespace-nowrap py-2 px-4 text-gray-900">{u.phone}</td>
                <td className="whitespace-nowrap py-2 px-4 text-gray-900">{u.email}</td>
                <td className="hidden sm:table-cell py-2 px-4 text-gray-700">{u.education_level || '-'}</td>
                <td className="hidden sm:table-cell py-2 px-4 text-gray-700">{u.experience_years ?? '-'}</td>
                <td className="hidden md:table-cell py-2 px-4 text-gray-700">{u.gender || '-'}</td>
                <td className="hidden lg:table-cell py-2 px-4 text-xs text-sky-700">
                  <div className="flex flex-col gap-1">
                    {u.cv_path && (<a href={'/storage/' + u.cv_path} target="_blank" rel="noreferrer" className="hover:underline">CV</a>)}
                    {u.degree_path && (<a href={'/storage/' + u.degree_path} target="_blank" rel="noreferrer" className="hover:underline">Degree</a>)}
                    {(() => { try { const arr = Array.isArray(u.certificates_paths) ? u.certificates_paths : (u.certificates_paths ? JSON.parse(u.certificates_paths) : []); return (arr || []).slice(0,3).map((p, i) => (<a key={i} href={'/storage/' + p} target="_blank" rel="noreferrer" className="hover:underline">Cert {i+1}</a>)); } catch { return null; } })()}
                  </div>
                </td>
                <td className="hidden md:table-cell py-2 px-4 text-gray-700">{u.province || '-'}</td>
                <td className="hidden md:table-cell py-2 px-4 text-gray-700">{u.district || '-'}</td>
                <td className="hidden md:table-cell py-2 px-4 text-gray-700">{u.sector || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.links && (
        <div className="mt-4 flex items-center justify-end gap-2">
          {data.links.filter(l=>l.url).map((l, idx) => (
            <button key={idx} onClick={()=>{
              const target = new URL(l.url, window.location.origin);
              target.searchParams.set('per_page', String(perPage));
              if (sort) target.searchParams.set('sort', sort);
              if (dir) target.searchParams.set('dir', dir);
              fetchUsers(target.toString());
            }} className={`rounded border px-2 py-1 text-xs ${l.active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}>{l.label.replace('&laquo;','«').replace('&raquo;','»')}</button>
          ))}
        </div>
      )}
      <div className="mt-2 text-right text-xs text-gray-500">Showing {data?.data?.length ? (((data.current_page-1)*(data.per_page))+1) : 0}–{(((data?.current_page||1)-1)*(data?.per_page||perPage)) + (data?.data?.length||0)} of {data?.total || 0}</div>
    </AdminLayout>
  );
}

