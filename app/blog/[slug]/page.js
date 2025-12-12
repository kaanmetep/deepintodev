import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import MDXComponents from "@/components/MDXComponents";
import remarkGfm from "remark-gfm";
import { notFound } from "next/navigation";
import NewsletterSubscription from "@/components/NewsletterSubscription";
import NewsletterPopup from "@/components/NewsletterPopup";
import { RefreshCcw } from "lucide-react";

// Blog yazılarının bulunduğu dizin
const POSTS_PATH = path.join(process.cwd(), "blogs");

// Tüm blog yazılarını getir
export const getAllPosts = () => {
  const files = fs.readdirSync(POSTS_PATH);

  return files
    .filter((file) => /\.mdx?$/.test(file))
    .map((file) => file.replace(/\.mdx?$/, ""));
};

// Belirli bir blog yazısını getir
async function getPostBySlug(slug) {
  try {
    const filePath = path.join(POSTS_PATH, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Blog post not found: ${slug}`);
    }

    const source = fs.readFileSync(filePath, "utf8");
    const { content, data } = matter(source);

    try {
      const { content: mdxContent } = await compileMDX({
        source: content,
        components: MDXComponents,
        options: {
          mdxOptions: {
            remarkPlugins: [remarkGfm],
          },
        },
      });

      return {
        mdxContent,
        frontMatter: { ...data, slug },
      };
    } catch (error) {
      console.error("Error in compileMDX:", error);
      throw new Error(`Failed to compile MDX for slug: ${slug}`);
    }
  } catch (error) {
    console.error("Error in getPostBySlug:", error);
    notFound();
  }
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({ params }) {
  const slug = (await params)?.slug;
  const { mdxContent, frontMatter } = await getPostBySlug(slug);

  const siteUrl = "https://deepintodev.com";
  const postUrl = `${siteUrl}/blog/${slug}`;
  const authorName = frontMatter.author || "DeepIntoDev";

  // Schema Objesini Burada Oluşturuyoruz
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: frontMatter.title,
    description: frontMatter.description || "",
    image: frontMatter.image ? `${siteUrl}${frontMatter.image}` : undefined,
    author: {
      "@type": "Person",
      name: authorName,
      url: frontMatter.authorUrl || siteUrl,
    },
    datePublished: new Date(frontMatter.date).toISOString(),
    dateModified: new Date(
      frontMatter.dateModified || frontMatter.date
    ).toISOString(),

    publisher: {
      "@type": "Organization",
      name: "DeepIntoDev",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    keywords: frontMatter.tags?.join(", ") || "",
    articleSection: frontMatter.category || "Software Development",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="flex flex-col items-center w-full ">
        <article className="w-full max-w-5xl 2xl:max-w-7xl mx-auto px-4 pt-10 ">
          <header className="mb-8 ">
            <h1 className="text-4xl font-bold mb-4 mt-4 lg:mt-0 dark:text-white">
              {frontMatter.title}
            </h1>
            {frontMatter.date && (
              <div className="flex gap-2 items-center justify-between">
                <div className="flex flex-col gap-1">
                  <time className="text-gray-500 dark:text-gray-400">
                    {new Date(frontMatter.date).toLocaleDateString("en-EN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </time>
                  {frontMatter.dateModified && (
                    <div className="flex gap-1 items-center">
                      <b className="flex items-center gap-1">
                        <span className="text-gray-500 dark:text-gray-400">
                          Last updated at:{" "}
                        </span>
                        <time className="text-gray-500 dark:text-gray-400">
                          {new Date(
                            frontMatter.dateModified
                          ).toLocaleDateString("en-EN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </time>
                        <RefreshCcw
                          size={15}
                          className="text-gray-800 dark:text-gray-300 mt-[1px]"
                        />
                      </b>
                    </div>
                  )}
                </div>
              </div>
            )}
            {frontMatter.tags && (
              <div className="mt-3 flex flex-wrap gap-2 dark:text-white">
                {frontMatter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-gray-200 dark:bg-gray-500 px-2 py-1 rounded-md text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="prose prose-lg dark:prose-invert max-w-none ">
            {mdxContent}
          </div>
          <p className="mb-2 text-[rgb(26,26,26)] dark:text-gray-100 leading-[32px] font-normal text-[16px] lg:text-[18px] tracking-[-.06px]">
            Was this blog helpful for you? If so,
          </p>
        </article>

        <div className="w-full px-4  lg:max-w-3xl mx-auto mt-4 pb-10">
          <NewsletterSubscription />
        </div>
      </div>
      <NewsletterPopup />
    </>
  );
}

export async function generateMetadata({ params }) {
  try {
    const slug = (await params)?.slug;
    const { frontMatter } = await getPostBySlug(slug);

    const siteUrl = "https://deepintodev.com";
    const authorName = frontMatter.author || "DeepIntoDev";
    const postUrl = `${siteUrl}/blog/${slug}`;

    return {
      title: frontMatter.title,
      description: frontMatter.description || "",
      keywords: frontMatter.tags?.join(", ") || "",
      metadataBase: new URL(siteUrl),
      alternates: {
        canonical: `/blog/${slug}`,
      },
      openGraph: {
        title: frontMatter.title,
        description: frontMatter.description || "",
        url: postUrl,
        siteName: "DeepIntoDev",
        locale: "en_US",
        type: "article",
        publishedTime: frontMatter.date,
        modifiedTime: frontMatter.dateModified,
        authors: [authorName],
        tags: frontMatter.tags || [],
      },
      robots: {
        index: true,
        follow: true,
      },
      authors: [
        {
          name: authorName,
          url: frontMatter.authorUrl || siteUrl,
        },
      ],
      category: frontMatter.category || "Software Development",
    };
  } catch (error) {
    console.error("Error in generateMetadata:", error);
    notFound();
  }
}
