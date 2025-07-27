import { Suspense } from 'react';

interface Props {
  defaultValue?: string;
}

/**
 * Server-rendered search bar that submits via GET so it works with JS disabled.
 */
export default function SearchBar({ defaultValue = '' }: Props) {
  return (
    <form className="mb-4" method="GET" role="search">
      <input
        type="search"
        name="q"
        defaultValue={defaultValue}
        placeholder="Search strains..."
        className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none"
        aria-label="Search menu"
      />
    </form>
  );
}