import fs from "fs";
import path from "path";
import { compileMDX } from "next-mdx-remote/rsc";
import matter from "gray-matter";
import MDXComponents from "@/components/MDXComponents";
import remarkGfm from "remark-gfm";

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
    throw error; // Hata fırlat
  }
}

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPost({ params }) {
  const slug = (await params)?.slug;
  const { mdxContent, frontMatter } = await getPostBySlug(slug);

  return (
    <div className="flex justify-center w-full ">
      <article className="w-full max-w-5xl mx-auto px-4 py-10">
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4 mt-4 lg:mt-0">
            {frontMatter.title}
          </h1>
          {frontMatter.date && (
            <time className="text-gray-500 dark:text-gray-400">
              {new Date(frontMatter.date).toLocaleDateString("en-EN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          {frontMatter.tags && (
            <div className="mt-3 flex flex-wrap gap-2">
              {frontMatter.tags.map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-200 dark:bg-gray-800 px-2 py-1 rounded-md text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-lg dark:prose-invert max-w-none">
          {mdxContent}
        </div>
      </article>
    </div>
  );
}

export async function generateMetadata({ params }) {
  const slug = (await params)?.slug;
  const { frontMatter } = await getPostBySlug(slug);

  const siteUrl = "https://deepintodev.com";

  const authorName = frontMatter.author || "DeepIntoDev";

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
      url: `${siteUrl}/blog/${slug}`,
      siteName: "DeepIntoDev",
      locale: "en_US",
      type: "article",
      publishedTime: frontMatter.date,
      authors: [authorName],
      tags: frontMatter.tags || [],
    },
    robots: {
      index: frontMatter.noIndex ? false : true,
      follow: frontMatter.noFollow ? false : true,
    },
    authors: [
      {
        name: authorName,
        url: frontMatter.authorUrl || siteUrl,
      },
    ],
    category: frontMatter.category || "Software Development",
  };
}
