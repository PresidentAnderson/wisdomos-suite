'use client';

import { motion } from 'framer-motion';
import { Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-200/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-black" />
          </div>

          <h1 className="text-2xl font-bold text-black mb-4">Check Your Email</h1>
          <p className="text-black mb-6">
            We've sent a verification link to your email address. Please click the link to activate your account.
          </p>

          <div className="space-y-4">
            <div className="text-sm text-black">
              Didn't receive the email? Check your spam folder or{' '}
              <button className="text-black hover:text-black transition">
                resend verification email
              </button>
            </div>

            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 text-black hover:text-black transition"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}