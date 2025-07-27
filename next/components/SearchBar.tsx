"use client";
import { useState } from 'react';

export default function SearchBar({ onChange }: { onChange: (val: string) => void }) {
  const [query, setQuery] = useState('');

  return (
    <input
      type="search"
      value={query}
      onChange={(e) => {
        setQuery(e.target.value);
        onChange(e.target.value);
      }}
      placeholder="Search strains..."
      className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none mb-4"
    />
  );
}