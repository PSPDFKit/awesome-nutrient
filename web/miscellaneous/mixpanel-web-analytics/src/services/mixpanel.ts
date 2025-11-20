// src/services/mixpanel.ts
import mixpanel from "mixpanel-browser";

const MIXPANEL_TOKEN =
  import.meta.env.VITE_MIXPANEL_TOKEN || "your-mixpanel-token-here";

interface EventProperties {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | undefined
    | string[]
    | number[];
}

interface TrackedEvent {
  timestamp: Date;
  event: string;
  properties: EventProperties;
}

class MixpanelService {
  private isInitialized = false;
  private eventQueue: TrackedEvent[] = [];

  constructor() {
    this.init();
  }

  async init() {
    try {
      mixpanel.init(MIXPANEL_TOKEN, {
        debug: import.meta.env.DEV,
        track_pageview: true,
        persistence: "localStorage",
        api_host: "https://api.mixpanel.com",
      });
      this.isInitialized = true;

      console.log("Mixpanel initialized successfully");

      await this.testConnectivity();

      this.track("Mixpanel Initialized", { test: true });
    } catch (error) {
      console.error("Failed to initialize Mixpanel:", error);
    }
  }

  async testConnectivity() {
    try {
      await fetch("https://api.mixpanel.com/track", {
        method: "POST",
        mode: "no-cors",
      });
      console.log("Mixpanel API is reachable");
    } catch (_error) {
      console.log("Mixpanel API connectivity test failed");
    }

    try {
      await fetch("https://mixpanel.com/", { method: "HEAD", mode: "no-cors" });
      console.log("Mixpanel domain is reachable");
    } catch (_error) {
      console.log("Mixpanel domain is not reachable - possible DNS issue");
    }
  }

  track(eventName: string, properties: EventProperties = {}) {
    if (!this.isInitialized) {
      console.warn("Mixpanel not initialized, queuing event:", eventName);
      return;
    }

    try {
      const eventData = {
        event: eventName,
        properties: {
          ...properties,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent,
          url: window.location.href,
          debug_session: Date.now(),
          client_time: new Date().toISOString(),
        },
      };

      console.log("Tracking Event:", eventName, eventData.properties);

      this.eventQueue.push({
        timestamp: new Date(),
        event: eventName,
        properties: eventData.properties,
      });

      mixpanel.track(eventName, eventData.properties);

      console.log("Event sent to Mixpanel successfully (sync):", eventName);
    } catch (error) {
      console.error("Mixpanel tracking error:", error);
    }
  }

  identify(userId: string, properties: EventProperties = {}) {
    if (!this.isInitialized) return;

    try {
      console.log("Identifying user:", userId, properties);
      mixpanel.identify(userId);
      mixpanel.people.set(properties);
    } catch (error) {
      console.error("Mixpanel identify error:", error);
    }
  }

  trackPageView(pageName: string, properties: EventProperties = {}) {
    this.track("Page View", {
      page_name: pageName,
      ...properties,
    });
  }

  trackPDFLoaded(fileName: string, fileSize: number | string) {
    this.track("PDF Loaded", {
      file_name: fileName,
      file_size: fileSize,
      load_time: Date.now(),
    });
  }

  trackPDFAction(action: string, details: EventProperties = {}) {
    this.track("PDF Action", {
      action_type: action,
      ...details,
    });
  }

  trackUserEngagement(
    engagementType: string,
    duration: number,
    details: EventProperties = {}
  ) {
    this.track("User Engagement", {
      engagement_type: engagementType,
      duration_seconds: duration,
      ...details,
    });
  }

  getTrackedEvents(): TrackedEvent[] {
    return this.eventQueue;
  }

  clearEventQueue() {
    this.eventQueue = [];
  }
}

const mixpanelService = new MixpanelService();

if (typeof window !== "undefined") {
  (window as any).mixpanelDebug = {
    service: mixpanelService,
    getEvents: () => mixpanelService.getTrackedEvents(),
    clearEvents: () => mixpanelService.clearEventQueue(),
    testEvent: () =>
      mixpanelService.track("Test Event", {
        test: true,
        timestamp: Date.now(),
      }),
  };
}

export default mixpanelService;
