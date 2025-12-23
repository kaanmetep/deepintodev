/* eslint-disable react/no-unescaped-entities */
"use client";
import { ArrowUpRight } from "lucide-react";

const AMAZON_URL = "https://www.amazon.com/dp/B0GBTG13JX";

export default function BookPromoBanner() {
  return (
    <div className="w-full mt-4 rounded-lg border border-gray-200 dark:border-gray-800  dark:bg-gray-950/90 shadow-sm">
      <a
        href={AMAZON_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-lg"
        aria-label="Read How JavaScript Works Behind the Scenes on Amazon"
      >
        <div className="relative flex gap-3 sm:gap-4 items-center px-4 sm:px-5 py-3 pr-12 text-gray-900 dark:text-gray-100">
          <div className="flex items-center">
            <img
              src="/images/kindlecover.png"
              alt="How JavaScript Works Behind the Scenes book cover"
              className="h-20 w-auto rounded-sm border border-gray-200 dark:border-gray-800 shadow-sm"
              loading="lazy"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-[15px] font-semibold leading-snug text-gray-900 dark:text-gray-50">
              How JavaScript Works Behind the Scenes: Inside the JavaScript
              Execution Engine
            </p>
            <span className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-gray-800 dark:text-gray-100 whitespace-nowrap">
              Read on Amazon
              <ArrowUpRight
                size={16}
                className="transition-transform duration-150 group-hover:translate-x-[2px]"
                aria-hidden="true"
              />
            </span>
          </div>
        </div>
      </a>
    </div>
  );
}
