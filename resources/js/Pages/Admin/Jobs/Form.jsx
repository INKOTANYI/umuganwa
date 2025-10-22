import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function JobForm() {
  const { job, companies = [], departments = [], provinces = [] } = usePage().props;
  const isEdit = !!job;
  const { data, setData, post, put, processing, errors, reset } = useForm({
    title: job?.title || '',
    description: job?.description || '',
    education_level: job?.education_level || '',
    qualifications: job?.qualifications || '',
    experience_years: job?.experience_years ?? '',
    company_id: job?.company_id || (companies[0]?.id || ''),
    department_id: job?.department_id || '',
    category: job?.category || 'full_time',
    deadline: job?.deadline || '',
    province_id: job?.province_id || '',
    district_id: job?.district_id || '',
    sector_id: job?.sector_id || '',
    
  });

  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    const loadDistricts = async () => {
      if (!data.province_id) { setDistricts([]); return; }
      try { const res = await fetch(route('locations.districts', { province_id: data.province_id })); const json = await res.json(); setDistricts(json || []); } catch {}
    };
    loadDistricts();
  }, [data.province_id]);

  useEffect(() => {
    const loadSectors = async () => {
      if (!data.district_id) { setSectors([]); return; }
      try { const res = await fetch(route('locations.sectors', { district_id: data.district_id })); const json = await res.json(); setSectors(json || []); } catch {}
    };
    loadSectors();
  }, [data.district_id]);

  const submit = (e) => {
    e.preventDefault();
    if (isEdit) {
      put(route('admin.jobs.update', { job: job.id }));
    } else {
      post(route('admin.jobs.store'));
    }
  };

  return (
    <AdminLayout title={isEdit ? 'Edit Job' : 'Create Job'}>
      <Head title={isEdit ? 'Edit Job' : 'Create Job'} />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">{isEdit ? 'Edit Job' : 'Create Job'}</h1>
        <Link href={route('admin.jobs.index')} className="text-emerald-600 hover:underline">Back to Jobs</Link>
      </div>

      <form onSubmit={submit} className="grid gap-4 rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input value={data.title} onChange={(e)=>setData('title', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60" />
          {errors.title && <div className="mt-1 text-xs text-red-600">{errors.title}</div>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Company</label>
          <select value={data.company_id} onChange={(e)=>setData('company_id', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
            <option value="">Select company</option>
            {companies.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
          {errors.company_id && <div className="mt-1 text-xs text-red-600">{errors.company_id}</div>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select value={data.category} onChange={(e)=>setData('category', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
            {['full_time','part_time','internship','scholarship','tender'].map(c => <option key={c} value={c}>{c.replace('_',' ')}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea rows={6} value={data.description} onChange={(e)=>setData('description', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60" />
          {errors.description && <div className="mt-1 text-xs text-red-600">{errors.description}</div>}
        </div>

        <div className="sm:col-span-2 rounded-lg border border-gray-100 bg-white/50 p-3">
          <div className="mb-2 text-sm font-semibold text-gray-900">Job qualifications</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <select value={data.department_id || ''} onChange={(e)=>setData('department_id', e.target.value || null)} className="mt-1 w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
                <option value="">—</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Education level</label>
              <select value={data.education_level} onChange={(e)=>setData('education_level', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60">
                <option value="">—</option>
                {['certificate','diploma','bachelors','masters','phd'].map(v => (
                  <option key={v} value={v}>{v.charAt(0).toUpperCase()+v.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Experience (years)</label>
              <input type="number" min="0" max="80" value={data.experience_years} onChange={(e)=>setData('experience_years', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60" />
            </div>
          </div>
        </div>

        

        <div>
          <label className="block text-sm font-medium text-gray-700">Deadline</label>
          <input type="date" value={data.deadline} onChange={(e)=>setData('deadline', e.target.value)} className="mt-1 w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60" />
          {errors.deadline && <div className="mt-1 text-xs text-red-600">{errors.deadline}</div>}
        </div>
        
        <div className="sm:col-span-2 rounded-lg border border-gray-100 bg-white/50 p-3">
          <div className="mb-2 text-sm font-semibold text-gray-900">Job location</div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Province</label>
              <select
                value={data.province_id || ''}
                onChange={(e)=>{ setData('province_id', e.target.value || null); setData('district_id', ''); setData('sector_id', ''); }}
                className="mt-1 w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm focus:border-emerald-400 focus:ring focus:ring-emerald-200/60"
              >
                <option value="">Select province</option>
                {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">District</label>
              <select
                value={data.district_id || ''}
                onChange={(e)=>{ setData('district_id', e.target.value || null); setData('sector_id', ''); }}
                disabled={!data.province_id}
                className="mt-1 w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm disabled:bg-gray-50 disabled:text-gray-400 focus:border-emerald-400 focus:ring focus:ring-emerald-200/60"
              >
                <option value="">{data.province_id ? 'Select district' : 'Select province first'}</option>
                {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Sector</label>
              <select
                value={data.sector_id || ''}
                onChange={(e)=>setData('sector_id', e.target.value || null)}
                disabled={!data.district_id}
                className="mt-1 w-full rounded-md border-gray-300 bg-white text-gray-900 shadow-sm disabled:bg-gray-50 disabled:text-gray-400 focus:border-emerald-400 focus:ring focus:ring-emerald-200/60"
              >
                <option value="">{data.district_id ? 'Select sector' : 'Select district first'}</option>
                {sectors.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
        </div>

        

        <div className="sm:col-span-2 flex items-center justify-end gap-2 pt-2">
          <Link href={route('admin.jobs.index')} className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Cancel</Link>
          <button type="submit" disabled={processing} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{isEdit ? 'Save changes' : 'Create job'}</button>
        </div>
      </form>
    </AdminLayout>
  );
}
