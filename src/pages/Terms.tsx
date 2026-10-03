import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText } from "lucide-react";
import { useTheme } from "../lib/theme";

export default function Terms() {
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
              <FileText size={22} />
              <span className="text-xs font-mono uppercase tracking-wider font-bold">
                SIGMA Legal Documentation
              </span>
            </div>
            <h1
              className={`text-2xl sm:text-3xl font-black font-display tracking-tight ${
                isDark ? "text-white" : "text-slate-950"
              }`}
            >
              Terms of Service for SIGMA
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
                1. Acceptance
              </h2>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                By using SIGMA, you agree to these terms.
              </p>
            </section>

            <section className="space-y-2">
              <h2
                className={`text-base sm:text-lg font-bold font-display ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                2. Use of the Service
              </h2>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                You agree to use the app lawfully and not to misuse, disrupt, or attempt to gain unauthorized access to it.
              </p>
            </section>

            <section className="space-y-2">
              <h2
                className={`text-base sm:text-lg font-bold font-display ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                3. Accounts
              </h2>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                You are responsible for activity under your account.
              </p>
            </section>

            <section className="space-y-2">
              <h2
                className={`text-base sm:text-lg font-bold font-display ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                4. Availability
              </h2>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                The service is provided "as is" without warranties. We may modify or discontinue features at any time.
              </p>
            </section>

            <section className="space-y-2">
              <h2
                className={`text-base sm:text-lg font-bold font-display ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                5. Limitation of Liability
              </h2>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                To the extent permitted by law, SIGMA is not liable for any damages arising from your use of the service.
              </p>
            </section>

            <section className="space-y-2">
              <h2
                className={`text-base sm:text-lg font-bold font-display ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                6. Changes
              </h2>
              <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                We may update these terms. Continued use means you accept the changes.
              </p>
            </section>

            <section className="space-y-2">
              <h2
                className={`text-base sm:text-lg font-bold font-display ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                7. Contact
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
              to="/privacy"
              className={`text-xs font-mono transition-colors ${
                isDark
                  ? "text-slate-400 hover:text-slate-200"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              Privacy Policy &rarr;
            </Link>
          </footer>
        </article>
      </div>
    </div>
  );
}
