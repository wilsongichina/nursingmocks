import Layout from "@/components/layout/Layout";

const typeScale = [
  {
    name: "Page Title",
    className: "user-page-title",
    sample: "Learning Center",
    usage: "Use once at the top of a user page.",
  },
  {
    name: "Section Title",
    className: "user-section-title",
    sample: "Recommended Actions",
    usage: "Use for major panels and grouped page sections.",
  },
  {
    name: "Card Title",
    className: "user-card-title",
    sample: "Weekly Summary",
    usage: "Use inside cards, tiles, rows, notices, and compact modules.",
  },
  {
    name: "Body",
    className: "user-body",
    sample: "Use body text for important explanations that users need to understand before taking action.",
    usage: "Primary readable paragraph text.",
  },
  {
    name: "Small Body",
    className: "user-body-sm",
    sample: "Use smaller body text for compact descriptions that still need to be readable.",
    usage: "Secondary descriptions below headings or values.",
  },
  {
    name: "Helper",
    className: "user-helper",
    sample: "Changes may affect what appears in your workspace.",
    usage: "Field hints, consequences, empty-state copy, and metadata.",
  },
  {
    name: "Label",
    className: "user-label",
    sample: "Notification preference",
    usage: "Form labels, metadata labels, and compact field names.",
  },
];

const statusPills = [
  { label: "Active", className: "user-pill user-pill-green" },
  { label: "Recommended", className: "user-pill user-pill-purple" },
  { label: "Needs Review", className: "user-pill user-pill-amber" },
  { label: "Optional", className: "user-pill" },
];

const badges = [
  { label: "New", className: "user-badge user-badge-purple" },
  { label: "12", className: "user-badge user-badge-count user-badge-green" },
  { label: "Beta", className: "user-badge user-badge-amber" },
  { label: "Issue", className: "user-badge user-badge-red" },
  { label: "Label", className: "user-badge" },
];

const alerts = [
  {
    title: "Information alert",
    body: "Use information alerts to explain a process, next step, or non-blocking context.",
    className: "user-alert user-alert-info",
    icon: "i",
  },
  {
    title: "Success alert",
    body: "Use success alerts to confirm that a user action completed successfully.",
    className: "user-alert user-alert-success",
    icon: "ok",
  },
  {
    title: "Warning alert",
    body: "Use warning alerts before a user changes something that may affect their experience.",
    className: "user-alert user-alert-warning",
    icon: "!",
  },
  {
    title: "Error alert",
    body: "Use error alerts when an action failed and the user needs a clear correction path.",
    className: "user-alert user-alert-error",
    icon: "x",
  },
];

const dataRows = [
  ["Status", "Ready"],
  ["Last updated", "Today"],
  ["Visibility", "User only"],
  ["Next step", "Review details"],
];

