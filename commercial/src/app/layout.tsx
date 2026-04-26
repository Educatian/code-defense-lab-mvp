import type { Metadata } from "next";
import { IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const ibmPlexSans = IBM_Plex_Sans({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ibm-plex-mono",
});

export const metadata: Metadata = {
  title: "Code Defense Lab — Assess understanding, not just code output",
  description:
    "AI use is allowed. Understanding is required. Code Defense Lab helps instructors assess whether learners can explain, trace, adapt, and repair AI-assisted code in Python and R.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`carbon-white ${ibmPlexSans.variable} ${ibmPlexMono.variable}`}
    >
      <body className="cds-baseline">{children}</body>
    </html>
  );
}
