import "./globals.css";
import Sidebar from "@/components/Sidebar";
import Link from "next/link";
import { Inter } from "next/font/google";
import { Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import MobileHeader from "@/components/MobileHeader";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
});

export const viewport = {
  themeColor: "#f9fafb",
  viewportFit: "cover",
};
export const metadata = {
  metadataBase: new URL("https://www.deepintodev.com"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  authors: [{ name: "Kaan Peksen", url: "https://www.deepintodev.com" }],
  generator: "Next.js",
  applicationName: "DeepIntoDev",
  referrer: "origin-when-cross-origin",
  creator: "Kaan Peksen",
  publisher: "DeepIntoDev",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "DeepIntoDev",
    description: "Your go-to source for deep development insights.",
    url: "https://www.deepintodev.com",
    siteName: "DeepIntoDev",
    images: [
      {
        url: "https://www.deepintodev.com/shelltw.png",
        width: 1200,
        height: 630,
        alt: "DeepIntoDev Preview Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@3o2kmpdev",
    title: "DeepIntoDev",
    description: "Your go-to source for deep development insights.",
    image: "https://www.deepintodev.com/shelltw.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-5S6MLJ6YDN"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-5S6MLJ6YDN');
          `}
        </Script>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body
        className={`${sourceSerif.variable} text-gray-900 dark:bg-gray-950 bg-gray-50 `}
      >
        <div className="flex relative sm:h-screen ">
          <MobileHeader />
          <Sidebar />
          <div className="flex flex-col  overflow-y-auto basis-0 grow-[3]">
            {children}
            <footer
              className="flex flex-col gap-2 items-center mt-auto py-3 border-t border-gray-200 dark:border-gray-600"
              itemScope
              itemType="https://schema.org/WPFooter"
            >
              <div
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
                itemScope
                itemType="https://schema.org/Organization"
              >
                <p className="text-sm" itemProp="name">
                  DeepIntoDev
                </p>
                <p className="text-sm">© {new Date().getFullYear()}</p>
              </div>

              <nav
                className="flex gap-6 text-gray-500 dark:text-gray-300  text-sm"
                itemScope
                itemType="https://schema.org/SiteNavigationElement"
              >
                <Link
                  href="/"
                  className="  transition-colors delay-[50ms] hover:text-gray-700 dark:hover:text-gray-500"
                  itemProp="url"
                >
                  Home
                </Link>

                <a
                  href="mailto:kaan@kmpcodes.com"
                  className="  transition-colors delay-[50ms] hover:text-gray-700 dark:hover:text-gray-500"
                  itemProp="email"
                >
                  Contact
                </a>
                <Link
                  href="/newsletter"
                  className="  transition-colors delay-[50ms] hover:text-gray-700 dark:hover:text-gray-500"
                  itemProp="url"
                >
                  Get Notified
                </Link>
              </nav>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
