import { useCallback, useEffect, useMemo, useState } from 'react';
import { BookOpen, Library, Plus, Search, X } from 'lucide-react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { useToast } from '../../context/ToastContext';
import { createLibraryBook, getLibraryBooks, updateLibraryBook } from '../../api/schoolOperationsApi';

const EMPTY_FORM = { title: '', author: '', category: '', isbn: '', totalCopies: '1' };

export default function LibraryPage() {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const loadBooks = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setBooks(await getLibraryBooks());
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to load the library catalog.';
      setLoadError(message);
      addToast(message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { loadBooks(); }, [loadBooks]);

  const filteredBooks = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return books;
    return books.filter((book) =>
      [book.title, book.author, book.category, book.isbn].some((value) => String(value || '').toLowerCase().includes(term))
    );
  }, [books, search]);

  const openNewBook = () => {
    setEditingId('');
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEditBook = (book) => {
    setEditingId(book.id);
    setForm({
      title: book.title || '',
      author: book.author || '',
      category: book.category || '',
      isbn: book.isbn || '',
      totalCopies: String(book.totalCopies ?? 1),
    });
    setFormOpen(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const data = { ...form, totalCopies: Number(form.totalCopies) };
      if (editingId) {
        await updateLibraryBook(editingId, data);
        addToast('Book details updated.', 'success');
      } else {
        await createLibraryBook(data);
        addToast('Book added to the library.', 'success');
      }
      setFormOpen(false);
      setForm(EMPTY_FORM);
      setEditingId('');
      await loadBooks();
    } catch (error) {
      addToast(error.response?.data?.message || 'Unable to save this book.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const totalCopies = books.reduce((total, book) => total + Number(book.totalCopies || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader title="Library Catalog" subtitle="Manage the books and learning resources held by this school." />
        <Button variant="primary" className="gap-2" onClick={openNewBook}>
          <Plus className="h-4 w-4" /> Add Book
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Catalog Titles</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{books.length}</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Volumes</p>
          <p className="mt-1 text-2xl font-bold text-indigo-600">{totalCopies}</p>
        </div>
      </div>

      {formOpen && (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-indigo-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">{editingId ? 'Edit Book' : 'Add Book to Catalog'}</h2>
            <button type="button" className="text-gray-500 hover:text-gray-800" onClick={() => setFormOpen(false)} aria-label="Close form">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Input required maxLength={200} placeholder="Book title" value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
            <Input maxLength={160} placeholder="Author" value={form.author} onChange={(event) => setForm({ ...form, author: event.target.value })} />
            <Input maxLength={120} placeholder="Category" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} />
            <Input maxLength={40} placeholder="ISBN" value={form.isbn} onChange={(event) => setForm({ ...form, isbn: event.target.value })} />
            <Input required type="number" min="1" max="100000" placeholder="Total copies" value={form.totalCopies} onChange={(event) => setForm({ ...form, totalCopies: event.target.value })} />
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={saving}>{saving ? 'Saving...' : editingId ? 'Save Changes' : 'Add Book'}</Button>
            <Button type="button" variant="secondary" onClick={() => setFormOpen(false)}>Cancel</Button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input placeholder="Search title, author, ISBN..." value={search} onChange={(event) => setSearch(event.target.value)} className="pl-9" />
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Title & Author</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">ISBN</th>
              <th className="px-4 py-3 text-center">Volumes</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {loading ? (
              <tr><td className="px-4 py-10 text-center text-gray-500" colSpan={5}>Loading catalog...</td></tr>
            ) : loadError ? (
              <tr><td className="px-4 py-10 text-center text-red-600" colSpan={5}>{loadError}</td></tr>
            ) : filteredBooks.length === 0 ? (
              <tr>
                <td className="px-4 py-12 text-center text-gray-500" colSpan={5}>
                  <Library className="mx-auto mb-2 h-5 w-5 text-gray-400" />
                  {books.length ? 'No books match your search.' : 'No books have been added to the catalog.'}
                </td>
              </tr>
            ) : filteredBooks.map((book) => (
              <tr key={book.id} className="hover:bg-gray-50/60">
                <td className="px-4 py-3 font-medium text-gray-900">
                  {book.title}
                  {book.author && <span className="block text-xs font-normal text-gray-500">{book.author}</span>}
                </td>
                <td className="px-4 py-3 text-gray-600">{book.category || '—'}</td>
                <td className="px-4 py-3 font-mono text-xs text-gray-500">{book.isbn || '—'}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-500" /> {book.totalCopies}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEditBook(book)}>Edit</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
