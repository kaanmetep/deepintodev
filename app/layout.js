import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Menu } from "lucide-react";
import Link from "next/link";
import { Inter } from "next/font/google";
import Script from "next/script";
import ThemeToggle from "@/components/ThemeToggle";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  metadataBase: new URL("https://deepintodev.com"),
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
  authors: [{ name: "Kaan Peksen", url: "https://deepintodev.com" }],
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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
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
      </head>
      <body className={`${inter.variable} text-gray-900 dark:bg-black`}>
        <div className="flex relative h-screen ">
          <ThemeToggle />
          <Menu className="absolute left-6 top-4 cursor-pointer lg:opacity-0 md:pointer-events-none dark:text-white" />
          <Sidebar />
          <div className="flex flex-col overflow-y-auto relative basis-0 grow-[3]">
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
                className="flex gap-4 text-gray-500 dark:text-gray-300  text-sm"
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
                <Link
                  href="/"
                  className="  transition-colors delay-[50ms] hover:text-gray-700 dark:hover:text-gray-500"
                  itemProp="url"
                >
                  Menu
                </Link>
                <a
                  href="mailto:kaanpmete@gmail.com"
                  className="  transition-colors delay-[50ms] hover:text-gray-700 dark:hover:text-gray-500"
                  itemProp="email"
                >
                  Contact
                </a>
              </nav>
            </footer>
          </div>
        </div>
      </body>
    </html>
  );
}
