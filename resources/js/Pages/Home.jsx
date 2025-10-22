import { Link, usePage, router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import PublicLayout from '@/Layouts/PublicLayout';

export default function Home() {
  const { auth, categories = [], provinces = [], featuredJobs = [], latestJobs, logoUrl, topCompanies = [], heroImageUrl, stats = {}, categoryCounts = {} } = usePage().props;
  const [list, setList] = useState(latestJobs);
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalJob, setModalJob] = useState(null);
  const [motivation, setMotivation] = useState('');
  const [applyState, setApplyState] = useState({ sending: false, done: false, error: '' });
  const [resultPopup, setResultPopup] = useState({ open: false, ok: false, msg: '' });
  const [modalStage, setModalStage] = useState('details'); // 'details' | 'login' | 'apply'
  const [innerOpen, setInnerOpen] = useState(false);

  const [q, setQ] = useState('');
  const [category, setCategory] = useState('');
  const [provinceId, setProvinceId] = useState('');
  const [districts, setDistricts] = useState([]);
  const [districtId, setDistrictId] = useState('');
  const [sectors, setSectors] = useState([]);
  const [sectorId, setSectorId] = useState('');

  useEffect(() => {
    if (!provinceId) { setDistricts([]); setDistrictId(''); setSectors([]); setSectorId(''); return; }
    const url = route('locations.districts', { province_id: provinceId });
    fetch(url).then(r => r.json()).then(d => setDistricts(d || [])).catch(()=>setDistricts([]));
  }, [provinceId]);
  useEffect(() => {
    if (!districtId) { setSectors([]); setSectorId(''); return; }
    const url = route('locations.sectors', { district_id: districtId });
    fetch(url).then(r => r.json()).then(d => setSectors(d || [])).catch(()=>setSectors([]));
  }, [districtId]);

  // Removed sticky mini-search to simplify header area

  const loadJobs = async (params = {}) => {
    const usp = new URLSearchParams(Object.entries(params).filter(([,v]) => v));
    const res = await fetch(`/api/public/jobs?${usp.toString()}`);
    const data = await res.json();
    setList(data);
  };

  const openJobModal = async (jobId) => {
    setShowModal(true);
    setModalLoading(true);
    setApplyState({ sending: false, done: false, error: '' });
    setMotivation('');
    setModalStage('details');
    setInnerOpen(false);
    try {
      const res = await fetch(`/api/public/jobs/${jobId}`);
      if (!res.ok) throw new Error('Failed to load');
      const data = await res.json();
      setModalJob(data);
    } catch (e) {
      setModalJob(null);
    } finally {
      setModalLoading(false);
    }
  };

  const submitApplication = async () => {
    if (!modalJob?.id || !motivation?.trim()) return;
    try {
      setApplyState({ sending: true, done: false, error: '' });
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest', ...(csrf ? { 'X-CSRF-TOKEN': csrf } : {}) },
        body: JSON.stringify({ job_id: modalJob.id, motivation }),
      });
      if (res.status === 401) { setApplyState({ sending: false, done: false, error: 'Please log in to apply.' }); return; }
      if (res.status === 409) {
        setApplyState({ sending: false, done: true, error: '' });
        // Ensure UI marks as applied and close inner popup
        setModalJob(prev => prev ? { ...prev, applied: 1 } : prev);
        setList(prev => {
          if (!prev?.data) return prev;
          return { ...prev, data: prev.data.map(it => it.id === modalJob.id ? { ...it, applied: 1 } : it) };
        });
        setInnerOpen(false);
        setResultPopup({ open: true, ok: true, msg: 'You have already applied to this job.' });
        return;
      }
      if (!res.ok) {
        let msg = 'Failed';
        try { const j = await res.json(); msg = j?.message || j?.error || msg; } catch {}
        throw new Error(msg);
      }
      setApplyState({ sending: false, done: true, error: '' });
      // Mark as applied locally
      setModalJob(prev => prev ? { ...prev, applied: 1 } : prev);
      setList(prev => {
        if (!prev?.data) return prev;
        return { ...prev, data: prev.data.map(it => it.id === modalJob.id ? { ...it, applied: 1 } : it) };
      });
      setInnerOpen(false);
      setResultPopup({ open: true, ok: true, msg: 'Application submitted successfully.' });
    } catch (e) {
      const msg = e?.message || 'Something went wrong. Try again.';
      setApplyState({ sending: false, done: false, error: msg });
      setResultPopup({ open: true, ok: false, msg: `Could not submit your application. ${msg}` });
    }
  };

  const submitSearch = async (e) => {
    e?.preventDefault?.();
    await loadJobs({
      q,
      category,
      province_id: provinceId,
      district_id: districtId,
      sector_id: sectorId,
    });
  };

  // Category tabs
  const [activeCat, setActiveCat] = useState(() => {
    try { return new URL(window.location.href).searchParams.get('category') || 'full_time'; } catch { return 'full_time'; }
  });
  const tabs = [
    { key: 'full_time', label: 'Full time', count: categoryCounts.full_time ?? 0, params: { category: 'full_time' } },
    { key: 'part_time', label: 'Part time', count: categoryCounts.part_time ?? 0, params: { category: 'part_time' } },
    { key: 'internship', label: 'Internship', count: categoryCounts.internship ?? 0, params: { category: 'internship' } },
    { key: 'scholarship', label: 'Scholarship', count: categoryCounts.scholarship ?? 0, params: { category: 'scholarship' } },
    { key: 'tender', label: 'Tender', count: categoryCounts.tender ?? 0, params: { category: 'tender' } },
  ];
  const goTab = async (t) => {
    setActiveCat(t.key);
    await loadJobs(t.params);
  };

  const prettyDate = (s) => {
    try { return new Date(s).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' }); } catch { return s; }
  };
  const renderKV = (label, value) => (
    <div key={label} className="flex items-start justify-between gap-3">
      <div className="text-[12px] font-medium text-gray-600">{label}</div>
      <div className="text-[13px] text-gray-800">{value}</div>
    </div>
  );

  const Countdown = ({ to }) => {
    const [now, setNow] = useState(Date.now());
    useEffect(() => {
      const id = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(id);
    }, []);
    const end = new Date(to).getTime();
    const diff = Math.max(0, Math.floor((end - now) / 1000));
    const days = Math.floor(diff / 86400);
    const hours = Math.floor((diff % 86400) / 3600);
    const mins = Math.floor((diff % 3600) / 60);
    const secs = diff % 60;
    const Box = ({v,label}) => (
      <div className="min-w-[56px] rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-center">
        <div className="text-base font-bold text-blue-700 tabular-nums">{String(v).padStart(2,'0')}</div>
        <div className="text-[10px] uppercase tracking-wide text-blue-700/80">{label}</div>
      </div>
    );
    return (
      <div className="flex items-center gap-2">
        <Box v={days} label="Days" />
        <Box v={hours} label="Hours" />
        <Box v={mins} label="Mins" />
        <Box v={secs} label="Seconds" />
      </div>
    );
  };

  const hero = (
      <section className="relative overflow-hidden bg-[#0f88c7]">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="min-h-[220px] flex flex-col items-center justify-center text-center">
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-wide text-white uppercase">Welcome to Ishakiro Job Solution</h1>
            <p className="mt-2 text-white/90 text-base max-w-3xl">Find your next opportunity by title, category and location across Rwanda.</p>
            <form onSubmit={submitSearch} className="mt-6 w-full max-w-5xl grid gap-3 bg-white p-3 rounded-xl shadow-xl ring-1 ring-black/5 md:grid-cols-2 lg:grid-cols-6">
                <input placeholder="Keyword" value={q} onChange={e=>setQ(e.target.value)} className="lg:col-span-2 rounded-md border-gray-300 focus:border-emerald-400 focus:ring focus:ring-emerald-200/60" />
                <select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-md border-gray-300 focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
                  <option value="">All categories</option>
                  {categories.map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
                </select>
                <select value={provinceId} onChange={e=>setProvinceId(e.target.value)} className="rounded-md border-gray-300 focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
                  <option value="">Province</option>
                  {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select value={districtId} onChange={e=>setDistrictId(e.target.value)} disabled={!provinceId} className="rounded-md border-gray-300 disabled:bg-gray-50 disabled:text-gray-400 focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
                  <option value="">{provinceId ? 'District' : 'Select province first'}</option>
                  {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <select value={sectorId} onChange={e=>setSectorId(e.target.value)} disabled={!districtId} className="rounded-md border-gray-300 disabled:bg-gray-50 disabled:text-gray-400 focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
                  <option value="">{districtId ? 'Sector' : 'Select district first'}</option>
                  {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <button className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-[#0f88c7] ring-1 ring-[#0f88c7]/30 hover:bg-[#f0f8ff]">Search</button>
              </form>
            
          </div>
        </div>
      </section>
  );

  return (
    <PublicLayout title="Welcome" hero={hero} hideDashboard={true} largeLogo={true}>
      

      

      

      

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="mb-6 text-2xl font-semibold text-gray-900 text-center">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white">1</div>
              <div className="font-semibold text-gray-900 text-base md:text-lg">Create an account</div>
            </div>
            <p className="mt-2 text-sm md:text-base text-gray-700">Open your account to access all features.</p>
            <div className="mt-3">
              <Link href={route('register')} className="text-sm font-medium text-emerald-700 hover:text-emerald-800">Create account →</Link>
            </div>
          </div>
          <div className="rounded-xl border border-sky-100 bg-sky-50/70 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-600 text-white">2</div>
              <div className="font-semibold text-gray-900 text-base md:text-lg">Sign in</div>
            </div>
            <p className="mt-2 text-sm md:text-base text-gray-700">Log in to manage your profile and applications.</p>
            <div className="mt-3">
              <Link href={route('login')} className="text-sm font-medium text-emerald-700 hover:text-emerald-800">Login →</Link>
            </div>
          </div>
          <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600 text-white">3</div>
              <div className="font-semibold text-gray-900 text-base md:text-lg">Complete your profile</div>
            </div>
            <p className="mt-2 text-sm md:text-base text-gray-700">Fill in education, languages and references to strengthen your application.</p>
            <div className="mt-3">
              {auth?.user ? (
                <Link href={route('profile.complete.show')} className="text-sm font-medium text-emerald-700 hover:text-emerald-800">Go to profile →</Link>
              ) : (
                <Link href={route('register')} className="text-sm font-medium text-emerald-700 hover:text-emerald-800">Create profile →</Link>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/70 p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fuchsia-600 text-white">4</div>
              <div className="font-semibold text-gray-900 text-base md:text-lg">Apply for jobs</div>
            </div>
            <p className="mt-2 text-sm md:text-base text-gray-700">Read the job details carefully and apply when ready.</p>
            <div className="mt-3">
              <Link href={route('jobs.index')} className="text-sm font-medium text-emerald-700 hover:text-emerald-800">Browse jobs →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12">
        <div className="mb-2 text-center">
          <h2 className="text-xl font-semibold text-gray-900">Latest jobs</h2>
        </div>
        {/* Category tabs with counts */}
        <div className="mb-4 flex flex-wrap items-center justify-center gap-4 border-b border-emerald-600/30 pb-2">
          {tabs.map(t => (
            <button
              key={t.key}
              type="button"
              onClick={() => goTab(t)}
              className={`inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 ${activeCat===t.key ? 'border-b-2 border-emerald-600 pb-1 font-semibold' : ''}`}
            >
              <span>{t.label}</span>
              <span className="inline-flex min-w-[34px] items-center justify-center rounded-full bg-black px-2 py-0.5 text-[11px] font-semibold text-white">{t.count}</span>
            </button>
          ))}
        </div>
        <div className="space-y-4">
          {list?.data?.map(j => (
            <div key={j.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <Link href={route('jobs.show', { job: j.id })} className="text-base font-semibold text-blue-700 hover:underline">
                    {j.title}
                  </Link>
                  <div className="text-sm text-gray-700 mt-0.5">{j.company}</div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[13px]">
                    {j.department && <span className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-0.5 text-gray-700">
                      <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l9 4v6c0 5-4 9-9 10-5-1-9-5-9-10V6l9-4z"/></svg>
                      <span>{j.department}</span>
                    </span>}
                    <span className="inline-flex items-center gap-1 rounded border border-gray-200 px-2 py-0.5 text-gray-700 capitalize">{j.category?.replace('_',' ')}</span>
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a7 7 0 00-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z"/></svg>
                      {[j.province, j.district, j.sector].filter(Boolean).join(', ')}
                    </span>
                  </div>
                  <div className="mt-3 grid gap-3 text-[12px] text-gray-600 sm:flex sm:items-center">
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 15H5V10h14v9z"/></svg>
                      <span>Posted on</span>
                      <span className="ml-1 font-medium">{prettyDate(j.created_at)}</span>
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2zm0 15H5V10h14v9z"/></svg>
                      <span>Deadline</span>
                      <span className="ml-1 font-medium">{prettyDate(j.deadline)}</span>
                    </span>
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
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-gray-500">No jobs found.</div>
          )}
        </div>

        {list?.links && (
          <div className="mt-4 flex items-center justify-end gap-2">
            {list.links.map((l,i) => (
              <button key={i} disabled={!l.url} onClick={async ()=>{ if(l.url){ const res = await fetch(l.url.replace(window.location.origin,'')); const data = await res.json(); setList(data);} }} className={`rounded-md px-3 py-1.5 text-sm ${l.active ? 'bg-emerald-600 text-white' : (l.url ? 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50' : 'bg-gray-100 text-gray-400')}`} dangerouslySetInnerHTML={{ __html: l.label }} />
            ))}
          </div>
        )}

        {/* Result popup */}
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

        {/* Job details/apply modal */}
        {showModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={()=>setShowModal(false)}>
            <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl" onClick={e=>e.stopPropagation()}>
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
                      {/* Extra key details if available */}
                      <div className="mt-4 grid gap-2">
                        {modalJob.level && renderKV('Level', modalJob.level)}
                        {modalJob.positions && renderKV('Positions', modalJob.positions)}
                        {modalJob.contract_type && renderKV('Contract type', modalJob.contract_type)}
                        {modalJob.employment_type && renderKV('Employment type', modalJob.employment_type)}
                        {modalJob.salary && renderKV('Salary', modalJob.salary)}
                        {modalJob.salary_range && renderKV('Salary range', modalJob.salary_range)}
                        {modalJob.email && renderKV('Email', modalJob.email)}
                        {modalJob.phone && renderKV('Phone', modalJob.phone)}
                        {modalJob.website && renderKV('Website', modalJob.website)}
                      </div>
                    </div>

                    {/* Descriptions/sections if present */}
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
                        <button disabled={applyState.sending} onClick={() => { const isAuth = !!auth?.user; setModalStage(isAuth ? 'apply' : 'login'); setInnerOpen(true); }} className={`rounded-md px-3 py-1.5 text-sm text-white ${applyState.sending ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>Apply now</button>
                      </div>
                    )}
                    {modalStage === 'details' && modalJob.applied && (
                      <div className="flex items-center justify-end">
                        <span className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white">Already applied</span>
                      </div>
                    )}
                  </div>
                )}
                {!modalLoading && !modalJob && (
                  <div className="py-10 text-center text-gray-500">Job not found.</div>
                )}
              </div>

              {innerOpen && (
                <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/40 p-4" onClick={()=>setInnerOpen(false)}>
                  <div className="w-full max-w-xl rounded-xl bg-white p-4 shadow-xl" onClick={e=>e.stopPropagation()}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="text-sm font-semibold text-gray-900">{modalStage === 'apply' ? 'Submit application' : 'Login required'}</div>
                      <button onClick={()=>setInnerOpen(false)} className="rounded p-1 text-gray-500 hover:bg-gray-100">✕</button>
                    </div>
                    {modalStage === 'apply' ? (
                      <div>
                        <div className="mb-2 text-sm text-gray-700">Add your motivation letter for <span className="font-semibold">{modalJob?.title}</span>.</div>
                        <textarea value={motivation} onChange={e=>setMotivation(e.target.value)} rows={6} className="w-full rounded-md border-gray-300 bg-white text-gray-900 placeholder-gray-400 focus:border-emerald-400 focus:ring focus:ring-emerald-200/60" placeholder="Write your motivation letter here…" />
                        {applyState.error && <div className="mt-2 text-sm text-red-600">{applyState.error}</div>}
                        <div className="mt-3 flex items-center justify-end gap-2">
                          <button disabled={applyState.sending} onClick={()=>setInnerOpen(false)} className={`rounded-md px-3 py-1.5 text-sm ring-1 ring-gray-200 ${applyState.sending ? 'opacity-60' : 'hover:bg-gray-50'}`}>Cancel</button>
                          <button onClick={submitApplication} disabled={applyState.sending || !motivation.trim()} className={`rounded-md px-3 py-1.5 text-sm text-white ${applyState.sending || !motivation.trim() ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}`}>{applyState.sending ? 'Submitting…' : 'Submit'}</button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="text-sm text-gray-700">Please log in to apply. You only need to add your motivation letter. We already have your profile details.</div>
                        <div className="mt-3 flex items-center gap-2">
                          <Link href={route('login')} className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700">Login</Link>
                          <Link href={route('register')} className="rounded-md px-3 py-1.5 text-sm ring-1 ring-emerald-600 text-emerald-700 hover:bg-emerald-50">Register</Link>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Newsletter subscribe banner */}
        <SubscribeBanner />
      </section>
    </PublicLayout>
  );
}

function SubscribeBanner() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const submit = (e) => {
    e?.preventDefault?.();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setSent(true);
  };
  return (
    <div className="mt-10 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-lg font-semibold">Subscribe to our news</div>
          <div className="text-white/90 text-sm">Get the latest jobs, tenders and updates straight to your inbox.</div>
        </div>
        <form onSubmit={submit} className="flex w-full max-w-md items-center gap-2">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e)=>setEmail(e.target.value)}
            className="flex-1 rounded-md border-0 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-300"
          />
          <button type="submit" disabled={sent || !email} className={`rounded-md px-4 py-2 font-semibold shadow ${sent ? 'bg-white/30 text-white cursor-not-allowed' : 'bg-white text-emerald-700 hover:bg-emerald-50'}`}>
            {sent ? 'Subscribed' : 'Subscribe'}
          </button>
        </form>
      </div>
      <div className="mt-2 text-xs text-white/80">We respect your privacy. Unsubscribe at any time.</div>
    </div>
  );
}
