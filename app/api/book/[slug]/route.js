import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { NextResponse } from "next/server";

// Directory where books are located
const BOOKS_PATH = path.join(process.cwd(), "books");

// Words per page limit
const WORDS_PER_PAGE = 280;

// Split content into blocks (paragraph, code block, image+caption, page break)
function splitIntoBlocks(content) {
  const blocks = [];
  let currentBlock = "";
  let inCodeBlock = false;
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start/end
    if (line.trim().startsWith("```")) {
      if (inCodeBlock) {
        currentBlock += line + "\n";
        blocks.push({ type: "code", content: currentBlock.trim() });
        currentBlock = "";
        inCodeBlock = false;
      } else {
        if (currentBlock.trim()) {
          blocks.push({ type: "text", content: currentBlock.trim() });
          currentBlock = "";
        }
        inCodeBlock = true;
        currentBlock = line + "\n";
      }
      continue;
    }

    if (inCodeBlock) {
      currentBlock += line + "\n";
      continue;
    }

    // Manual page break: ------ (6 or more dashes) or <!-- pagebreak -->
    if (
      line.trim().match(/^-{6,}$/) ||
      line.trim().toLowerCase() === "<!-- pagebreak -->"
    ) {
      if (currentBlock.trim()) {
        blocks.push({ type: "text", content: currentBlock.trim() });
        currentBlock = "";
      }
      blocks.push({ type: "pagebreak" });
      continue;
    }

    // Image line
    if (line.trim().match(/^!\[.*\]\(.*\)$/)) {
      if (currentBlock.trim()) {
        blocks.push({ type: "text", content: currentBlock.trim() });
        currentBlock = "";
      }

      // Get image + caption together
      let imageBlock = line.trim();
      let j = i + 1;

      // Add if next line is caption (**Figure X.X:** or *italic*)
      if (j < lines.length) {
        const nextLine = lines[j].trim();
        // **Figure X.X:** format or **Listing X.X:** format
        if (nextLine.match(/^\*\*(?:Figure|Listing|Table)\s+\d+\.\d+:/)) {
          imageBlock += "\n\n" + nextLine;
          i = j; // skip caption line
        }
        // Only italic caption (*...*)
        else if (
          nextLine.startsWith("*") &&
          nextLine.endsWith("*") &&
          !nextLine.startsWith("**")
        ) {
          imageBlock += "\n\n" + nextLine;
          i = j;
        }
      }

      blocks.push({ type: "image", content: imageBlock });
      continue;
    }

    // Empty line
    if (line.trim() === "") {
      if (currentBlock.trim()) {
        blocks.push({ type: "text", content: currentBlock.trim() });
        currentBlock = "";
      }
    } else {
      currentBlock += line + "\n";
    }
  }

  if (currentBlock.trim()) {
    blocks.push({ type: "text", content: currentBlock.trim() });
  }

  return blocks;
}

// Word count
function countWords(text) {
  return text.split(/\s+/).filter((w) => w.length > 0).length;
}

// Split content into pages
function splitContentToPages(content, chapterTitle) {
  const blocks = splitIntoBlocks(content);
  const pages = [];
  let currentPageContent = "";
  let currentWordCount = 0;
  let isFirstPage = true;

  const savePage = () => {
    if (currentPageContent.trim()) {
      pages.push({
        content: currentPageContent.trim(),
        chapterTitle: isFirstPage ? chapterTitle : null,
      });
      isFirstPage = false;
      currentPageContent = "";
      currentWordCount = 0;
    }
  };

  for (const block of blocks) {
    // Manual page break
    if (block.type === "pagebreak") {
      savePage();
      continue;
    }

    const blockWords = countWords(block.content);

    // Save first if limit will be exceeded (but not if first block)
    if (
      currentWordCount > 0 &&
      currentWordCount + blockWords > WORDS_PER_PAGE
    ) {
      savePage();
    }

    currentPageContent += block.content + "\n\n";
    currentWordCount += blockWords;
  }

  savePage();
  return pages;
}

// Split into chapters
function processContent(content) {
  const chapterRegex = /^## (.+)$/gm;
  const pages = [];
  const matches = [...content.matchAll(chapterRegex)];

  if (matches.length === 0) {
    return splitContentToPages(content.trim(), "Content");
  }

  // Before first chapter
  if (matches[0].index > 0) {
    const intro = content.substring(0, matches[0].index).trim();
    if (intro) {
      pages.push(...splitContentToPages(intro, "Introduction"));
    }
  }

  // Each chapter
  for (let i = 0; i < matches.length; i++) {
    const title = matches[i][1];
    const start = matches[i].index + matches[i][0].length;
    const end = matches[i + 1]?.index || content.length;
    const chapterContent = content.substring(start, end).trim();
    pages.push(...splitContentToPages(chapterContent, title));
  }

  return pages;
}

export async function GET(request, { params }) {
  try {
    const slug = (await params)?.slug;
    const bookPath = path.join(BOOKS_PATH, `${slug}.md`);

    if (!fs.existsSync(bookPath)) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const source = fs.readFileSync(bookPath, "utf8");
    const { data, content } = matter(source);
    const pages = processContent(content.trim());

    return NextResponse.json({
      title: data.title || "Book",
      subtitle: data.subtitle || "",
      author: data.author || "DeepIntoDev",
      slug,
      pages,
    });
  } catch (error) {
    console.error("Error reading book:", error);
    return NextResponse.json({ error: "Failed to load book" }, { status: 500 });
  }
}
