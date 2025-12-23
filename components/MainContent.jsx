import { blogPosts } from "@/constants";
import { Shell } from "lucide-react";
import Link from "next/link";
import NewsletterSubscription from "./NewsletterSubscription";
const MainContent = () => {
  return (
    <>
      <main className="px-6 pt-16 overflow-y-auto pb-6 md:pb-10 max-w-[2000px] dark:text-white ">
        <article itemScope itemType="https://schema.org/Article">
          <header>
            <div className="flex items-start gap-1">
              <Shell className="shrink-0 size-5 md:size-6 mt-[4.2px]" />
              <h1
                itemProp="headline"
                className="text-lg sm:text-xl md:text-2xl font-semibold"
              >
                DeepIntoDev{" "}
                <span className="block lg:inline text-gray-700 dark:text-white lg:before:content-['-'] lg:before:mr-1 text-base sm:text-lg md:text-2xl">
                  Software Development Insights
                </span>
              </h1>
            </div>
          </header>

          <section className="mt-3 md:mt-6 text-gray-800 dark:text-white">
            <p
              className="mt-1  leading-relaxed text-base md:text-lg"
              itemProp="articleBody"
            >
              In the world of software development, filled with frameworks,
              libraries, and abstractions, I often felt like I was just{" "}
              <b>using technologies without truly understanding</b> them. So, I
              started digging deeper, reading more, and researching.
              <strong>
                {" "}
                That’s why I created this blog: to break down complex
                programming concepts into simpler, easy-to-understand
                explanations.
              </strong>
            </p>
            <p className="mt-4 text-base md:text-lg" itemProp="description">
              DeepIntoDev is the place where you can understand any software
              engineering concept without any confusion. Trust me, everything
              becomes simple when it’s explained well.
            </p>
            <p className="mt-4 text-base md:text-lg">
              I also wrote a book:{" "}
              <Link
                href="https://www.amazon.com/dp/B0GBTG13JX"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:decoration-white transition-all delay-[50ms] underline underline-offset-4 decoration-gray-600 dark:decoration-gray-300"
              >
                How JavaScript Works Behind the Scenes: Inside the JavaScript
                Execution Engine
              </Link>
            </p>
          </section>
          <section className="w-full  lg:max-w-3xl mx-auto mt-8">
            <NewsletterSubscription />
          </section>
          <section className="mt-8">
            <h2 className="text-base md:text-lg font-medium">
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
                      className="flex items-center gap-1 lg:gap-2 w-fit hover:text-gray-500 dark:hover:text-gray-400 hover:decoration-white transition-all delay-[50ms] underline underline-offset-4 decoration-gray-600 dark:decoration-gray-300"
                      itemProp="url"
                    >
                      <span itemProp="name">{post.title}</span>
                    </Link>
                  </li>
                ))}
            </ul>
          </section>
        </article>
      </main>
    </>
  );
};

export default MainContent;
