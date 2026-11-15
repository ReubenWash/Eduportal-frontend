import { useCallback, useEffect, useMemo, useState } from 'react';
import { Bus, MapPin, Plus, Search, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { useToast } from '../../context/ToastContext';
import { createTransportRoute, getTransportRoutes, updateTransportRoute } from '../../api/schoolOperationsApi';

const EMPTY_FORM = {
  name: '',
  vehiclePlate: '',
  driverName: '',
  driverPhone: '',
  stopCount: '0',
  capacity: '0',
  status: 'ACTIVE',
};

const statusVariant = (status) => {
  if (status === 'ACTIVE') return 'success';
  if (status === 'MAINTENANCE') return 'warning';
  return 'default';
};

export default function TransportPage() {
  const [routes, setRoutes] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const loadRoutes = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setRoutes(await getTransportRoutes());
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load transport routes.';
      setLoadError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { loadRoutes(); }, [loadRoutes]);

  const filteredRoutes = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return routes;
    return routes.filter((route) =>
      [route.name, route.vehiclePlate, route.driverName].some((value) => String(value || '').toLowerCase().includes(term))
    );
  }, [routes, search]);

  const openNewRoute = () => {
    setForm(EMPTY_FORM);
    setEditingId('');
    setFormOpen(true);
  };

  const openEditRoute = (route) => {
    setForm({
      name: route.name || '',
      vehiclePlate: route.vehiclePlate || '',
      driverName: route.driverName || '',
      driverPhone: route.driverPhone || '',
      stopCount: String(route.stopCount ?? 0),
      capacity: String(route.capacity ?? 0),
      status: route.status || 'ACTIVE',
    });
    setEditingId(route.id);
    setFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        stopCount: Number(form.stopCount),
        capacity: Number(form.capacity),
      };
      if (editingId) {
        await updateTransportRoute(editingId, payload);
        addToast('Transport route updated.', 'success');
      } else {
        await createTransportRoute(payload);
        addToast('Transport route created.', 'success');
      }
      setFormOpen(false);
      setEditingId('');
      setForm(EMPTY_FORM);
      await loadRoutes();
    } catch (error) {
      addToast(error.response?.data?.message || 'Unable to save this route.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const changeStatus = async (route, status) => {
    try {
      await updateTransportRoute(route.id, { status });
      setRoutes((current) => current.map((item) => item.id === route.id ? { ...item, status } : item));
    } catch (error) {
      addToast(error.response?.data?.message || 'Unable to update route status.', 'error');
    }
  };

  const activeRoutes = routes.filter((route) => route.status === 'ACTIVE').length;
  const maintenanceRoutes = routes.filter((route) => route.status === 'MAINTENANCE').length;
  const fleetCapacity = routes.reduce((total, route) => total + Number(route.capacity || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Transport & Bus Routes" subtitle="Maintain this school's vehicles, drivers, route stops, and capacity." />
        <Button variant="primary" className="gap-2" onClick={openNewRoute}>
          <Plus className="h-4 w-4" /> Add Route
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active Routes</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{activeRoutes}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">Fleet Capacity</p>
          <p className="mt-1 text-2xl font-bold text-indigo-600">{fleetCapacity}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-600">Routes in Maintenance</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{maintenanceRoutes}</p>
        </div>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-indigo-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{editingId ? 'Edit Route' : 'Add Transport Route'}</h2>
            <button type="button" className="text-gray-500 hover:text-gray-800" onClick={() => setFormOpen(false)} aria-label="Close form">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input required maxLength={160} placeholder="Route name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <Input maxLength={30} placeholder="Vehicle plate" value={form.vehiclePlate} onChange={(event) => setForm({ ...form, vehiclePlate: event.target.value })} />
            <Input maxLength={160} placeholder="Driver name" value={form.driverName} onChange={(event) => setForm({ ...form, driverName: event.target.value })} />
            <Input maxLength={40} placeholder="Driver phone" value={form.driverPhone} onChange={(event) => setForm({ ...form, driverPhone: event.target.value })} />
            <Input type="number" min="0" max="1000" placeholder="Number of stops" value={form.stopCount} onChange={(event) => setForm({ ...form, stopCount: event.target.value })} />
            <Input type="number" min="0" max="10000" placeholder="Vehicle capacity" value={form.capacity} onChange={(event) => setForm({ ...form, capacity: event.target.value })} />
            <select className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="ACTIVE">Active</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save Changes' : 'Create Route'}</Button>
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search routes, plates, drivers..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Route</th>
              <th className="px-4 py-3 text-left">Vehicle</th>
              <th className="px-4 py-3 text-left">Driver</th>
              <th className="px-4 py-3 text-center">Stops</th>
              <th className="px-4 py-3 text-center">Capacity</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td className="px-4 py-10 text-center text-gray-500" colSpan={7}>Loading routes...</td></tr>
            ) : loadError ? (
              <tr><td className="px-4 py-10 text-center text-red-600" colSpan={7}>{loadError}</td></tr>
            ) : filteredRoutes.length === 0 ? (
              <tr>
                <td className="px-4 py-12 text-center text-gray-500" colSpan={7}>
                  <Bus className="mx-auto mb-2 h-5 w-5 text-gray-400" />
                  {routes.length ? 'No routes match your search.' : 'No transport routes have been recorded.'}
                </td>
              </tr>
            ) : filteredRoutes.map((route) => (
              <tr key={route.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 font-semibold text-gray-900">
                  <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-indigo-500" />{route.name}</span>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-gray-600">{route.vehiclePlate || '—'}</td>
                <td className="px-4 py-3 text-gray-700">
                  {route.driverName || '—'}
                  {route.driverPhone && <span className="block text-xs text-gray-500">{route.driverPhone}</span>}
                </td>
                <td className="px-4 py-3 text-center text-gray-700">{route.stopCount}</td>
                <td className="px-4 py-3 text-center font-semibold text-gray-800">{route.capacity}</td>
                <td className="px-4 py-3"><Badge variant={statusVariant(route.status)}>{route.status}</Badge></td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => openEditRoute(route)}>Edit</Button>
                    <select
                      aria-label={`Set ${route.name} status`}
                      className="rounded border border-gray-300 bg-white px-2 py-1 text-xs"
                      value={route.status}
                      onChange={(event) => changeStatus(route, event.target.value)}
                    >
                      <option value="ACTIVE">Active</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="INACTIVE">Inactive</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
