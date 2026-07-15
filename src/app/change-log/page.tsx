import fs from "fs";
import path from "path";

type ChangeLogDocument = {
  title: string;
  slug: string;
  group: string;
  groupSlug: string;
  groupTitle: string;
  fileName: string;
  relativePath: string;
  sections: Array<{
    id: string;
    title: string;
    blocks: Array<
      | { type: "paragraph"; text: string }
      | { type: "heading"; text: string }
      | { type: "list"; items: string[] }
      | { type: "code"; text: string }
    >;
  }>;
};

type DocumentationGroup = {
  slug: string;
  title: string;
  documents: ChangeLogDocument[];
};

export const metadata = {
  title: "Project Documentation | NursingMocks",
  robots: {
    index: false,
    follow: false,
  },
};

const documentationGroupLabels: Record<string, string> = {
  admin: "Admin",
  billing: "Billing",
  documentation: "Documentation",
  email: "Email",
  migration: "Migration",
  "user-dashboard": "User Dashboard",
};

const documentationGroupOrder = [
  "billing",
  "admin",
  "user-dashboard",
  "email",
  "migration",
  "documentation",
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function formatGroupTitle(groupSlug: string) {
  return (
    documentationGroupLabels[groupSlug] ||
    groupSlug
      .split("-")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

function readMarkdownFiles(directory: string): string[] {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return readMarkdownFiles(entryPath);
    return entry.isFile() && entry.name.endsWith(".md") ? [entryPath] : [];
  });
}

function sortDocuments(a: ChangeLogDocument, b: ChangeLogDocument) {
  const groupOrderA = documentationGroupOrder.indexOf(a.groupSlug);
  const groupOrderB = documentationGroupOrder.indexOf(b.groupSlug);
  const normalizedGroupOrderA = groupOrderA === -1 ? documentationGroupOrder.length : groupOrderA;
  const normalizedGroupOrderB = groupOrderB === -1 ? documentationGroupOrder.length : groupOrderB;

  if (normalizedGroupOrderA !== normalizedGroupOrderB) {
    return normalizedGroupOrderA - normalizedGroupOrderB;
  }

  return a.fileName.localeCompare(b.fileName, undefined, { numeric: true, sensitivity: "base" });
}

function readDocumentationFiles() {
  const documentationDirectory = path.join(process.cwd(), "Documentation");
  if (!fs.existsSync(documentationDirectory)) return [];

  return readMarkdownFiles(documentationDirectory)
    .map((filePath) => {
      const relativePath = path.relative(documentationDirectory, filePath);
      const groupSlug = relativePath.split(path.sep)[0] || "documentation";
      const groupTitle = formatGroupTitle(groupSlug);
      const fileName = path.basename(filePath);
      const content = fs.readFileSync(filePath, "utf8");
      return parseMarkdownDocument({
        fileName,
        relativePath,
        groupSlug,
        groupTitle,
        content,
      });
    })
    .sort(sortDocuments);
}

function groupDocumentationFiles(documents: ChangeLogDocument[]): DocumentationGroup[] {
  const groups = new Map<string, DocumentationGroup>();

  for (const document of documents) {
    const group = groups.get(document.groupSlug);
    if (group) {
      group.documents.push(document);
      continue;
    }

    groups.set(document.groupSlug, {
      slug: document.groupSlug,
      title: document.groupTitle,
      documents: [document],
    });
  }

  return Array.from(groups.values()).sort((a, b) => {
    const groupOrderA = documentationGroupOrder.indexOf(a.slug);
    const groupOrderB = documentationGroupOrder.indexOf(b.slug);
    const normalizedGroupOrderA = groupOrderA === -1 ? documentationGroupOrder.length : groupOrderA;
    const normalizedGroupOrderB = groupOrderB === -1 ? documentationGroupOrder.length : groupOrderB;

    if (normalizedGroupOrderA !== normalizedGroupOrderB) {
      return normalizedGroupOrderA - normalizedGroupOrderB;
    }

    return a.title.localeCompare(b.title);
  });
}

function parseMarkdownDocument({
  fileName,
  relativePath,
  groupSlug,
  groupTitle,
  content,
}: {
  fileName: string;
  relativePath: string;
  groupSlug: string;
  groupTitle: string;
  content: string;
}): ChangeLogDocument {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const titleLine = lines.find((line) => line.startsWith("# "));
  const title = titleLine?.replace(/^#\s+/, "").trim() || fileName.replace(/\.md$/, "");
  const document: ChangeLogDocument = {
    title,
    slug: `${groupSlug}-${slugify(title)}`,
    group: groupSlug,
    groupSlug,
    groupTitle,
    fileName,
    relativePath,
    sections: [],
  };

  let currentSection = {
    id: `${document.slug}-overview`,
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
        type: "heading",
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
  const documents = readDocumentationFiles();
  const groups = groupDocumentationFiles(documents);
  const totalSections = documents.reduce((total, doc) => total + doc.sections.length, 0);
  let renderedDocumentIndex = 0;

  return (
    <main className="min-h-screen bg-[#f6f7fb] text-slate-950">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-4 py-8 sm:px-6 lg:px-10">
        <header className="rounded-2xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-[#6a5cff]">
                NursingMocks Documentation
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
                Project Documentation
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                A document-style reading view for the grouped markdown notes stored in the local
                `Documentation` folder.
              </p>
            </div>
            <div className="grid min-w-full gap-3 sm:grid-cols-3 lg:min-w-[420px]">
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Documents</p>
                <p className="mt-1 text-2xl font-bold">{documents.length}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Sections</p>
                <p className="mt-1 text-2xl font-bold">{totalSections}</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Source</p>
                <p className="mt-2 text-sm font-semibold">Documentation</p>
              </div>
            </div>
          </div>
        </header>

        <div className="grid items-start gap-8 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm xl:sticky xl:top-6">
            <h2 className="px-2 text-sm font-bold uppercase tracking-wide text-slate-600">
              Documentation
            </h2>
            <nav className="mt-4 flex max-h-[70vh] flex-col gap-5 overflow-y-auto pr-1">
              {groups.map((group) => (
                <div key={group.slug}>
                  <a
                    href={`#${group.slug}`}
                    className="block rounded-lg px-2 py-1 text-xs font-bold uppercase tracking-wide text-slate-500 hover:text-[#5a4df0]"
                  >
                    {group.title}
                  </a>
                  <div className="mt-2 flex flex-col gap-1">
                    {group.documents.map((doc) => (
                      <a
                        key={doc.slug}
                        href={`#${doc.slug}`}
                        className="rounded-lg border border-transparent px-3 py-2 text-sm font-medium leading-5 text-slate-700 hover:border-[#d8d4ff] hover:bg-[#f5f3ff] hover:text-[#5a4df0]"
                      >
                        {doc.title}
                      </a>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </aside>

          <div className="mx-auto flex w-full max-w-[980px] flex-col gap-12">
            {groups.map((group) => (
              <section key={group.slug} id={group.slug} className="scroll-mt-8">
                <div className="mb-4 px-1">
                  <p className="text-sm font-semibold uppercase tracking-wide text-[#6a5cff]">
                    {group.title}
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-950">
                    {group.title} Documentation
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    {group.documents.length} document{group.documents.length === 1 ? "" : "s"} in this folder
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {group.documents.map((doc) => {
                    const isFirstDocument = renderedDocumentIndex === 0;
                    renderedDocumentIndex += 1;

                    return (
                      <details
                        key={doc.slug}
                        id={doc.slug}
                        name="documentation-document"
                        open={isFirstDocument}
                        className="scroll-mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm [&_summary::-webkit-details-marker]:hidden"
                      >
                        <summary className="cursor-pointer list-none px-6 py-5 sm:px-8">
                          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wide text-[#6a5cff]">
                                {doc.relativePath}
                              </p>
                              <h3 className="mt-2 text-2xl font-bold leading-tight text-slate-950">{doc.title}</h3>
                              <p className="mt-2 text-sm text-slate-500">
                                {doc.sections.length} section{doc.sections.length === 1 ? "" : "s"} in this document
                              </p>
                            </div>
                            <span className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                              Open
                            </span>
                          </div>
                        </summary>

                        <div className="grid gap-5 border-t border-slate-200 bg-slate-50/60 px-4 py-5 sm:px-6">
                          {doc.sections.map((section) => (
                            <section
                              key={section.id}
                              id={section.id}
                              className="scroll-mt-8 rounded-xl border border-slate-200 bg-white px-5 py-5 sm:px-6"
                            >
                              <div className="border-b border-slate-100 pb-3">
                                <h4 className="text-xl font-bold leading-7 text-slate-950">{section.title}</h4>
                              </div>
                              <div className="mt-5 space-y-4 text-[15px] leading-7 text-slate-700">
                                {section.blocks.map((block, index) => {
                                  if (block.type === "paragraph") {
                                    return <p key={index}>{formatInlineText(block.text)}</p>;
                                  }
                                  if (block.type === "heading") {
                                    return (
                                      <h5 key={index} className="pt-2 text-base font-bold text-slate-950">
                                        {formatInlineText(block.text)}
                                      </h5>
                                    );
                                  }
                                  if (block.type === "list") {
                                    return (
                                      <ul key={index} className="space-y-2">
                                        {block.items.map((item, itemIndex) => (
                                          <li key={itemIndex} className="flex gap-3">
                                            <span className="mt-3 h-1.5 w-1.5 flex-none rounded-full bg-[#6a5cff]" />
                                            <span>{formatInlineText(item)}</span>
                                          </li>
                                        ))}
                                      </ul>
                                    );
                                  }
                                  return (
                                    <pre
                                      key={index}
                                      className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-950 p-4 text-xs leading-5 text-slate-50"
                                    >
                                      <code>{block.text}</code>
                                    </pre>
                                  );
                                })}
                              </div>
                            </section>
                          ))}
                        </div>
                      </details>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
