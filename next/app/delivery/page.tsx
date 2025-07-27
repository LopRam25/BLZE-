import { BASE_URL } from '../../lib/constants';

export const metadata = {
  title: 'CBD Delivery Asheville NC | 60-Min Hemp Flower – BLZE',
  description:
    'Order CBD flower, oil & more for 60-minute delivery in Asheville, Henderson, Polk & Transylvania counties. Discreet, legal, 0.3% THC compliant.',
};

export const generateMetadata = () => ({
  alternates: {
    canonical: `${BASE_URL}/delivery`,
  },
});

export default function DeliveryPage() {
  const areas = ['Buncombe', 'Henderson', 'Polk', 'Transylvania'];
  return (
    <section>
      <h1 className="text-3xl font-extrabold mb-4">CBD Delivery Zones &amp; FAQs</h1>
      <ul className="list-disc pl-6 space-y-1 text-lg">
        {areas.map((area) => (
          <li key={area}>{area} County</li>
        ))}
      </ul>
      <p className="mt-6 text-gray-600">
        Not in our zone yet? Send us a message and we’ll let you know when BLZE expands to
        your area.
      </p>

      {/* Map Placeholder */}
      <div className="my-8 aspect-video w-full bg-gray-200 flex items-center justify-center text-gray-600">
        <span>📍 Interactive map coming soon</span>
      </div>

      {/* FAQs */}
      <h2 className="text-2xl font-semibold mb-2">Frequently Asked Questions</h2>
      <div className="space-y-2">
        <details className="border rounded-lg p-3">
          <summary className="font-medium cursor-pointer">
            How fast is delivery in Asheville?
          </summary>
          <p className="mt-2 text-gray-700">
            Most orders arrive within 60 minutes. Peak traffic or weather can add a few
            minutes, but you’ll always receive live tracking.
          </p>
        </details>
        <details className="border rounded-lg p-3">
          <summary className="font-medium cursor-pointer">Is the delivery discreet?</summary>
          <p className="mt-2 text-gray-700">
            Yes—our drivers use unmarked vehicles and plain packaging, so only you know
            what’s inside.
          </p>
        </details>
        <details className="border rounded-lg p-3">
          <summary className="font-medium cursor-pointer">
            Do I need to show ID?
          </summary>
          <p className="mt-2 text-gray-700">
            We verify that every customer is 21&#43; at drop-off. Have your state-issued ID
            ready.
          </p>
        </details>
      </div>
    </section>
  );
}