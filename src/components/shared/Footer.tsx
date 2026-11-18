import React from 'react';
import Link from 'next/link';
import { Pizza, Mail, Phone, MapPin } from 'lucide-react';

// Evaluated once at module load so the value is stable during prerendering.
const copyrightYear = new Date().getFullYear();

export default function Footer() {
  return (
    <footer className="bg-[#121212] text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Info */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-[#E20001] flex items-center justify-center text-white">
                <Pizza className="w-5 h-5" />
              </div>
              <span className="text-2xl font-extrabold text-white">
                Pizza<span className="text-[#E20001]">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your neighborhood destination for artisan wood-fired pizzas, cheesy sides, and refreshing drinks—delivered
              hot and fresh from trusted local kitchens.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Quick Links</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/" className="hover:text-[#E20001] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/menu" className="hover:text-[#E20001] transition-colors">
                  Browse Pizza Menu
                </Link>
              </li>
              <li>
                <Link href="/sign-up" className="hover:text-[#E20001] transition-colors">
                  Become a Vendor
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-[#E20001] transition-colors">
                  User Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-[#E20001] shrink-0" />
                <span>House 24, Road 11, Banani, Dhaka</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-[#E20001] shrink-0" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#E20001] shrink-0" />
                <span>support@pizzahub.com</span>
              </li>
            </ul>
          </div>

          {/* Social Links (With New X Logo as required) */}
          <div>
            <h3 className="text-white font-bold text-base mb-4">Follow Us</h3>
            <p className="text-sm text-gray-400 mb-4">
              Stay updated with weekend pizza deals and new restaurant partners.
            </p>
            <div className="flex items-center gap-3">
              {/* New X (Twitter) Logo */}
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                aria-label="X"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#E20001] text-white flex items-center justify-center transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              {/* Facebook */}
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#E20001] text-white flex items-center justify-center transition-colors font-bold text-sm"
              >
                f
              </a>
              {/* Instagram */}
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-gray-800 hover:bg-[#E20001] text-white flex items-center justify-center transition-colors font-bold text-sm"
              >
                in
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {copyrightYear} PizzaHub. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/menu" className="hover:text-gray-300">
              Privacy Policy
            </Link>
            <Link href="/menu" className="hover:text-gray-300">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