function ExampleCard({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <section className="user-card p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="user-section-title">{title}</h2>
          {intro ? <p className="user-helper mt-1 max-w-2xl">{intro}</p> : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function CodeTag({ children }: { children: string }) {
  return (
    <code className="rounded-lg border border-[#e3e5f0] bg-white px-2 py-1 text-sm text-[#4338ca]">
      {children}
    </code>
  );
}

export default function TypographyPage() {
  return (
    <Layout>
      <main className="user-page">
        <div className="user-page-container">
          <header className="user-page-header">
            <div className="user-page-header-row">
              <div className="user-page-header-copy">
                <p className="user-eyebrow inline-flex items-center gap-2">
                  <span className="user-accent-dot" />
                  Authenticated User Interface Standard
                </p>
                <h1 className="user-page-title mt-2">Typography And UI Elements</h1>
                <p className="user-body-sm mt-3">
                  This page defines reusable text styles, surfaces, controls, and layout patterns for user-facing
                  application pages. Treat it as the baseline before adding page-specific styling.
                </p>
              </div>
              <div className="user-page-header-actions">
                <span className="user-badge user-badge-purple">Standard</span>
                <button className="user-button-secondary" type="button">Preview</button>
              </div>
            </div>
          </header>

          <div className="grid gap-5">
            <ExampleCard
              title="Foundation"
              intro="All user pages should start from the same background, width, spacing, and readable text rhythm."
            >
              <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
                <div className="rounded-[18px] border border-[#e3e5f0] bg-[radial-gradient(circle_at_top_left,#eef2ff,#f5f6fb_40%,#f9fafb_100%)] p-5">
                  <p className="user-card-title">Page Background</p>
                  <p className="user-helper mt-2">
                    Wrap authenticated user pages with <CodeTag>user-page</CodeTag> so every screen has the same calm
                    background and base text color.
                  </p>
                </div>
                <div className="user-detail-surface p-5">
                  <p className="user-card-title">Content Width</p>
                  <p className="user-helper mt-2">
                    Use <CodeTag>user-page-container</CodeTag> for consistent full-width user pages with readable side
                    spacing on desktop and mobile.
                  </p>
                </div>
              </div>
            </ExampleCard>

            <ExampleCard
              title="Page Header"
              intro="Use this structure at the top of authenticated user pages instead of building a new hero each time."
            >
              <header className="user-detail-surface p-5">
                <div className="user-page-header-row">
                  <div className="user-page-header-copy">
                    <p className="user-eyebrow inline-flex items-center gap-2">
                      <span className="user-accent-dot" />
                      Section Label
                    </p>
                    <h2 className="user-page-title mt-2">Page Title</h2>
                    <p className="user-body-sm mt-3">
                      Use one concise paragraph to explain what the user can manage here and what the page is for.
                    </p>
                    <div className="user-page-header-meta mt-4">
                      <span className="user-pill user-pill-green">Ready</span>
                      <span className="user-badge user-badge-purple">Updated</span>
                      <span className="user-badge">User page</span>
                    </div>
                  </div>
                  <div className="user-page-header-actions">
                    <button className="user-button-primary" type="button">Primary action</button>
                    <button className="user-button-secondary" type="button">Secondary action</button>
                  </div>
                </div>
              </header>
            </ExampleCard>

            <ExampleCard
              title="Navigation Patterns"
              intro="Choose the navigation pattern based on depth: breadcrumbs for location, tabs for peer views, pills for simple page filters, and subnav for persistent sections."
            >
              <div className="grid gap-5">
                <div className="user-detail-surface p-4">
                  <p className="user-label">Breadcrumbs</p>
                  <nav className="user-breadcrumbs mt-3" aria-label="Breadcrumb">
                    <a href="#">User area</a>
                    <span>/</span>
                    <a href="#">Records</a>
                    <span>/</span>
                    <span>Current page</span>
                  </nav>
                  <p className="user-helper mt-3">Use breadcrumbs only when users are inside a nested page or detail view.</p>
                </div>

                <div className="user-detail-surface p-4">
                  <p className="user-label">Tabs</p>
                  <div className="user-tabs mt-3" role="tablist" aria-label="Example tabs">
                    <button className="user-tab" type="button" role="tab" aria-selected="true">Overview</button>
                    <button className="user-tab" type="button" role="tab" aria-selected="false">Activity</button>
                    <button className="user-tab" type="button" role="tab" aria-selected="false">Settings</button>
                    <button className="user-tab" type="button" role="tab" aria-selected="false" disabled>Locked</button>
                  </div>
                  <p className="user-helper mt-3">Use tabs for peer views that switch content inside the same page.</p>
                </div>

                <div className="user-detail-surface p-4">
                  <p className="user-label">Horizontal Page Navigation</p>
                  <nav className="user-nav-list mt-3" aria-label="Page sections">
                    <a className="user-nav-pill" href="#" aria-current="page">
                      Summary <span className="user-badge user-badge-purple">Now</span>
                    </a>
                    <a className="user-nav-pill" href="#">Records</a>
                    <a className="user-nav-pill" href="#">Reports</a>
                    <a className="user-nav-pill" href="#">Settings</a>
                  </nav>
                  <p className="user-helper mt-3">
                    Use nav pills for simple page-level navigation where a full sidebar would be too heavy.
                  </p>
                </div>

                <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
                  <nav className="user-subnav" aria-label="Section navigation">
                    <a className="user-subnav-link" href="#" aria-current="page">
                      Summary <span className="user-badge user-badge-purple">Now</span>
                    </a>
                    <a className="user-subnav-link" href="#">Details</a>
                    <a className="user-subnav-link" href="#">History</a>
                    <a className="user-subnav-link" href="#">Preferences</a>
                  </nav>
                  <div className="user-detail-surface p-4">
                    <p className="user-card-title">Persistent Section Navigation</p>
                    <p className="user-helper mt-2">
                      Use subnav when a page has several durable sections that users may revisit repeatedly. Keep labels
                      short and mark the current section with <CodeTag>aria-current="page"</CodeTag>.
                    </p>
                  </div>
                </div>
              </div>
            </ExampleCard>

            <ExampleCard
              title="Summary Tiles And Progress"
              intro="Use summary tiles for quick metrics and progress indicators for completion or multi-step work."
            >
              <div className="grid gap-4 md:grid-cols-3">
                <article className="user-stat-tile">
                  <p className="user-label">Total records</p>
                  <p className="user-stat-value mt-2">128</p>
                  <p className="user-helper mt-2">Updated today</p>
                </article>
                <article className="user-stat-tile">
                  <p className="user-label">Completion</p>
                  <p className="user-stat-value mt-2">72%</p>
                  <div className="user-progress mt-3" aria-label="72 percent complete">
                    <div className="user-progress-bar" style={{ width: "72%" }} />
                  </div>
                </article>
                <article className="user-stat-tile">
                  <p className="user-label">Trend</p>
                  <p className="user-stat-value mt-2">+14</p>
                  <span className="user-badge user-badge-green mt-3">Improved</span>
                </article>
              </div>
              <div className="user-detail-surface mt-4 p-4">
                <div className="user-steps">
                  {["Started", "In progress", "Complete"].map((step, index) => (
                    <div key={step} className="user-step">
                      <span className="user-step-marker">{index + 1}</span>
                      <div>
                        <p className="user-card-title">{step}</p>
                        <p className="user-helper mt-1">Use steps when the user needs to understand sequence.</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ExampleCard>

            <ExampleCard
              title="Loading, Modal, And Destructive States"
              intro="Use these patterns for async states, confirmation dialogs, full-page empty states, and irreversible actions."
            >
              <div className="grid gap-5 lg:grid-cols-2">
                <div className="user-detail-surface p-4">
                  <p className="user-card-title">Skeleton Loading</p>
                  <div className="mt-4 grid gap-3">
                    <div className="user-skeleton h-5 w-3/4" />
                    <div className="user-skeleton h-4 w-full" />
                    <div className="user-skeleton h-4 w-2/3" />
                  </div>
                </div>
                <div className="user-empty-page user-detail-surface p-5">
                  <div>
                    <p className="user-card-title">No results found</p>
                    <p className="user-helper mt-2">Use full-page empty states when the whole view has no content.</p>
                    <button className="user-button-secondary mt-4" type="button">Reset view</button>
                  </div>
                </div>
                <div className="user-modal-backdrop lg:col-span-2">
                  <section className="user-modal mx-auto" role="dialog" aria-modal="true" aria-labelledby="example-modal-title">
                    <header className="user-modal-header">
                      <h3 id="example-modal-title" className="user-card-title">Confirm action</h3>
                      <button className="user-close-button" type="button" aria-label="Close dialog">x</button>
                    </header>
                    <div className="user-modal-body">
                      <p className="user-helper">Use modal dialogs only when the user must make a focused decision.</p>
                    </div>
                    <footer className="user-modal-footer">
                      <button className="user-button-cancel" type="button">Cancel</button>
                      <button className="user-button-danger" type="button">Delete</button>
                    </footer>
                  </section>
                </div>
              </div>
            </ExampleCard>

            <ExampleCard
              title="Type Scale"
              intro="Use these classes before adding one-off text sizes. The samples are neutral so the scale can apply anywhere."
            >
              <div className="grid gap-3">
                {typeScale.map((item) => (
                  <article key={item.name} className="user-detail-surface p-4">
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="user-label">{item.name}</p>
                        <div className={`${item.className} mt-2`}>{item.sample}</div>
                      </div>
                      <div className="max-w-sm md:text-right">
                        <CodeTag>{item.className}</CodeTag>
                        <p className="user-helper mt-2">{item.usage}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </ExampleCard>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="grid gap-5">
                <ExampleCard
                  title="Surfaces"
                  intro="Use surfaces to group work, not as decoration. Most pages should need only standard cards and detail surfaces."
                >
                  <div className="grid gap-4 md:grid-cols-3">
                    <article className="user-card p-5">
                      <span className="user-pill">Standard</span>
                      <h3 className="user-card-title mt-4">Default Card</h3>
                      <p className="user-helper mt-2">
                        Use for normal page sections, settings groups, activity panels, and reusable modules.
                      </p>
                    </article>
                    <article className="user-detail-surface p-5">
                      <span className="user-pill">Compact</span>
                      <h3 className="user-card-title mt-4">Detail Surface</h3>
                      <p className="user-helper mt-2">
                        Use inside cards for grouped rows, read-only values, helper blocks, and secondary content.
                      </p>
                    </article>
                    <article className="user-feature-surface p-5">
                      <span className="user-pill user-pill-purple">Priority</span>
                      <h3 className="user-card-title mt-4">Featured Surface</h3>
                      <p className="user-helper mt-2">
                        Use sparingly when one area needs priority, such as an urgent action or main state.
                      </p>
                    </article>
                  </div>
                </ExampleCard>

                <ExampleCard
                  title="Forms"
                  intro="Forms should feel intentional, easy to scan, and clear about state. Group each label, field, and helper message as one control."
                >
                  <div className="grid gap-5">
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="user-control">
                        <span className="user-control-header">
                          <span className="user-label">Text field</span>
                          <span className="user-required">Required</span>
                        </span>
                        <input className="user-field mt-2" defaultValue="Readable value" />
                        <span className="user-helper mt-2 block">Use helper text to explain consequences or expected format.</span>
                      </label>
                      <label className="user-control">
                        <span className="user-control-header">
                          <span className="user-label">Select field</span>
                          <span className="user-helper">Optional</span>
                        </span>
                        <select className="user-field mt-2" defaultValue="recommended">
                          <option value="recommended">Recommended</option>
                          <option value="optional">Optional</option>
                          <option value="hidden">Hidden</option>
                        </select>
                        <span className="user-helper mt-2 block">Keep choices short and clear.</span>
                      </label>
                      <label className="user-control">
                        <span className="user-label">Success state</span>
                        <input className="user-field user-field-success mt-2" defaultValue="Verified value" />
                        <span className="user-feedback user-feedback-success">This value is valid and ready to save.</span>
                      </label>
                      <label className="user-control">
                        <span className="user-label">Error state</span>
                        <input className="user-field user-field-error mt-2" defaultValue="Invalid value" />
                        <span className="user-feedback user-feedback-error">Enter a valid value before continuing.</span>
                      </label>
                      <label className="user-control">
                        <span className="user-label">Read-only field</span>
                        <input className="user-field mt-2" defaultValue="System managed" readOnly />
                        <span className="user-helper mt-2 block">Read-only values should look calm and intentionally locked.</span>
                      </label>
                      <label className="user-control">
                        <span className="user-label">Disabled field</span>
                        <input className="user-field mt-2" defaultValue="Unavailable" disabled />
                        <span className="user-helper mt-2 block">Disabled fields need nearby context when the reason is not obvious.</span>
                      </label>
                      <label className="user-control md:col-span-2">
                        <span className="user-label">Long text field</span>
                        <textarea
                          className="user-field mt-2 min-h-[104px]"
                          defaultValue="Longer notes should use the same field style and enough height to be readable."
                        />
                      </label>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <label className="user-choice">
                        <input type="checkbox" defaultChecked />
                        <span>
                          <span className="user-card-title block">Checkbox option</span>
                          <span className="user-helper mt-1 block">Use for independent yes/no choices.</span>
                        </span>
                      </label>
                      <label className="user-choice">
                        <input name="typography-radio" type="radio" defaultChecked />
                        <span>
                          <span className="user-card-title block">Radio option</span>
                          <span className="user-helper mt-1 block">Use when only one option can be selected.</span>
                        </span>
                      </label>
                      <div className="user-choice">
                        <span className="user-toggle mt-1" data-state="on" aria-hidden="true" />
                        <span>
                          <span className="user-card-title block">Toggle option</span>
                          <span className="user-helper mt-1 block">Use for immediate on/off preferences.</span>
                        </span>
                      </div>
                    </div>

                    <div className="user-feature-surface p-4">
                      <p className="user-card-title">Form Notice</p>
                      <p className="user-helper mt-2">
                        Use a notice near fields when changing values can affect saved progress, access, security,
                        personalization, or future recommendations.
                      </p>
                    </div>
                  </div>
                </ExampleCard>

                <ExampleCard
                  title="Data Rows"
                  intro="Use rows when users need to compare labels and values quickly without reading a full paragraph."
                >
                  <div className="user-detail-surface divide-y divide-[rgba(148,163,184,0.25)] overflow-hidden">
                    {dataRows.map(([label, value]) => (
                      <div key={label} className="grid gap-1 p-4 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center">
                        <p className="user-label">{label}</p>
                        <p className="user-body-sm font-semibold text-[#0f172a]">{value}</p>
                      </div>
                    ))}
                  </div>
                </ExampleCard>

                <ExampleCard
                  title="Search And Filters"
                  intro="Use search and filters together when users need to narrow repeated records before scanning a table or list."
                >
                  <div className="user-search-panel">
                    <div className="user-search-row lg:grid-cols-[minmax(0,1fr)_180px] lg:items-end">
                      <label className="user-control">
                        <span className="user-label">Search records</span>
                        <span className="user-search-input mt-2 block">
                          <span className="user-search-icon" aria-hidden="true">S</span>
                          <input className="user-field" defaultValue="recent activity" type="search" />
                        </span>
                      </label>
                      <label className="user-control">
                        <span className="user-label">Sort by</span>
                        <select className="user-field mt-2" defaultValue="recent">
                          <option value="recent">Most recent</option>
                          <option value="name">Name</option>
                          <option value="status">Status</option>
                        </select>
                      </label>
                    </div>

                    <div>
                      <p className="user-label">Quick filters</p>
                      <div className="user-filter-bar mt-2">
                        <button className="user-filter-chip" type="button" aria-pressed="true">All</button>
                        <button className="user-filter-chip" type="button" aria-pressed="false">Ready</button>
                        <button className="user-filter-chip" type="button" aria-pressed="false">Needs review</button>
                        <button className="user-filter-chip" type="button" aria-pressed="false">Archived</button>
                      </div>
                    </div>

                    <div>
                      <p className="user-label">Active filters</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="user-active-filter">
                          Search: recent activity
                          <button type="button" aria-label="Remove search filter">x</button>
                        </span>
                        <span className="user-active-filter">
                          Status: All
                          <button type="button" aria-label="Remove status filter">x</button>
                        </span>
                        <button className="user-button-cancel min-h-[30px] px-3 py-1.5 text-sm" type="button">
                          Clear filters
                        </button>
                      </div>
                    </div>
                  </div>
                </ExampleCard>

                <ExampleCard
                  title="Tables"
                  intro="Use tables for repeated comparable records. Keep headers compact and allow horizontal scrolling on small screens."
                >
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[620px] border-collapse text-sm">
                      <thead>
                        <tr>
                          <th className="p-3 text-left user-label">Item</th>
                          <th className="p-3 text-left user-label">Status</th>
                          <th className="p-3 text-left user-label">Updated</th>
                          <th className="p-3 text-right user-label">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {["Learning record", "Saved preference", "Recent activity"].map((item, index) => (
                          <tr key={item} className="border-t border-[rgba(226,232,240,0.9)]">
                            <td className="p-3 text-[#0f172a]">{item}</td>
                            <td className="p-3">
                              <span className={index === 1 ? "user-pill user-pill-amber" : "user-pill user-pill-green"}>
                                {index === 1 ? "Review" : "Ready"}
                              </span>
                            </td>
                            <td className="p-3 user-helper">Today</td>
                            <td className="p-3 text-right">
                              <button className="user-button-secondary min-h-[34px] px-3 py-1.5 text-sm" type="button">
                                Open
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ExampleCard>

                <ExampleCard
                  title="Pagination"
                  intro="Use pagination when repeated records need stable navigation without loading an overwhelming list."
                >
                  <div className="grid gap-5">
                    <div className="user-pagination">
                      <p className="user-helper">Showing 21-30 of 128 records</p>
                      <nav className="user-page-controls" aria-label="Pagination example">
                        <button className="user-page-button" type="button">Previous</button>
                        <button className="user-page-button" type="button">1</button>
                        <span className="user-page-ellipsis" aria-hidden="true">...</span>
                        <button className="user-page-button" type="button">3</button>
                        <button className="user-page-button" type="button" aria-current="page">4</button>
                        <button className="user-page-button" type="button">5</button>
                        <span className="user-page-ellipsis" aria-hidden="true">...</span>
                        <button className="user-page-button" type="button">13</button>
                        <button className="user-page-button" type="button">Next</button>
                      </nav>
                    </div>

                    <div className="user-detail-surface p-4">
                      <p className="user-label">Compact / Mobile Pattern</p>
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <button className="user-page-button" type="button" disabled>Previous</button>
                        <span className="user-helper font-semibold text-[#0f172a]">Page 1 of 13</span>
                        <button className="user-page-button" type="button">Next</button>
                      </div>
                      <p className="user-helper mt-3">
                        Use the compact pattern when there is not enough width for every page number.
                      </p>
                    </div>
                  </div>
                </ExampleCard>

                <ExampleCard
                  title="Buttons"
                  intro="Buttons should make action priority obvious. Use primary for the main action and secondary for supporting actions."
                >
                  <div className="grid gap-5">
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="user-detail-surface p-4">
                        <p className="user-label">Primary</p>
                        <button className="user-button-primary mt-3" type="button">Continue</button>
                        <p className="user-helper mt-3">Use for the one action that moves the user forward.</p>
                      </div>
                      <div className="user-detail-surface p-4">
                        <p className="user-label">Secondary</p>
                        <button className="user-button-secondary mt-3" type="button">View details</button>
                        <p className="user-helper mt-3">Use for supporting, optional, or navigation actions.</p>
                      </div>
                      <div className="user-detail-surface p-4">
                        <p className="user-label">Cancel</p>
                        <button className="user-button-cancel mt-3" type="button">Cancel</button>
                        <p className="user-helper mt-3">Use for backing out of a form, modal, or unsaved edit state.</p>
                      </div>
                      <div className="user-detail-surface p-4">
                        <p className="user-label">Close Icon</p>
                        <button className="user-close-button mt-3" type="button" aria-label="Close">x</button>
                        <p className="user-helper mt-3">Use for dismissing panels, dialogs, popovers, and alert banners.</p>
                      </div>
                      <div className="user-detail-surface p-4">
                        <p className="user-label">Compact</p>
                        <button className="user-button-secondary mt-3 min-h-[34px] px-3 py-1.5 text-sm" type="button">
                          Open
                        </button>
                        <p className="user-helper mt-3">Use inside tables, dense lists, and small repeated rows.</p>
                      </div>
                      <div className="user-detail-surface p-4">
                        <p className="user-label">Disabled</p>
                        <button className="user-button-primary mt-3" type="button" disabled>
                          Save changes
                        </button>
                        <p className="user-helper mt-3">Disable only when the action cannot run, and explain why nearby.</p>
                      </div>
                    </div>

                    <div className="user-detail-surface p-4">
                      <p className="user-label">Action Group</p>
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        <button className="user-button-primary" type="button">Save</button>
                        <button className="user-button-secondary" type="button">Preview</button>
                        <button className="user-button-cancel" type="button">Cancel</button>
                      </div>
                      <p className="user-helper mt-3">
                        Put the primary action first, then supporting actions. Stack buttons on mobile when space is tight.
                      </p>
                    </div>

                    <div className="user-detail-surface p-4">
                      <p className="user-label">Full Width On Mobile</p>
                      <div className="mt-3 grid gap-2 sm:flex">
                        <button className="user-button-primary w-full sm:w-auto" type="button">Start process</button>
                        <button className="user-button-secondary w-full sm:w-auto" type="button">Learn more</button>
                      </div>
                      <p className="user-helper mt-3">
                        Use full-width mobile buttons for important forms and narrow layouts, then return to content-width on desktop.
                      </p>
                    </div>
                  </div>
                </ExampleCard>
              </div>

              <aside className="grid content-start gap-5">
                <ExampleCard title="Actions">
                  <div className="grid gap-3">
                    <button className="user-button-primary" type="button">Primary action</button>
                    <button className="user-button-secondary" type="button">Secondary action</button>
                  </div>
                  <p className="user-helper mt-4">
                    Use one primary action per decision area. Secondary actions should support, cancel, or navigate.
                  </p>
                </ExampleCard>

                <ExampleCard title="Status Pills">
                  <div className="flex flex-wrap gap-2">
                    {statusPills.map((pill) => (
                      <span key={pill.label} className={pill.className}>
                        {pill.label}
                      </span>
                    ))}
                  </div>
                </ExampleCard>

                <ExampleCard title="Badges">
                  <div className="grid gap-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {badges.map((badge) => (
                        <span key={badge.label} className={badge.className}>
                          {badge.label}
                        </span>
                      ))}
                    </div>
                    <div className="user-detail-surface p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="user-card-title">Inline metadata</p>
                        <span className="user-badge user-badge-purple">Updated</span>
                      </div>
                      <p className="user-helper mt-2">
                        Use badges for small labels, counts, and compact metadata. Use pills for larger status states.
                      </p>
                    </div>
                  </div>
                </ExampleCard>

                <ExampleCard title="Alerts">
                  <div className="grid gap-3">
                    {alerts.map((alert) => (
                      <div key={alert.title} className={alert.className} role="status">
                        <span className="user-alert-icon" aria-hidden="true">{alert.icon}</span>
                        <div>
                          <p className="user-card-title">{alert.title}</p>
                          <p className="user-helper mt-1">{alert.body}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ExampleCard>

                <ExampleCard title="Closeable Alert">
                  <div className="user-alert user-alert-warning" role="status">
                    <span className="user-alert-icon" aria-hidden="true">!</span>
                    <div className="min-w-0 flex-1">
                      <p className="user-card-title">Unsaved changes</p>
                      <p className="user-helper mt-1">Use a close button only when dismissing the message is safe.</p>
                    </div>
                    <button className="user-close-button" type="button" aria-label="Dismiss alert">x</button>
                  </div>
                </ExampleCard>

                <ExampleCard title="Notice">
                  <div className="user-alert user-alert-info" role="note">
                    <span className="user-alert-icon" aria-hidden="true">i</span>
                    <div>
                      <p className="user-card-title">Important information</p>
                      <p className="user-helper mt-2">
                        Use notices to explain consequences before users change meaningful settings or start a process.
                      </p>
                    </div>
                  </div>
                </ExampleCard>

                <ExampleCard title="Empty State">
                  <div className="user-detail-surface p-5 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(79,70,229,0.2)] bg-[rgba(79,70,229,0.06)]">
                      <span className="user-accent-dot" />
                    </div>
                    <p className="user-card-title mt-4">Nothing to show yet</p>
                    <p className="user-helper mt-2">
                      Empty states should explain what is missing and provide a clear next action when one exists.
                    </p>
                    <button className="user-button-secondary mt-4" type="button">Refresh</button>
                  </div>
                </ExampleCard>

                <ExampleCard title="Usage Rules">
                  <ul className="grid gap-3 text-[15px] leading-6 text-[#4b5563]">
                    <li>Start every authenticated user page with the shared page wrapper and container.</li>
                    <li>Use one page title per screen and keep it descriptive.</li>
                    <li>Use section titles for major content groups only.</li>
                    <li>Use cards for grouped work, not for every small row.</li>
                    <li>Use featured surfaces sparingly so priority remains meaningful.</li>
                    <li>Keep helper text readable and tied to actual consequences.</li>
                    <li>Do not use negative letter spacing or viewport-scaled text on user pages.</li>
                    <li>Prefer shared classes before adding page-specific Tailwind typography.</li>
                  </ul>
                </ExampleCard>
              </aside>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
