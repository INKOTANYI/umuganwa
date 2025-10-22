import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

export default function SupportIndex() {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('all');
  const [perPage, setPerPage] = useState(10);
  const [data, setData] = useState({ data: [], total: 0, links: [], current_page: 1, per_page: 10 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [replying, setReplying] = useState({});
  const [sending, setSending] = useState({});
  const [rowError, setRowError] = useState({});
  const [rowSuccess, setRowSuccess] = useState({});
  const controllerRef = useRef(null);
  const seqRef = useRef(0);

  const fetchTickets = async (url) => {
    const endpoint = url || route('admin.api.support', { q: query || undefined, status, per_page: perPage });
    try {
      const mySeq = ++seqRef.current;
      setError('');
      setLoading(true);
      if (controllerRef.current) { try { controllerRef.current.abort(); } catch {} }
      const controller = new AbortController();
      controllerRef.current = controller;
      const res = await fetch(endpoint, { signal: controller.signal });
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      const json = await res.json();
      if (mySeq === seqRef.current) setData(json);
    } catch (e) {
      if (e?.name !== 'AbortError') setError(e?.message || 'Failed to load tickets');
    } finally {
      if (controllerRef.current && controllerRef.current.signal && controllerRef.current.signal.aborted) {
        // ignore
      } else {
        setLoading(false);
        controllerRef.current = null;
      }
    }
  };

  useEffect(() => { fetchTickets(); }, []);
  useEffect(() => { const id = setTimeout(() => fetchTickets(), 300); return () => clearTimeout(id); }, [query, status, perPage]);

  const csrf = () => document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
  const sendReply = async (ticketId) => {
    const body = replying[ticketId];
    if (!body || !body.trim()) return;
    try {
      setSending((s)=>({ ...s, [ticketId]: true }));
      setRowError((e)=>({ ...e, [ticketId]: '' }));
      setRowSuccess((m)=>({ ...m, [ticketId]: '' }));
      const form = new FormData();
      form.append('reply', body.trim());
      let res = await fetch(route('admin.support.reply', { ticket: ticketId }), {
        method: 'POST',
        body: form,
        headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': csrf(), 'Accept': 'application/json' },
        credentials: 'same-origin',
      });
      if (res.status === 419) {
        // try to refresh CSRF cookie and retry once
        try { await fetch('/sanctum/csrf-cookie', { credentials: 'same-origin' }); } catch {}
        res = await fetch(route('admin.support.reply', { ticket: ticketId }), {
          method: 'POST',
          body: form,
          headers: { 'X-Requested-With': 'XMLHttpRequest', 'X-CSRF-TOKEN': csrf(), 'Accept': 'application/json' },
          credentials: 'same-origin',
        });
      }
      let json = null;
      try { json = await res.json(); } catch {}
      if (!res.ok || !json?.ok) throw new Error(json?.error || `Reply failed (${res.status})`);
      setReplying((r) => ({ ...r, [ticketId]: '' }));
      setRowSuccess((m)=>({ ...m, [ticketId]: 'Reply sent and ticket closed.' }));
      fetchTickets();
    } catch (e) {
      setRowError((er)=>({ ...er, [ticketId]: e?.message || 'Failed to send reply' }));
    } finally {
      setSending((s)=>({ ...s, [ticketId]: false }));
    }
  };

  return (
    <AdminLayout title="Support Inbox">
      <Head title="Support" />

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-3 text-sm">
          <div className="inline-flex items-center gap-2">
            <label>Status</label>
            <select value={status} onChange={(e)=>setStatus(e.target.value)} className="rounded-md border-gray-300 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
              {['all','open','closed'].map(s => (<option key={s} value={s}>{s}</option>))}
            </select>
          </div>
          <div className="inline-flex items-center gap-2">
            <label>Show</label>
            <select value={perPage} onChange={(e)=>setPerPage(Number(e.target.value))} className="rounded-md border-gray-300 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
              {[10,25,50].map(n => (<option key={n} value={n}>{n}</option>))}
            </select>
            <span>entries</span>
          </div>
          <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">Total: {data?.total || 0}</span>
        </div>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search name, email, subject, message" className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60 sm:w-96" />
          <button onClick={()=>setQuery('')} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Clear</button>
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

      <div className="overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="sticky top-0 z-[1] bg-gray-50/95 backdrop-blur">
            <tr className="text-left text-gray-700">
              <th className="py-2 px-4">No</th>
              <th className="py-2 px-4">From</th>
              <th className="py-2 px-4">Email</th>
              <th className="py-2 px-4">Subject</th>
              <th className="py-2 px-4">Message</th>
              <th className="py-2 px-4">Created</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data?.data?.length === 0 && (
              <tr>
                <td colSpan="7" className="py-10 px-4">
                  <div className="flex flex-col items-center justify-center gap-2 text-center">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600">🙂</div>
                    <div className="text-sm font-medium text-gray-900">No tickets found</div>
                    <div className="text-xs text-gray-500">Try switching Status to All or clearing the search</div>
                  </div>
                </td>
              </tr>
            )}
            {data?.data?.map((t, idx) => (
              <tr key={t.id} className={`${idx % 2 ? 'bg-gray-50/40' : ''}`}>
                <td className="py-2 px-4">{(((data?.current_page || 1) - 1) * (data?.per_page || 10)) + idx + 1}</td>
                <td className="py-2 px-4 whitespace-nowrap">{t.name}</td>
                <td className="py-2 px-4 whitespace-nowrap">{t.email}</td>
                <td className="py-2 px-4 whitespace-nowrap">{t.subject || '-'}</td>
                <td className="py-2 px-4 max-w-xl">
                  <div className="line-clamp-2 text-gray-700">{t.message}</div>
                  {t.admin_reply && (
                    <div className="mt-1 rounded bg-emerald-50 p-2 text-xs text-emerald-700">Reply: {t.admin_reply}</div>
                  )}
                </td>
                <td className="py-2 px-4 whitespace-nowrap text-gray-600">{t.created_at}</td>
                <td className="py-2 px-4">
                  {t.status === 'open' ? (
                    <div className="flex flex-col gap-2">
                      <textarea value={replying[t.id] || ''} onChange={(e)=>setReplying(r=>({...r, [t.id]: e.target.value}))} rows={2} placeholder="Type reply..." className="w-64 rounded-md border-gray-300 text-sm shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60" />
                      <div className="flex items-center gap-2">
                        <button disabled={!!sending[t.id]} onClick={()=>sendReply(t.id)} className={`inline-flex items-center justify-center rounded-md px-3 py-1.5 text-xs font-medium text-white ${sending[t.id] ? 'bg-emerald-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700'}`}>{sending[t.id] ? 'Sending…' : 'Send reply'}</button>
                        {rowSuccess[t.id] && (<span className="text-xs text-emerald-700">{rowSuccess[t.id]}</span>)}
                        {rowError[t.id] && (<span className="text-xs text-red-600">{rowError[t.id]}</span>)}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-gray-500">Closed</span>
                      {t.admin_reply && (<span className="text-gray-600">Replied: {t.admin_reply}</span>)}
                    </div>
                  )}
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
              if (status) target.searchParams.set('status', status);
              if (query) target.searchParams.set('q', query);
              fetchTickets(target.toString());
            }} className={`rounded border px-2 py-1 text-xs ${l.active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}>{l.label.replace('&laquo;','«').replace('&raquo;','»')}</button>
          ))}
        </div>
      )}
    </AdminLayout>
  );
}
