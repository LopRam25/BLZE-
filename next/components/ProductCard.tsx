import Image from 'next/image';

type Product = {
  id: string;
  name: string;
  category?: string;
  image?: string;
  pricing?: Record<string, number>;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white shadow rounded-lg p-4 flex flex-col">
      <Image
        src={product.image || '/placeholder.jpg'}
        alt={`${product.name} CBD Flower Delivery Asheville NC`}
        width={400}
        height={300}
        className="rounded-md object-cover h-40 w-full"
      />
      <h3 className="font-semibold mt-2">{product.name}</h3>
      {product.category && <p className="text-sm text-gray-600">{product.category}</p>}
      <div className="mt-auto space-y-1">
        {product.pricing &&
          Object.entries(product.pricing).map(([weight, price]) => (
            <div key={weight} className="flex justify-between text-sm">
              <span>{weight}</span>
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded">${price}</span>
            </div>
          ))}
      </div>
    </div>
  );
}