import FiltersBar from '../components/FiltersBar';
import SearchBar from '../components/SearchBar';
import ProductCard from '../components/ProductCard';
import JsonLd from '../components/JsonLd';
import { BASE_URL } from '../lib/constants';

export const metadata = {
  title: 'BLZE CBD Asheville NC | Premium Hemp Flower & Oil Delivery',
  description:
    'Fast, discreet CBD delivery in Asheville NC. Browse Sativa, Indica & Hybrid hemp flower plus CBD oil. Order now and receive in under 60 minutes.',
};

export const generateMetadata = () => ({
  alternates: {
    canonical: BASE_URL,
  },
});

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

interface PageProps {
  searchParams: { [key: string]: string | string[] | undefined };
}

export default async function HomePage({ searchParams }: PageProps) {
  const allProducts = await getProducts();

  const query = typeof searchParams.q === 'string' ? searchParams.q.toLowerCase() : '';
  const type = typeof searchParams.type === 'string' ? searchParams.type : 'All';

  const filtered = allProducts.filter((p: any) => {
    const matchesQuery = query ? p.name?.toLowerCase().includes(query) : true;
    const matchesType =
      type === 'All' ? true : p.category?.toLowerCase() === type.toLowerCase();
    return matchesQuery && matchesType;
  });

  return (
    <section>
      <h1 className="text-4xl font-extrabold mb-4">Premium CBD Delivery in Asheville, NC</h1>

      <p className="mb-6 text-gray-700 max-w-3xl">
        Browse our curated menu of federally legal hemp flower and CBD products. We deliver
        across Buncombe, Henderson, Polk, and Transylvania counties—fast, discreet and
        fully compliant. Looking for <strong>cbd delivery asheville nc</strong>? You’re in
        the right place.
      </p>
      <SearchBar defaultValue={query} />
      <FiltersBar active={type} searchParams={searchParams} />
      {filtered.length === 0 ? (
        <p className="text-center py-20 text-gray-600">
          No products found.{' '}
          <a href="tel:+18285551234" className="underline font-semibold">
            Order via Call for Fast Delivery
          </a>
          .
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p: any) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}

      {/* LocalBusiness Schema */}
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'BLZE CBD Delivery',
          image: `${BASE_URL}/android-chrome-512x512.png`,
          url: BASE_URL,
          telephone: '+1-828-555-1234',
          address: {
            '@type': 'PostalAddress',
            streetAddress: 'Downtown',
            addressLocality: 'Asheville',
            addressRegion: 'NC',
            postalCode: '28801',
            addressCountry: 'US',
          },
          openingHoursSpecification: [
            {
              '@type': 'OpeningHoursSpecification',
              dayOfWeek: [
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ],
              opens: '10:00',
              closes: '22:00',
            },
          ],
          areaServed: {
            '@type': 'GeoCircle',
            geoMidpoint: {
              '@type': 'GeoCoordinates',
              latitude: 35.5951,
              longitude: -82.5515,
            },
            geoRadius: 40000,
          },
          makesOffer: {
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: 'CBD Delivery Service',
              areaServed: 'Asheville NC and surrounding counties',
            },
          },
        }}
      />
    </section>
  );
}