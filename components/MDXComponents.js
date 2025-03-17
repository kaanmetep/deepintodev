// components/MDXComponents.jsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism";

// Başlıklar
const H1 = ({ children }) => (
  <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
    {children}
  </h1>
);

const H2 = ({ children }) => (
  <h2 className="text-2xl font-semibold mt-8 mb-3 text-gray-800 dark:text-gray-50">
    {children}
  </h2>
);

const H3 = ({ children }) => (
  <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-800 dark:text-gray-50">
    {children}
  </h3>
);

// Paragraf
const P = ({ children }) => (
  <p className="mb-4 text-gray-700 dark:text-gray-100 leading-relaxed">
    {children}
  </p>
);

// Kod blokları
const CodeBlock = ({ children, className }) => {
  // Dil bilgisini className'den çıkar (eğer varsa)
  const match = /language-(\w+)/.exec(className || "");
  const language = match ? match[1] : "javascript"; // Varsayılan dil

  // JSX için özel işleme
  const lang = language === "jsx" ? "javascript" : language;

  return (
    <div className="rounded-md my-6 overflow-hidden">
      <SyntaxHighlighter
        language={lang}
        style={oneDark}
        className="text-sm"
        customStyle={{
          margin: 0,
          padding: "1.5rem",
          borderRadius: "0.375rem",
        }}
      >
        {children}
      </SyntaxHighlighter>
    </div>
  );
};

// Satır içi kod
const InlineCode = ({ children }) => (
  <code className="bg-gray-200 dark:bg-gray-800 rounded px-1 py-0.5 text-sm font-mono">
    {children}
  </code>
);

// Alıntı
const BlockQuote = ({ children }) => (
  <blockquote className="border-l-4 border-gray-300 dark:border-gray-400 pl-4 italic my-4 text-gray-600 dark:text-gray-400">
    {children}
  </blockquote>
);

// Bağlantılar
const CustomLink = ({ href, children }) => {
  const isInternal = href && (href.startsWith("/") || href.startsWith("#"));

  if (isInternal) {
    return (
      <Link
        href={href}
        className="text-blue-600 dark:text-blue-400 hover:underline"
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-600 dark:text-blue-400 hover:underline"
    >
      {children}
    </a>
  );
};

// Listeler
const Ul = ({ children }) => (
  <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-200">
    {children}
  </ul>
);

const Ol = ({ children }) => (
  <ol className="list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-200">
    {children}
  </ol>
);

const Li = ({ children }) => <li className="mb-1">{children}</li>;

// Yatay çizgi
const Hr = () => (
  <hr className="my-8 border-t border-gray-300 dark:border-gray-700" />
);

const ResponsiveImage = ({ src, alt, ...props }) => {
  return (
    <Image
      src={src || "/placeholder.png"}
      alt={alt || ""}
      className="rounded-lg object-contain"
      width={500}
      height={500}
      priority={props.priority}
    />
  );
};

// Alert bileşeni
const Alert = ({ children, type = "info" }) => {
  const styles = {
    info: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    warning:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-800",
    error:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    success:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
  };

  return (
    <div className={`p-4 mb-4 rounded-md border ${styles[type]}`}>
      {children}
    </div>
  );
};

// MDX bileşenleri export
const MDXComponents = {
  h1: H1,
  h2: H2,
  h3: H3,
  p: P,
  code: (props) => {
    const { children, className } = props;
    // Eğer blok kodu ise (pre içinde)
    if (className) {
      return <CodeBlock {...props} />;
    }
    // Eğer satır içi kod ise
    return <InlineCode {...props} />;
  },
  pre: ({ children }) => children,
  // MDX'te kod blokları genellikle pre > code yapısındadır
  "pre.code": CodeBlock,
  blockquote: BlockQuote,
  a: CustomLink,
  ul: Ul,
  ol: Ol,
  li: Li,
  hr: Hr,
  img: ResponsiveImage,
  Alert,
};

export default MDXComponents;
