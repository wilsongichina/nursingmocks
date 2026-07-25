"use client";

import { useCallback, useMemo, useState } from "react";
import {
  AdminAlert,
  AdminCard,
  AdminInlineLoading,
  AdminNotificationRegion,
  AdminPageHeader,
  AdminStatCard,
  AdminStatusBadge,
  AdminTabs,
  AdminTable,
  AdminTableCell,
  AdminTopBar,
} from "@/components/admin/AdminUi";
import AdminSidebar from "@/components/layout/AdminSidebar";
import { SidebarProvider, useSidebar } from "@/components/layout/SidebarContext";
import UserProfileBadge from "@/components/layout/UserProfileBadge";
import { useAuth } from "@/contexts/AuthContext";
import type {
  NaxlexFolderImageRecord,
  NaxlexFolderImageScanResult,
} from "@/lib/admin/naxlex-image-folder-scan";

async function readAdminJson(response: Response) {
  const text = await response.text();
  if (!text.trim()) return {};
  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { error: text.trim() };
  }
}

function imageKey(image: NaxlexFolderImageRecord) {
  return `${image.relativeJsonPath}::${image.fieldPath}::${image.imageSourceUrl}`;
}

function imageSaveFolder(result: NaxlexFolderImageScanResult) {
  const firstTarget = result.images.find((image) => image.targetPath)?.targetPath;
  if (!firstTarget) return "";
  const separatorIndex = Math.max(firstTarget.lastIndexOf("\\"), firstTarget.lastIndexOf("/"));
  return separatorIndex > 0 ? firstTarget.slice(0, separatorIndex) : "";
}

const MAX_CONCURRENT_DOWNLOADS = 15;
const NAXLEX_SCAN_ROOT = "C:\\Users\\wilso\\OneDrive\\Desktop\\Naxlex";
type ImageStatusTab = "unfinished" | "finished";
type UnsavedImageFailure = {
  imageSourceUrl: string;
  fieldPath: string;
  error: string;
};

type ImageDownloadFailure = UnsavedImageFailure & {
  image: NaxlexFolderImageRecord;
};

