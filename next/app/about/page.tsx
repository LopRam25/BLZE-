export const metadata = {
  title: 'About | BLZE CBD Delivery',
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
      <p>
        Our menu is hand-selected from licensed North Carolina cultivators and every batch
        is <em>third-party lab tested</em> to guarantee &lt;0.3 % Δ⁹-THC. Whether you’re
        searching for <strong>CBD delivery Asheville NC</strong> or exploring hybrids for
        evening relaxation, BLZE has you covered.
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