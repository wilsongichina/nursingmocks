import ScanRecordPageClient from "./ScanRecordPageClient";

export default async function SavedTeasScanViewPage({
  params,
}: {
  params: Promise<{ scanId: string }>;
}) {
  const resolved = await params;
  return <ScanRecordPageClient scanId={resolved.scanId} mode="view" />;
}
