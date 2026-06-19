import type { OrganizationProfile, Place, ProfessionalProfile } from "@accessibilitat/shared";

export const places: Place[] = [
  {
    id: "biblioteca-sant-antoni",
    name: "Biblioteca Sant Antoni",
    category: "culture",
    city: "Barcelona",
    addressOrArea: "Sant Antoni",
    description: "Espai amb zones de lectura silencioses i sortides clares.",
    position: { latitude: 41.3788, longitude: 2.162 },
    status: "active",
    createdBy: "seed",
    ratingCount: 18,
    imageCount: 4,
    averageScore: 4.4,
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "centre-civic-gracia",
    name: "Centre cívic de Gràcia",
    category: "culture",
    city: "Barcelona",
    addressOrArea: "Gràcia",
    description: "Activitat variable segons horari; recomanable consultar afluència.",
    position: { latitude: 41.4024, longitude: 2.1568 },
    status: "active",
    createdBy: "seed",
    ratingCount: 9,
    imageCount: 2,
    averageScore: 3.8,
    updatedAt: "2026-06-19T00:00:00.000Z"
  },
  {
    id: "cafeteria-calma",
    name: "Cafeteria Calma",
    category: "cafe",
    city: "Girona",
    addressOrArea: "Barri Vell",
    description: "Il·luminació càlida, taules separades i música baixa al matí.",
    position: { latitude: 41.9859, longitude: 2.8249 },
    status: "active",
    createdBy: "seed",
    ratingCount: 12,
    imageCount: 3,
    averageScore: 4.7,
    updatedAt: "2026-06-19T00:00:00.000Z"
  }
];

export const professionals: ProfessionalProfile[] = [
  {
    id: "psicologa-1",
    ownerUid: "seed",
    professionalName: "Dra. Marta Soler",
    licenseNumber: "COPC 24421",
    professionalCollege: "Col·legi Oficial de Psicologia de Catalunya",
    specialty: "Autisme adult i suport familiar",
    photoPath: "/professional-placeholder.svg",
    verificationStatus: "verified"
  }
];

export const organizations: OrganizationProfile[] = [
  {
    id: "associacio-1",
    ownerUid: "seed",
    name: "Associació Autisme Obert",
    description: "Entitat de suport a persones autistes i famílies.",
    city: "Barcelona",
    website: "https://example.org",
    registryNumber: "Registre 12345",
    logoPath: "/organization-placeholder.svg",
    verificationStatus: "verified"
  }
];

export const adminQueues = [
  { label: "Imatges pendents", count: 14 },
  { label: "Comentaris reportats", count: 3 },
  { label: "Verificacions", count: 5 }
];
