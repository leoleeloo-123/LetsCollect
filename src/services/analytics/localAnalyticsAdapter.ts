import type {
  AnalyticsAdapter,
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsEventPayloadMap,
  AnyAnalyticsEvent
} from "./events";

const STORAGE_KEY = "letscollect.analytics.v1";
const MAX_LOCAL_EVENTS = 200;

let fallbackSequence = 0;
let inMemoryEvents: AnyAnalyticsEvent[] = [];

function createEventId() {
  if (typeof globalThis.crypto?.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  fallbackSequence += 1;
  return `analytics-${Date.now()}-${fallbackSequence}`;
}

function canUseLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function isStoredEvent(value: unknown): value is AnyAnalyticsEvent {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<AnyAnalyticsEvent>;
  return (
    typeof candidate.id === "string"
    && typeof candidate.name === "string"
    && typeof candidate.occurredAt === "string"
    && candidate.schemaVersion === 1
    && Boolean(candidate.payload)
  );
}

function readStoredEvents() {
  if (!canUseLocalStorage()) return inMemoryEvents;

  try {
    const value = window.localStorage.getItem(STORAGE_KEY);
    if (!value) return [];
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter(isStoredEvent).slice(-MAX_LOCAL_EVENTS) : [];
  } catch {
    return inMemoryEvents;
  }
}

function writeStoredEvents(events: readonly AnyAnalyticsEvent[]) {
  const boundedEvents = events.slice(-MAX_LOCAL_EVENTS);
  inMemoryEvents = [...boundedEvents];

  if (!canUseLocalStorage()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(boundedEvents));
  } catch {
    // The in-memory copy remains usable when storage is unavailable or full.
  }
}

export class LocalAnalyticsAdapter implements AnalyticsAdapter {
  async track<Name extends AnalyticsEventName>(
    name: Name,
    payload: AnalyticsEventPayloadMap[Name]
  ) {
    const event: AnalyticsEvent<Name> = {
      id: createEventId(),
      name,
      occurredAt: new Date().toISOString(),
      schemaVersion: 1,
      payload
    };

    writeStoredEvents([...readStoredEvents(), event as AnyAnalyticsEvent]);
    return event;
  }

  async list() {
    return [...readStoredEvents()];
  }

  async clear() {
    inMemoryEvents = [];
    if (!canUseLocalStorage()) return;

    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Clearing the in-memory copy still gives callers a predictable local reset.
    }
  }
}
