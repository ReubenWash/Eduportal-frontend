import PageHeader from '../../components/common/PageHeader';
import { Image, Upload, Folder, Search } from 'lucide-react';
import Button from '../../components/ui/Button';

export default function AdminMedia() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="File & Media Manager"
        subtitle="Manage all uploaded assets across the platform."
        action={
          <Button icon={Upload}>Upload File</Button>
        }
      />
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Folder className="h-5 w-5 text-indigo-500" />
            <span>Root / Images / Logos</span>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Search media..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500" />
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
             <div key={i} className="border border-gray-200 rounded-lg p-2 flex flex-col items-center gap-2 cursor-pointer hover:bg-gray-50">
               <div className="h-24 w-full bg-gray-100 rounded flex items-center justify-center text-gray-400">
                 <Image className="h-8 w-8" />
               </div>
               <span className="text-xs text-gray-600 truncate w-full text-center">asset-{i}.png</span>
             </div>
          ))}
        </div>
      </div>
    </div>
  );
}
