"use client";
import { useState, useEffect } from "react";
import { Moon, Sun, Menu, Shell, FileText, X } from "lucide-react";
import Link from "next/link";
import { blogPosts } from "@/constants";
import React from "react";

export default function MobileHeader() {
  const [isDark, setIsDark] = useState(true);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    setIsDark(!isDark);
  };
  return (
    <>
      {showMenu && (
        <div className="fixed inset-0 z-[999] bg-gray-50 dark:bg-gray-900">
          <button
            className="bg-gray-100 dark:bg-gray-500 dark:text-white p-3 rounded-full h-4 w-4 flex justify-center items-center text-xs right-4 absolute top-4 cursor-pointer"
            onClick={() => setShowMenu(false)}
            aria-label="Close menu"
          >
            <span aria-hidden={true}>X</span>
          </button>

          <nav
            className="dark:bg-gray-950 dark:text-white bg-gray-50 text-gray-700 font-medium py-8 px-3 h-full"
            aria-label="Site Navigation"
          >
            <header>
              <h2 className="flex items-center justify-center gap-[3px] dark:text-white text-black text-xl">
                <Shell size={20} aria-hidden="true" />
                DeepIntoDev
              </h2>
              <p className="text-center text-sm mt-[2px]">
                Depth Insights into Software Development
              </p>
            </header>

            <div className="mt-4 flex justify-center">
              <ul role="list" className="flex items-center gap-1">
                <li>
                  <Link
                    href="/"
                    className="text-sm dark:text-gray-300 text-gray-500 hover:text-gray-700 dark:hover:text-gray-500 transition-colors delay-[50ms]"
                    onClick={() => setShowMenu(false)}
                  >
                    <span>Home</span>
                  </Link>
                </li>
                <li className="text-black dark:text-white">|</li>
                <li>
                  <a
                    href="mailto:kaanpmete@gmail.com"
                    className="text-sm dark:text-gray-300 text-gray-500 hover:text-gray-700 dark:hover:text-gray-500 transition-colors delay-[50ms]"
                  >
                    <span>Contact</span>
                  </a>
                </li>
              </ul>
            </div>

            <section className="mt-8">
              <h3 className="sr-only">Blog Posts</h3>
              <ul role="list" className="flex flex-col gap-4">
                {blogPosts
                  .sort((a, b) => b.id - a.id)
                  .map((post) => (
                    <li
                      key={post.id}
                      className="flex flex-col gap-1 group w-full"
                    >
                      <Link
                        href={`/blog/${post.slug}`}
                        title={post.title}
                        className="flex items-center gap-1 lg:gap-2 w-fit dark:text-gray-300 text-gray-700 hover:text-gray-500 dark:hover:text-gray-500 transition-all delay-[50ms] text-xs lg:text-sm"
                        onClick={() => setShowMenu(false)}
                      >
                        <FileText
                          size={16}
                          className="shrink-0"
                          aria-hidden="true"
                        />
                        <span className="hidden 2xl:xl:inline">
                          {post.title.length > 64
                            ? `${post.title.slice(0, 64)}...`
                            : post.title}
                        </span>
                        <span className="inline 2xl:hidden">
                          {post.title.length > 44
                            ? `${post.title.slice(0, 44)}...`
                            : post.title}
                        </span>
                      </Link>
                      <div className="flex justify-between">
                        <time
                          dateTime={post.dateISO || post.date}
                          className="text-[11px] dark:text-gray-400 text-gray-500"
                        >
                          {post.date}
                        </time>
                        <span className="text-[11px] dark:text-gray-400 text-gray-500">
                          {post.readTime} min. read
                        </span>
                      </div>
                    </li>
                  ))}
              </ul>
            </section>
          </nav>
        </div>
      )}

      <div className="mobile-controls">
        <button
          className="absolute left-6 top-4 cursor-pointer lg:opacity-0 lg:pointer-events-none pointer-events-auto dark:text-white z-50 bg-gray-50 dark:bg-gray-700 p-[6px] rounded-md"
          onClick={() => setShowMenu(true)}
          aria-label="Open main menu"
        >
          <Menu
            className="size-4 lg:size-5 cursor-pointer"
            aria-hidden="true"
          />
        </button>
        <button
          onClick={toggleTheme}
          className="absolute right-8 top-4 cursor-pointer z-50 bg-gray-50 dark:bg-gray-700 p-[6px] rounded-md"
          aria-label="Toggle theme"
        >
          {isDark ? (
            <Sun
              color="#ffffff"
              className="size-4 lg:size-5"
              aria-hidden="true"
            />
          ) : (
            <Moon className="size-4 lg:size-5" aria-hidden="true" />
          )}
        </button>
      </div>
    </>
  );
}
