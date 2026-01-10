"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Shell,
  Moon,
  Sun,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import Image from "next/image";
import Link from "next/link";
import NewsletterSubscription from "@/components/NewsletterSubscription";

const BookPage = ({ params }) => {
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSinglePage, setIsSinglePage] = useState(false);
  const [slug, setSlug] = useState(null);
  const [isDark, setIsDark] = useState(false);
  const prevIsSinglePage = useRef(isSinglePage);

  // Check initial dark mode state
  useEffect(() => {
    const isDarkMode = document.documentElement.classList.contains("dark");
    setIsDark(isDarkMode);
  }, []);

  // Get slug
  useEffect(() => {
    const getSlug = async () => {
      const resolvedParams = await params;
      setSlug(resolvedParams?.slug);
    };
    getSlug();
  }, [params]);

  // Fetch book data
  useEffect(() => {
    if (slug) {
      setLoading(true);
      fetch(`/api/book/${slug}`)
        .then((res) => res.json())
        .then((data) => {
          setBookData(data);
          // Load saved page from localStorage
          const savedPage = localStorage.getItem(`book-${slug}-currentPage`);
          if (savedPage !== null) {
            const pageNum = parseInt(savedPage, 10);
            if (!isNaN(pageNum)) {
              setCurrentPage(pageNum);
            } else {
              setCurrentPage(0);
            }
          } else {
            setCurrentPage(0);
          }
        })
        .catch((err) => console.error("Error loading book:", err))
        .finally(() => setLoading(false));
    }
  }, [slug]);

  // Check screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsSinglePage(window.innerWidth < 1536);
    };
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    if (isDark) {
      document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
    setIsDark(!isDark);
  };

  // Save current page to localStorage when it changes
  useEffect(() => {
    if (slug && !loading && bookData) {
      localStorage.setItem(`book-${slug}-currentPage`, currentPage.toString());
    }
  }, [currentPage, slug, loading, bookData]);

  // Scroll to top when page changes
  useEffect(() => {
    // Find and scroll all scrollable containers to top
    const scrollContainers = document.querySelectorAll(
      ".overflow-y-auto.scrollbar-custom"
    );
    scrollContainers.forEach((container) => {
      container.scrollTop = 0;
    });
  }, [currentPage]);

  // Convert currentPage when page mode changes
  useEffect(() => {
    if (
      prevIsSinglePage.current !== isSinglePage &&
      bookData?.pages?.length > 0
    ) {
      if (isSinglePage) {
        // Double -> Single: convert spread index to page index
        setCurrentPage((prev) => prev * 2);
      } else {
        // Single -> Double: convert page index to spread index
        setCurrentPage((prev) => Math.floor(prev / 2));
      }
    }
    prevIsSinglePage.current = isSinglePage;
  }, [isSinglePage, bookData?.pages?.length]);

  // Create pages
  const pages = useMemo(() => {
    if (!bookData || !bookData.pages) return [];

    const allPages = [];

    // Cover page
    allPages.push({
      type: "cover",
      title: bookData.title,
      subtitle: bookData.subtitle,
      author: bookData.author,
    });

    // Find chapter titles and page indexes for table of contents
    const tocChapters = [];
    let pageIndex = 2; // 0: cover, 1: toc
    bookData.pages.forEach((page, idx) => {
      if (page.chapterTitle) {
        tocChapters.push({
          title: page.chapterTitle,
          pageIndex: pageIndex + idx,
        });
      }
    });

    // Table of contents page
    allPages.push({
      type: "toc",
      chapters: tocChapters,
    });

    // Content pages (pages from API)
    bookData.pages.forEach((page) => {
      allPages.push({
        type: "content",
        chapterTitle: page.chapterTitle || null,
        content: page.content,
      });
    });

    // Newsletter subscription page (after all content pages)
    allPages.push({
      type: "newsletter",
    });

    return allPages;
  }, [bookData]);

  const totalItems = isSinglePage ? pages.length : Math.ceil(pages.length / 2);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalItems - 1) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [currentPage, totalItems]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentPage]);

  const goToPage = useCallback(
    (pageIndex) => {
      if (isSinglePage) {
        setCurrentPage(pageIndex);
      } else {
        const spreadIndex = Math.floor(pageIndex / 2);
        setCurrentPage(spreadIndex);
      }
    },
    [isSinglePage]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        goToNextPage();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrevPage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextPage, goToPrevPage]);

  const leftPageIndex = isSinglePage ? currentPage : currentPage * 2;
  const rightPageIndex = currentPage * 2 + 1;
  const leftPage = pages[leftPageIndex];
  const rightPage = isSinglePage ? null : pages[rightPageIndex];

  const markdownComponents = {
    img: ({ src, alt }) => (
      <span className="my-3 flex justify-center">
        <Image
          src={src}
          alt={alt || ""}
          width={500}
          height={350}
          className="rounded-lg max-w-full h-auto"
          style={{ maxHeight: "45vh", objectFit: "contain" }}
        />
      </span>
    ),
    code: ({ children, className, ...props }) => {
      if (!className) {
        return (
          <code
            className="bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded text-sm font-mono text-gray-900 dark:text-gray-200"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code className="!bg-transparent !p-0 text-inherit" {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children }) => (
      <pre className="bg-gray-900 dark:bg-gray-800 text-gray-300 dark:text-gray-200 p-4 rounded-lg overflow-x-auto text-sm my-4 [&_code]:!text-gray-300 dark:[&_code]:!text-gray-200">
        {children}
      </pre>
    ),
    p: ({ children }) => (
      <p className="mb-3 leading-relaxed text-gray-900 dark:text-gray-200">
        {children}
      </p>
    ),
    h3: ({ children }) => (
      <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-white">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-base font-semibold mt-3 mb-2 text-gray-900 dark:text-white">
        {children}
      </h4>
    ),
    ul: ({ children }) => (
      <ul className="list-disc pl-5 mb-3 space-y-1 text-gray-900 dark:text-gray-200">
        {children}
      </ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-5 mb-3 space-y-1 text-gray-900 dark:text-gray-200">
        {children}
      </ol>
    ),
    li: ({ children }) => (
      <li className="[&>p]:inline [&>p]:m-0 text-gray-900 dark:text-gray-200">
        {children}
      </li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4 text-gray-600 dark:text-gray-400">
        {children}
      </blockquote>
    ),
    strong: ({ children }) => (
      <strong className="font-semibold text-gray-900 dark:text-white">
        {children}
      </strong>
    ),
    em: ({ children }) => <em className="italic">{children}</em>,
  };

  const renderPage = (page) => {
    if (!page) {
      return (
        <div className="h-full flex items-center justify-center text-gray-300 dark:text-gray-700">
          <BookOpen size={48} strokeWidth={1} />
        </div>
      );
    }

    if (page.type === "cover") {
      return (
        <div className="h-full flex items-center justify-center p-4">
          <Image
            src="/images/kindlecover.png"
            alt={page.title}
            width={400}
            height={600}
            className="max-h-full w-auto object-contain rounded-lg shadow-lg"
            priority
          />
        </div>
      );
    }

    if (page.type === "toc") {
      return (
        <div className="h-full flex flex-col px-4 md:px-6 lg:px-8 2xl:px-6 py-4 md:py-6 overflow-y-auto scrollbar-custom">
          <p className="text-gray-500 dark:text-gray-400  my-1 text-xs lg:text-base mb-8">
            Published on January 10, 2026
          </p>
          <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 text-center text-gray-900 dark:text-white">
            Table of Contents
          </h2>
          <nav className="space-y-2 md:space-y-3">
            {page.chapters.map((chapter, index) => (
              <button
                key={index}
                onClick={() => goToPage(chapter.pageIndex)}
                className="w-full text-left px-3 md:px-4 py-2 md:py-3 rounded-lg transition-colors text-xs md:text-sm flex items-center justify-between group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
              >
                <span className="transition-colors group-hover:text-gray-900 dark:group-hover:text-white">
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <>{children}</>,
                      em: ({ children }) => (
                        <em className="italic">{children}</em>
                      ),
                    }}
                  >
                    {chapter.title}
                  </ReactMarkdown>
                </span>
                <ChevronRight
                  size={14}
                  className="text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                />
              </button>
            ))}
          </nav>
        </div>
      );
    }

    if (page.type === "newsletter") {
      return (
        <div className="  justify-center px-4 md:px-6 lg:px-8 2xl:px-6 py-4 md:py-6 overflow-y-auto scrollbar-custom">
          <p className="mb-4 text-gray-900 dark:text-gray-100">
            Did you enjoy this book?
          </p>
          <div className="w-full ">
            <NewsletterSubscription />
          </div>
        </div>
      );
    }

    // Content page
    return (
      <div className="h-full flex flex-col px-4 md:px-6 lg:px-8 2xl:px-6 py-4 md:py-6 overflow-y-auto scrollbar-custom">
        {page.chapterTitle && (
          <h2 className="text-base md:text-lg lg:text-xl 2xl:text-xl font-bold mb-3 md:mb-4 pb-2 md:pb-3 border-b text-gray-900 dark:text-white border-gray-200 dark:border-gray-700">
            <ReactMarkdown
              components={{
                p: ({ children }) => <>{children}</>,
                em: ({ children }) => <em className="italic">{children}</em>,
              }}
            >
              {page.chapterTitle}
            </ReactMarkdown>
          </h2>
        )}
        <div className="flex-1 max-w-none [&_pre_code]:!bg-transparent [&_pre_code]:!p-0 prose prose-sm md:prose-base dark:prose-invert prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-pre:text-gray-300 dark:prose-pre:text-gray-200">
          <ReactMarkdown components={markdownComponents}>
            {page.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-600 dark:border-gray-300"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 2xl:p-4">
      {/* Dark Mode Toggle */}
      <button
        onClick={toggleDarkMode}
        className="fixed sm:top-4 sm:right-4 top-2 right-8 z-50 sm:p-2 p-1.5 rounded-full shadow-lg transition-colors bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 cursor-pointer"
        aria-label={isDark ? "Light mode" : "Dark mode"}
      >
        {isDark ? (
          <Sun className="sm:size-5 size-4" />
        ) : (
          <Moon className="sm:size-5 size-4" />
        )}
      </button>

      {/* Book Container */}
      <div className="relative w-full max-w-[calc(100%-4rem)] sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-[1600px] mx-auto">
        {/* Book Shadow */}
        <div className="absolute inset-0 bg-gray-400/10 dark:bg-black/0 rounded-lg  transform translate-y-2" />

        {/* Book */}
        <div className="relative rounded-lg shadow-2xl overflow-hidden bg-white dark:bg-gray-900">
          {/* Book Spine Effect */}
          {!isSinglePage && (
            <>
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b z-10 from-gray-300 via-gray-200 to-gray-300 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700" />
              <div className="absolute left-1/2 top-0 bottom-0 w-4 -ml-2 bg-gradient-to-r from-transparent to-transparent z-10 pointer-events-none via-gray-100 dark:via-gray-800/50" />
            </>
          )}

          {/* Pages Container */}
          <div
            className={`flex ${
              isSinglePage
                ? "min-h-[80vh] max-h-[85vh]"
                : "min-h-[85vh] max-h-[88vh]"
            }`}
          >
            {/* Left/Single Page */}
            <div
              className={`${
                isSinglePage
                  ? "w-full"
                  : "w-1/2 border-r border-gray-100 dark:border-gray-800"
              } bg-gradient-to-l from-gray-50 to-white dark:from-gray-900 dark:to-gray-900 relative`}
            >
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-transparent to-gray-100/50 dark:to-gray-800/30" />
              <div className="relative h-full">{renderPage(leftPage)}</div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400 dark:text-gray-600">
                {leftPageIndex + 1}
              </div>
            </div>

            {/* Right Page */}
            {!isSinglePage && (
              <div className="w-1/2 relative bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-900">
                <div className="absolute inset-0 pointer-events-none bg-gradient-to-l from-transparent to-gray-100/50 dark:to-gray-800/30" />
                <div className="relative h-full">{renderPage(rightPage)}</div>
                {rightPage && (
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-gray-400 dark:text-gray-600">
                    {rightPageIndex + 1}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Buttons */}
        <div className="absolute top-1/2 -translate-y-1/2 -left-5 sm:-left-7 md:-left-10 2xl:-left-20">
          <button
            onClick={goToPrevPage}
            disabled={currentPage === 0}
            className="p-2 2xl:p-4 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronLeft size={20} className="2xl:w-6 2xl:h-6" />
          </button>
        </div>

        <div className="absolute top-1/2 -translate-y-1/2 -right-5 sm:-right-7 md:-right-10 2xl:-right-20">
          <button
            onClick={goToNextPage}
            disabled={currentPage >= totalItems - 1}
            className="p-2 2xl:p-4 rounded-full shadow-lg hover:shadow-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-105 active:scale-95 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            <ChevronRight size={20} className="2xl:w-6 2xl:h-6" />
          </button>
        </div>
      </div>

      {/* Bottom Section */}
      <div className=" mt-3 2xl:mt-4 w-full max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl xl:max-w-4xl 2xl:max-w-[1600px] px-2 flex sm:flex-row flex-col items-center justify-between gap-2">
        {/* DeepIntoDev Logo */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs sm:text-sm transition-colors group text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <Shell
            size={16}
            className="group-hover:rotate-12 transition-transform sm:w-[18px] sm:h-[18px]"
          />
          <span className="font-semibold">DeepIntoDev</span>
        </Link>

        {/* Progress Bar */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md sm:mt-1">
          <div className="flex items-center justify-between text-xs mb-1 text-gray-500 dark:text-gray-400">
            <span>
              {isSinglePage ? (
                <>
                  Page {leftPageIndex + 1} of {pages.length}
                </>
              ) : (
                <>
                  Page {leftPageIndex + 1}
                  {rightPage ? `-${rightPageIndex + 1}` : ""} of {pages.length}
                </>
              )}
            </span>
            <span>{Math.round(((currentPage + 1) / totalItems) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-700">
            <div
              className="h-full rounded-full transition-all duration-300 bg-gray-500"
              style={{
                width: `${((currentPage + 1) / totalItems) * 100}%`,
              }}
            />
          </div>
          {/* Keyboard Hint */}
          <p className="hidden lg:block mt-2 text-xs text-center text-gray-400 dark:text-gray-500">
            Use{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              ←
            </kbd>{" "}
            <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              →
            </kbd>{" "}
            to navigate
          </p>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm flex-wrap justify-center my-4 sm:my-0">
          <Link
            href="/"
            className="hover:underline transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Home
          </Link>
          <Link
            href="/newsletter"
            className="hover:underline transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Newsletter
          </Link>
          <a
            href="https://buymeacoffee.com/kaanmetep"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Support Me
          </a>
          <a
            href="https://mail.google.com/mail/?view=cm&to=kaan@kmpcodes.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-colors text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            Contact
          </a>
        </div>
      </div>
    </div>
  );
};

export default BookPage;
