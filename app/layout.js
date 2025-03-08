import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Moon, Sun, Menu } from "lucide-react";
import Link from "next/link";
import { Inter } from "next/font/google";

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
    <html lang="en">
      <body className={`${inter.variable} text-gray-900`}>
        <div className="lg:flex relative h-screen ">
          <Moon className="absolute right-6 top-4 cursor-pointer" />
          <Menu className="absolute left-6 top-4 cursor-pointer lg:opacity-0 md:pointer-events-none" />
          <Sidebar />
          <div className="flex flex-col overflow-y-auto relative basis-0 grow-[3]  ">
            {children}
            <footer
              className="flex flex-col gap-2 items-center mt-auto py-3 border-t border-gray-200"
              itemScope
              itemType="https://schema.org/WPFooter"
            >
              <div
                className="flex items-center gap-2 text-gray-600"
                itemScope
                itemType="https://schema.org/Organization"
              >
                <p className="text-sm" itemProp="name">
                  DeepIntoDev
                </p>
                <p className="text-sm">© {new Date().getFullYear()}</p>
              </div>

              <nav
                className="flex gap-4 "
                itemScope
                itemType="https://schema.org/SiteNavigationElement"
              >
                <Link
                  href="/"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors delay-[50ms]"
                  itemProp="url"
                >
                  Home
                </Link>
                <Link
                  href="/"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors delay-[50ms]"
                  itemProp="url"
                >
                  Menu
                </Link>
                <a
                  href="mailto:kaanpmete@gmail.com"
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors delay-[50ms]"
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
