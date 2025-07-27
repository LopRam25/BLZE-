"use client";
import { useState } from 'react';

interface Props {
  onChange: (filter: string) => void;
}

export default function FiltersBar({ onChange }: Props) {
  const categories = ['All', 'Sativa', 'Indica', 'Hybrid'];
  const [active, setActive] = useState('All');

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => {
            setActive(cat);
            onChange(cat);
          }}
          className={`whitespace-nowrap px-4 py-1 rounded-full border transition-colors duration-150 ${
            active === cat
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-800'
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}