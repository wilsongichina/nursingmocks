import fs from "fs";
import path from "path";

type ChangeLogDocument = {
  title: string;
  slug: string;
  fileName: string;
  sections: Array<{
    id: string;
    title: string;
    blocks: Array<
      | { type: "paragraph"; text: string }
      | { type: "list"; items: string[] }
      | { type: "code"; text: string }
    >;
  }>;
};

export const metadata = {
  title: "Project Change Log | NursingMocks",
  robots: {
    index: false,
    follow: false,
  },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function readChangeLogFiles() {
  const changeLogDirectory = path.join(process.cwd(), "Project Change Log");
  if (!fs.existsSync(changeLogDirectory)) return [];

  return fs
    .readdirSync(changeLogDirectory)
    .filter((fileName) => fileName.endsWith(".md"))
    .sort((a, b) => a.localeCompare(b))
    .map((fileName) => {
      const content = fs.readFileSync(path.join(changeLogDirectory, fileName), "utf8");
      return parseMarkdownDocument(fileName, content);
    });
}

function parseMarkdownDocument(fileName: string, content: string): ChangeLogDocument {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const titleLine = lines.find((line) => line.startsWith("# "));
  const title = titleLine?.replace(/^#\s+/, "").trim() || fileName.replace(/\.md$/, "");
  const document: ChangeLogDocument = {
    title,
    slug: slugify(title),
    fileName,
    sections: [],
  };

  let currentSection = {
    id: "overview",
    title: "Overview",
    blocks: [] as ChangeLogDocument["sections"][number]["blocks"],
  };
  let paragraph: string[] = [];
  let listItems: string[] = [];
  let codeLines: string[] = [];
  let inCodeBlock = false;

  function flushParagraph() {
    if (!paragraph.length) return;
    currentSection.blocks.push({ type: "paragraph", text: paragraph.join(" ") });
    paragraph = [];
  }

  function flushList() {
    if (!listItems.length) return;
    currentSection.blocks.push({ type: "list", items: listItems });
    listItems = [];
  }

  function flushCode() {
    currentSection.blocks.push({ type: "code", text: codeLines.join("\n") });
    codeLines = [];
  }

  function pushSection() {
    flushParagraph();
    flushList();
    if (currentSection.blocks.length || currentSection.title !== "Overview") {
      document.sections.push(currentSection);
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith("```")) {
      if (inCodeBlock) {
        inCodeBlock = false;
        flushCode();
      } else {
        flushParagraph();
        flushList();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    if (trimmed.startsWith("# ")) continue;

    if (trimmed.startsWith("## ")) {
      pushSection();
      const sectionTitle = trimmed.replace(/^##\s+/, "");
      currentSection = {
        id: `${document.slug}-${slugify(sectionTitle)}`,
        title: sectionTitle,
        blocks: [],
      };
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushParagraph();
      flushList();
      currentSection.blocks.push({
        type: "paragraph",
        text: trimmed.replace(/^###\s+/, ""),
      });
      continue;
    }

    if (trimmed.startsWith("- ")) {
      flushParagraph();
      listItems.push(trimmed.replace(/^-\s+/, ""));
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    flushList();
    paragraph.push(trimmed);
  }

  pushSection();
  return document;
}

function formatInlineText(text: string) {
  const parts = text.split(/(`[^`]+`)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={index} className="rounded bg-slate-100 px-1.5 py-0.5 text-[0.9em] text-slate-800">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export default function ChangeLogPage() {
  const documents = readChangeLogFiles();
  const totalSections = documents.reduce((total, doc) => total + doc.sections.length, 0);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#6a5cff]">
            NursingMocks Migration
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
            Project Change Log
          </h1>
          <p className="mt-3 max-w-3xl text-base text-slate-600">
            Structured view of the local migration notes stored in the project repository.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <div className="border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Documents</p>
            <p className="mt-1 text-2xl font-bold">{documents.length}</p>
          </div>
          <div className="border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Sections</p>
            <p className="mt-1 text-2xl font-bold">{totalSections}</p>
          </div>
          <div className="border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-500">Source Folder</p>
            <p className="mt-1 text-sm font-semibold">Project Change Log</p>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="h-fit border border-slate-200 bg-white p-4 lg:sticky lg:top-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-600">
              Documents
            </h2>
            <nav className="mt-4 flex flex-col gap-2">
              {documents.map((doc) => (
                <a
                  key={doc.slug}
                  href={`#${doc.slug}`}
                  className="border-l-2 border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:border-[#6a5cff] hover:text-[#6a5cff]"
                >
                  {doc.title}
                </a>
              ))}
            </nav>
          </aside>

          <div className="flex flex-col gap-8">
            {documents.map((doc) => (
              <article key={doc.slug} id={doc.slug} className="border border-slate-200 bg-white">
                <div className="border-b border-slate-200 p-5">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {doc.fileName}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold">{doc.title}</h2>
                </div>

                <div className="divide-y divide-slate-100">
                  {doc.sections.map((section) => (
                    <section key={section.id} id={section.id} className="p-5">
                      <h3 className="text-lg font-bold text-slate-950">{section.title}</h3>
                      <div className="mt-4 space-y-4 text-sm leading-6 text-slate-700">
                        {section.blocks.map((block, index) => {
                          if (block.type === "paragraph") {
                            return <p key={index}>{formatInlineText(block.text)}</p>;
                          }
                          if (block.type === "list") {
                            return (
                              <ul key={index} className="list-disc space-y-2 pl-5">
                                {block.items.map((item, itemIndex) => (
                                  <li key={itemIndex}>{formatInlineText(item)}</li>
                                ))}
                              </ul>
                            );
                          }
                          return (
                            <pre
                              key={index}
                              className="overflow-x-auto border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-50"
                            >
                              <code>{block.text}</code>
                            </pre>
                          );
                        })}
                      </div>
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
