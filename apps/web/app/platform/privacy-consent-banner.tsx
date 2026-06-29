import { BarChart3, Cookie, MapPinned, ShieldCheck, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useEffect, useState } from "react";
import type { PrivacyConsent, PrivacyConsentChoice } from "../lib/privacy-consent";
import { privacyCopy } from "./privacy-copy";
import type { Locale } from "./types";

type PrivacyConsentBannerProps = {
  locale: Locale;
  consent: PrivacyConsent | null;
  analyticsConfigured: boolean;
  preferencesOpen: boolean;
  onAcceptAll: () => void;
  onRejectOptional: () => void;
  onSave: (choice: PrivacyConsentChoice) => void;
  onClosePreferences: () => void;
};

export function PrivacyConsentBanner({
  locale,
  consent,
  analyticsConfigured,
  preferencesOpen,
  onAcceptAll,
  onRejectOptional,
  onSave,
  onClosePreferences
}: PrivacyConsentBannerProps) {
  const labels = privacyCopy[locale];
  const [isConfiguring, setIsConfiguring] = useState(preferencesOpen);
  const [draft, setDraft] = useState<PrivacyConsentChoice>({
    analytics: consent?.analytics ?? false,
    maps: consent?.maps ?? false
  });

  useEffect(() => {
    setIsConfiguring(preferencesOpen);
  }, [preferencesOpen]);

  useEffect(() => {
    setDraft({
      analytics: consent?.analytics ?? false,
      maps: consent?.maps ?? false
    });
  }, [consent]);

  const showCompactBanner = !isConfiguring && !preferencesOpen;

  return (
    <section
      className="privacy-consent-shell"
      data-mode={showCompactBanner ? "banner" : "settings"}
      aria-label={labels.title}
    >
      <div className="privacy-consent-panel" role={showCompactBanner ? undefined : "dialog"} aria-modal={showCompactBanner ? undefined : true}>
        <div className="privacy-consent-heading">
          <span className="privacy-consent-icon">
            <Cookie aria-hidden="true" size={22} />
          </span>
          <div>
            <p>{labels.shortTitle}</p>
            <h2>{labels.title}</h2>
          </div>
          {preferencesOpen ? (
            <button type="button" className="icon-button privacy-close-action" aria-label={labels.close} onClick={onClosePreferences}>
              <X aria-hidden="true" size={18} />
            </button>
          ) : null}
        </div>

        <p className="privacy-consent-intro">{labels.intro}</p>

        {isConfiguring ? (
          <div className="privacy-category-grid">
            <PrivacyCategory
              icon={ShieldCheck}
              title={labels.necessaryTitle}
              body={labels.necessaryBody}
              status={labels.alwaysActive}
              checked
              locked
              onChange={() => undefined}
            />
            <PrivacyCategory
              icon={BarChart3}
              title={labels.analyticsTitle}
              body={`${labels.analyticsBody}${analyticsConfigured ? "" : ` ${labels.analyticsUnavailable}`}`}
              status={draft.analytics ? labels.enabled : labels.disabled}
              checked={draft.analytics}
              onChange={(analytics) => setDraft((current) => ({ ...current, analytics }))}
            />
            <PrivacyCategory
              icon={MapPinned}
              title={labels.mapsTitle}
              body={labels.mapsBody}
              status={draft.maps ? labels.enabled : labels.disabled}
              checked={draft.maps}
              onChange={(maps) => setDraft((current) => ({ ...current, maps }))}
            />
          </div>
        ) : null}

        <div className="privacy-consent-actions">
          {isConfiguring ? (
            <button type="button" className="primary-action" onClick={() => onSave(draft)}>
              {labels.save}
            </button>
          ) : (
            <>
              <button type="button" className="primary-action" onClick={onAcceptAll}>
                {labels.acceptAll}
              </button>
              <button type="button" className="secondary-action" onClick={onRejectOptional}>
                {labels.rejectOptional}
              </button>
              <button type="button" className="text-action" onClick={() => setIsConfiguring(true)}>
                {labels.configure}
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function PrivacyCategory({
  icon: Icon,
  title,
  body,
  status,
  checked,
  locked = false,
  onChange
}: {
  icon: LucideIcon;
  title: string;
  body: string;
  status: string;
  checked: boolean;
  locked?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <article className="privacy-category">
      <Icon aria-hidden="true" size={21} />
      <div>
        <h3>{title}</h3>
        <p>{body}</p>
        <span className="privacy-category-status">{status}</span>
      </div>
      <label className="privacy-switch">
        <input
          type="checkbox"
          checked={checked}
          disabled={locked}
          aria-label={title}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span />
      </label>
    </article>
  );
}
