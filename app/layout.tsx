import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Makao - East Africa's Premier Real Estate Rental Platform",
  description: "Find your perfect rental property across East Africa. Browse verified apartments, houses, and flats in Nairobi, Dar es Salaam, Kampala, Kigali and more.",
  keywords: "rental properties, east africa, nairobi, dar es salaam, kampala, kigali, apartments, houses, real estate, makao",
  authors: [{ name: "Makao Team" }],
  creator: "Makao",
  publisher: "Makao",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://makao.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://makao.com',
    title: 'Makao - East Africa\'s Premier Real Estate Rental Platform',
    description: 'Find your perfect rental property across East Africa. Browse verified apartments, houses, and flats in major cities.',
    siteName: 'Makao',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Makao - East African Real Estate Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Makao - East Africa\'s Premier Real Estate Rental Platform',
    description: 'Find your perfect rental property across East Africa. Browse verified apartments, houses, and flats.',
    images: ['/twitter-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main>
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
