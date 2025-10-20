import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-maroon-900 text-sand-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Logo */}
          <div className="lg:col-span-1">
            <Link href="/" className="text-2xl font-bold mb-4 block">
              MindfulAI
            </Link>
          </div>

          {/* Work At */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-sand-100">Work With Us</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#company" className="text-sand-100/70 hover:text-sand-50 transition-colors text-sm">
                  Company
                </Link>
              </li>
              <li>
                <Link href="#careers" className="text-sand-100/70 hover:text-sand-50 transition-colors text-sm">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Information */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-sand-100">Information</h3>
            <ul className="space-y-3">
              <li>
                <Link href="#about" className="text-sand-100/70 hover:text-sand-50 transition-colors text-sm">
                  About
                </Link>
              </li>
              <li>
                <Link href="#faqs" className="text-sand-100/70 hover:text-sand-50 transition-colors text-sm">
                  FAQs
                </Link>
              </li>
              <li>
                <Link href="#policies" className="text-sand-100/70 hover:text-sand-50 transition-colors text-sm">
                  Policies
                </Link>
              </li>
              <li>
                <Link href="#terms" className="text-sand-100/70 hover:text-sand-50 transition-colors text-sm">
                  Terms &amp; Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Socials */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-sand-100">Socials</h3>
            <ul className="space-y-3">
              <li>
                <a href="https://facebook.com" className="text-sand-100/70 hover:text-sand-50 transition-colors text-sm">
                  Facebook
                </a>
              </li>
              <li>
                <a href="https://instagram.com" className="text-sand-100/70 hover:text-sand-50 transition-colors text-sm">
                  Instagram
                </a>
              </li>
              <li>
                <a href="https://twitter.com" className="text-sand-100/70 hover:text-sand-50 transition-colors text-sm">
                  Twitter
                </a>
              </li>
              <li>
                <a href="https://tiktok.com" className="text-sand-100/70 hover:text-sand-50 transition-colors text-sm">
                  TikTok
                </a>
              </li>
              <li>
                <a href="https://linkedin.com" className="text-sand-100/70 hover:text-sand-50 transition-colors text-sm">
                  LinkedIn
                </a>
              </li>
            </ul>
          </div>

          {/* Address & Contact */}
          <div>
            <h3 className="text-sm font-semibold mb-4 text-sand-100">Address</h3>
            <address className="not-italic text-sand-100/70 text-sm leading-relaxed mb-6">
              MindfulAI<br />
              300 Delaware Ave,<br />
              Suite 210<br />
              Wilmington DE,<br />
              19801
            </address>

            <h3 className="text-sm font-semibold mb-2 text-sand-100">Contact</h3>
            <a
              href="mailto:team@mindfulai.com"
              className="text-sand-100/70 hover:text-sand-50 transition-colors text-sm"
            >
              team@mindfulai.com
            </a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-sand-100/10">
          <p className="text-sand-100/50 text-xs">
            © 2025 MindfulAI. All rights reserved. MindfulAI Inc.
          </p>
        </div>
      </div>
    </footer>
  )
}
