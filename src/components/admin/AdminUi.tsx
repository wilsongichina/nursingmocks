import Link from "next/link";
import type { ReactNode } from "react";

type AdminPageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

type AdminBreadcrumbItem = {
  label: string;
  href?: string;
};

type AdminTopBarProps = {
  breadcrumbs: AdminBreadcrumbItem[];
  actions?: ReactNode;
};

type AdminAlertProps = {
  tone: "success" | "error" | "warning" | "info";
  title?: string;
  children: ReactNode;
};

type AdminNotificationRegionProps = {
  error?: ReactNode;
  success?: ReactNode;
  warning?: ReactNode;
  info?: ReactNode;
  errorTitle?: string;
  successTitle?: string;
  warningTitle?: string;
  infoTitle?: string;
};

type AdminTabItem = {
  id: string;
  label: string;
};

type AdminTabsProps = {
  tabs: AdminTabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  label?: string;
};

type AdminStatCardProps = {
  label: string;
  value: ReactNode;
  helper?: ReactNode;
};

type AdminToolbarProps = {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

type AdminTableProps = {
  children: ReactNode;
  className?: string;
  tableClassName?: string;
};

type AdminTableCellProps = {
  children: ReactNode;
  className?: string;
  nowrap?: boolean;
  mono?: boolean;
};

type AdminLoadingStateProps = {
  title: string;
  description: ReactNode;
};

type AdminLoadingShellProps = AdminLoadingStateProps & {
  className?: string;
};

type AdminInlineLoadingProps = {
  label: string;
  className?: string;
};

type AdminEmptyStateProps = {
  title: string;
  description: ReactNode;
  action?: ReactNode;
};

type AdminDetailPanelProps = {
  title?: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

type AdminInfoTileProps = {
  label: string;
  children: ReactNode;
};

type AdminBadgeTone = "purple" | "green" | "amber" | "blue" | "gray";

type AdminBadgeListItem = {
  label: ReactNode;
  tone?: AdminBadgeTone;
};

type AdminBadgeListProps = {
  items: AdminBadgeListItem[];
  emptyLabel?: ReactNode;
};

type AdminTableEmptyStateProps = AdminEmptyStateProps & {
  colSpan: number;
};

type AdminStatusTone = "green" | "amber" | "red" | "purple" | "gray" | "blue";

type AdminStatusBadgeProps = {
  label: string | null | undefined;
  tone?: AdminStatusTone;
};

type AdminPaginationProps = {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
};

type AdminFormSectionProps = {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

type AdminFieldGroupProps = {
  label: string;
  required?: boolean;
  helper?: ReactNode;
  children: ReactNode;
};

type AdminValidationMessageProps = {
  children: ReactNode;
};

type AdminSlugFieldProps = {
  origin: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
};

type AdminSelectFieldProps = {
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
  required?: boolean;
};

type AdminModalProps = {
  title: string;
  description?: ReactNode;
  children: ReactNode;
  maxWidthClassName?: string;
  onClose?: () => void;
};

type AdminModalFooterProps = {
  children: ReactNode;
};

type AdminDestructiveDialogProps = {
  title: string;
  itemName: ReactNode;
  consequence?: ReactNode;
  confirmLabel: string;
  confirmingLabel?: string;
  confirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function normalizeStatusLabel(label: string | null | undefined) {
  if (!label) return "Not Available";
  return label
    .replace(/[_-]+/g, " ")
    .trim()
    .replace(/\w\S*/g, (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
}

function inferStatusTone(label: string | null | undefined): AdminStatusTone {
  const normalized = (label || "").trim().toLowerCase();
  if (["published", "active", "enabled", "ready", "paid", "sent", "success"].includes(normalized)) {
    return "green";
  }
  if (["draft", "pending", "review", "needs review", "processing"].includes(normalized)) {
    return "amber";
  }
  if (["archived", "disabled", "failed", "error", "inactive", "blocked"].includes(normalized)) {
    return "red";
  }
  if (["admin", "featured"].includes(normalized)) {
    return "purple";
  }
  if (["test", "preview"].includes(normalized)) {
    return "blue";
  }
  return "gray";
}

export function AdminPageHeader({
  eyebrow = "Admin",
  title,
  description,
  actions,
}: AdminPageHeaderProps) {
  return (
    <header className="admin-header mb-6">
      <div className="admin-header-row">
        <div className="admin-header-copy">
          <p className="admin-eyebrow">{eyebrow}</p>
          <h1 className="admin-page-title mt-1">{title}</h1>
          {description && <p className="admin-body mt-2 max-w-4xl">{description}</p>}
        </div>
        {actions && <div className="admin-header-actions">{actions}</div>}
      </div>
    </header>
  );
}

export function AdminTopBar({ breadcrumbs, actions }: AdminTopBarProps) {
  return (
    <div className="admin-topbar">
      <div className="admin-topbar-inner">
        <nav className="admin-breadcrumbs" aria-label="Admin breadcrumb">
          {breadcrumbs.map((item, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <span key={`${item.label}-${index}`} className="admin-breadcrumb-segment">
                {index > 0 && (
                  <svg
                    className="admin-breadcrumb-icon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                )}
                {item.href && !isLast ? (
                  <Link href={item.href} className="admin-breadcrumb-link">
                    {item.label}
                  </Link>
                ) : (
                  <span className="admin-breadcrumb-current" aria-current={isLast ? "page" : undefined}>
                    {item.label}
                  </span>
                )}
              </span>
            );
          })}
        </nav>
        {actions && <div className="admin-topbar-actions">{actions}</div>}
      </div>
    </div>
  );
}

export function AdminAlert({ tone, title, children }: AdminAlertProps) {
  const toneClass =
    tone === "success"
      ? "user-alert-success"
      : tone === "error"
      ? "user-alert-error"
      : tone === "warning"
      ? "user-alert-warning"
      : "user-alert-info";

  return (
    <div className={`user-alert ${toneClass} mb-6`} role={tone === "error" ? "alert" : "status"}>
      <span className="user-alert-icon" aria-hidden="true">
        {tone === "error" ? "x" : tone === "success" ? "!" : "i"}
      </span>
      <div>
        {title && <p className="user-card-title">{title}</p>}
        <div className="user-helper mt-1">{children}</div>
      </div>
    </div>
  );
}

export function AdminNotificationRegion({
  error,
  success,
  warning,
  info,
  errorTitle = "Unable To Complete Action",
  successTitle = "Action Completed",
  warningTitle = "Review Needed",
  infoTitle = "Notice",
}: AdminNotificationRegionProps) {
  if (!error && !success && !warning && !info) {
    return null;
  }

  return (
    <div className="admin-notification-region" aria-live="polite">
      {error && (
        <AdminAlert tone="error" title={errorTitle}>
          {error}
        </AdminAlert>
      )}
      {success && (
        <AdminAlert tone="success" title={successTitle}>
          {success}
        </AdminAlert>
      )}
      {warning && (
        <AdminAlert tone="warning" title={warningTitle}>
          {warning}
        </AdminAlert>
      )}
      {info && (
        <AdminAlert tone="info" title={infoTitle}>
          {info}
        </AdminAlert>
      )}
    </div>
  );
}

export function AdminTabs({ tabs, activeTab, onChange, label = "Admin sections" }: AdminTabsProps) {
  return (
    <div className="admin-tabs" role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={activeTab === tab.id}
          className="admin-tab-button"
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function AdminCard({
  title,
  description,
  children,
  className = "",
}: {
  title?: string;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`admin-card p-5 ${className}`}>
      {(title || description) && (
        <div className="mb-4">
          {title && <h2 className="admin-section-title">{title}</h2>}
          {description && <p className="admin-helper mt-1">{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function AdminLoadingState({ title, description }: AdminLoadingStateProps) {
  return (
    <div className="admin-loading-state" role="status" aria-live="polite">
      <div className="admin-loading-spinner" aria-hidden="true" />
      <p className="admin-loading-title">{title}</p>
      <p className="admin-loading-description">{description}</p>
      <div className="admin-loading-skeletons" aria-hidden="true">
        <div className="admin-loading-skeleton h-5 w-3/4" />
        <div className="admin-loading-skeleton h-4 w-full" />
        <div className="admin-loading-skeleton h-4 w-2/3" />
      </div>
    </div>
  );
}

export function AdminLoadingShell({
  title,
  description,
  className = "",
}: AdminLoadingShellProps) {
  return (
    <div
      className={`flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-6 sm:px-6 lg:px-8 ${className}`}
    >
      <AdminLoadingState title={title} description={description} />
    </div>
  );
}

export function AdminInlineLoading({ label, className = "" }: AdminInlineLoadingProps) {
  return (
    <div className={`admin-inline-loading ${className}`} role="status" aria-live="polite">
      <span className="admin-inline-loading-spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function AdminStatCard({ label, value, helper }: AdminStatCardProps) {
  return (
    <div className="admin-stat-card">
      <p className="user-label">{label}</p>
      <p className="user-stat-value mt-2">{value}</p>
      {helper && <p className="admin-helper mt-2">{helper}</p>}
    </div>
  );
}

export function AdminToolbar({ children, actions, className = "" }: AdminToolbarProps) {
  return (
    <div className={`admin-toolbar ${className}`}>
      <div className="admin-toolbar-fields">{children}</div>
      {actions && <div className="admin-toolbar-actions">{actions}</div>}
    </div>
  );
}

export function AdminModal({
  title,
  description,
  children,
  maxWidthClassName = "max-w-[560px]",
  onClose,
}: AdminModalProps) {
  return (
    <div className="admin-modal-backdrop">
      <div className={`admin-modal ${maxWidthClassName}`} role="dialog" aria-modal="true">
        <div className="admin-modal-header flex items-start justify-between gap-4">
          <div>
            <h2 className="admin-modal-title">{title}</h2>
            {description && <p className="admin-modal-description">{description}</p>}
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-lg font-semibold leading-none text-gray-500 transition hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700"
              aria-label="Close modal"
            >
              &times;
            </button>
          )}
        </div>
        <div className="admin-modal-body">{children}</div>
      </div>
    </div>
  );
}

export function AdminModalFooter({ children }: AdminModalFooterProps) {
  return <div className="admin-modal-footer">{children}</div>;
}

export function AdminDestructiveDialog({
  title,
  itemName,
  consequence = "This action cannot be undone.",
  confirmLabel,
  confirmingLabel = "Deleting...",
  confirming = false,
  onCancel,
  onConfirm,
}: AdminDestructiveDialogProps) {
  return (
    <AdminModal title={title} maxWidthClassName="max-w-[460px]">
      <div className="admin-destructive-dialog">
        <div className="admin-destructive-icon" aria-hidden="true">
          !
        </div>
        <p className="admin-destructive-copy">
          Are you sure you want to delete <strong>{itemName}</strong>?
        </p>
        <p className="admin-destructive-consequence">{consequence}</p>
        <AdminModalFooter>
          <button
            type="button"
            onClick={onCancel}
            disabled={confirming}
            className="admin-button-cancel"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="admin-button-danger"
          >
            {confirming ? (
              <>
                <span className="admin-button-spinner" aria-hidden="true" />
                <span>{confirmingLabel}</span>
              </>
            ) : (
              confirmLabel
            )}
          </button>
        </AdminModalFooter>
      </div>
    </AdminModal>
  );
}

export function AdminTable({ children, className = "", tableClassName = "" }: AdminTableProps) {
  return (
    <div className={`admin-table-wrap ${className}`}>
      <table className={`admin-table ${tableClassName}`}>{children}</table>
    </div>
  );
}

export function AdminTableCell({
  children,
  className = "",
  nowrap = true,
  mono = false,
}: AdminTableCellProps) {
  const classes = [
    nowrap ? "admin-table-cell-nowrap" : "",
    mono ? "admin-table-cell-mono" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return <td className={classes}>{children}</td>;
}

export function AdminEmptyState({ title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="admin-empty-state">
      <div className="admin-empty-state-icon" aria-hidden="true">
        +
      </div>
      <div>
        <p className="admin-card-title">{title}</p>
        <p className="admin-helper mt-1">{description}</p>
      </div>
      {action && <div className="admin-empty-state-action">{action}</div>}
    </div>
  );
}

export function AdminDetailPanel({
  title,
  children,
  actions,
  className = "",
}: AdminDetailPanelProps) {
  return (
    <aside className={`admin-detail-panel ${className}`}>
      <div className="admin-detail-panel-copy">
        {title && <p className="admin-detail-panel-title">{title}</p>}
        <div className="admin-detail-panel-body">{children}</div>
      </div>
      {actions && <div className="admin-detail-panel-actions">{actions}</div>}
    </aside>
  );
}

export function AdminInfoTile({ label, children }: AdminInfoTileProps) {
  return (
    <div className="admin-info-tile">
      <p className="admin-info-tile-label">{label}</p>
      <div className="admin-info-tile-value">{children}</div>
    </div>
  );
}

export function AdminBadgeList({ items, emptyLabel = "None" }: AdminBadgeListProps) {
  if (items.length === 0) {
    return <p className="admin-helper">{emptyLabel}</p>;
  }

  return (
    <div className="admin-badge-list">
      {items.map((item, index) => (
        <span
          className={`admin-overview-badge admin-overview-badge-${item.tone || "gray"}`}
          key={index}
        >
          {item.label}
        </span>
      ))}
    </div>
  );
}

export function AdminTableEmptyState({
  colSpan,
  title,
  description,
  action,
}: AdminTableEmptyStateProps) {
  return (
    <tr>
      <td colSpan={colSpan}>
        <AdminEmptyState title={title} description={description} action={action} />
      </td>
    </tr>
  );
}

export function AdminStatusBadge({ label, tone }: AdminStatusBadgeProps) {
  const resolvedTone = tone || inferStatusTone(label);
  return (
    <span className={`admin-status-badge admin-status-badge-${resolvedTone}`}>
      {normalizeStatusLabel(label)}
    </span>
  );
}

export function AdminPagination({
  currentPage,
  totalItems,
  itemsPerPage,
  itemLabel,
  onPageChange,
}: AdminPaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const visiblePages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      (page >= currentPage - 1 && page <= currentPage + 1)
  );

  return (
    <nav className="admin-pagination" aria-label={`${itemLabel} pagination`}>
      <p className="admin-pagination-summary">
        Showing {startItem} to {endItem} of {totalItems} {itemLabel}
      </p>
      <div className="admin-pagination-controls">
        <button
          type="button"
          className="admin-pagination-button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <div className="admin-pagination-pages">
          {visiblePages.map((page, index) => {
            const previousPage = visiblePages[index - 1];
            const showGap = previousPage !== undefined && page - previousPage > 1;
            return (
              <span className="admin-pagination-page-group" key={page}>
                {showGap && <span className="admin-pagination-gap">...</span>}
                <button
                  type="button"
                  className="admin-pagination-button admin-pagination-number"
                  aria-current={currentPage === page ? "page" : undefined}
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              </span>
            );
          })}
        </div>
        <button
          type="button"
          className="admin-pagination-button"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
    </nav>
  );
}

export function AdminFormSection({
  title,
  description,
  children,
  className = "",
}: AdminFormSectionProps) {
  return (
    <section className={`admin-form-section ${className}`}>
      {(title || description) && (
        <div className="admin-form-section-header">
          {title && <h3 className="admin-card-title">{title}</h3>}
          {description && <p className="admin-helper mt-1">{description}</p>}
        </div>
      )}
      <div className="admin-form-section-body">{children}</div>
    </section>
  );
}

export function AdminFieldGroup({ label, required = false, helper, children }: AdminFieldGroupProps) {
  return (
    <label className="admin-field-group">
      <span className="admin-field-label">
        {label}
        {required && <span className="admin-required-marker" aria-label="required">*</span>}
      </span>
      {children}
      {helper && <span className="admin-field-helper">{helper}</span>}
    </label>
  );
}

export function AdminSlugField({
  origin,
  value,
  onChange,
  placeholder,
  required = false,
}: AdminSlugFieldProps) {
  return (
    <div className="admin-slug-field">
      <span className="admin-slug-origin">{origin.replace(/\/$/, "")}/</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="admin-slug-input"
        placeholder={placeholder}
        required={required}
      />
    </div>
  );
}

export function AdminSelectField({
  value,
  onChange,
  children,
  required = false,
}: AdminSelectFieldProps) {
  return (
    <div className="admin-select-field">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="admin-select-input"
        required={required}
      >
        {children}
      </select>
      <svg
        className="admin-select-icon"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9l6 6 6-6" />
      </svg>
    </div>
  );
}

export function AdminValidationMessage({ children }: AdminValidationMessageProps) {
  return (
    <div className="admin-validation-message" role="alert">
      <span className="admin-validation-icon" aria-hidden="true">!</span>
      <p>{children}</p>
    </div>
  );
}
