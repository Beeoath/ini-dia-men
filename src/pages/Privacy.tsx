import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useTheme } from "../lib/theme";

export default function Privacy() {
  const { isDark } = useTheme();

  return (
    <div
      className={`min-h-screen py-10 px-4 sm:px-6 lg:px-8 transition-colors duration-200 ${
        isDark ? "bg-[#070913] text-slate-100" : "bg-[#f8fafc] text-slate-900"
      }`}
    >
      <div className="max-w-3xl mx-auto">
        {/* Navigation */}
        <div className="mb-8">
          <Link
            to="/"
            className={`inline-flex items-center gap-2 text-xs font-mono font-semibold transition-colors cursor-pointer ${
              isDark
                ? "text-cyan-400 hover:text-cyan-300"
                : "text-cyan-600 hover:text-cyan-700"
            }`}
          >
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Card Content */}
        <article
          className={`rounded-3xl border p-6 sm:p-10 shadow-xl backdrop-blur-xl ${
            isDark
              ? "border-white/10 bg-[#0d1326]/90 text-slate-200"
              : "border-slate-200 bg-white text-slate-800 shadow-sm"
          }`}
        >
          {/* Header */}
          <header className="border-b pb-6 mb-8 border-slate-200 dark:border-white/10">
            <div className="flex items-center gap-2.5 text-cyan-500 mb-2">
              <ShieldCheck size={22} />
              <span className="text-xs font-mono uppercase tracking-wider font-bold">
                SIGMA Legal Documentation
              </span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black font-display tracking-tight ${
                isDark ? "text-white" : "text-slate-950"
              }`}
            >
              Privacy Policy for SIGMA
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1.5">
              Last updated: October 3, 2026
            </p>
          </header>

          {/* Body Sections */}
          <div className="space-y-6 text-sm sm:text-base leading-relaxed">
            <section className="space-y-2">
              <h2
                className={`text-base sm:text-lg font-bold font-display ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                1. Information We Collect
              </h2>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                When you sign in with Google, we receive your name, email address, and profile picture. We do not access any other Google data.
              </p>
            </section>

            <section className="space-y-2">
              <h2
                className={`text-base sm:text-lg font-bold font-display ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                2. How We Use It
              </h2>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                We use this information only to create and manage your account and to provide the features of SIGMA. We do not sell or share your data with third parties for advertising.
              </p>
            </section>

            <section className="space-y-2">
              <h2
                className={`text-base sm:text-lg font-bold font-display ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                3. Data Storage and Security
              </h2>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                Your data is stored securely using Supabase and kept only as long as your account is active. You can request deletion at any time.
              </p>
            </section>

            <section className="space-y-2">
              <h2
                className={`text-base sm:text-lg font-bold font-display ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                4. Your Rights
              </h2>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                You may request access to, correction of, or deletion of your data by emailing{" "}
                <a
                  href="mailto:tribagusferdiansah842@gmail.com"
                  className="font-mono text-cyan-400 hover:underline"
                >
                  tribagusferdiansah842@gmail.com
                </a>
                .
              </p>
            </section>

            <section className="space-y-2">
              <h2
                className={`text-base sm:text-lg font-bold font-display ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                5. Changes
              </h2>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                We may update this policy. Changes will be posted on this page.
              </p>
            </section>

            <section className="space-y-2">
              <h2
                className={`text-base sm:text-lg font-bold font-display ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                6. Contact
              </h2>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                <a
                  href="mailto:tribagusferdiansah842@gmail.com"
                  className="font-mono text-cyan-400 hover:underline"
                >
                  tribagusferdiansah842@gmail.com
                </a>
              </p>
            </section>
          </div>

          {/* Footer inside card */}
          <footer className="mt-10 pt-6 border-t border-slate-200 dark:border-white/10 flex items-center justify-between">
            <Link
              to="/"
              className={`inline-flex items-center gap-1.5 text-xs font-mono font-semibold transition-colors cursor-pointer ${
                isDark
                  ? "text-cyan-400 hover:text-cyan-300"
                  : "text-cyan-600 hover:text-cyan-700"
              }`}
            >
              <ArrowLeft size={14} />
              <span>Back to Home</span>
            </Link>

            <Link
              to="/terms"
              className={`text-xs font-mono transition-colors ${
                isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Terms of Service &rarr;
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}
