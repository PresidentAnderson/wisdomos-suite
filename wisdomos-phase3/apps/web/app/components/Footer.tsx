// app/components/Footer.tsx
"use client";
import Link from "next/link";
import { ExternalLink, Github, Twitter, Linkedin, Mail, Heart, Flame } from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { name: "Dashboard", href: "/" },
    { name: "Journal", href: "/journal" },
    { name: "Fulfillment", href: "/fulfillment" },
    { name: "Voice Coach", href: "/coach" },
  ];

  const phoenixTools = [
    { name: "Reset Ritual", href: "/reset" },
    { name: "Autobiography", href: "/autobiography" },
    { name: "Community", href: "/community" },
    { name: "Knowledge Graph", href: "/knowledge-graph/autobiography" },
  ];

  const resources = [
    { name: "Settings", href: "/settings" },
    { name: "Credits", href: "/credits" },
    { name: "Documentation", href: "/docs" },
    { name: "Support", href: "/support" },
  ];

  return (
    <footer className="bg-gradient-to-br from-orange-50 via-white to-orange-50/30 border-t border-orange-100 mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-orange-600">WisdomOS</h3>
            </div>
            <p className="text-sm text-gray-700 mb-4 max-w-sm">
              Phoenix Operating System for Life Transformation. Rise from the ashes into clarity, purpose, and fulfillment.
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <span>Built with</span>
              <Heart className="w-3 h-3 text-red-500 fill-current" />
              <span>by AXAI Innovations</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-3 mt-4">
              <a
                href="https://github.com/axaiinovation"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-lg border border-orange-100 text-gray-600 hover:text-orange-600 hover:border-orange-300 transition-all"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/axaiinnovation"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-lg border border-orange-100 text-gray-600 hover:text-orange-600 hover:border-orange-300 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com/company/axai-innovations"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-white rounded-lg border border-orange-100 text-gray-600 hover:text-orange-600 hover:border-orange-300 transition-all"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a
                href="mailto:contact@axai-innovations.com"
                className="p-2 bg-white rounded-lg border border-orange-100 text-gray-600 hover:text-orange-600 hover:border-orange-300 transition-all"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Phoenix Tools */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Phoenix Tools</h4>
            <ul className="space-y-2">
              {phoenixTools.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
            <ul className="space-y-2">
              {resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-600 hover:text-orange-600 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://github.com/axaiinovation/wisdomos"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-600 hover:text-orange-600 transition-colors inline-flex items-center gap-1"
                >
                  GitHub <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="border-t border-orange-100 pt-6 mb-6">
          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
            <span className="font-medium text-gray-700">Built with:</span>
            <span className="px-2 py-1 bg-white rounded border border-orange-100">Next.js 14</span>
            <span className="px-2 py-1 bg-white rounded border border-orange-100">TypeScript</span>
            <span className="px-2 py-1 bg-white rounded border border-orange-100">Tailwind CSS</span>
            <span className="px-2 py-1 bg-white rounded border border-orange-100">Supabase</span>
            <span className="px-2 py-1 bg-white rounded border border-orange-100">Vercel</span>
            <span className="px-2 py-1 bg-white rounded border border-orange-100">Docker</span>
          </div>
        </div>

        {/* Bottom Credits */}
        <div className="border-t border-orange-100 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-700">
              <p className="font-medium">
                © {currentYear} AXAI Innovations
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Developed by Jonathan Anderson
              </p>
            </div>

            <div className="text-xs text-gray-500 text-center md:text-right max-w-md">
              <p>
                Not affiliated with Landmark Worldwide LLC. All trademarks belong to their respective owners.
              </p>
              <p className="mt-1">
                WisdomOS is an independent life transformation platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
