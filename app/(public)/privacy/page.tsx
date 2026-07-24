export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <p className="text-sm text-gray-400">Last updated: July 2026</p>

        <h2 className="text-xl font-semibold text-gray-900">1. Introduction</h2>
        <p>Scrollzea (&ldquo;we,&rdquo; &ldquo;our,&rdquo; &ldquo;us&rdquo;) respects your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>

        <h2 className="text-xl font-semibold text-gray-900">2. Information We Collect</h2>
        <p><strong>Personal Information:</strong> When you use Scrollzea, we may collect your name, email address, and phone number when you fill contact forms, create an account, or place an order.</p>
        <p><strong>Payment Information:</strong> All payments are processed through Razorpay or PayPal. We do NOT store credit/debit card numbers, CVV, UPI PIN, or banking passwords on our servers.</p>
        <p><strong>Non-Personal Information:</strong> We automatically collect browser type, device type, pages visited, referral source, and anonymized IP address for analytics.</p>

        <h2 className="text-xl font-semibold text-gray-900">3. How We Use Your Information</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>To process orders and deliver digital products</li>
          <li>To respond to enquiries and pre-booking requests</li>
          <li>To send administrative information (order confirmations, project updates)</li>
          <li>To improve our website and product offerings</li>
          <li>To analyze sales performance and product popularity</li>
          <li>To comply with legal obligations</li>
        </ul>

        <h2 className="text-xl font-semibold text-gray-900">4. Payment Processing</h2>
        <p>All payments are processed by third-party payment gateways: Razorpay (razorpay.com) and PayPal (paypal.com). Please refer to their respective privacy policies for how they handle your payment data. We do not store any sensitive payment information.</p>

        <h2 className="text-xl font-semibold text-gray-900">5. Data Storage & Security</h2>
        <p>Your personal data is stored in secure databases. Passwords are hashed using bcrypt before storage. We implement industry-standard security measures and data is encrypted in transit (HTTPS).</p>

        <h2 className="text-xl font-semibold text-gray-900">6. Your Rights</h2>
        <p>You have the right to access your personal data, request correction of inaccurate data, request deletion of your data (subject to legal obligations), and withdraw consent at any time.</p>

        <h2 className="text-xl font-semibold text-gray-900">7. Third-Party Services</h2>
        <p>We use the following third-party services: Razorpay (payment processing), PayPal (payment processing), Resend (email delivery), Uploadthing (image hosting), and Vercel (website hosting).</p>

        <h2 className="text-xl font-semibold text-gray-900">8. Contact</h2>
        <p>For privacy-related enquiries: srollzea@gmail.com | Kolkata, West Bengal, India</p>
      </div>
    </div>
  );
}
