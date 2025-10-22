import AdminLayout from '@/Layouts/AdminLayout';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function Create() {
  const { provinces = [], departments = [] } = usePage().props;
  const { data, setData, post, processing, errors, transform } = useForm({
    title: '',
    description: '',
    department_id: '',
    province_id: '',
    district_id: '',
    sector_id: '',
    logo: null,
    
  });
  const [districts, setDistricts] = useState([]);
  const [sectors, setSectors] = useState([]);

  useEffect(() => {
    if (data.province_id) {
      fetch(`${route('locations.districts')}?province_id=${data.province_id}`)
        .then(r => r.json()).then(json => { setDistricts(json); setData('district_id',''); setSectors([]); setData('sector_id',''); });
    }
  }, [data.province_id]);

  useEffect(() => {
    if (data.district_id) {
      fetch(`${route('locations.sectors')}?district_id=${data.district_id}`)
        .then(r => r.json()).then(json => { setSectors(json); setData('sector_id',''); });
    }
  }, [data.district_id]);

  const submit = (e) => {
    e.preventDefault();
    post(route('admin.companies.store'), { forceFormData: true });
  };

  return (
    <AdminLayout title="New Company">
      <Head title="New Company" />
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Create Company</h1>
        <Link href={route('admin.companies.index')} className="rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">Back</Link>
      </div>

      <form onSubmit={submit} encType="multipart/form-data" className="rounded-2xl bg-white p-6 shadow">
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-900">Title</label>
            <input value={data.title} onChange={e=>setData('title', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-emerald-500 focus:ring focus:ring-emerald-200/60" required />
            <p className="text-xs text-red-600">{errors.title}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900">Description</label>
            <textarea value={data.description} onChange={e=>setData('description', e.target.value)} rows={6} className="mt-1 block w-full rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm placeholder:text-gray-500 focus:border-emerald-500 focus:ring focus:ring-emerald-200/60" />
            <p className="text-xs text-red-600">{errors.description}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900">Department</label>
            <select value={data.department_id} onChange={e=>setData('department_id', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200/60 disabled:bg-white disabled:text-gray-500 disabled:opacity-100 disabled:cursor-not-allowed">
              <option value="">Select department</option>
              {departments.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
            </select>
            <p className="text-xs text-red-600">{errors.department_id}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900">Company Logo</label>
            <input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>setData('logo', e.target.files?.[0] || null)} className="mt-1 block w-full rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-emerald-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-emerald-700" />
            <p className="text-xs text-red-600">{errors.logo}</p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900">Location</label>
            <div className="mt-1 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs font-medium text-gray-700">Province</label>
                <select value={data.province_id} onChange={e=>setData('province_id', e.target.value)} className="mt-1 block w-full rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200/60" required>
                  <option value="">Select province</option>
                  {provinces.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}
                </select>
                <p className="text-xs text-red-600">{errors.province_id}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">District</label>
                <select value={data.district_id} onChange={e=>setData('district_id', e.target.value)} disabled={!districts.length} className="mt-1 block w-full rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200/60 disabled:bg-white disabled:text-gray-500 disabled:opacity-100 disabled:cursor-not-allowed" required>
                  <option value="">{districts.length ? 'Select district' : 'Select province first'}</option>
                  {districts.map(d => (<option key={d.id} value={d.id}>{d.name}</option>))}
                </select>
                <p className="text-xs text-red-600">{errors.district_id}</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Sector</label>
                <select value={data.sector_id} onChange={e=>setData('sector_id', e.target.value)} disabled={!sectors.length} className="mt-1 block w-full rounded-lg border border-gray-200 bg-white text-gray-900 shadow-sm focus:border-emerald-500 focus:ring focus:ring-emerald-200/60 disabled:bg-white disabled:text-gray-500 disabled:opacity-100 disabled:cursor-not-allowed" required>
                  <option value="">{sectors.length ? 'Select sector' : 'Select district first'}</option>
                  {sectors.map(s => (<option key={s.id} value={s.id}>{s.name}</option>))}
                </select>
                <p className="text-xs text-red-600">{errors.sector_id}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 pt-2">
            <Link href={route('admin.companies.index')} className="rounded-md px-3 py-2 text-sm text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50">Cancel</Link>
            <button type="submit" disabled={processing} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 disabled:opacity-60">{processing ? 'Saving…' : 'Save'}</button>
          </div>
        </div>
      </form>
    </AdminLayout>
  );
}
