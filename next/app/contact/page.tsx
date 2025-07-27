export const metadata = {
  title: 'Contact | BLZE CBD Delivery',
};

export default function ContactPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-extrabold">Contact</h1>
      <p>
        Need help with an order? Call us at{' '}
        <a href="tel:+18285551234" className="text-blue-600 underline">
          (828) 555-1234
        </a>{' '}
        or email{' '}
        <a href="mailto:support@blzedelivery.com" className="text-blue-600 underline">
          support@blzedelivery.com
        </a>
        .
      </p>
    </section>
  );
}