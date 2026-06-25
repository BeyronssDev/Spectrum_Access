import type { Locale, PlaceCategory, SensoryCriterion } from "./models.js";

export const localeNames: Record<Locale, string> = {
  ca: "Català",
  es: "Castellano",
  en: "English"
};

export const categoryLabels: Record<PlaceCategory, Record<Locale, string>> = {
  bar: { ca: "Bar", es: "Bar", en: "Bar" },
  restaurant: { ca: "Restaurant", es: "Restaurante", en: "Restaurant" },
  cafe: { ca: "Cafeteria", es: "Cafetería", en: "Cafe" },
  park: { ca: "Parc", es: "Parque", en: "Park" },
  public_space: { ca: "Espai públic", es: "Espacio público", en: "Public space" },
  shop: { ca: "Botiga", es: "Tienda", en: "Shop" },
  medical_center: { ca: "Centre mèdic", es: "Centro médico", en: "Medical center" },
  public_administration: { ca: "Administració pública", es: "Administración pública", en: "Public administration" },
  education: { ca: "Educació", es: "Educación", en: "Education" },
  transport: { ca: "Transport", es: "Transporte", en: "Transport" },
  culture: { ca: "Cultura", es: "Cultura", en: "Culture" },
  leisure: { ca: "Oci", es: "Ocio", en: "Leisure" },
  other: { ca: "Altres", es: "Otros", en: "Other" }
};

export const sensoryLabels: Record<SensoryCriterion, Record<Locale, string>> = {
  noise: { ca: "Soroll", es: "Ruido", en: "Noise" },
  crowd: { ca: "Afluència", es: "Afluencia", en: "Crowd" },
  lighting: { ca: "Llum", es: "Luz", en: "Lighting" },
  temperature: { ca: "Temperatura", es: "Temperatura", en: "Temperature" },
  waitingTime: { ca: "Espera", es: "Espera", en: "Waiting time" },
  staffTreatment: { ca: "Tracte", es: "Trato", en: "Staff treatment" },
  quietSpace: { ca: "Espai tranquil", es: "Espacio tranquilo", en: "Quiet space" },
  exitEase: { ca: "Sortida fàcil", es: "Salida fácil", en: "Exit ease" },
  perceivedSafety: { ca: "Seguretat", es: "Seguridad", en: "Safety" },
  generalRecommendation: { ca: "Recomanació", es: "Recomendación", en: "Recommendation" }
};
