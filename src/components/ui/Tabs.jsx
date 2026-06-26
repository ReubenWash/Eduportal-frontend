import { useState } from 'react';

export default function Tabs({ tabs = [] }) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex gap-4">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className={`pb-3 px-1 border-b-2 text-sm font-medium transition-colors ${active === i ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
      <div>{tabs[active]?.content}</div>
    </div>
  );
}