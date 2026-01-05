import React from 'react';
import { Outlet } from 'react-router-dom';

export default function RootLayout({ }) {
  return (
    <div className="min-h-dvh bg-slate-50 text-slate-900">
      {/* Skip to content (a11y) */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 bg-white border px-3 py-2 rounded-md shadow"
      >
        Μετάβαση στο περιεχόμενο
      </a>

      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-lg font-semibold">HelpMe-HelpYou</div>
            {/* Placeholder για μελλοντικό nav */}
            <nav className="hidden sm:flex gap-4 text-sm text-slate-600">
              {/* αργότερα: <a className="hover:text-slate-900">Dashboard</a> κλπ */}
            </nav>
          </div>
        </div>
      </header>

      {/* Main */}
      <main id="main" className="mx-auto max-w-6xl px-4 py-8">
       <Outlet />
      </main>

      {/* Unified footer */}
      <footer role="contentinfo" className="mt-10 border-t">
        <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-slate-500">
          <div className="flex items-center justify-between">
            <p>© {new Date().getFullYear()} BillMaN</p>
            <p>Thesis Project • v 0.3.1</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
