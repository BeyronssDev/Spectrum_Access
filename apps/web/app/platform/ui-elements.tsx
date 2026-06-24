import { ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function OfficialLogo({ size }: { size: number }) {
  return (
    <img
      src="/brand/accessibilitat-logo.svg"
      width={size}
      height={size}
      alt="Spectrum Access"
      className="official-logo"
    />
  );
}

export function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 48 48" focusable="false">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
      />
      <path fill="none" d="M0 0h48v48H0z" />
    </svg>
  );
}

export function AppleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 16 16" focusable="false">
      <path
        fill="currentColor"
        d="M11.182.008C11.148-.03 9.923.023 8.857 1.18c-1.066 1.156-.902 2.482-.878 2.516.024.034 1.52.087 2.475-1.258.955-1.345.762-2.391.728-2.43Zm3.314 11.725c-.048-.096-2.325-1.234-2.113-3.422.212-2.187 1.675-2.789 1.698-2.854.023-.065-.597-.79-1.254-1.157a3.692 3.692 0 0 0-1.563-.434c-.108-.003-.483-.095-1.254.116-.508.139-1.653.589-1.968.607-.316.018-1.256-.522-2.267-.665-.647-.125-1.333.131-1.824.328-.49.196-1.422.754-2.074 2.237-.652 1.482-.311 3.83-.067 4.56.244.729.625 1.924 1.273 2.796.576.984 1.34 1.667 1.659 1.899.319.232 1.219.386 1.843.067.502-.308 1.408-.485 1.766-.472.357.013 1.061.154 1.782.539.571.197 1.111.115 1.652-.105.541-.221 1.324-1.059 2.238-2.758.347-.79.505-1.217.473-1.28Z"
      />
    </svg>
  );
}

export function ToggleButton({
  active,
  label,
  activeIcon: ActiveIcon,
  inactiveIcon: InactiveIcon,
  onClick,
  className
}: {
  active: boolean;
  label: string;
  activeIcon: LucideIcon;
  inactiveIcon: LucideIcon;
  onClick: () => void;
  className?: string;
}) {
  const Icon = active ? ActiveIcon : InactiveIcon;

  return (
    <button type="button" className={["toggle-button", className].filter(Boolean).join(" ")} data-active={active} aria-pressed={active} onClick={onClick}>
      <Icon aria-hidden="true" size={17} />
      <span>{label}</span>
      <span className="switch" />
    </button>
  );
}

export function PanelHeading({
  title,
  action,
  onAction
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="panel-heading">
      <h3>{title}</h3>
      {action ? (
        <button type="button" onClick={onAction}>
          {action}
          <ChevronRight aria-hidden="true" size={16} />
        </button>
      ) : null}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  body
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="empty-state">
      <Icon aria-hidden="true" size={24} />
      <strong>{title}</strong>
      <p>{body}</p>
    </div>
  );
}


export function ProfileCard({
  icon: Icon,
  title,
  meta,
  children
}: {
  icon: LucideIcon;
  title: string;
  meta: string;
  children: ReactNode;
}) {
  return (
    <article className="panel profile-card">
      <Icon aria-hidden="true" size={28} />
      <h3>{title}</h3>
      <strong>{meta}</strong>
      {children}
    </article>
  );
}
