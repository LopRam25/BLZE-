import FiltersBar from '../components/FiltersBar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';

async function getProducts() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || ''}/api/products`, {
      // revalidate every minute to keep menu fresh
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error('Failed');
    return res.json();
  } catch {
    return [] as any[];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <section>
      <h1 className="text-3xl font-extrabold mb-4">Menu</h1>
      <SearchBar onChange={() => {}} />
      <FiltersBar onChange={() => {}} />
      {products.length === 0 ? (
        <p className="text-center py-20 text-gray-600">
          No products found.{' '}
          <a href="tel:+18285551234" className="underline">
            Call now
          </a>{' '}
          for premium CBD delivery!
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </section>
  );
}