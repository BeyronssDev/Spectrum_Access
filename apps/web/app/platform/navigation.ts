import { CircleHelp, Home, Search, ShieldCheck, Upload, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Locale, ViewId } from "./types";

export const authRequiredViews = new Set<ViewId>(["contribute"]);

export const locales: Record<Locale, string> = {
  ca: "Català",
  es: "Castellano",
  en: "English"
};

export const navItems: Array<{ id: ViewId; icon: LucideIcon }> = [
  { id: "home", icon: Home },
  { id: "consult", icon: Search },
  { id: "contribute", icon: Upload },
  { id: "support", icon: CircleHelp },
  { id: "profiles", icon: UsersRound },
  { id: "verified", icon: ShieldCheck }
];
