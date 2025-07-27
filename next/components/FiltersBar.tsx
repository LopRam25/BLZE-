import Link from 'next/link';

interface Props {
  active?: string;
  searchParams: Record<string, string | string[] | undefined>;
}

/**
 * Server-rendered filter bar. Each chip is an actual link with query params so it
 * works when JS is disabled.
 */
export default function FiltersBar({ active = 'All', searchParams }: Props) {
  const categories = ['All', 'Sativa', 'Indica', 'Hybrid'];

  const hrefFor = (cat: string) => {
    const params = new URLSearchParams(searchParams as any);
    if (cat === 'All') {
      params.delete('type');
    } else {
      params.set('type', cat);
    }
    return `/?${params.toString()}`;
  };

  return (
    <div className="flex space-x-2 overflow-x-auto pb-2 mb-4">
      {categories.map((cat) => (
        <Link
          key={cat}
          href={hrefFor(cat)}
          className={`whitespace-nowrap px-4 py-1 rounded-full border text-sm transition-colors duration-150 ${
            active === cat
              ? 'bg-green-600 text-white border-green-600'
              : 'bg-white text-gray-800'
          }`}
        >
          {cat}
        </Link>
      ))}
    </div>
  );
}