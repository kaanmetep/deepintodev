"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { blogPosts, books } from "@/constants";
import { Shell, FileText, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside
      className={`
         dark:bg-gray-950 dark:text-white max-w-[470px] hidden lg:block relative  bg-gray-50 text-gray-700 font-medium 
        transition-all duration-300 ease-in-out
        ${
          isOpen
            ? "overflow-y-auto scrollbar-custom basis-0 grow-[1]"
            : "overflow-hidden w-[50px]"
        }
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
          <h2
            className="flex items-center justify-center gap-[3px] dark:text-white text-black text-xl cursor-pointer"
            onClick={() => router.push("/")}
          >
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
              <a
                href="https://buymeacoffee.com/kaanmetep"
                target="_blank"
                rel="noopener noreferrer"
              >
                Support Me
              </a>
            </li>
            <span className="text-black dark:text-white">|</span>
            <li className="sidebar-link">
              <a
                href="https://mail.google.com/mail/?view=cm&to=kaan@kmpcodes.com"
                target="_blank"
                rel="noopener noreferrer"
                itemProp="email"
              >
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
        {/* Books Section */}
        <section aria-label="Books Navigation" className="mt-6">
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
            📚 Books
          </h3>
          {books.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 p-2 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all cursor-pointer"
            >
              <div className="shrink-0 w-10 h-14 rounded-md overflow-hidden">
                <Image
                  src={book.cover}
                  alt={book.title}
                  width={40}
                  height={56}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1 w-full">
                <span className="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-black dark:group-hover:text-white transition-colors leading-tight">
                  {book.title}
                </span>
                <div className="flex justify-between">
                  <span className="text-[11px] dark:text-gray-400 text-gray-500">
                    {book.date}
                  </span>
                  <span className="text-[11px] dark:text-gray-400 text-gray-500">
                    {book.pages} pages
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </section>

        {/* Blogs Section */}
        <section aria-label="Blog Posts Navigation" className="mt-6" itemScope>
          <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3 px-1">
            📝 Blog Posts
          </h3>
          <ul role="list" className="flex flex-col gap-4">
            {blogPosts
              .sort((a, b) => b.id - a.id)
              .map((post) => {
                const isActive = pathname === `/blog/${post.slug}`;
                return (
                  <li
                    key={post.id}
                    className="flex flex-col gap-1 group w-full"
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      title={`Read more about ${post.title}`}
                      className={`flex items-center gap-1 lg:gap-2 w-fit transition-all delay-[50ms] text-xs lg:text-sm ${
                        isActive
                          ? "font-bold dark:text-white text-black dark:bg-gray-800 bg-gray-200 px-2 py-1 rounded-md"
                          : "dark:text-gray-300 text-gray-700 hover:text-gray-500 dark:hover:text-gray-500"
                      }`}
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
                    <div className="flex xl:flex-row flex-col justify-between ">
                      <span className="text-[11px] dark:text-gray-400 text-gray-500 flex items-center gap-2">
                        <span>{post.date}</span>
                        {post.dateModified && (
                          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-900/40 px-2 py-[2px] rounded-full">
                            Updated {post.dateModified}
                          </span>
                        )}
                      </span>
                      <span className="text-[11px] dark:text-gray-400 text-gray-500 ">
                        {post.readTime} min. read
                      </span>
                    </div>
                  </li>
                );
              })}
          </ul>
        </section>
      </div>
    </aside>
  );
};

export default Sidebar;
