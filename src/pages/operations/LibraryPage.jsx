import { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Library, Plus, Search, BookOpen, UserCheck, Clock, CheckCircle } from 'lucide-react';

const mockBooks = [
  {
    id: 'BK-101',
    title: 'Things Fall Apart',
    author: 'Chinua Achebe',
    category: 'African Literature',
    copiesTotal: 25,
    copiesAvailable: 8,
    isbn: '978-0385474542',
  },
  {
    id: 'BK-102',
    title: 'Integrated Science for JHS (Pupil Book 1-3)',
    author: 'Ghana Ministry of Education',
    category: 'Science & Technology',
    copiesTotal: 60,
    copiesAvailable: 14,
    isbn: '978-9988123456',
  },
  {
    id: 'BK-103',
    title: 'Concise Mathematics with Worked Examples',
    author: 'J. K. Mensah',
    category: 'Mathematics',
    copiesTotal: 40,
    copiesAvailable: 22,
    isbn: '978-9988654321',
  },
];

export default function LibraryPage() {
  const [search, setSearch] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader
          title="Library & Learning Resources"
          subtitle="Catalog books, monitor borrowings, manage returns, and track inventory."
        />
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <UserCheck className="h-4 w-4" /> Issue Book
          </Button>
          <Button variant="primary" className="gap-2">
            <Plus className="h-4 w-4" /> Add Book to Catalog
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Catalog Volumes</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">1,480</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Currently Borrowed</p>
          <p className="text-2xl font-bold text-indigo-600 mt-1">142</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Overdue Returns</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">9</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active Student Borrowers</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">118</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by title, author, or ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 text-xs sm:text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
            <tr>
              <th className="py-3 px-4 text-left">Book Title & Author</th>
              <th className="py-3 px-4 text-left">Category</th>
              <th className="py-3 px-4 text-left">ISBN</th>
              <th className="py-3 px-4 text-center">Total Copies</th>
              <th className="py-3 px-4 text-center">Available</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {mockBooks.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50/60 transition">
                <td className="py-3 px-4 font-medium text-gray-900">
                  {b.title}
                  <span className="block text-xs text-gray-400 font-normal">{b.author}</span>
                </td>
                <td className="py-3 px-4 text-xs text-gray-600">{b.category}</td>
                <td className="py-3 px-4 font-mono text-xs text-gray-500">{b.isbn}</td>
                <td className="py-3 px-4 text-center font-semibold text-gray-800">{b.copiesTotal}</td>
                <td className="py-3 px-4 text-center">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    b.copiesAvailable > 5 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {b.copiesAvailable} in stock
                  </span>
                </td>
                <td className="py-3 px-4 text-right">
                  <Button variant="ghost" size="sm" className="text-indigo-600">
                    Details
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

