export const metadata = {
  title: 'Delivery Areas | BLZE CBD Delivery',
};

export default function DeliveryPage() {
  const areas = ['Buncombe', 'Henderson', 'Polk', 'Transylvania'];
  return (
    <section>
      <h1 className="text-3xl font-extrabold mb-4">Delivery Areas</h1>
      <ul className="list-disc pl-6 space-y-1 text-lg">
        {areas.map((area) => (
          <li key={area}>{area} County</li>
        ))}
      </ul>
      <p className="mt-6 text-gray-600">
        Not in our zone yet? Send us a message and we’ll let you know when BLZE expands to
        your area.
      </p>
    </section>
  );
}