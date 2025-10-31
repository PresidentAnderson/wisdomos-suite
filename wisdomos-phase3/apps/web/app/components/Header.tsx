// app/components/Header.tsx
"use client";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, User, LogOut, Sparkles, Network, Home, Settings as SettingsIcon, Layers } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const { user, logout } = useAuth();

  const links = [
    {
      label: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      label: "Integrated Display",
      href: "/integrated",
      icon: Layers,
    },
    {
      label: "Phoenix Tools",
      icon: Sparkles,
      items: [
        { name: "Journal", href: "/journal" },
        { name: "Reset Ritual", href: "/reset" },
        { name: "Fulfillment Display", href: "/fulfillment" },
        { name: "Autobiography", href: "/autobiography" },
        { name: "Voice Coach", href: "/coach" },
        { name: "Community", href: "/community" },
      ],
    },
    {
      label: "Knowledge Graph",
      icon: Network,
      items: [
        { name: "Autobiography Graph", href: "/knowledge-graph/autobiography" },
        { name: "Coach Sessions Graph", href: "/knowledge-graph/coach" },
      ],
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="text-xl font-semibold text-orange-600 tracking-tight">
          WisdomOS
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((section) => (
            <div key={section.label} className="relative">
              {section.href ? (
                <Link
                  href={section.href}
                  className="flex items-center gap-1 font-medium text-gray-700 hover:text-orange-600 transition"
                >
                  {section.icon && <section.icon className="w-4 h-4" />}
                  {section.label}
                </Link>
              ) : (
                <>
                  <button
                    onMouseEnter={() => setDropdown(section.label)}
                    onMouseLeave={() => setDropdown(null)}
                    className="flex items-center gap-1 font-medium text-gray-700 hover:text-orange-600 transition"
                  >
                    {section.icon && <section.icon className="w-4 h-4" />}
                    {section.label} <ChevronDown className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {dropdown === section.label && section.items && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 mt-2 bg-white border border-orange-100 rounded-xl shadow-lg p-3 w-52"
                        onMouseEnter={() => setDropdown(section.label)}
                        onMouseLeave={() => setDropdown(null)}
                      >
                        {section.items.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="block px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-orange-50 hover:text-orange-600"
                          >
                            {item.name}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          ))}

          <Link
            href="/settings"
            className="font-medium text-gray-700 hover:text-orange-600 transition"
          >
            Settings
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg">
                <User className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user.email || user.id.substring(0, 8)}
                </span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-orange-600 transition"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm font-medium text-gray-700 hover:text-orange-600 transition"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl shadow hover:bg-orange-700 transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-orange-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-t border-orange-100 shadow-inner"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((section) => (
                <div key={section.label}>
                  {section.href ? (
                    <Link
                      href={section.href}
                      className="flex items-center gap-2 text-gray-700 font-medium hover:text-orange-600"
                      onClick={() => setMenuOpen(false)}
                    >
                      {section.icon && <section.icon className="w-4 h-4" />}
                      {section.label}
                    </Link>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 text-gray-700 font-medium mb-2">
                        {section.icon && <section.icon className="w-4 h-4" />}
                        {section.label}
                      </div>
                      <div className="flex flex-col gap-1 ml-6">
                        {section.items?.map((item) => (
                          <Link
                            key={item.name}
                            href={item.href}
                            className="text-sm text-gray-600 hover:text-orange-600"
                            onClick={() => setMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              ))}

              <Link
                href="/settings"
                className="text-gray-700 font-medium hover:text-orange-600"
              >
                Settings
              </Link>

              <div className="pt-4 border-t border-orange-100">
                {user ? (
                  <>
                    <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg mb-3">
                      <User className="w-4 h-4 text-orange-600" />
                      <span className="text-sm font-medium text-gray-700">
                        {user.email || user.id.substring(0, 8)}
                      </span>
                    </div>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 w-full justify-center bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-xl hover:bg-gray-200 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      className="block text-sm font-medium text-gray-700 hover:text-orange-600 mb-2"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/register"
                      className="block bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-xl shadow hover:bg-orange-700 transition text-center"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
