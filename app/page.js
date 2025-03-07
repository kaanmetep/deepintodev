import MainContent from "@/components/MainContent";

export const metadata = {
  title: "DeepIntoDev | In-Depth Insights into Software Development",
  description:
    "Diving deep into software development, architecture, and technology. Comprehensive guides and detailed explanations about modern development practices and tools.",
  keywords: [
    "software development",
    "programming",
    "coding tutorials",
    "tech deep dives",
    "software architecture",
    "web development",
    "development guides",
  ],
  openGraph: {
    title: "DeepIntoDev | In-Depth Software Development Insights",
    description:
      "Deep technical insights and comprehensive guides about software development, architecture, and modern programming practices.",
    url: "https://deepintodev.com",
    siteName: "DeepIntoDev",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    title: "DeepIntoDev | In-Depth Software Development Insights",
    description:
      "Deep technical insights and comprehensive guides about software development, architecture, and modern programming practices.",
  },
};

export default function Home() {
  return <MainContent />;
}
