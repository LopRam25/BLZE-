export const metadata = {
  title: 'Blog | BLZE CBD Delivery',
};

export default function BlogPage() {
  return (
    <section>
      <h1 className="text-3xl font-extrabold mb-6">CBD Blog &amp; News</h1>
      <div className="space-y-6">
        {[
          {
            title: 'CBD Trends in North Carolina for 2025',
            slug: '#',
            excerpt:
              'Delta-8, THCA flower, and the rise of same-day CBD delivery services across Asheville.',
          },
          {
            title: 'Sativa vs. Indica: What’s Best for Daytime Focus?',
            slug: '#',
            excerpt:
              'Breaking down terpenes, cannabinoid ratios, and how BLZE customers use CBD flower to stay productive.',
          },
          {
            title: 'How Fast Is BLZE? Behind the Scenes of 60-Minute Hemp Delivery',
            slug: '#',
            excerpt:
              'A peek at our dispatch tech stack and the drivers making Western NC deliveries possible.',
          },
        ].map((post) => (
          <article key={post.title} className="border-b pb-4 last:border-none">
            <h2 className="text-2xl font-semibold">
              <a href={post.slug} className="hover:underline">
                {post.title}
              </a>
            </h2>
            <p className="text-gray-600">{post.excerpt}</p>
            <a href={post.slug} className="text-blue-600 underline text-sm">
              Read more →
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}