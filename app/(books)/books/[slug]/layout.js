import fs from "fs";
import path from "path";
import matter from "gray-matter";

const BOOKS_PATH = path.join(process.cwd(), "books");

// Static params - return all book slugs
export async function generateStaticParams() {
  const files = fs.readdirSync(BOOKS_PATH);
  const books = files
    .filter((file) => file.endsWith(".md"))
    .map((file) => ({
      slug: file.replace(".md", ""),
    }));
  return books;
}

// Read book frontmatter
function getBookFrontmatter(slug) {
  try {
    const bookPath = path.join(BOOKS_PATH, `${slug}.md`);
    if (!fs.existsSync(bookPath)) {
      return null;
    }
    const source = fs.readFileSync(bookPath, "utf8");
    const { data } = matter(source);
    return data;
  } catch (error) {
    console.error("Error reading book frontmatter:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const slug = (await params)?.slug;
  const frontmatter = getBookFrontmatter(slug);

  if (!frontmatter) {
    return {
      title: "Book Not Found",
      description: "The requested book could not be found.",
    };
  }

  const siteUrl = "https://www.deepintodev.com";
  const bookUrl = `${siteUrl}/books/${slug}`;

  return {
    title: frontmatter.title,
    description: frontmatter.subtitle || frontmatter.description || "",
    keywords: frontmatter.keywords?.join(", ") || "",
    metadataBase: new URL(siteUrl),
    alternates: {
      canonical: `/books/${slug}`,
    },
    openGraph: {
      title: frontmatter.title,
      description: frontmatter.subtitle || frontmatter.description || "",
      url: bookUrl,
      siteName: "DeepIntoDev",
      locale: "en_US",
      type: "book",
      authors: [frontmatter.author || "DeepIntoDev"],
      images: [
        {
          url: `${siteUrl}/images/kindlecover.png`,
          width: 400,
          height: 600,
          alt: frontmatter.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: frontmatter.title,
      description: frontmatter.subtitle || frontmatter.description || "",
      images: [`${siteUrl}/images/kindlecover.png`],
    },
    robots: {
      index: true,
      follow: true,
    },
    authors: [
      {
        name: frontmatter.author || "DeepIntoDev",
        url: siteUrl,
      },
    ],
  };
}

export default function BookSlugLayout({ children, params }) {
  return (
    <>
      <BookJsonLd params={params} />
      {children}
    </>
  );
}

// Separate async server component for JSON-LD
async function BookJsonLd({ params }) {
  const slug = (await params)?.slug;
  const frontmatter = getBookFrontmatter(slug);

  if (!frontmatter) return null;

  const siteUrl = "https://www.deepintodev.com";
  const bookUrl = `${siteUrl}/books/${slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: frontmatter.title,
    description: frontmatter.subtitle || frontmatter.description || "",
    keywords: frontmatter.keywords?.join(", ") || "",
    author: {
      "@type": "Person",
      name: frontmatter.author || "DeepIntoDev",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: "DeepIntoDev",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logo.png`,
      },
    },
    image: `${siteUrl}/images/kindlecover.png`,
    url: bookUrl,
    inLanguage: "en",
    genre: "Technology",
    bookFormat: "EBook",
    numberOfPages: "50+",
    audience: {
      "@type": "Audience",
      audienceType: "Developers",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
