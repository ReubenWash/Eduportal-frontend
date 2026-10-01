import { useState, useEffect, useMemo } from 'react';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import SlideOver from '../../components/ui/SlideOver';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import FileUpload from '../../components/common/FileUpload';
import { useToast } from '../../context/ToastContext';
import {
  getDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
  bulkDeleteDocuments,
  DOCUMENT_CATEGORIES,
} from '../../api/documentsApi';
import { getStudents } from '../../api/studentsApi';
import { getStaff } from '../../api/staffApi';
import { getGuardians } from '../../api/guardiansApi';
import { Search, Upload, Trash2, Download, Pencil, FileText, Image as ImageIcon, File as FileIcon } from 'lucide-react';

const LINK_TYPES = [
  { value: 'student', label: 'Student' },
  { value: 'staff', label: 'Staff' },
  { value: 'guardian', label: 'Guardian' },
];

const EMPTY_FORM = { file: null, category: '', linkType: '', linkId: '' };

function formatSize(bytes) {
  if (!bytes && bytes !== 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIconFor(mimeType) {
  if (!mimeType) return FileIcon;
  if (mimeType.startsWith('image/')) return ImageIcon;
  if (mimeType === 'application/pdf') return FileText;
  return FileIcon;
}

// A document can be linked to a student, staff member, or guardian (or none).
// This reads whichever one is populated and returns a display name + badge.
function linkedTo(doc) {
  if (doc.student) return { type: 'Student', name: doc.student.name || `${doc.student.firstName || ''} ${doc.student.lastName || ''}`.trim() };
  if (doc.staff) return { type: 'Staff', name: `${doc.staff.firstName || ''} ${doc.staff.lastName || ''}`.trim() };
  if (doc.guardian) return { type: 'Guardian', name: doc.guardian.name || `${doc.guardian.firstName || ''} ${doc.guardian.lastName || ''}`.trim() };
  return null;
}

export default function Documents() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editModal, setEditModal] = useState(null); // document being re-categorized
  const [editCategory, setEditCategory] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null); // single doc, or 'bulk'
  const [keyword, setKeyword] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selected, setSelected] = useState(new Set());

  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // Loaded lazily once the form's "link to" type is chosen, so we don't
  // fetch every student/staff/guardian on every page load.
  const [linkOptions, setLinkOptions] = useState([]);
  const [loadingLinkOptions, setLoadingLinkOptions] = useState(false);

  const { addToast } = useToast();

  const load = () => {
    setLoading(true);
    getDocuments()
      .then((d) => setData(Array.isArray(d) ? d : []))
      .catch(() => addToast('Failed to load documents', 'error'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return data.filter((doc) => {
      const matchesKeyword = !keyword
        || doc.originalName?.toLowerCase().includes(keyword.toLowerCase())
        || linkedTo(doc)?.name?.toLowerCase().includes(keyword.toLowerCase());
      const matchesCategory = !categoryFilter || doc.category === categoryFilter;
      return matchesKeyword && matchesCategory;
    });
  }, [data, keyword, categoryFilter]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setLinkOptions([]);
    setDrawerOpen(true);
  };

  const handleLinkTypeChange = async (e) => {
    const linkType = e.target.value;
    setForm({ ...form, linkType, linkId: '' });
    if (!linkType) { setLinkOptions([]); return; }

    setLoadingLinkOptions(true);
    try {
      if (linkType === 'student') {
        const students = await getStudents();
        setLinkOptions(students.map((s) => ({ value: s.id, label: `${s.name} (${s.studentNo})` })));
      } else if (linkType === 'staff') {
        const staff = await getStaff();
        setLinkOptions((Array.isArray(staff) ? staff : []).map((s) => ({
          value: s.id,
          label: `${s.firstName} ${s.lastName}`.trim(),
        })));
      } else if (linkType === 'guardian') {
        const guardians = await getGuardians();
        setLinkOptions(guardians.map((g) => ({ value: g.id, label: g.name })));
      }
    } catch {
      addToast('Failed to load list', 'error');
      setLinkOptions([]);
    } finally {
      setLoadingLinkOptions(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.file) {
      addToast('Please choose a file to upload', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = { file: form.file, category: form.category || undefined };
      if (form.linkType === 'student') payload.studentId = form.linkId;
      if (form.linkType === 'staff') payload.staffId = form.linkId;
      if (form.linkType === 'guardian') payload.guardianId = form.linkId;

      await uploadDocument(payload);
      addToast('Document uploaded successfully', 'success');
      setDrawerOpen(false);
      setSelected(new Set());
      load();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to upload document';
      addToast(message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (doc) => {
    setEditModal(doc);
    setEditCategory(doc.category || '');
  };

  const handleSaveEdit = async () => {
    try {
      await updateDocument(editModal.id, { category: editCategory });
      addToast('Document updated', 'success');
      setEditModal(null);
      load();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to update document';
      addToast(message, 'error');
    }
  };

  const confirmDelete = async () => {
    try {
      if (deleteTarget === 'bulk') {
        const result = await bulkDeleteDocuments([...selected]);
        addToast(`${result.deletedCount} document(s) deleted`, 'success');
        setSelected(new Set());
      } else {
        await deleteDocument(deleteTarget.id);
        addToast('Document deleted', 'success');
      }
      setDeleteTarget(null);
      load();
    } catch (err) {
      const message = err?.response?.data?.message || 'Failed to delete';
      addToast(message, 'error');
      setDeleteTarget(null);
    }
  };

  const toggleSelected = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelected((prev) => (prev.size === filtered.length ? new Set() : new Set(filtered.map((d) => d.id))));
  };

  return (
    <div>
      <PageHeader
        title="Documents"
        subtitle="Birth certificates, IDs, and other files for students, staff, and guardians"
        action={
          <>
            {selected.size > 0 && (
              <Button variant="danger" icon={Trash2} onClick={() => setDeleteTarget('bulk')}>
                Delete {selected.size} selected
              </Button>
            )}
            <Button onClick={openCreate} icon={Upload}>Add Document</Button>
          </>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-xs flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by file name or linked person..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all"
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
            placeholder="All categories"
            className="w-full sm:w-56"
          />
        </div>

        <Table
          loading={loading}
          data={filtered}
          emptyMessage="No documents found"
          columns={[
            {
              header: (
                <input
                  type="checkbox"
                  checked={filtered.length > 0 && selected.size === filtered.length}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300"
                />
              ),
              key: '_select',
              render: (_, row) => (
                <input
                  type="checkbox"
                  checked={selected.has(row.id)}
                  onChange={() => toggleSelected(row.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded border-gray-300"
                />
              ),
            },
            {
              header: 'File',
              key: 'originalName',
              render: (v, row) => {
                const Icon = fileIconFor(row.mimeType);
                return (
                  <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate max-w-[220px]">{v}</p>
                      <p className="text-[11px] text-gray-500">{formatSize(row.size)}</p>
                    </div>
                  </div>
                );
              },
            },
            {
              header: 'Category',
              key: 'category',
              render: (v) => v ? <Badge variant="info">{v}</Badge> : <span className="text-gray-400">—</span>,
            },
            {
              header: 'Linked To',
              key: '_linked',
              render: (_, row) => {
                const link = linkedTo(row);
                if (!link) return <span className="text-gray-400">—</span>;
                return (
                  <div>
                    <p className="text-sm text-gray-700">{link.name}</p>
                    <p className="text-[11px] text-gray-500">{link.type}</p>
                  </div>
                );
              },
            },
            {
              header: 'Uploaded By',
              key: 'uploadedBy',
              render: (v) => <span className="text-gray-600">{v || '—'}</span>,
            },
            {
              header: 'Date',
              key: 'createdAt',
              render: (v) => <span className="text-gray-500">{v ? new Date(v).toLocaleDateString() : '—'}</span>,
            },
          ]}
          rowActions={(row) => (
            <>
              <a
                href={row.url}
                target="_blank"
                rel="noreferrer"
                download={row.originalName}
                className="flex items-center gap-1.5 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1.5 rounded-md transition-colors"
              >
                <Download className="h-3.5 w-3.5" /> Download
              </a>
              <button
                onClick={() => openEdit(row)}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-700 hover:bg-gray-50 px-2.5 py-1.5 rounded-md transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" /> Edit
              </button>
              <button
                onClick={() => setDeleteTarget(row)}
                className="flex items-center gap-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2.5 py-1.5 rounded-md transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </button>
            </>
          )}
        />
      </div>

      {/* Add Document */}
      <SlideOver
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Add Document"
        subtitle="Upload a file and optionally link it to a student, staff member, or guardian."
      >
        <form onSubmit={handleSave} className="space-y-4">
          <FileUpload
            label="File"
            onFileSelect={(file) => setForm({ ...form, file })}
          />
          {form.file && (
            <p className="text-xs text-gray-500 -mt-2">Selected: {form.file.name} ({formatSize(form.file.size)})</p>
          )}

          <Select
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            options={DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
            placeholder="Select a category (optional)..."
          />

          <Select
            label="Link to"
            value={form.linkType}
            onChange={handleLinkTypeChange}
            options={LINK_TYPES}
            placeholder="Not linked to anyone (optional)"
          />

          {form.linkType && (
            <Select
              label={`Select ${LINK_TYPES.find((t) => t.value === form.linkType)?.label}`}
              value={form.linkId}
              onChange={(e) => setForm({ ...form, linkId: e.target.value })}
              options={linkOptions}
              placeholder={loadingLinkOptions ? 'Loading...' : 'Choose...'}
              disabled={loadingLinkOptions}
            />
          )}

          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setDrawerOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Uploading…' : 'Upload Document'}</Button>
          </div>
        </form>
      </SlideOver>

      {/* Edit category */}
      <Modal isOpen={!!editModal} onClose={() => setEditModal(null)} title="Edit Document" subtitle={editModal?.originalName}>
        <div className="space-y-4 pt-2">
          <Select
            label="Category"
            value={editCategory}
            onChange={(e) => setEditCategory(e.target.value)}
            options={DOCUMENT_CATEGORIES.map((c) => ({ value: c, label: c }))}
            placeholder="No category"
          />
          <div className="flex justify-end gap-3 pt-4 mt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        message={
          deleteTarget === 'bulk'
            ? `Are you sure you want to delete ${selected.size} selected document(s)? This cannot be undone.`
            : `Are you sure you want to delete "${deleteTarget?.originalName}"? This cannot be undone.`
        }
      />
    </div>
  );
}