function ImageSourcesContent() {
  const { isCollapsed } = useSidebar();
  const { currentUser } = useAuth();
  const [folderPath, setFolderPath] = useState(NAXLEX_SCAN_ROOT);
  const [result, setResult] = useState<NaxlexFolderImageScanResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [openingFolder, setOpeningFolder] = useState(false);
  const [openingSavedImageKey, setOpeningSavedImageKey] = useState<string | null>(null);
  const [downloadingImageKeys, setDownloadingImageKeys] = useState<Set<string>>(() => new Set());
  const [bulkDownloading, setBulkDownloading] = useState(false);
  const [bulkProgress, setBulkProgress] = useState("");
  const [activeImageTab, setActiveImageTab] = useState<ImageStatusTab>("unfinished");
  const [autoContinue, setAutoContinue] = useState(true);
  const [skipCompleted, setSkipCompleted] = useState(true);
  const [resettingProgress, setResettingProgress] = useState(false);
  const [savingReport, setSavingReport] = useState(false);
  const [navigatingFolder, setNavigatingFolder] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const localCount = useMemo(
    () => result?.images.filter((image) => image.existsLocally).length || 0,
    [result]
  );
  const missingImages = useMemo(
    () => result?.images.filter((image) => !image.existsLocally) || [],
    [result]
  );
  const finishedImages = useMemo(
    () => result?.images.filter((image) => image.existsLocally) || [],
    [result]
  );
  const visibleImages = activeImageTab === "finished" ? finishedImages : missingImages;
  const isBusy = loading || bulkDownloading;

  const scanFolder = useCallback(async (folderPathOverride?: string) => {
    if (!currentUser) return null;
    const requestedFolder = (folderPathOverride || folderPath).trim();
    if (!requestedFolder) {
      setError("Enter a local Naxlex folder path before scanning.");
      setResult(null);
      return null;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);
    setBulkProgress("");
    setActiveImageTab("unfinished");

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/image-sources/folder-scan", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ folderPath: requestedFolder }),
      });
      const data = await readAdminJson(response);
      if (!response.ok) {
        throw new Error(String(data.error || "Could not scan image folder"));
      }
      const scanResult = data as NaxlexFolderImageScanResult;
      setFolderPath(scanResult.folderPath);
      setResult(scanResult);
      return scanResult;
    } catch (scanError) {
      setError(scanError instanceof Error ? scanError.message : "Could not scan image folder");
      return null;
    } finally {
      setLoading(false);
    }
  }, [currentUser, folderPath]);

  const openFolder = useCallback(
    async (targetFolderPath: string) => {
      if (!currentUser) return;
      const requestedFolder = targetFolderPath.trim();
      if (!requestedFolder) {
        setError("Enter a local Naxlex folder path before opening.");
        return;
      }

      setOpeningFolder(true);
      setError(null);
      setSuccess(null);

      try {
        const token = await currentUser.getIdToken();
        const response = await fetch("/api/admin/image-sources/open-folder", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ folderPath: requestedFolder }),
        });
        const data = await readAdminJson(response);
        if (!response.ok) {
          throw new Error(String(data.error || "Could not open folder"));
        }
      } catch (openError) {
        setError(openError instanceof Error ? openError.message : "Could not open folder");
      } finally {
        setOpeningFolder(false);
      }
    },
    [currentUser]
  );

  async function requestImageDownload(
    scanResult: NaxlexFolderImageScanResult,
    image: NaxlexFolderImageRecord,
    token: string
  ) {
    const response = await fetch("/api/admin/image-sources/download-image", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        folderPath: scanResult.folderPath,
        imageSourceUrl: image.imageSourceUrl,
        fieldPath: image.fieldPath,
      }),
    });
    const data = await readAdminJson(response);
    if (!response.ok) {
      throw new Error(String(data.error || "Could not download image"));
    }
    return data;
  }

  function markImageSaved(key: string) {
    setResult((current) =>
      current
        ? {
            ...current,
            images: current.images.map((candidate) =>
              imageKey(candidate) === key ? { ...candidate, existsLocally: true } : candidate
            ),
          }
        : current
    );
  }

  function setImageDownloading(key: string, downloading: boolean) {
    setDownloadingImageKeys((current) => {
      const next = new Set(current);
      if (downloading) {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }

  async function downloadImage(image: NaxlexFolderImageRecord) {
    if (!currentUser || !result) return;
    const key = imageKey(image);
    setImageDownloading(key, true);
    setError(null);
    setSuccess(null);

    try {
      const token = await currentUser.getIdToken();
      const data = await requestImageDownload(result, image, token);
      markImageSaved(key);
      setSuccess(`Saved image with ${data.provider || "Zyte"} to ${data.targetPath || image.targetPath}`);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error ? downloadError.message : "Could not download image"
      );
    } finally {
      setImageDownloading(key, false);
    }
  }

  async function saveUnsavedReport(
    scanResult: NaxlexFolderImageScanResult,
    failures: UnsavedImageFailure[] = []
  ) {
    if (!currentUser) return null;
    setSavingReport(true);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/image-sources/save-unsaved-report", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderPath: scanResult.folderPath,
          failures,
        }),
      });
      const data = await readAdminJson(response);
      if (!response.ok) {
        throw new Error(String(data.error || "Could not save unsaved image report"));
      }
      return data as { reportPath?: string; status?: string; unsavedCount?: number };
    } finally {
      setSavingReport(false);
    }
  }

  async function generateMissingImages(folderPathOverride?: string, continueAfterFolder = autoContinue) {
    if (!currentUser) return;
    const scanResult = await scanFolder(folderPathOverride);
    if (!scanResult) return;
    const activeScanResult = scanResult;
    const imagesToDownload = scanResult.images.filter((image) => !image.existsLocally);
    if (imagesToDownload.length === 0) {
      const report = await saveUnsavedReport(activeScanResult);
      setSuccess(
        `No missing images found. Folder marked complete and report saved to ${
          report?.reportPath || "unsaved-images.txt"
        }.`
      );
      if (continueAfterFolder) {
        await navigateFolder("next", true, activeScanResult.folderPath, continueAfterFolder);
      }
      return;
    }

    setBulkDownloading(true);
    setError(null);
    setSuccess(null);
    setBulkProgress(`0 of ${imagesToDownload.length} saved`);

    let saved = 0;

    try {
      const token = await currentUser.getIdToken();
      const workerCount = Math.min(MAX_CONCURRENT_DOWNLOADS, imagesToDownload.length);

      async function downloadBatch(
        images: NaxlexFolderImageRecord[],
        attemptLabel: "first pass" | "retry"
      ) {
        const failures: ImageDownloadFailure[] = [];
        let nextIndex = 0;

        async function downloadNextImage() {
          while (nextIndex < images.length) {
            const image = images[nextIndex];
            nextIndex += 1;
            const key = imageKey(image);
            setImageDownloading(key, true);

            try {
              await requestImageDownload(activeScanResult, image, token);
              saved += 1;
              markImageSaved(key);
            } catch (downloadError) {
              failures.push({
                image,
                imageSourceUrl: image.imageSourceUrl,
                fieldPath: image.fieldPath,
                error:
                  downloadError instanceof Error ? downloadError.message : "Could not download image",
              });
            } finally {
              setImageDownloading(key, false);
              setBulkProgress(
                `${saved} of ${imagesToDownload.length} saved during ${attemptLabel}${
                  failures.length ? `, ${failures.length} failed` : ""
                }`
              );
            }
          }
        }

        await Promise.all(
          Array.from({ length: Math.min(MAX_CONCURRENT_DOWNLOADS, images.length) }, () =>
            downloadNextImage()
          )
        );
        return failures;
      }

      const firstFailures = await downloadBatch(imagesToDownload, "first pass");
      const retryFailures =
        firstFailures.length > 0
          ? await downloadBatch(
              firstFailures.map((failure) => failure.image),
              "retry"
            )
          : [];
      const report = await saveUnsavedReport(activeScanResult, retryFailures);

      if (retryFailures.length > 0) {
        const message = `${retryFailures.length} image${
          retryFailures.length === 1 ? "" : "s"
        } still failed after retry. Report saved to ${report?.reportPath || "unsaved-images.txt"}.`;
        if (continueAfterFolder) {
          setBulkProgress(`${message} Continuing to next folder.`);
          await navigateFolder("next", true, activeScanResult.folderPath, continueAfterFolder);
        } else {
          setError(`${message} ${retryFailures
            .slice(0, 3)
            .map((failure) => failure.error)
            .join("; ")}`);
        }
        return;
      }

      setSuccess(
        `Generated ${saved} image${saved === 1 ? "" : "s"} with Zyte using up to ${workerCount} parallel connections. Report saved to ${
          report?.reportPath || "unsaved-images.txt"
        }.`
      );
      if (continueAfterFolder) {
        await navigateFolder("next", true, activeScanResult.folderPath, continueAfterFolder);
      }
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? `${downloadError.message} (${saved} of ${imagesToDownload.length} saved.)`
          : "Could not generate images"
      );
    } finally {
      setDownloadingImageKeys(new Set());
      setBulkDownloading(false);
    }
  }

  async function saveCurrentUnfinishedReport() {
    if (!result) return;
    setError(null);
    setSuccess(null);

    try {
      const report = await saveUnsavedReport(result);
      setSuccess(
        `Saved ${report?.unsavedCount || 0} unfinished image${
          report?.unsavedCount === 1 ? "" : "s"
        } to ${report?.reportPath || "unsaved-images.txt"}.`
      );
    } catch (reportError) {
      setError(reportError instanceof Error ? reportError.message : "Could not save report");
    }
  }

  async function navigateFolder(
    direction: "first" | "next" | "previous",
    generateAfterNavigation = false,
    folderPathOverride?: string,
    continueAfterFolder = autoContinue
  ) {
    if (!currentUser) return;
    const requestedFolder = (folderPathOverride || result?.folderPath || folderPath).trim();
    if (!requestedFolder && direction !== "first") {
      setError("Enter or scan a folder before navigating.");
      return;
    }

    setNavigatingFolder(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/image-sources/folder-navigation", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderPath: direction === "first" ? undefined : requestedFolder,
          direction,
          skipCompleted,
        }),
      });
      const data = await readAdminJson(response);
      if (!response.ok) {
        throw new Error(String(data.error || "Could not move to another folder"));
      }

      const nextFolderPath = String(data.folderPath || "");
      if (!nextFolderPath || nextFolderPath === requestedFolder) {
        setSuccess("No more folders in that direction.");
        return;
      }

      setFolderPath(nextFolderPath);
      if (generateAfterNavigation) {
        await generateMissingImages(nextFolderPath, continueAfterFolder);
      } else {
        await scanFolder(nextFolderPath);
      }
    } catch (navigationError) {
      setError(
        navigationError instanceof Error ? navigationError.message : "Could not move to another folder"
      );
    } finally {
      setNavigatingFolder(false);
    }
  }

  async function startFromRoot() {
    setAutoContinue(true);
    await navigateFolder("first", true, undefined, true);
  }

  async function cleanStartFromRoot() {
    if (!currentUser) return;
    setResettingProgress(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/image-sources/reset-progress", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const data = await readAdminJson(response);
      if (!response.ok) {
        throw new Error(String(data.error || "Could not reset scan progress"));
      }
      const removedFiles = Array.isArray(data.removedFiles) ? data.removedFiles.length : 0;
      const removedDirectories = Array.isArray(data.removedDirectories)
        ? data.removedDirectories.length
        : 0;

      setResult(null);
      setFolderPath(NAXLEX_SCAN_ROOT);
      setBulkProgress("");
      setActiveImageTab("unfinished");
      setSkipCompleted(true);
      setSuccess(
        `Clean start ready. Removed ${removedFiles} tracking/report files and ${removedDirectories} image cache folders.`
      );
      await navigateFolder("first", true, undefined, true);
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Could not reset scan progress");
    } finally {
      setResettingProgress(false);
    }
  }

  async function openSavedFolder(image: NaxlexFolderImageRecord) {
    if (!currentUser || !result) return;
    const key = imageKey(image);
    setOpeningSavedImageKey(key);
    setError(null);
    setSuccess(null);

    try {
      const token = await currentUser.getIdToken();
      const response = await fetch("/api/admin/image-sources/open-saved-folder", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          folderPath: result.folderPath,
          imageSourceUrl: image.imageSourceUrl,
          fieldPath: image.fieldPath,
        }),
      });
      const data = await readAdminJson(response);
      if (!response.ok) {
        throw new Error(String(data.error || "Could not open saved image folder"));
      }
    } catch (openError) {
      setError(
        openError instanceof Error ? openError.message : "Could not open saved image folder"
      );
    } finally {
      setOpeningSavedImageKey(null);
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-white">
      <AdminSidebar />
      <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-20" : "md:ml-64"}`}>
        <AdminTopBar
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Admin Dashboard", href: "/admin" },
            { label: "Image Sources" },
          ]}
          actions={currentUser && <UserProfileBadge />}
        />

        <main className="admin-workspace">
          <div className="admin-content">
            <AdminPageHeader
              eyebrow="Admin Content Audit"
              title="Image Sources"
              description={`Scan the main Naxlex folder at ${NAXLEX_SCAN_ROOT}, then process each deeper JSON folder one at a time with Zyte.`}
            />

            <AdminNotificationRegion
              error={error}
              success={success}
              info={bulkProgress || undefined}
              errorTitle="Image Action Failed"
              successTitle="Image Action Complete"
              infoTitle="Generation Progress"
            />

            {!currentUser && (
              <AdminAlert tone="warning" title="Admin Session Required">
                Sign in as an admin before scanning or generating images.
              </AdminAlert>
            )}

            <div className="space-y-6">
              <AdminCard title="Generate Naxlex Images" description="Finds deeper folders from the main Naxlex folder, then processes one JSON folder at a time.">
                <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
                  <div className="max-w-5xl">
                    <p className="admin-field-label">Current Folder</p>
                    <p className="mt-1 break-all rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-sm text-gray-900">
                      {result?.folderPath || folderPath}
                    </p>
                    <p className="admin-field-helper mt-2">
                      Main folder: {NAXLEX_SCAN_ROOT}. Reports are written per processed folder and summarized in the root scan log.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void startFromRoot()}
                      disabled={isBusy || navigatingFolder || resettingProgress || !currentUser}
                      className="admin-button-primary disabled:opacity-50"
                    >
                      {bulkDownloading || navigatingFolder ? "Running..." : "Start From Root"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void cleanStartFromRoot()}
                      disabled={isBusy || navigatingFolder || resettingProgress || !currentUser}
                      className="admin-button-secondary disabled:opacity-50"
                    >
                      {resettingProgress ? "Cleaning..." : "Clean Start"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void navigateFolder("previous")}
                      disabled={isBusy || navigatingFolder || !currentUser}
                      className="admin-button-secondary disabled:opacity-50"
                    >
                      Previous Folder
                    </button>
                    <button
                      type="button"
                      onClick={() => void navigateFolder("next")}
                      disabled={isBusy || navigatingFolder || !currentUser}
                      className="admin-button-secondary disabled:opacity-50"
                    >
                      {navigatingFolder ? "Loading..." : "Next Folder"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void openFolder(folderPath)}
                      disabled={openingFolder || !currentUser}
                      className="admin-button-secondary disabled:opacity-50"
                    >
                      {openingFolder ? "Opening..." : "Open Folder"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void scanFolder()}
                      disabled={isBusy || !currentUser}
                      className="admin-button-secondary disabled:opacity-50"
                    >
                      {loading ? "Scanning..." : "Scan Only"}
                    </button>
                    <button
                      type="button"
                      onClick={() => void generateMissingImages()}
                      disabled={isBusy || !currentUser}
                      className="admin-button-secondary disabled:opacity-50"
                    >
                      {bulkDownloading ? "Generating..." : "Generate Current"}
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={autoContinue}
                      onChange={(event) => setAutoContinue(event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    Auto continue after saving each folder report
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                    <input
                      type="checkbox"
                      checked={skipCompleted}
                      onChange={(event) => setSkipCompleted(event.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                    />
                    Skip already processed folders
                  </label>
                  {result && (
                    <button
                      type="button"
                      onClick={() => void saveCurrentUnfinishedReport()}
                      disabled={savingReport || !currentUser}
                      className="admin-button-secondary disabled:opacity-50"
                    >
                      {savingReport ? "Saving TXT..." : "Save Unfinished TXT"}
                    </button>
                  )}
                </div>
              </AdminCard>

              {isBusy && (
                <AdminCard>
                  <AdminInlineLoading label={bulkDownloading ? "Generating images with Zyte..." : "Scanning selected folder..."} />
                </AdminCard>
              )}

              {result && (
                <>
                  <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                    <AdminStatCard label="JSON Files" value={result.directJsonFiles} helper="Direct JSON files scanned." />
                    <AdminStatCard label="Images" value={result.images.length} helper="Image references found." />
                    <AdminStatCard label="Saved" value={localCount} helper="Already cached locally." />
                    <AdminStatCard label="Missing" value={missingImages.length} helper="Still needs generation." />
                  </section>

                  <AdminCard title="Folder Images" description={result.folderPath}>
                    <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                      <p className="admin-field-label">Saving To</p>
                      <p className="mt-1 break-all font-mono text-sm text-gray-900">
                        {imageSaveFolder(result) || "No image save folder yet. This folder has no downloadable image references."}
                      </p>
                    </div>
                    {result.images.length === 0 ? (
                      <AdminAlert tone="warning" title="No Images Found">
                        This folder has {result.directJsonFiles} direct JSON files, but no downloadable image references.
                      </AdminAlert>
                    ) : (
                      <div className="space-y-4">
                        <AdminTabs
                          label="Image status"
                          activeTab={activeImageTab}
                          onChange={(tabId) => setActiveImageTab(tabId as ImageStatusTab)}
                          tabs={[
                            { id: "unfinished", label: `Unfinished (${missingImages.length})` },
                            { id: "finished", label: `Finished (${finishedImages.length})` },
                          ]}
                        />

                        {visibleImages.length === 0 ? (
                          <AdminAlert
                            tone={activeImageTab === "finished" ? "info" : "success"}
                            title={activeImageTab === "finished" ? "No Finished Images" : "All Images Finished"}
                          >
                            {activeImageTab === "finished"
                              ? "No images from this folder have been saved locally yet."
                              : "Every image found in this folder is already saved locally."}
                          </AdminAlert>
                        ) : (
                          <AdminTable>
                            <thead>
                              <tr>
                                <th>Question</th>
                                <th>Status</th>
                                <th>File</th>
                                <th>Source URL</th>
                                <th>Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {visibleImages.map((image) => {
                                const key = imageKey(image);
                                const isDownloading = downloadingImageKeys.has(key);
                                const isOpeningSavedFolder = openingSavedImageKey === key;

                                return (
                                  <tr key={key}>
                                    <AdminTableCell mono>{image.questionId}</AdminTableCell>
                                    <AdminTableCell>
                                      <AdminStatusBadge
                                        label={image.existsLocally ? "Saved" : isDownloading ? "Generating" : "Missing"}
                                        tone={image.existsLocally ? "green" : isDownloading ? "blue" : "amber"}
                                      />
                                    </AdminTableCell>
                                    <AdminTableCell nowrap={false} mono>{image.relativeJsonPath}</AdminTableCell>
                                    <AdminTableCell nowrap={false} mono>{image.imageSourceUrl}</AdminTableCell>
                                    <AdminTableCell>
                                      <div className="flex flex-wrap gap-2">
                                        <a
                                          href={image.imageSourceUrl}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="admin-button-secondary px-3 py-1.5 text-xs"
                                        >
                                          Open
                                        </a>
                                        <button
                                          type="button"
                                          onClick={() => void downloadImage(image)}
                                          disabled={
                                            image.existsLocally ||
                                            isDownloading ||
                                            bulkDownloading ||
                                            !currentUser
                                          }
                                          className="admin-button-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                                        >
                                          {image.existsLocally ? "Saved" : isDownloading ? "Generating..." : "Generate"}
                                        </button>
                                        {image.existsLocally && (
                                          <button
                                            type="button"
                                            onClick={() => void openSavedFolder(image)}
                                            disabled={isOpeningSavedFolder || !currentUser}
                                            className="admin-button-secondary px-3 py-1.5 text-xs disabled:opacity-50"
                                          >
                                            {isOpeningSavedFolder ? "Opening..." : "Folder"}
                                          </button>
                                        )}
                                      </div>
                                    </AdminTableCell>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </AdminTable>
                        )}
                      </div>
                    )}
                  </AdminCard>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ImageSourcesPage() {
  return (
    <SidebarProvider>
      <ImageSourcesContent />
    </SidebarProvider>
  );
}
