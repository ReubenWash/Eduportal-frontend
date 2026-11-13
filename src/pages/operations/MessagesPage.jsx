import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Mail, Plus, Search, Send, Users, MessageSquare, CheckCheck } from 'lucide-react';

const mockMessages = [
  {
    id: 'MSG-001',
    recipientGroup: 'All Parents & Guardians',
    subject: 'Mid-term PTA General Meeting Notice',
    sender: 'School Administration Office',
    timestamp: 'Yesterday at 3:45 PM',
    channel: 'SMS + App Broadcast',
    deliveredCount: '342/350',
  },
  {
    id: 'MSG-002',
    recipientGroup: 'JHS 3 Parents',
    subject: 'BECE Registration Documents Submission Deadline',
    sender: 'Academic Directorate',
    timestamp: 'May 12, 2026',
    channel: 'SMS Alert',
    deliveredCount: '68/68',
  },
  {
    id: 'MSG-003',
    recipientGroup: 'All Teaching Staff',
    subject: 'End of Term Assessment Score Submissions',
    sender: 'Head of Academics',
    timestamp: 'May 10, 2026',
    channel: 'In-App Message',
    deliveredCount: '28/28',
  },
];

export default function MessagesPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Communications & Messaging Center"
          subtitle="Send direct SMS, push broadcasts, and announcements to parents, teachers, and students."
        />
        <div className="flex items-center gap-2">
          <Button variant="primary" className="gap-2">
            <Send className="h-4 w-4" /> Compose Message
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SMS Broadcast Credits</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">4,250 units</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Messages Dispatched</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">1,890</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Average Delivery Rate</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">99.2%</p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="py-3 px-4 text-left">Recipient Group</th>
              <th className="py-3 px-4 text-left">Subject / Preview</th>
              <th className="py-3 px-4 text-left">Sender</th>
              <th className="py-3 px-4 text-left">Channel</th>
              <th className="py-3 px-4 text-left">Sent Time</th>
              <th className="py-3 px-4 text-right">Delivery Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {mockMessages.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50/60 transition">
                <td className="py-3 px-4 font-bold text-gray-900">{m.recipientGroup}</td>
                <td className="py-3 px-4 text-gray-700 font-medium">{m.subject}</td>
                <td className="py-3 px-4 text-xs text-gray-500">{m.sender}</td>
                <td className="py-3 px-4">
                  <Badge variant="info">{m.channel}</Badge>
                </td>
                <td className="py-3 px-4 text-xs text-gray-500">{m.timestamp}</td>
                <td className="py-3 px-4 text-right font-mono text-xs font-bold text-emerald-600">
                  <span className="inline-flex items-center gap-1">
                    <CheckCheck className="h-3.5 w-3.5" /> {m.deliveredCount}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

