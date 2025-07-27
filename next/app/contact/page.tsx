import { BASE_URL } from '../../lib/constants';

export const metadata = {
  title: 'Contact BLZE | CBD Delivery Asheville NC',
  description:
    'Need help with your CBD order in Asheville NC? Call or message BLZE for fast answers on products, delivery times and compliance.',
  alternates: {
    canonical: `${BASE_URL}/contact`,
  },
};

export default function ContactPage() {
  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-extrabold">Contact BLZE</h1>
      <p className="text-gray-700">
        Have a question about our <strong>CBD delivery in Asheville</strong>? Reach out below
        or tap the call button for instant assistance.
      </p>

      <a
        href="tel:+18285551234"
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg font-medium"
      >
        📞 Call Now
      </a>

      <form
        className="space-y-4 max-w-md"
        action="https://formspree.io/f/xknldpaz"
        method="POST"
      >
        <div>
          <label className="block mb-1 font-medium" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            className="w-full border rounded-lg p-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="email">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="w-full border rounded-lg p-2"
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium" htmlFor="message">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            className="w-full border rounded-lg p-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          Send Message
        </button>
      </form>
    </section>
  );
}