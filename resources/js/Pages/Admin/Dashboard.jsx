import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useState } from 'react';

export default function Dashboard({ stats = {}, recentUsers = [], recentCompanies = [] }) {
    const { flash = {} } = usePage().props;
    const [usersOpen, setUsersOpen] = useState(false);
    const [companiesOpen, setCompaniesOpen] = useState(false);
    const [supportOpen, setSupportOpen] = useState(false);
    const [usersData, setUsersData] = useState({ data: [], total: 0, links: [] });
    const [companiesData, setCompaniesData] = useState({ data: [], total: 0, links: [] });
    const [supportData, setSupportData] = useState({ data: [], total: 0, links: [] });
    const [userQuery, setUserQuery] = useState('');
    const [companyQuery, setCompanyQuery] = useState('');
    const [supportQuery, setSupportQuery] = useState('');
    const [supportStatus, setSupportStatus] = useState('open');
    const [replyTicketId, setReplyTicketId] = useState(null);
    const [replyText, setReplyText] = useState('');

    const fetchUsers = async (url) => {
        const endpoint = url || route('admin.api.users', { q: userQuery || undefined });
        const res = await fetch(endpoint);
        const json = await res.json();
        setUsersData(json);
    };

    const fetchCompanies = async (url) => {
        const endpoint = url || route('admin.api.companies', { q: companyQuery || undefined });
        const res = await fetch(endpoint);
        const json = await res.json();
        setCompaniesData(json);
    };

    const fetchSupport = async (url) => {
        const endpoint = url || route('admin.api.support', { q: supportQuery || undefined, status: supportStatus || undefined });
        const res = await fetch(endpoint);
        const json = await res.json();
        setSupportData(json);
    };

    useEffect(() => { if (usersOpen) fetchUsers(); }, [usersOpen]);
    useEffect(() => { if (companiesOpen) fetchCompanies(); }, [companiesOpen]);
    useEffect(() => { if (supportOpen) fetchSupport(); }, [supportOpen, supportStatus]);
    useEffect(() => {
        if (flash?.openCompanies) setCompaniesOpen(true);
    }, [flash?.openCompanies]);
    useEffect(() => {
        const onKey = (e) => {
            if (e.key === 'Escape') { setUsersOpen(false); setCompaniesOpen(false); }
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);
    return (
        <AdminLayout title="Admin">
            <Head title="Admin Dashboard" />

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <Link href={route('admin.users.index')} className="group block text-left rounded-xl border border-emerald-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-emerald-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                {/* Users icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V20h14v-3.5C15 14.17 10.33 13 8 13zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V20h6v-3.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
                            </span>
                            <span>Users</span>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 ring-1 ring-emerald-100">Manage</span>
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.users || 0}</div>
                    <div className="mt-3 h-1 w-16 rounded bg-emerald-500/80 group-hover:w-20 transition-all" />
                </Link>
                <button onClick={() => setCompaniesOpen(true)} className="group text-left rounded-xl border border-emerald-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-emerald-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                                {/* Buildings icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M3 21h18v-2H3v2zm2-4h3v-6H5v6zm5 0h3V4h-3v13zm5 0h3v-8h-3v8zM5 9h3V7H5v2zm10 0h3V7h-3v2z"/></svg>
                            </span>
                            <span>Companies</span>
                        </div>
                        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] text-emerald-700 ring-1 ring-emerald-100">Manage</span>
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.companies || 0}</div>
                    <div className="mt-3 h-1 w-16 rounded bg-emerald-500/80 group-hover:w-20 transition-all" />
                </button>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-50 text-gray-700 ring-1 ring-gray-200">
                            {/* Briefcase icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M10 4h4a2 2 0 012 2v2h4a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2v-8a2 2 0 012-2h4V6a2 2 0 012-2zm0 4h4V6h-4v2z"/></svg>
                        </span>
                        <span>Jobs</span>
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.jobs || 0}</div>
                    <div className="mt-3 h-1 w-16 rounded bg-gray-200" />
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-gray-50 text-gray-700 ring-1 ring-gray-200">
                            {/* File icon */}
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm1 7H8V7h7v2zm3 4H8v-2h10v2zm0 4H8v-2h10v2z"/></svg>
                        </span>
                        <span>Applications</span>
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.applications || 0}</div>
                    <div className="mt-3 h-1 w-16 rounded bg-gray-200" />
                </div>
                <button onClick={() => setSupportOpen(true)} className="group text-left rounded-xl border border-indigo-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-indigo-300">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                            <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100">
                                {/* Inbox icon */}
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M19 3H4.99C3.88 3 3 3.89 3 5L3 19c0 1.1.88 2 1.99 2H19c1.1 0 2-.9 2-2V5c0-1.11-.9-2-2-2zm0 12h-3.5c-.28 0-.5.22-.5.5s-.22.5-.5.5H9.5c-.28 0-.5-.22-.5-.5s-.22-.5-.5-.5H5V5h14v10z"/></svg>
                            </span>
                            <span>Support Inbox</span>
                        </div>
                        <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-700 ring-1 ring-indigo-100">Open</span>
                    </div>
                    <div className="mt-2 text-3xl font-semibold text-gray-900">{stats.support_open || 0}</div>
                    <div className="mt-3 h-1 w-16 rounded bg-indigo-500/80 group-hover:w-20 transition-all" />
                </button>
            </div>

            {/* Users Modal */}
            {usersOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e)=>{ if(e.target===e.currentTarget) setUsersOpen(false); }}>
                    <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <h3 className="text-base font-semibold">Manage Users</h3>
                            <button className="rounded p-1 hover:bg-gray-100" onClick={() => setUsersOpen(false)} aria-label="Close">✕</button>
                        </div>
                        <div className="p-4">
                            <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex w-full items-center gap-2">
                                    <input value={userQuery} onChange={(e)=>setUserQuery(e.target.value)} placeholder="Search name, email, phone" className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60" />
                                    <button onClick={()=>fetchUsers()} className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">Search</button>
                                </div>
                                <a href={route('admin.api.users.export', { q: userQuery || undefined })} className="inline-flex items-center justify-center rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Download CSV</a>
                            </div>
                            <div className="max-h-[60vh] overflow-auto rounded border">
                                <table className="min-w-full text-sm">
                                    <thead className="sticky top-0 z-[1] bg-gray-50">
                                        <tr className="text-left text-gray-700">
                                            <th className="py-2 px-3">Name</th>
                                            <th className="py-2 px-3">First</th>
                                            <th className="py-2 px-3">Last</th>
                                            <th className="py-2 px-3">Phone</th>
                                            <th className="py-2 px-3">Email</th>
                                            <th className="py-2 px-3">Address</th>
                                            <th className="py-2 px-3">Education</th>
                                            <th className="py-2 px-3">Exp</th>
                                            <th className="py-2 px-3">Gender</th>
                                            <th className="py-2 px-3">Attachments</th>
                                            <th className="py-2 px-3">Role</th>
                                            <th className="py-2 px-3">Created</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {usersData.data.length === 0 && (
                                            <tr><td colSpan="7" className="py-6 text-center text-gray-600">No users</td></tr>
                                        )}
                                        {usersData.data.map((u, idx) => (
                                            <tr key={u.id} className={`border-t ${idx % 2 ? 'bg-gray-50/60' : ''}`}>
                                                <td className="py-2 px-3 text-gray-900">{u.name}</td>
                                                <td className="py-2 px-3 text-gray-900">{u.first_name}</td>
                                                <td className="py-2 px-3 text-gray-900">{u.last_name}</td>
                                                <td className="py-2 px-3 text-gray-900">{u.phone}</td>
                                                <td className="py-2 px-3 text-gray-900">{u.email}</td>
                                                <td className="py-2 px-3 max-w-[200px] truncate text-gray-700" title={u.address_line || ''}>{u.address_line}</td>
                                                <td className="py-2 px-3 text-gray-700">{u.education_level || '-'}</td>
                                                <td className="py-2 px-3 text-gray-700">{u.experience_years ?? '-'}</td>
                                                <td className="py-2 px-3 text-gray-700">{u.gender || '-'}</td>
                                                <td className="py-2 px-3 text-xs text-sky-700">
                                                    <div className="flex flex-col gap-1">
                                                        {u.cv_path && (<a href={"/storage/" + u.cv_path} target="_blank" rel="noreferrer" className="hover:underline">CV</a>)}
                                                        {u.degree_path && (<a href={"/storage/" + u.degree_path} target="_blank" rel="noreferrer" className="hover:underline">Degree</a>)}
                                                        {(() => {
                                                            try { const arr = Array.isArray(u.certificates_paths) ? u.certificates_paths : (u.certificates_paths ? JSON.parse(u.certificates_paths) : []); return (arr || []).slice(0,3).map((p, i) => (<a key={i} href={"/storage/" + p} target="_blank" rel="noreferrer" className="hover:underline">Cert {i+1}</a>)); } catch { return null; }
                                                        })()}
                                                    </div>
                                                </td>
                                                <td className="py-2 px-3 text-xs"><span className={`rounded px-2 py-0.5 ${u.is_admin ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-gray-100 text-gray-700 ring-1 ring-gray-200'}`}>{u.is_admin ? 'Admin' : 'User'}</span></td>
                                                <td className="py-2 px-3 text-xs text-gray-700">{new Date(u.created_at).toLocaleString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <div className="text-xs text-gray-600">Total: {usersData.total}</div>
                                <div className="flex items-center gap-2">
                                    {usersData.links?.filter(l=>l.url).map((l, idx) => (
                                        <button key={idx} onClick={()=>fetchUsers(l.url)} className={`rounded border px-2 py-1 text-xs ${l.active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>{l.label.replace('&laquo;','«').replace('&raquo;','»')}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Support Inbox Modal */}
            {supportOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e)=>{ if(e.target===e.currentTarget) setSupportOpen(false); }}>
                    <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <h3 className="text-base font-semibold">Support Inbox</h3>
                            <div className="flex items-center gap-2">
                                <select value={supportStatus} onChange={(e)=>setSupportStatus(e.target.value)} className="rounded-md border-gray-300 text-sm shadow-sm focus:border-indigo-400 focus:ring focus:ring-indigo-200/60">
                                    <option value="open">Open</option>
                                    <option value="closed">Closed</option>
                                </select>
                                <button className="rounded p-1 hover:bg-gray-100" onClick={() => setSupportOpen(false)} aria-label="Close">✕</button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <input value={supportQuery} onChange={(e)=>setSupportQuery(e.target.value)} placeholder="Search name, email, subject, message" className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-400 focus:ring focus:ring-indigo-200/60" />
                                <button onClick={()=>fetchSupport()} className="rounded-md bg-indigo-600 px-3 py-2 text-sm text-white hover:bg-indigo-700">Search</button>
                            </div>
                            {replyTicketId && (
                                <div className="mb-3 rounded-lg border border-indigo-200 bg-indigo-50/40 p-3">
                                    <div className="mb-2 text-sm font-medium text-indigo-800">Reply to Ticket #{replyTicketId}</div>
                                    <textarea value={replyText} onChange={(e)=>setReplyText(e.target.value)} rows={4} className="mt-1 w-full rounded-md border border-indigo-200 bg-white p-2 text-gray-900 shadow-sm focus:border-indigo-400 focus:ring focus:ring-indigo-200/60" placeholder="Type your reply..." />
                                    <div className="mt-2 flex items-center justify-end gap-2">
                                        <button onClick={()=>{ setReplyTicketId(null); setReplyText(''); }} className="rounded-md px-3 py-1.5 text-sm text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Cancel</button>
                                        <button onClick={async()=>{
                                            if(!replyText.trim()) return;
                                            const token = document.querySelector('meta[name="csrf-token"]').getAttribute('content');
                                            await fetch(route('admin.support.reply', replyTicketId), { method:'POST', headers:{ 'Content-Type':'application/json', 'X-Requested-With':'XMLHttpRequest', 'X-CSRF-TOKEN': token }, body: JSON.stringify({ reply: replyText }) });
                                            setReplyTicketId(null); setReplyText('');
                                            fetchSupport();
                                        }} className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-700">Send Reply</button>
                                    </div>
                                </div>
                            )}
                            <div className="max-h-[60vh] overflow-auto rounded border">
                                <table className="min-w-full text-sm">
                                    <thead className="sticky top-0 z-[1] bg-gray-50">
                                        <tr className="text-left text-gray-700">
                                            <th className="py-2 px-3">ID</th>
                                            <th className="py-2 px-3">User</th>
                                            <th className="py-2 px-3">Subject</th>
                                            <th className="py-2 px-3">Message</th>
                                            <th className="py-2 px-3">Created</th>
                                            <th className="py-2 px-3">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {supportData.data.length === 0 && (
                                            <tr><td colSpan="6" className="py-6 text-center text-gray-600">No tickets</td></tr>
                                        )}
                                        {supportData.data.map((s, idx) => (
                                            <tr key={s.id} className={`border-t ${idx % 2 ? 'bg-gray-50/60' : ''}`}>
                                                <td className="py-2 px-3 text-gray-900">{s.id}</td>
                                                <td className="py-2 px-3 text-gray-900">{s.name || '-'}<div className="text-xs text-gray-600">{s.email}</div></td>
                                                <td className="py-2 px-3 text-gray-700 max-w-[200px] truncate" title={s.subject || ''}>{s.subject}</td>
                                                <td className="py-2 px-3 text-gray-700 max-w-[260px] truncate" title={s.message}>{s.message}</td>
                                                <td className="py-2 px-3 text-xs text-gray-700">{new Date(s.created_at).toLocaleString()}</td>
                                                <td className="py-2 px-3">
                                                    {s.status === 'open' ? (
                                                        <button onClick={()=>{ setReplyTicketId(s.id); setReplyText(''); }} className="rounded border border-indigo-200 px-2 py-1 text-xs text-indigo-700 hover:bg-indigo-50">Reply</button>
                                                    ) : (
                                                        <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">Closed</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <div className="text-xs text-gray-600">Total: {supportData.total}</div>
                                <div className="flex items-center gap-2">
                                    {supportData.links?.filter(l=>l.url).map((l, idx) => (
                                        <button key={idx} onClick={()=>fetchSupport(l.url)} className={`rounded border px-2 py-1 text-xs ${l.active ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>{l.label.replace('&laquo;','«').replace('&raquo;','»')}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Companies Modal */}
            {companiesOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={(e)=>{ if(e.target===e.currentTarget) setCompaniesOpen(false); }}>
                    <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-white shadow-xl">
                        <div className="flex items-center justify-between border-b px-4 py-3">
                            <h3 className="text-base font-semibold">Manage Companies</h3>
                            <div className="flex items-center gap-2">
                                <Link href={route('admin.companies.create')} className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-700">New</Link>
                                <button className="rounded p-1 hover:bg-gray-100" onClick={() => setCompaniesOpen(false)} aria-label="Close">✕</button>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="mb-3 flex items-center gap-2">
                                <input value={companyQuery} onChange={(e)=>setCompanyQuery(e.target.value)} placeholder="Search company id or title" className="w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60" />
                                <button onClick={()=>fetchCompanies()} className="rounded-md bg-emerald-600 px-3 py-2 text-sm text-white hover:bg-emerald-700">Search</button>
                            </div>
                            <div className="max-h-[60vh] overflow-auto rounded border">
                                <table className="min-w-full text-sm">
                                    <thead className="sticky top-0 z-[1] bg-gray-50">
                                        <tr className="text-left text-gray-700">
                                            <th className="py-2 px-3">ID</th>
                                            <th className="py-2 px-3">Title</th>
                                            <th className="py-2 px-3">Description</th>
                                            <th className="py-2 px-3">Department</th>
                                            <th className="py-2 px-3">Logo</th>
                                            <th className="py-2 px-3">Location</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {companiesData.data.length === 0 && (
                                            <tr><td colSpan="6" className="py-6 text-center text-gray-600">No companies</td></tr>
                                        )}
                                        {companiesData.data.map((c, idx) => (
                                            <tr key={c.id} className={`border-t ${idx % 2 ? 'bg-gray-50/60' : ''}`}>
                                                <td className="py-2 px-3 text-gray-900">{c.id}</td>
                                                <td className="py-2 px-3 text-gray-900">{c.title}</td>
                                                <td className="py-2 px-3 text-gray-700 max-w-[260px] truncate" title={c.description || ''}>{c.description}</td>
                                                <td className="py-2 px-3 text-gray-700">{c.department}</td>
                                                <td className="py-2 px-3">
                                                    {c.logo_path ? (
                                                        <img src={`/storage/${c.logo_path}`} alt={`${c.title} logo`} className="h-8 w-8 rounded object-cover ring-1 ring-gray-200" />
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="py-2 px-3 text-xs text-gray-700">P:{c.province_id} D:{c.district_id} S:{c.sector_id}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <div className="text-xs text-gray-600">Total: {companiesData.total}</div>
                                <div className="flex items-center gap-2">
                                    {companiesData.links?.filter(l=>l.url).map((l, idx) => (
                                        <button key={idx} onClick={()=>fetchCompanies(l.url)} className={`rounded border px-2 py-1 text-xs ${l.active ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white hover:bg-gray-50 border-gray-200'}`}>{l.label.replace('&laquo;','«').replace('&raquo;','»')}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
