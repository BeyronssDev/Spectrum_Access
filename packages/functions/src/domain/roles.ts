import type { UserRole } from "@accessibilitat/shared";

export function ensureUserRoles(currentRoles: unknown, role: UserRole, enabled: boolean): UserRole[] {
  const roles = Array.isArray(currentRoles)
    ? currentRoles.filter((value): value is UserRole => typeof value === "string")
    : [];
  const next = new Set<UserRole>(roles.includes("user") ? roles : ["user", ...roles]);

  if (enabled) {
    next.add(role);
  } else {
    next.delete(role);
  }

  return [...next];
}
