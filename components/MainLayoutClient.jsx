"use client";

import Sidebar from "@/components/Sidebar";
import MobileHeader from "@/components/MobileHeader";
import Link from "next/link";

export default function MainLayoutClient({ children }) {
  return (
    <div className="flex relative sm:h-screen">
      <MobileHeader />
      <Sidebar />
      <div className="flex flex-col overflow-y-auto scrollbar-custom basis-0 grow-[3]">
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
            className="flex gap-6 text-gray-500 dark:text-gray-300 text-sm"
            itemScope
            itemType="https://schema.org/SiteNavigationElement"
          >
            <Link
              href="/"
              className="transition-colors delay-[50ms] hover:text-gray-700 dark:hover:text-gray-500"
              itemProp="url"
            >
              Home
            </Link>

            <a
              href="https://buymeacoffee.com/kaanmetep"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors delay-[50ms] hover:text-gray-700 dark:hover:text-gray-500"
            >
              Support Me
            </a>
            <a
              href="https://mail.google.com/mail/?view=cm&to=kaan@kmpcodes.com"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors delay-[50ms] hover:text-gray-700 dark:hover:text-gray-500"
              itemProp="email"
            >
              Contact
            </a>
            <Link
              href="/newsletter"
              className="transition-colors delay-[50ms] hover:text-gray-700 dark:hover:text-gray-500"
              itemProp="url"
            >
              Get Notified
            </Link>
          </nav>
        </footer>
      </div>
    </div>
  );
}
