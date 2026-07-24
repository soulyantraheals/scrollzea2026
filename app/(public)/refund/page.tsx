export default function RefundPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Refund Policy</h1>
      <div className="prose prose-gray max-w-none space-y-6 text-gray-600">
        <p className="text-sm text-gray-400">Last updated: July 2026</p>

        <h2 className="text-xl font-semibold text-gray-900">1. Ready-Made Digital Products</h2>
        <p>All sales of ready-made digital products are <strong>final</strong> due to the instant nature of digital delivery. Once a digital product is delivered, it cannot be &ldquo;returned.&rdquo;</p>
        <p><strong>Refunds may be issued if:</strong> The product is not as described, the product is defective/non-functional, or duplicate purchase occurred. Please contact us at srollzea@gmail.com with your order details.</p>

        <h2 className="text-xl font-semibold text-gray-900">2. Free Products</h2>
        <p>No refund applies to free products (₹0). If you experienced issues accessing a free product, please contact us for assistance.</p>

        <h2 className="text-xl font-semibold text-gray-900">3. Custom Services (Pre-booked)</h2>
        <p><strong>Before work commences:</strong> If you cancel before we begin work on your project, you may receive a full refund of the advance payment.</p>
        <p><strong>After work has commenced:</strong> Once project work has started, the advance payment is non-refundable as it covers initial consultation, requirement analysis, and project planning.</p>
        <p><strong>Our delays:</strong> If we fail to begin your project within 7 business days of receiving the advance (without prior communication), you may request a full refund of the advance.</p>

        <h2 className="text-xl font-semibold text-gray-900">4. How to Request a Refund</h2>
        <p>Email us at <strong>srollzea@gmail.com</strong> with your name, order/transaction number, product or service name, and reason for refund request. We will respond within 2-3 business days.</p>

        <h2 className="text-xl font-semibold text-gray-900">5. Refund Timelines</h2>
        <p>Razorpay refunds: 5-7 business days after approval. PayPal refunds: 3-5 business days after approval. Funds may take additional time depending on your bank/payment method.</p>
      </div>
    </div>
  );
}
