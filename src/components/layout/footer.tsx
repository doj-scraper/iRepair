"use client";

import * as React from "react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Twitter,
  Linkedin,
  Send,
} from "lucide-react";

/**
 * Footer Component for CellTech Distributor B2B Portal
 *
 * Features:
 * - Multi-column responsive layout (1 col mobile, 2 cols tablet, 4 cols desktop)
 * - Sticky footer behavior (use mt-auto on footer, min-h-screen flex flex-col on parent)
 * - Dark mode support
 * - WCAG 2.1 AA compliant
 * - Newsletter signup
 * - Social media links
 *
 * @example
 * // In your layout.tsx:
 * // <body className="min-h-screen flex flex-col">
 * //   <Header />
 * //   <main className="flex-1">{children}</main>
 * //   <Footer />
 * // </body>
 */

const quickLinks = [
  { label: "Products", href: "/products" },
  { label: "About Us", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "FAQ", href: "/faq" },
];

const categoryLinks = [
  { label: "iPhone Parts", href: "/products?category=iphone" },
  { label: "Samsung Parts", href: "/products?category=samsung" },
  { label: "Motorola Parts", href: "/products?category=motorola" },
];

const supportLinks = [
  { label: "Return Policy", href: "/returns" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Request a Quote", href: "/quote" },
];

const socialLinks = [
  {
    label: "Facebook",
    href: "https://facebook.com/celltech",
    icon: Facebook,
  },
  {
    label: "Twitter",
    href: "https://twitter.com/celltech",
    icon: Twitter,
  },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/company/celltech",
    icon: Linkedin,
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitMessage, setSubmitMessage] = React.useState("");

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      setSubmitMessage("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setSubmitMessage("Thank you for subscribing!");
    setEmail("");
    setIsSubmitting(false);

    // Clear message after 3 seconds
    setTimeout(() => setSubmitMessage(""), 3000);
  };

  return (
    <footer
      className="mt-auto bg-primary-dark text-white"
      role="contentinfo"
      aria-label="Site footer"
    >
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-12">
          {/* Company Info Column */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-white">CellTech Distributor</h2>
            <p className="text-sm leading-relaxed text-emerald-100/80">
              Your trusted B2B partner for high-quality cell phone repair parts.
              We provide wholesale pricing on OEM and aftermarket components for
              iPhone, Samsung, Motorola, and more.
            </p>
            {/* Social Media Links */}
            <div className="flex items-center gap-4 pt-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all hover:bg-primary hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  aria-label={`Follow us on ${social.label}`}
                >
                  <social.icon className="h-5 w-5" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Quick Links</h3>
            <nav aria-label="Quick links">
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-emerald-100/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Categories Column */}
          <div>
            <h3 className="mb-4 text-lg font-semibold text-white">Categories</h3>
            <nav aria-label="Product categories">
              <ul className="space-y-3">
                {categoryLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-emerald-100/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Contact & Newsletter Column */}
          <div className="space-y-6">
            {/* Contact Info */}
            <div>
              <h3 className="mb-4 text-lg font-semibold text-white">Contact Us</h3>
              <address className="not-italic space-y-3">
                <a
                  href="mailto:sales@celltechdist.com"
                  className="flex items-center gap-3 text-sm text-emerald-100/80 transition-colors hover:text-white"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>sales@celltechdist.com</span>
                </a>
                <a
                  href="tel:+18005551234"
                  className="flex items-center gap-3 text-sm text-emerald-100/80 transition-colors hover:text-white"
                >
                  <Phone className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>1-800-555-1234</span>
                </a>
                <div className="flex items-start gap-3 text-sm text-emerald-100/80">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <span>
                    1234 Industrial Parkway<br />
                    Los Angeles, CA 90001
                  </span>
                </div>
              </address>
            </div>

            {/* Support Links */}
            <div>
              <h3 className="mb-3 text-base font-semibold text-white">Support</h3>
              <ul className="space-y-2">
                {supportLinks.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-emerald-100/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-12 rounded-lg bg-white/10 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Subscribe to Our Newsletter
              </h3>
              <p className="text-sm text-emerald-100/80">
                Get updates on new products, special offers, and industry news.
              </p>
            </div>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex w-full max-w-md gap-2"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address for newsletter
              </label>
              <Input
                id="newsletter-email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/60 focus-visible:ring-white"
                aria-describedby={submitMessage ? "newsletter-message" : undefined}
              />
              <Button
                type="submit"
                variant="secondary"
                disabled={isSubmitting}
                className="bg-white text-primary-dark hover:bg-white/90"
              >
                {isSubmitting ? (
                  "Subscribing..."
                ) : (
                  <>
                    <Send className="h-4 w-4" aria-hidden="true" />
                    <span className="sr-only">Subscribe to newsletter</span>
                  </>
                )}
              </Button>
            </form>
          </div>
          {submitMessage && (
            <p
              id="newsletter-message"
              className="mt-2 text-sm text-emerald-200"
              role="status"
              aria-live="polite"
            >
              {submitMessage}
            </p>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      <Separator className="bg-white/20" />
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-emerald-100/80">
            &copy; {currentYear} CellTech Distributor. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="/privacy"
              className="text-sm text-emerald-100/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Privacy Policy
            </Link>
            <span className="text-white/40" aria-hidden="true">
              |
            </span>
            <Link
              href="/terms"
              className="text-sm text-emerald-100/80 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
