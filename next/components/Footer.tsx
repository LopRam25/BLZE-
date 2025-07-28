export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 text-sm py-6 mt-10">
      <div className="container mx-auto px-4 text-center space-y-2">
        <p>
          Hemp-derived CBD products only, compliant with NC laws (&lt;0.3% THC). Not for minors.
        </p>
        <p>© {new Date().getFullYear()} BLZE Delivery. All rights reserved.</p>
      </div>
    </footer>
  );
}