import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[var(--bg-secondary)] border-t border-[var(--border-gold)]">
      {/* Top divider gold line */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--accent-gold)] to-transparent opacity-40" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block">
              <img src="/logo.jpg" alt="Scrollzea" className="h-9 w-auto object-contain" />
            </Link>
            <p className="mt-4 text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              Premium digital products, templates, and custom digital solutions for businesses, creators, and developers.
            </p>
            <div className="mt-6 space-y-2 text-sm text-[var(--text-dim)]">
              <p className="flex items-center gap-2">
                <span className="text-[var(--accent-gold)]">✉</span>
                srollzea@gmail.com
              </p>
              <p className="flex items-center gap-2">
                <span className="text-[var(--accent-gold)]">📍</span>
                Kolkata, West Bengal, India
              </p>
            </div>
          </div>

          {/* Products */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--accent-gold)] uppercase tracking-wider mb-6">Products</h4>
            <div className="space-y-3 text-sm">
              <Link href="/products" className="block text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors">All Products</Link>
              <Link href="/freebies" className="block text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors">Free Resources</Link>
              <Link href="/categories" className="block text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors">Categories</Link>
              <Link href="/services" className="block text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors">Custom Services</Link>
            </div>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--accent-gold)] uppercase tracking-wider mb-6">Company</h4>
            <div className="space-y-3 text-sm">
              <Link href="/about" className="block text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors">About Us</Link>
              <Link href="/contact" className="block text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors">Contact</Link>
              <a href="https://wa.me/911234567890?text=Hi%20Scrollzea%2C%20I%20have%20a%20question" target="_blank" rel="noopener noreferrer" className="block text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors">WhatsApp</a>
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--accent-gold)] uppercase tracking-wider mb-6">Legal</h4>
            <div className="space-y-3 text-sm">
              <Link href="/privacy" className="block text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="block text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors">Terms &amp; Conditions</Link>
              <Link href="/refund" className="block text-[var(--text-muted)] hover:text-[var(--accent-gold)] transition-colors">Refund Policy</Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[var(--border-gold)]/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <a
              href="https://www.facebook.com/scrollzea"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-[var(--border-gold)] text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--accent-glow)] transition-all duration-200"
              aria-label="Facebook"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
            </a>
            <a
              href="https://www.instagram.com/scrollzea/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg border border-[var(--border-gold)] text-[var(--text-muted)] hover:text-[var(--accent-gold)] hover:bg-[var(--accent-glow)] transition-all duration-200"
              aria-label="Instagram"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.27 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/></svg>
            </a>
          </div>
          <p className="text-sm text-[var(--text-dim)]">
            © {currentYear} Scrollzea. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
