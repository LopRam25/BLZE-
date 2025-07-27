import { BASE_URL } from '../../lib/constants';

export const metadata = {
  title: 'About BLZE | CBD Delivery Asheville NC',
  description:
    'Learn how BLZE offers compliant, same-day CBD delivery in Asheville NC. Premium hemp flower, CBD oil & gummies brought to your doorstep.',
  alternates: {
    canonical: `${BASE_URL}/about`,
  },
};

export default function AboutPage() {
  return (
    <article className="prose max-w-none">
      <h1>About BLZE</h1>
      <p>
        Founded in 2023, <strong>BLZE</strong> was created to be Asheville’s hassle-free
        alternative to a traditional CBD dispensary. Think of us as the Uber Eats of hemp: a
        few taps, and top-shelf flower shows up at your door—no traffic, no waiting rooms,
        no cash-only surprises.
      </p>
      <p className="text-sm">
        Curious how it works? Visit our <a href="/delivery" className="text-blue-600 underline">CBD
        delivery page</a> or <a href="/contact" className="text-blue-600 underline">contact the
        BLZE team</a> for answers.
      </p>
      <p>
        Our menu is hand-selected from licensed North Carolina cultivators and every batch
        is <em>third-party lab tested</em> to guarantee &lt;0.3 % Δ⁹-THC. Whether you’re
        exploring <strong>cbd Asheville NC</strong> options or comparing <strong>Asheville NC dispensaries</strong>, BLZE has you covered with compliant hemp products and rapid delivery.
      </p>
      <p>
        We operate 7 days a week with average delivery times under 60 minutes inside
        Buncombe, Henderson, Polk and Transylvania counties.
      </p>
      <p>
        Questions?{' '}
        <a href="tel:+18285551234" className="text-blue-600 underline">
          Call us anytime
        </a>{' '}
        or email 
        <a href="mailto:support@blzedelivery.com" className="text-blue-600 underline">
          support@blzedelivery.com
        </a>
        .
      </p>
    </article>
  );
}