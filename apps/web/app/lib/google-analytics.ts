type GtagCommand = [command: string, ...parameters: unknown[]];

type AnalyticsWindow = Window &
  typeof globalThis & {
    dataLayer?: GtagCommand[];
    gtag?: (...parameters: GtagCommand) => void;
    __spectrumAnalyticsId?: string;
  };

const googleAnalyticsScriptId = "spectrum-google-analytics";

function analyticsWindow(): AnalyticsWindow | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window as AnalyticsWindow;
}

function setGoogleAnalyticsDisabled(measurementId: string, disabled: boolean) {
  const target = analyticsWindow();
  if (!target) {
    return;
  }

  (target as unknown as Record<string, boolean>)[`ga-disable-${measurementId}`] = disabled;
}

export function initializeGoogleAnalytics(measurementId: string) {
  const target = analyticsWindow();
  const normalizedMeasurementId = measurementId.trim();
  if (!target || !normalizedMeasurementId) {
    return;
  }

  setGoogleAnalyticsDisabled(normalizedMeasurementId, false);

  target.dataLayer = target.dataLayer ?? [];
  target.gtag = target.gtag ?? ((...parameters: GtagCommand) => {
    target.dataLayer?.push(parameters);
  });
  target.gtag("consent", "default", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied"
  });

  if (target.__spectrumAnalyticsId === normalizedMeasurementId) {
    return;
  }

  target.__spectrumAnalyticsId = normalizedMeasurementId;
  target.gtag("js", new Date());
  target.gtag("config", normalizedMeasurementId, {
    anonymize_ip: true,
    send_page_view: true
  });

  if (document.getElementById(googleAnalyticsScriptId)) {
    return;
  }

  const script = document.createElement("script");
  script.id = googleAnalyticsScriptId;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(normalizedMeasurementId)}`;
  document.head.appendChild(script);
}

export function disableGoogleAnalytics(measurementId: string) {
  const normalizedMeasurementId = measurementId.trim();
  if (!normalizedMeasurementId) {
    return;
  }

  setGoogleAnalyticsDisabled(normalizedMeasurementId, true);
}
