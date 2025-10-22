import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function JobsPublicIndex() {
  const { filters, categories = [], provinces = [] } = usePage().props;
  const [q, setQ] = useState(filters?.q || '');
  const [category, setCategory] = useState(filters?.category || '');
  const [per, setPer] = useState(filters?.per_page || 12);
  const [provinceId, setProvinceId] = useState(filters?.province_id || '');
  const [districts, setDistricts] = useState([]);
  const [districtId, setDistrictId] = useState(filters?.district_id || '');
  const [sectors, setSectors] = useState([]);
  const [sectorId, setSectorId] = useState(filters?.sector_id || '');
  const [list, setList] = useState({ data: [], links: [] });
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalJob, setModalJob] = useState(null);
  const [motivation, setMotivation] = useState('');
  const [applyState, setApplyState] = useState({ sending: false, done: false, error: '' });
  const [resultPopup, setResultPopup] = useState({ open: false, ok: false, msg: '' });
  const [modalStage, setModalStage] = useState('details');
  const [innerOpen, setInnerOpen] = useState(false);

  useEffect(() => {
    const loadDistricts = async () => {
      if (!provinceId) { setDistricts([]); setDistrictId(''); setSectorId(''); return; }
      try { const res = await fetch(route('locations.districts', { province_id: provinceId })); const json = await res.json(); setDistricts(json || []); } catch {}
    };
    loadDistricts();
  }, [provinceId]);

  useEffect(() => {
    const loadSectors = async () => {
      if (!districtId) { setSectors([]); setSectorId(''); return; }
      try { const res = await fetch(route('locations.sectors', { district_id: districtId })); const json = await res.json(); setSectors(json || []); } catch {}
    };
    loadSectors();
  }, [districtId]);

  const loadJobs = async (params = {}) => {
    const usp = new URLSearchParams(Object.entries(params).filter(([,v]) => v !== '' && v !== undefined));
    const res = await fetch(`/api/public/jobs?${usp.toString()}`);
    const data = await res.json();
    setList(data);
  };

  useEffect(() => {
    loadJobs({ q, category, province_id: provinceId, district_id: districtId, sector_id: sectorId, per_page: per });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitFilters = async (e) => {
    e?.preventDefault?.();
    await loadJobs({ q, category, province_id: provinceId, district_id: districtId, sector_id: sectorId, per_page: per });
  };

  const prettyDate = (s) => { try { return new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }); } catch { return s; } };

  const Countdown = ({ to }) => {
    const [now, setNow] = useState(Date.now());
    useEffect(() => { const id = setInterval(()=>setNow(Date.now()), 1000); return ()=>clearInterval(id); }, []);
    const end = new Date(to).getTime();
    const diff = Math.max(0, Math.floor((end - now)/1000));
    const d = Math.floor(diff/86400); const h = Math.floor((diff%86400)/3600); const m = Math.floor((diff%3600)/60); const s = diff%60;
    const Box = ({v,label}) => (<div className="rounded-md bg-blue-50 px-2 py-1 text-center"><div className="text-base font-semibold text-blue-700">{String(v).padStart(2,'0')}</div><div className="text-[10px] uppercase tracking-wide text-blue-700/80">{label}</div></div>);
    return (<div className="flex gap-2"> <Box v={d} label="Days"/> <Box v={h} label="Hours"/> <Box v={m} label="Mins"/> <Box v={s} label="Seconds"/> </div>);
  };

  const openJobModal = async (jobId) => {
    setShowModal(true);
    setModalLoading(true);
    setApplyState({ sending: false, done: false, error: '' });
    setMotivation('');
    setModalStage('details');
    try {
      const res = await fetch(`/api/public/jobs/${jobId}`);
      const data = await res.json();
      setModalJob(data);
    } catch { setModalJob(null); } finally { setModalLoading(false); }
  };

  const submitApplication = async () => {
    if (!modalJob?.id || !motivation?.trim()) return;
    try {
      setApplyState({ sending: true, done: false, error: '' });
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const res = await fetch('/api/applications', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}) },
        body: JSON.stringify({ job_id: modalJob.id, motivation })
      });
      if (res.status === 409) {
        setApplyState({ sending:false, done:true, error:'' });
        setModalJob(prev => prev ? { ...prev, applied: 1 } : prev);
        setList(prev => prev?.data ? { ...prev, data: prev.data.map(it => it.id === modalJob.id ? { ...it, applied: 1 } : it) } : prev);
        setInnerOpen(false);
        setResultPopup({ open:true, ok:true, msg:'You have already applied to this job.' });
      }
      else if (!res.ok) {
        let msg = 'Failed';
        try { const j = await res.json(); msg = j?.message || j?.error || msg; } catch {}
        throw new Error(msg);
      }
      else {
        setApplyState({ sending:false, done:true, error:'' });
        setModalJob(prev => prev ? { ...prev, applied: 1 } : prev);
        setList(prev => prev?.data ? { ...prev, data: prev.data.map(it => it.id === modalJob.id ? { ...it, applied: 1 } : it) } : prev);
        setInnerOpen(false);
        setResultPopup({ open:true, ok:true, msg:'Application submitted successfully.' });
      }
      setModalJob(prev => prev ? { ...prev, applied: 1 } : prev);
      setList(prev => prev?.data ? { ...prev, data: prev.data.map(it => it.id === modalJob.id ? { ...it, applied: 1 } : it) } : prev);
    } catch (e) { const msg = e?.message || 'Something went wrong. Try again.'; setApplyState({ sending:false, done:false, error: msg }); setResultPopup({ open:true, ok:false, msg:`Could not submit your application. ${msg}` }); }
  };

  return (
    <AuthenticatedLayout header={<h2 className="text-xl font-semibold leading-tight text-gray-800">Browse Jobs</h2>}>
      <Head title="Browse Jobs" />

      <div className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <form onSubmit={submitFilters} className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <input value={q} onChange={(e)=>setQ(e.target.value)} placeholder="Search title/company" className="rounded-md border-gray-300 text-sm shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60" />
            <select value={category} onChange={(e)=>setCategory(e.target.value)} className="rounded-md border-gray-300 text-sm shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
              <option value="">All types</option>
              {categories.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
            </select>
            <select value={provinceId} onChange={(e)=>setProvinceId(e.target.value)} className="rounded-md border-gray-300 text-sm shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
              <option value="">Province</option>
              {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select value={districtId} onChange={(e)=>setDistrictId(e.target.value)} className="rounded-md border-gray-300 text-sm shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
              <option value="">District</option>
              {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
            <select value={sectorId} onChange={(e)=>setSectorId(e.target.value)} className="rounded-md border-gray-300 text-sm shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
              <option value="">Sector</option>
              {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="flex items-center gap-2">
              <button type="submit" className="rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700">Filter</button>
              <select value={per} onChange={(e)=>setPer(Number(e.target.value))} className="rounded-md border-gray-300 text-sm shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
                {[12,24,48].map(n => <option key={n} value={n}>{n}/page</option>)}
              </select>
            </div>
          </form>

          <div className="space-y-3">
            {list?.data?.map(j => (
              <div key={j.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm text-gray-500">{j.company}</div>
                    <div className="mt-1 truncate text-base font-semibold text-gray-900">{j.title}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-gray-700">
                      {j.department && <span className="rounded border border-gray-200 px-2 py-0.5">{j.department}</span>}
                      <span className="rounded border border-gray-200 px-2 py-0.5 capitalize">{j.category?.replace('_',' ')}</span>
                      <span className="inline-flex items-center gap-1"><svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.1 2 5 5.1 5 9c0 5.2 7 13 7 13s7-7.8 7-13c0-3.9-3.1-7-7-7zm0 9.5c-1.4 0-2.5-1.1-2.5-2.5S10.6 6.5 12 6.5s2.5 1.1 2.5 2.5S13.4 11.5 12 11.5z"/></svg>{[j.province, j.district, j.sector].filter(Boolean).join(', ')}</span>
                    </div>
                    <div className="mt-2 grid gap-3 text-[12px] text-gray-600 sm:flex sm:items-center">
                      <span className="inline-flex items-center gap-1"><svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 15H5V10h14v9z"/></svg>Posted on <span className="ml-1 font-medium">{prettyDate(j.created_at)}</span></span>
                      <span className="inline-flex items-center gap-1"><svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 15H5V10h14v9z"/></svg>Deadline <span className="ml-1 font-medium">{prettyDate(j.deadline)}</span></span>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-3">
                    {j.applied ? (
                      <button disabled className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white opacity-80">APPLIED</button>
                    ) : (
                      <button onClick={() => openJobModal(j.id)} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-blue-700">APPLY</button>
                    )}
                    <Countdown to={j.deadline} />
                  </div>
                </div>
              </div>
            ))}
            {(!list?.data || list?.data.length === 0) && (
              <div className="rounded-xl border border-gray-100 bg-white p-6 text-center text-gray-500">No jobs found</div>
            )}
          </div>

          {list?.links && (
            <div className="mt-6 flex items-center justify-end gap-2">
              {list.links.map((l, i) => (
                <button key={i} disabled={!l.url} onClick={async ()=>{ if(l.url){ const res = await fetch(l.url.replace(window.location.origin,'')); const data = await res.json(); setList(data);} }} className={`rounded-md px-3 py-1.5 text-sm ${l.active ? 'bg-emerald-600 text-white' : (l.url ? 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50' : 'bg-gray-100 text-gray-400')}`} dangerouslySetInnerHTML={{ __html: l.label }} />
              ))}
            </div>
          )}

          {showModal && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={()=>setShowModal(false)}>
              <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl" onClick={e=>e.stopPropagation()}>
                <div className="flex items-center justify-between border-b px-5 py-3">
                  <div className="text-sm font-semibold text-gray-900">Advertisement details</div>
                  <button onClick={()=>setShowModal(false)} className="rounded p-1 text-gray-500 hover:bg-gray-100">✕</button>
                </div>
                <div className="max-h-[70vh] overflow-y-auto px-5 py-4">
                  {modalLoading && <div className="py-10 text-center text-gray-500">Loading…</div>}
                  {!modalLoading && modalJob && (
                    <div className="space-y-4">
                      <div className="rounded-xl border border-gray-200 bg-white p-4">
                        <div className="text-lg font-semibold text-blue-700">{modalJob.title}</div>
                        <div className="text-sm text-gray-700">{modalJob.company}</div>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px] text-gray-700">
                          {modalJob.department && <span className="rounded border border-gray-200 px-2 py-0.5">{modalJob.department}</span>}
                          <span className="rounded border border-gray-200 px-2 py-0.5 capitalize">{modalJob.category?.replace('_',' ')}</span>
                          <span>{[modalJob.province, modalJob.district, modalJob.sector].filter(Boolean).join(', ')}</span>
                        </div>
                        <div className="mt-3 grid gap-3 text-[12px] text-gray-600 sm:flex sm:items-center">
                          <span>Posted on <span className="font-medium">{prettyDate(modalJob.created_at)}</span></span>
                          <span>Deadline <span className="font-medium">{prettyDate(modalJob.deadline)}</span></span>
                        </div>
                      </div>

                      {(modalJob.description || modalJob.summary || modalJob.content) && (
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                          <div className="mb-2 text-sm font-semibold text-gray-900">Description</div>
                          {typeof modalJob.description === 'string' && /<[^>]+>/.test(modalJob.description) ? (
                            <div className="prose prose-sm max-w-none text-gray-700" dangerouslySetInnerHTML={{ __html: modalJob.description }} />
                          ) : (
                            <div className="prose prose-sm max-w-none whitespace-pre-line text-gray-700">{(modalJob.description || modalJob.summary || modalJob.content)}</div>
                          )}
                        </div>
                      )}
                      {modalJob.responsibilities && (
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                          <div className="mb-2 text-sm font-semibold text-gray-900">Responsibilities</div>
                          <div className="prose prose-sm max-w-none whitespace-pre-line text-gray-700">{modalJob.responsibilities}</div>
                        </div>
                      )}
                      {modalJob.requirements && (
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                          <div className="mb-2 text-sm font-semibold text-gray-900">Requirements</div>
                          <div className="prose prose-sm max-w-none whitespace-pre-line text-gray-700">{modalJob.requirements}</div>
                        </div>
                      )}
                      {modalJob.benefits && (
                        <div className="rounded-xl border border-gray-200 bg-white p-4">
                          <div className="mb-2 text-sm font-semibold text-gray-900">Benefits</div>
                          <div className="prose prose-sm max-w-none whitespace-pre-line text-gray-700">{modalJob.benefits}</div>
                        </div>
                      )}

                      {modalStage === 'details' && !modalJob.applied && (
                        <div className="flex items-center justify-end">
                          <button disabled={applyState.sending} onClick={()=>{ setModalStage('apply'); setInnerOpen(true); }} className={`rounded-md px-4 py-2 text-sm font-semibold text-white shadow ${applyState.sending ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>Apply now</button>
                        </div>
                      )}
                      {modalStage === 'details' && modalJob.applied && (
                        <div className="flex items-center justify-end">
                          <span className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white">Already applied</span>
                        </div>
                      )}

                      {/* motivation form moved to inner popup */}
                    </div>
                  )}
                  {!modalLoading && !modalJob && <div className="py-10 text-center text-gray-500">Job not found.</div>}
                </div>
              </div>
            </div>
          )}
        </div>

        {resultPopup.open && (
          <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 p-4" onClick={()=>setResultPopup({ open:false, ok:false, msg:'' })}>
            <div className="w-full max-w-sm rounded-xl bg-white p-5 text-center shadow-xl" onClick={e=>e.stopPropagation()}>
              <div className={`mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full ${resultPopup.ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{resultPopup.ok ? '✓' : '!'}</div>
              <div className="text-sm font-medium text-gray-900">{resultPopup.msg}</div>
              <div className="mt-4">
                <button onClick={()=>setResultPopup({ open:false, ok:false, msg:'' })} className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">OK</button>
              </div>
            </div>
          </div>
        )}

        {showModal && innerOpen && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={()=>setInnerOpen(false)}>
            <div className="w-full max-w-xl rounded-xl bg-white p-4 shadow-xl" onClick={e=>e.stopPropagation()}>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-900">Submit application</div>
                <button onClick={()=>setInnerOpen(false)} className="rounded p-1 text-gray-500 hover:bg-gray-100">✕</button>
              </div>
              <div>
                <div className="mb-2 text-sm text-gray-700">Add your motivation letter for <span className="font-semibold">{modalJob?.title}</span>.</div>
                <textarea value={motivation} onChange={e=>setMotivation(e.target.value)} rows={6} className="w-full rounded-md border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-emerald-400 focus:ring focus:ring-emerald-200/60" placeholder="Write your motivation letter here…" />
                {applyState.error && <div className="mt-2 text-sm text-red-600">{applyState.error}</div>}
                <div className="mt-3 flex items-center justify-end gap-2">
                  <button disabled={applyState.sending} onClick={()=>setInnerOpen(false)} className={`rounded-md px-3 py-1.5 text-sm ring-1 ring-gray-200 ${applyState.sending ? 'opacity-60' : 'hover:bg-gray-50'}`}>Cancel</button>
                  <button onClick={submitApplication} disabled={applyState.sending || !motivation.trim()} className={`rounded-md px-3 py-1.5 text-sm text-white ${applyState.sending || !motivation.trim() ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{applyState.sending ? 'Submitting…' : 'Submit'}</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
