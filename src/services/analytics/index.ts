import { LocalAnalyticsAdapter } from "./localAnalyticsAdapter";

export type {
  AnalyticsAdapter,
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsEventPayloadMap,
  AnyAnalyticsEvent
} from "./events";
export { LocalAnalyticsAdapter } from "./localAnalyticsAdapter";

export const analytics = new LocalAnalyticsAdapter();
