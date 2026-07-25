type AdminConfirmDialogOptions = {
  title: string;
  itemName: string;
  consequence?: string;
  confirmLabel?: string;
  cancelLabel?: string;
};

export function showAdminConfirmDialog({
  title,
  itemName,
  consequence = "This action cannot be undone.",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
}: AdminConfirmDialogOptions): Promise<boolean> {
  return new Promise((resolve) => {
    const backdrop = document.createElement("div");
    backdrop.className = "admin-modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "admin-modal max-w-[460px]";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    const header = document.createElement("div");
    header.className = "admin-modal-header";

    const heading = document.createElement("h2");
    heading.className = "admin-modal-title";
    heading.textContent = title;
    heading.id = "admin-confirm-dialog-title";
    modal.setAttribute("aria-labelledby", heading.id);

    header.appendChild(heading);

    const body = document.createElement("div");
    body.className = "admin-modal-body";

    const dialog = document.createElement("div");
    dialog.className = "admin-destructive-dialog";

    const icon = document.createElement("div");
    icon.className = "admin-destructive-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "!";

    const copy = document.createElement("p");
    copy.className = "admin-destructive-copy";
    copy.append("Are you sure you want to delete ");
    const strong = document.createElement("strong");
    strong.textContent = itemName;
    copy.append(strong, "?");

    const consequenceText = document.createElement("p");
    consequenceText.className = "admin-destructive-consequence";
    consequenceText.textContent = consequence;

    const footer = document.createElement("div");
    footer.className = "admin-modal-footer";

    const cancelButton = document.createElement("button");
    cancelButton.type = "button";
    cancelButton.className = "admin-button-cancel";
    cancelButton.textContent = cancelLabel;

    const confirmButton = document.createElement("button");
    confirmButton.type = "button";
    confirmButton.className = "admin-button-danger";
    confirmButton.textContent = confirmLabel;

    const close = (confirmed: boolean) => {
      document.removeEventListener("keydown", handleKeyDown);
      backdrop.remove();
      resolve(confirmed);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close(false);
      }
    };

    cancelButton.addEventListener("click", () => close(false));
    confirmButton.addEventListener("click", () => close(true));
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) close(false);
    });
    document.addEventListener("keydown", handleKeyDown);

    footer.append(cancelButton, confirmButton);
    dialog.append(icon, copy, consequenceText, footer);
    body.appendChild(dialog);
    modal.append(header, body);
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    confirmButton.focus();
  });
}
