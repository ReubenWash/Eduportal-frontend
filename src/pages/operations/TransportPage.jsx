import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Bus, Plus, Search, MapPin, Phone, UserCheck, ShieldCheck } from 'lucide-react';

const mockRoutes = [
  {
    id: 'BUS-01',
    routeNumber: 'Route 1 - East Legon / Madina',
    vehiclePlate: 'GR 4210-24',
    driverName: 'Emmanuel Mensah',
    driverPhone: '+233 24 555 1201',
    stopsCount: 8,
    studentsRegistered: 34,
    capacity: 40,
    status: 'ACTIVE',
  },
  {
    id: 'BUS-02',
    routeNumber: 'Route 2 - Spintex / Sakumono',
    vehiclePlate: 'GE 7891-23',
    driverName: 'Kwabena Appiah',
    driverPhone: '+233 20 555 3490',
    stopsCount: 11,
    studentsRegistered: 38,
    capacity: 40,
    status: 'ACTIVE',
  },
  {
    id: 'BUS-03',
    routeNumber: 'Route 3 - Dansoman / Kaneshie',
    vehiclePlate: 'GW 1142-25',
    driverName: 'Isaac Quarshie',
    driverPhone: '+233 55 555 7712',
    stopsCount: 7,
    studentsRegistered: 28,
    capacity: 35,
    status: 'MAINTENANCE',
  },
];

export default function TransportPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Transport & Bus Fleet"
          subtitle="Manage school bus routes, drivers, student bus registrations, and schedules."
        />
        <div className="flex items-center gap-2">
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" /> Add Bus Route
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Active Bus Routes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">6</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Boarding Students</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">198</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Fleet Operational</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">5 / 6</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">In Service / Maintenance</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">1</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="py-3 px-4 text-left">Route & Details</th>
              <th className="py-3 px-4 text-left">Vehicle Plate</th>
              <th className="py-3 px-4 text-left">Driver & Contact</th>
              <th className="py-3 px-4 text-center">Stops</th>
              <th className="py-3 px-4 text-center">Occupancy</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {mockRoutes.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50/60 transition">
                <td className="py-3 px-4 font-bold text-gray-900">{r.routeNumber}</td>
                <td className="py-3 px-4 font-mono text-xs text-gray-700">{r.vehiclePlate}</td>
                <td className="py-3 px-4">
                  <p className="text-gray-900 font-medium">{r.driverName}</p>
                  <p className="text-xs text-gray-500">{r.driverPhone}</p>
                </td>
                <td className="py-3 px-4 text-center font-medium text-gray-700">{r.stopsCount} stops</td>
                <td className="py-3 px-4 text-center">
                  <span className="font-semibold text-gray-900">{r.studentsRegistered}</span>
                  <span className="text-xs text-gray-400">/{r.capacity}</span>
                </td>
                <td className="py-3 px-4">
                  <Badge variant={r.status === 'ACTIVE' ? 'success' : 'warning'}>
                    {r.status}
                  </Badge>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm" className="text-indigo-600">
                    Manifest
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

