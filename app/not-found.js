import Link from "next/link";
import { blogPosts } from "@/constants";
import Head from "next/head";

export default function NotFound() {
  return (
    <>
      <Head>
        <title>Page Not Found - DeepIntoDev</title>
        <meta
          name="description"
          content="Sorry, the page you were looking for could not be found. Explore our software development articles instead."
        />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href="https://deepintodev.com/404" />
      </Head>

      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-16 bg-white dark:bg-black transition-colors duration-200">
        <div className="max-w-2xl w-full flex flex-col items-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            404 - Page Not Found
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 text-center">
            The page you are looking for doesnt exist or has been moved.
          </p>

          <div className="flex gap-4 mb-10">
            <Link
              href="/"
              className="px-5 py-2 bg-gray-800 hover:bg-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 text-white rounded-md transition"
              aria-label="Go to homepage"
            >
              Home
            </Link>
            <a
              href="https://mail.google.com/mail/?view=cm&to=kaan@kmpcodes.com"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition"
              aria-label="Contact"
            >
              Contact
            </a>
          </div>

          <section>
            <h2 className="text-base md:text-lg font-medium text-gray-900 dark:text-white">
              Explore the Most Popular Software Development Blogs
            </h2>
            <ul
              role="list"
              className="flex flex-col gap-4 mt-4 text-sm md:text-base"
              itemScope
              itemType="https://schema.org/ItemList"
            >
              {blogPosts
                .sort((a, b) => b.id - a.id)
                .map((post, index) => (
                  <li
                    key={post.id}
                    itemScope
                    itemProp="itemListElement"
                    itemType="https://schema.org/ListItem"
                  >
                    <meta itemProp="position" content={index + 1} />
                    <Link
                      href={`/blog/${post.slug}`}
                      title={`Read more about ${post.title}`}
                      className="flex items-center gap-1 lg:gap-2 w-fit text-gray-800 dark:text-gray-200 hover:text-gray-600 dark:hover:text-gray-400 transition-all delay-[50ms] underline underline-offset-4 decoration-gray-600 dark:decoration-gray-500"
                      itemProp="url"
                    >
                      <span itemProp="name">{post.title}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
