import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MatchMarshal — AI Volunteer Copilot for FIFA World Cup 2026",
  description:
    "MatchMarshal gives stadium volunteers an AI-assisted copilot that turns incident descriptions into structured action plans, escalation paths, and multilingual communication guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-emerald-800 focus:text-white focus:outline-none focus:ring-4 focus:ring-emerald-400">
          Skip to main content
        </a>
        <div className="flex-grow">
          {children}
        </div>
        <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-6 text-center text-sm text-slate-600 dark:text-slate-400" role="contentinfo">
          <p><strong>MatchMarshal</strong> — An AI Volunteer Copilot.</p>
          <p className="text-xs mt-1">Not affiliated with FIFA or the FIFA World Cup 2026™. For demonstration purposes only.</p>
        </footer>
      </body>
    </html>
  );
}
