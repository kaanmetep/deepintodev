"use client";

import { useState } from "react";
import Link from "next/link";
import { blogPosts } from "@/constants";
import { Shell, FileText, ChevronLeft } from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <aside
      className={`
        dark:bg-gray-900 dark:text-white max-w-[470px] hidden lg:block relative  bg-gray-50 text-gray-700 font-medium 
        transition-all duration-300 ease-in-out
        ${isOpen ? "basis-0 grow-[1]" : "w-[50px]"}
        overflow-hidden py-8 px-3  shadow-lg 
      `}
      aria-label="Blog navigation sidebar"
    >
      <ChevronLeft
        className={` 
          absolute right-3 top-4 bg-gray-200 dark:bg-gray-400 rounded-full cursor-pointer 
          hover:bg-gray-50 dark:hover:bg-gray-300 transition-all delay-[50ms] p-1
          ${!isOpen && "rotate-180"}
        `}
        size={28}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
      />
      <div
        className={`transition-opacity ${
          isOpen
            ? "opacity-100 pointer-events-auto "
            : "opacity-0 pointer-events-none "
        }`}
      >
        <header>
          <h2 className="flex items-center justify-center gap-[3px] dark:text-white text-black text-xl">
            <Shell size={20} aria-hidden="true" />
            DeepIntoDev
          </h2>
          <h3 className="text-center text-sm mt-[2px]">
            Depth Insights into Software Development
          </h3>
        </header>
        <nav
          aria-label="Main Navigation"
          className="mt-4 flex justify-center"
          itemScope
          itemType="https://schema.org/SiteNavigationElement"
        >
          <ul role="list" className="flex items-center gap-1">
            <li className="sidebar-link">
              <Link href="/" itemProp="url">
                Home
              </Link>
            </li>
            <span className="text-black dark:text-white">|</span>
            <li className="sidebar-link">
              <a href="mailto:kaan@kmpcodes.com" itemProp="email">
                Contact
              </a>
            </li>
          </ul>
        </nav>
        <Link
          href={"/newsletter"}
          className="sidebar-link !text-[10px] sm:!text-xs mt-1"
        >
          Get Notified When New Blog Drops
        </Link>
        <nav aria-label="Other Posts Navigation" className="mt-6" itemScope>
          <ul role="list" className="flex flex-col gap-4">
            {blogPosts
              .sort((a, b) => b.id - a.id)
              .map((post) => (
                <li key={post.id} className="flex flex-col gap-1 group w-full">
                  <Link
                    href={`/blog/${post.slug}`}
                    title={`Read more about ${post.title}`}
                    className="flex items-center gap-1 lg:gap-2 w-fit dark:text-gray-300 text-gray-700 hover:text-gray-500 dark:hover:text-gray-500 transition-all delay-[50ms] text-xs lg:text-sm "
                  >
                    <FileText size={16} className="shrink-0" />
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
                  <div className="flex justify-between  ">
                    <span className="text-[11px] dark:text-gray-400 text-gray-500 ">
                      {post.date}
                    </span>
                    <span className="text-[11px] dark:text-gray-400 text-gray-500 ">
                      {post.readTime} min. read
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
