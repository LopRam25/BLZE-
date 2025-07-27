export const metadata = {
  title: 'About | BLZE CBD Delivery',
};

export default function AboutPage() {
  return (
    <article className="prose max-w-none">
      <h1>About BLZE</h1>
      <p>
        BLZE delivers premium hemp-derived CBD flower and products across Western North
        Carolina. Our service operates like your favorite food-delivery app—order online and
        receive your products in under 60 minutes.
      </p>
      <p>
        We’re locally owned and committed to compliance with all state and federal laws.
        Questions?{' '}
        <a href="tel:+18285551234" className="text-blue-600 underline">
          Call us anytime
        </a>
        .
      </p>
    </article>
  );
}