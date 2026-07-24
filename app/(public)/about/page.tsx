export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">About Scrollzea</h1>

      <div className="prose prose-gray max-w-none space-y-6">
        <p className="text-lg text-gray-600 leading-relaxed">
          Scrollzea is a digital products and creative digital solutions platform based in
          Kolkata, West Bengal, India. We create and curate ready-to-use digital products,
          free resources, and custom digital services for individuals and businesses.
        </p>

        <div className="p-6 bg-indigo-50 rounded-xl">
          <h2 className="font-semibold text-gray-900 text-lg">What We Offer</h2>
          <ul className="mt-3 space-y-2 text-gray-600">
            <li>✓ Ready-to-use digital products — apps, PDFs, e-books, wallpapers, and more</li>
            <li>✓ Free digital resources — no payment needed, just download and use</li>
            <li>✓ Custom digital services — websites, desktop apps, logo design, and branding</li>
            <li>✓ Pre-book custom projects with a simple 30% advance model</li>
            <li>✓ Professional digital solutions tailored to your needs</li>
          </ul>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mt-10">Our Approach</h2>
        <p className="text-gray-600">
          We believe in making digital products accessible, professional, and easy to acquire.
          Whether you need a ready-made app for immediate use, a custom website built from
          scratch, or professional logo design, Scrollzea delivers quality digital solutions.
        </p>

        <p className="text-gray-600">
          Based in Kolkata, we serve clients across India and internationally through our
          digital platform. We use Razorpay and PayPal for secure payments, and communicate
          through WhatsApp, email, and our contact forms.
        </p>

        <h2 className="text-2xl font-bold text-gray-900 mt-10">Contact</h2>
        <div className="text-gray-600">
          <p>📧 srollzea@gmail.com</p>
          <p>📍 Kolkata, West Bengal, India</p>
          <p>🌐 <a href="https://www.facebook.com/scrollzea" className="text-indigo-600 hover:underline">Facebook</a> · <a href="https://www.instagram.com/scrollzea/" className="text-indigo-600 hover:underline">Instagram</a></p>
        </div>
      </div>
    </div>
  );
}
