import type { Locale, Organization, Place, Professional, SensoryKey } from "./types";

export const places: Place[] = [];

export const professionals: Professional[] = [];

export const organizations: Organization[] = [];

export const childProfiles: Array<{ alias: string; age: string; state: string }> = [];

export const sensoryKeys: Array<{ key: SensoryKey; low: string; high: string }> = [
  { key: "noise", low: "Silenci", high: "Actiu" },
  { key: "density", low: "Privat", high: "Social" },
  { key: "light", low: "Suau", high: "Vibrant" },
  { key: "wait", low: "Ràpid", high: "Llarg" }
];

export const sensoryLabels: Record<Locale, Record<SensoryKey, string>> = {
  ca: { noise: "Soroll", density: "Densitat", light: "Impacte visual", wait: "Espera" },
  es: { noise: "Ruido", density: "Densidad", light: "Impacto visual", wait: "Espera" },
  en: { noise: "Noise", density: "Density", light: "Visual impact", wait: "Waiting" }
};
export const sensoryWords: Record<Locale, Record<SensoryKey, string[]>> = {
  ca: {
    noise: ["Silenciós", "Suau", "Moderat", "Actiu", "Intens"],
    density: ["Aïllat", "Tranquil", "Mitjà", "Social", "Ple"],
    light: ["Calma", "Serena", "Clara", "Viva", "Saturada"],
    wait: ["Immediat", "Curt", "Moderat", "Llarg", "Molt llarg"]
  },
  es: {
    noise: ["Silencioso", "Suave", "Moderado", "Activo", "Intenso"],
    density: ["Aislado", "Tranquilo", "Medio", "Social", "Lleno"],
    light: ["Calma", "Serena", "Clara", "Viva", "Saturada"],
    wait: ["Inmediato", "Corto", "Moderado", "Largo", "Muy largo"]
  },
  en: {
    noise: ["Silent", "Muted", "Moderate", "Active", "Intense"],
    density: ["Secluded", "Quiet", "Medium", "Social", "Full"],
    light: ["Calm", "Serene", "Clear", "Vivid", "Saturated"],
    wait: ["Immediate", "Short", "Moderate", "Long", "Very long"]
  }
};
