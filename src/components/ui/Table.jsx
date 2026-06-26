import { Inbox } from 'lucide-react';

export default function Table({ columns = [], data = [], loading = false, emptyMessage = 'No records found', rowActions, onRowClick }) {
  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                {columns.map((col, i) => <th key={i} className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider">{col.header}</th>)}
                {rowActions && <th className="px-6 py-3.5" />}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {[1, 2, 3, 4, 5].map((r) => (
                <tr key={r}>
                  {columns.map((col, i) => (
                    <td key={i} className="px-6 py-4 whitespace-nowrap">
                      <div className="h-4 bg-gray-100 rounded w-full animate-pulse" />
                    </td>
                  ))}
                  {rowActions && <td className="px-6 py-4"><div className="h-4 w-8 bg-gray-100 rounded ml-auto animate-pulse" /></td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80">
            <tr>
              {columns.map((col, i) => (
                <th key={i} className="px-6 py-3.5 text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
                  {col.header}
                </th>
              ))}
              {rowActions && <th className="px-6 py-3.5 text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100">
            {data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (rowActions ? 1 : 0)} className="px-6 py-16 text-center">
                  <div className="mx-auto h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-3 border border-gray-100">
                    <Inbox className="h-5 w-5 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-900">{emptyMessage}</p>
                  <p className="text-xs text-gray-500 mt-1">Check back later or add a new record.</p>
                </td>
              </tr>
            ) : (
              data.map((row, rowIndex) => (
                <tr
                  key={row.id || rowIndex}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-gray-50' : 'hover:bg-gray-50/60'}`}
                >
                  {columns.map((col, colIndex) => (
                    <td key={colIndex} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                  {rowActions && (
                    <td
                      className="px-6 py-4 whitespace-nowrap text-right"
                      onClick={(e) => e.stopPropagation()} // prevent row click when clicking action
                    >
                      <div className="flex items-center justify-end gap-2">
                        {rowActions(row)}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}