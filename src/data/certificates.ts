import { getCertificatesData } from '../lib/contentStore';

export interface Certificate {
  id: string;
  title: string;
  level: string;
  issuer: string;
  icon: string;
  status: string;
  issued: string;
  validityLabel: string;
  validityValue: string;
  hash: string;
  verifyUrl: string;
  verifyButtonText: string;
}

const defaultCertificates: Certificate[] = [
  {
    id: "aws-sap",
    title: "AWS Certified Solutions Architect",
    level: "Professional Level (SAP-C02)",
    issuer: "AMAZON WEB SERVICES",
    icon: "cloud_done",
    status: "ACTIVE",
    issued: "2024",
    validityLabel: "EXPIRY",
    validityValue: "2027",
    hash: "8f9b..41cd7a",
    verifyUrl: "https://aws.amazon.com/verification",
    verifyButtonText: "Verify AWS Ledger",
  },
  {
    id: "pg-dba",
    title: "PostgreSQL Certified Enterprise DBA",
    level: "PostgreSQL 15/16 Professional",
    issuer: "POSTGRESQL GLOBAL",
    icon: "database",
    status: "ACTIVE",
    issued: "2023",
    validityLabel: "VALIDATION",
    validityValue: "PERPETUAL",
    hash: "4e21..90ad31",
    verifyUrl: "https://www.postgresql.org",
    verifyButtonText: "Verify PG Credential",
  },
  {
    id: "cka",
    title: "Certified Kubernetes Administrator",
    level: "Linux Foundation (CKA-2401)",
    issuer: "CNCF / LINUX FOUNDATION",
    icon: "view_in_ar",
    status: "ACTIVE",
    issued: "2024",
    validityLabel: "EXPIRY",
    validityValue: "2027",
    hash: "11c3..aa049f",
    verifyUrl: "https://www.cncf.io/certification/cka/",
    verifyButtonText: "Verify Linux Found.",
  },
  {
    id: "meta-frontend",
    title: "Meta Certified Frontend Lead",
    level: "Principal Engineering Specialist",
    issuer: "META OPEN SOURCE",
    icon: "code_blocks",
    status: "ACTIVE",
    issued: "2023",
    validityLabel: "VALIDATION",
    validityValue: "VERIFIED",
    hash: "902f..77b022",
    verifyUrl: "https://www.coursera.org",
    verifyButtonText: "Verify Meta Badge",
  },
];

export function getLiveCertificates(): Certificate[] {
  try {
    const raw = getCertificatesData();
    if (Array.isArray(raw) && raw.length > 0) {
      return raw.map((c: any) => ({
        id: c.id,
        title: c.title,
        level: c.level,
        issuer: c.issuer,
        icon: c.icon || 'verified',
        status: c.status || 'ACTIVE',
        issued: c.issued,
        validityLabel: c.validityLabel || 'EXPIRY',
        validityValue: c.validityValue || '2027',
        hash: c.hash || 'hash..000',
        verifyUrl: c.verifyUrl || '#',
        verifyButtonText: c.verifyButtonText || 'Verify Ledger',
      }));
    }
  } catch {}
  return defaultCertificates;
}

export const certificates: Certificate[] = new Proxy([] as Certificate[], {
  get: (_, prop: string | symbol) => {
    const list = getLiveCertificates();
    const val = (list as any)[prop];
    return typeof val === 'function' ? val.bind(list) : val;
  },
});
