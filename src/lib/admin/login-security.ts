import type { DocumentData, QuerySnapshot, Timestamp } from "firebase-admin/firestore";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/server/firebase-admin";

export type AdminLoginEvent = {
  eventId: string;
  loginAt: string | null;
  provider: string | null;
  success: boolean;
  ipHashPreview: string | null;
  device: {
    deviceType: string | null;
    browser: string | null;
    os: string | null;
  };
  location: {
    country: string | null;
    region: string | null;
    city: string | null;
    source: string | null;
  };
};

export type AdminLoginSecuritySummary = {
  totalEventsReviewed: number;
  uniqueIpHashes: number;
  uniqueDevices: number;
  uniqueLocations: number;
  latestLoginAt: string | null;
  flags: string[];
};

export type AdminAccountSharingSignals = {
  status: "normal" | "watch" | "review" | "high_attention";
  uniqueIpHashes24h: number;
  uniqueIpHashes7d: number;
  uniqueIpHashes30d: number;
  uniqueDevices24h: number;
  uniqueDevices7d: number;
  uniqueDevices30d: number;
  uniqueLocations30d: number;
  uniqueCountries30d: number;
  recentIpSwitches24h: number;
  recentDeviceSwitches24h: number;
  lastSwitchAt: string | null;
  reasons: string[];
  recommendation: string;
};

export type AdminLoginSecurity = {
  summary: AdminLoginSecuritySummary;
  sharingSignals: AdminAccountSharingSignals;
  events: AdminLoginEvent[];
};

export type AdminLoginSecuritySnapshot = {
  status: AdminAccountSharingSignals["status"];
  unique_ip_hashes_24h: number;
  unique_ip_hashes_7d: number;
  unique_ip_hashes_30d: number;
  unique_devices_24h: number;
  unique_devices_7d: number;
  unique_devices_30d: number;
  unique_locations_30d: number;
  unique_countries_30d: number;
  recent_ip_switches_24h: number;
  recent_device_switches_24h: number;
  last_switch_at: string | null;
  reasons: string[];
  recommendation: string;
  last_evaluated_at: FieldValue;
};

export type AdminLoginSecurityOverviewUser = {
  uid: string;
  email: string | null;
  displayName: string | null;
  status: AdminAccountSharingSignals["status"];
  uniqueIpHashes30d: number;
  uniqueDevices30d: number;
  uniqueCountries30d: number;
  recentSwitches24h: number;
  lastEvaluatedAt: string | null;
  reasons: string[];
};

function timestampToIso(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === "string") return value;
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }
  return null;
}

function nullableString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value : null;
}

function nullableNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function objectOrEmpty(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function hashPreview(value: unknown): string | null {
  const hash = nullableString(value);
  return hash ? hash.slice(0, 12) : null;
}

function mapLoginEvent(data: DocumentData): AdminLoginEvent {
  const device = objectOrEmpty(data.device);
  const location = objectOrEmpty(data.location);

  return {
    eventId: nullableString(data.eventId) || nullableString(data.session_id) || "unknown",
    loginAt: timestampToIso(data.login_at) || timestampToIso(data.created_at),
    provider: nullableString(data.provider),
    success: data.success !== false,
    ipHashPreview: hashPreview(data.ip_hash),
    device: {
      deviceType: nullableString(device.device_type),
      browser: nullableString(device.browser),
      os: nullableString(device.os),
    },
    location: {
      country: nullableString(location.country),
      region: nullableString(location.region),
      city: nullableString(location.city),
      source: nullableString(location.source),
    },
  };
}

function deviceKey(event: AdminLoginEvent) {
  return [event.device.deviceType, event.device.browser, event.device.os].filter(Boolean).join("|");
}

function locationKey(event: AdminLoginEvent) {
  return [event.location.country, event.location.region, event.location.city].filter(Boolean).join("|");
}

function countryKey(event: AdminLoginEvent) {
  return event.location.country || "";
}

function eventTime(event: AdminLoginEvent) {
  return event.loginAt ? new Date(event.loginAt).getTime() : 0;
}

function since(events: AdminLoginEvent[], now: number, days: number) {
  const cutoff = now - days * 24 * 60 * 60 * 1000;
  return events.filter((event) => eventTime(event) >= cutoff);
}

function uniqueCount(events: AdminLoginEvent[], keyFn: (event: AdminLoginEvent) => string | null) {
  return new Set(events.map(keyFn).filter(Boolean)).size;
}

function countRecentSwitches(events: AdminLoginEvent[], keyFn: (event: AdminLoginEvent) => string | null) {
  let switches = 0;
  let lastSwitchAt: string | null = null;

  for (let index = 0; index < events.length - 1; index += 1) {
    const currentKey = keyFn(events[index]);
    const previousKey = keyFn(events[index + 1]);
    if (currentKey && previousKey && currentKey !== previousKey) {
      switches += 1;
      lastSwitchAt ??= events[index].loginAt;
    }
  }

  return { switches, lastSwitchAt };
}

function buildSharingSignals(events: AdminLoginEvent[]): AdminAccountSharingSignals {
  const now = Date.now();
  const events24h = since(events, now, 1);
  const events7d = since(events, now, 7);
  const events30d = since(events, now, 30);
  const uniqueIpHashes24h = uniqueCount(events24h, (event) => event.ipHashPreview);
  const uniqueIpHashes7d = uniqueCount(events7d, (event) => event.ipHashPreview);
  const uniqueIpHashes30d = uniqueCount(events30d, (event) => event.ipHashPreview);
  const uniqueDevices24h = uniqueCount(events24h, deviceKey);
  const uniqueDevices7d = uniqueCount(events7d, deviceKey);
  const uniqueDevices30d = uniqueCount(events30d, deviceKey);
  const uniqueLocations30d = uniqueCount(events30d, locationKey);
  const uniqueCountries30d = uniqueCount(events30d, countryKey);
  const ipSwitches = countRecentSwitches(events24h, (event) => event.ipHashPreview);
  const deviceSwitches = countRecentSwitches(events24h, deviceKey);
  const reasons: string[] = [];

  let status: AdminAccountSharingSignals["status"] = "normal";

  if (events.length === 0) {
    reasons.push("No login history has been recorded yet.");
  }
  if (uniqueIpHashes30d >= 6) {
    status = "high_attention";
    reasons.push("Six or more unique IP hashes were seen in the last 30 days.");
  } else if (uniqueIpHashes30d >= 4) {
    status = "review";
    reasons.push("Four or more unique IP hashes were seen in the last 30 days.");
  } else if (uniqueIpHashes30d >= 3) {
    status = "watch";
    reasons.push("Three unique IP hashes were seen in the last 30 days.");
  }

  if (uniqueDevices30d >= 4) {
    status = status === "high_attention" ? status : "review";
    reasons.push("Four or more device profiles were seen in the last 30 days.");
  } else if (uniqueDevices30d >= 3 && status === "normal") {
    status = "watch";
    reasons.push("Three device profiles were seen in the last 30 days.");
  }

  if (uniqueCountries30d >= 3) {
    status = "high_attention";
    reasons.push("Three or more countries were seen in the last 30 days.");
  } else if (uniqueCountries30d >= 2 && status !== "high_attention") {
    status = "review";
    reasons.push("Multiple countries were seen in the last 30 days.");
  }

  if (ipSwitches.switches >= 2 || deviceSwitches.switches >= 2) {
    status = status === "high_attention" ? status : "review";
    reasons.push("Multiple IP or device switches happened within the last 24 hours.");
  }

  if (reasons.length === 0) {
    reasons.push("No unusual sharing pattern was found in the reviewed login history.");
  }

  return {
    status,
    uniqueIpHashes24h,
    uniqueIpHashes7d,
    uniqueIpHashes30d,
    uniqueDevices24h,
    uniqueDevices7d,
    uniqueDevices30d,
    uniqueLocations30d,
    uniqueCountries30d,
    recentIpSwitches24h: ipSwitches.switches,
    recentDeviceSwitches24h: deviceSwitches.switches,
    lastSwitchAt: ipSwitches.lastSwitchAt || deviceSwitches.lastSwitchAt,
    reasons,
    recommendation: "Review manually before taking action. Shared Wi-Fi, VPNs, mobile networks, work networks, and travel can change IP, device, or location signals naturally.",
  };
}

export function loginSecuritySnapshot(signals: AdminAccountSharingSignals): AdminLoginSecuritySnapshot {
  return {
    status: signals.status,
    unique_ip_hashes_24h: signals.uniqueIpHashes24h,
    unique_ip_hashes_7d: signals.uniqueIpHashes7d,
    unique_ip_hashes_30d: signals.uniqueIpHashes30d,
    unique_devices_24h: signals.uniqueDevices24h,
    unique_devices_7d: signals.uniqueDevices7d,
    unique_devices_30d: signals.uniqueDevices30d,
    unique_locations_30d: signals.uniqueLocations30d,
    unique_countries_30d: signals.uniqueCountries30d,
    recent_ip_switches_24h: signals.recentIpSwitches24h,
    recent_device_switches_24h: signals.recentDeviceSwitches24h,
    last_switch_at: signals.lastSwitchAt,
    reasons: signals.reasons,
    recommendation: signals.recommendation,
    last_evaluated_at: FieldValue.serverTimestamp(),
  };
}

function buildFlags(events: AdminLoginEvent[], uniqueIpHashes: number, uniqueDevices: number, uniqueLocations: number) {
  const flags: string[] = [];

  if (events.length === 0) {
    flags.push("No login events recorded yet.");
  }
  if (events.length > 0 && events.every((event) => !event.location.country && !event.location.city)) {
    flags.push("Location is unavailable for these events, which is expected on localhost.");
  }
  if (uniqueIpHashes >= 3) {
    flags.push("Multiple IP hashes seen in the reviewed login history.");
  }
  if (uniqueDevices >= 3) {
    flags.push("Multiple device profiles seen in the reviewed login history.");
  }
  if (uniqueLocations >= 2) {
    flags.push("Multiple locations seen in the reviewed login history.");
  }

  return flags;
}

export async function getAdminLoginSecurity(uid: string, limit = 20): Promise<AdminLoginSecurity> {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const collection = getAdminDb().collection("user_login_events");
  let snapshot: QuerySnapshot<DocumentData>;

  try {
    snapshot = await collection
      .where("uid", "==", uid)
      .orderBy("login_at", "desc")
      .limit(safeLimit)
      .get();
  } catch (error) {
    // Local and early-stage Firestore projects may not have the composite index yet.
    console.warn("Falling back to unordered login event query", {
      uid,
      message: error instanceof Error ? error.message : "Unknown Firestore query error",
    });
    snapshot = await collection
      .where("uid", "==", uid)
      .limit(safeLimit)
      .get();
  }

  const events = snapshot.docs
    .map((doc) => mapLoginEvent({ eventId: doc.id, ...doc.data() }))
    .sort((first, second) => {
      const firstTime = first.loginAt ? new Date(first.loginAt).getTime() : 0;
      const secondTime = second.loginAt ? new Date(second.loginAt).getTime() : 0;
      return secondTime - firstTime;
    });
  const ipHashes = new Set(events.map((event) => event.ipHashPreview).filter(Boolean));
  const devices = new Set(events.map(deviceKey).filter(Boolean));
  const locations = new Set(events.map(locationKey).filter(Boolean));

  return {
    summary: {
      totalEventsReviewed: events.length,
      uniqueIpHashes: ipHashes.size,
      uniqueDevices: devices.size,
      uniqueLocations: locations.size,
      latestLoginAt: events[0]?.loginAt ?? null,
      flags: buildFlags(events, ipHashes.size, devices.size, locations.size),
    },
    sharingSignals: buildSharingSignals(events),
    events,
  };
}

export async function updateUserLoginSecuritySnapshot(uid: string) {
  const loginSecurity = await getAdminLoginSecurity(uid, 50);
  await getAdminDb().collection("users").doc(uid).set(
    {
      login_security: loginSecuritySnapshot(loginSecurity.sharingSignals),
      updated_at: FieldValue.serverTimestamp(),
    },
    { merge: true }
  );
  return loginSecurity.sharingSignals;
}

export async function listLoginSecurityOverview(limit = 300): Promise<AdminLoginSecurityOverviewUser[]> {
  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const snapshot = await getAdminDb().collection("users").limit(safeLimit).get();
  const rankedStatus = new Map<AdminAccountSharingSignals["status"], number>([
    ["high_attention", 0],
    ["review", 1],
    ["watch", 2],
    ["normal", 3],
  ]);

  const users: AdminLoginSecurityOverviewUser[] = [];

  snapshot.docs.forEach((doc) => {
    const data = doc.data();
    const loginSecurity = objectOrEmpty(data.login_security);
    const status = nullableString(loginSecurity.status) as AdminAccountSharingSignals["status"] | null;
    if (!status || status === "normal") return;

    const profile = objectOrEmpty(data.profile);
    users.push({
      uid: doc.id,
      email: nullableString(data.email),
      displayName: nullableString(profile.display_name) || nullableString(data.full_name),
      status,
      uniqueIpHashes30d: nullableNumber(loginSecurity.unique_ip_hashes_30d),
      uniqueDevices30d: nullableNumber(loginSecurity.unique_devices_30d),
      uniqueCountries30d: nullableNumber(loginSecurity.unique_countries_30d),
      recentSwitches24h: nullableNumber(loginSecurity.recent_ip_switches_24h) + nullableNumber(loginSecurity.recent_device_switches_24h),
      lastEvaluatedAt: timestampToIso(loginSecurity.last_evaluated_at),
      reasons: Array.isArray(loginSecurity.reasons) ? loginSecurity.reasons.filter((reason): reason is string => typeof reason === "string") : [],
    });
  });

  return users.sort((first, second) => {
      const rankDiff = (rankedStatus.get(first.status) ?? 99) - (rankedStatus.get(second.status) ?? 99);
      if (rankDiff !== 0) return rankDiff;
      const firstTime = first.lastEvaluatedAt ? new Date(first.lastEvaluatedAt).getTime() : 0;
      const secondTime = second.lastEvaluatedAt ? new Date(second.lastEvaluatedAt).getTime() : 0;
      return secondTime - firstTime;
    });
}
