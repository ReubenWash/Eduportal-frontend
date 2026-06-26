import { useCallback, useState } from 'react';
import { Upload } from 'lucide-react';

export default function FileUpload({ label, accept, onFileSelect, preview, className = '' }) {
  const [isDragActive, setIsDragActive] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) onFileSelect(files[0]);
  }, [onFileSelect]);

  const handleChange = (e) => {
    const file = e.target.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <div className={className}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragActive(true); }}
        onDragLeave={() => setIsDragActive(false)}
        className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400'}`}
      >
        <input type="file" accept={accept} onChange={handleChange} className="hidden" id="file-upload" />
        {preview ? (
          <img src={preview} alt="Preview" className="mx-auto h-24 w-auto rounded-lg object-cover mb-2" />
        ) : (
          <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
        )}
        <label htmlFor="file-upload" className="cursor-pointer text-sm text-primary-600 hover:text-primary-500 font-medium">
          Click to upload or drag file
        </label>
      </div>
    </div>
  );
}