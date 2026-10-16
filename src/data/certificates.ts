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
    id: "mtcna",
    title: "MikroTik Certified Network Associate (MTCNA)",
    level: "Certificate ID: 2511NA7324",
    issuer: "MikroTik",
    icon: "router",
    status: "ACTIVE",
    issued: "2025",
    validityLabel: "EXPIRY",
    validityValue: "2028",
    hash: "2511..7324",
    verifyUrl: "https://mikrotik.com/certificates",
    verifyButtonText: "Verify MikroTik",
  },
  {
    id: "mtcre",
    title: "MikroTik Certified Routing Engineer (MTCRE)",
    level: "Certificate ID: 2512RE1563",
    issuer: "MikroTik",
    icon: "alt_route",
    status: "ACTIVE",
    issued: "2025",
    validityLabel: "EXPIRY",
    validityValue: "2028",
    hash: "2512..1563",
    verifyUrl: "https://mikrotik.com/certificates",
    verifyButtonText: "Verify MikroTik",
  },
  {
    id: "oracle-sql",
    title: "Database Programming with SQL",
    level: "Course Completion Award",
    issuer: "Oracle Academy",
    icon: "database",
    status: "COMPLETED",
    issued: "2024",
    validityLabel: "VALIDATION",
    validityValue: "PERPETUAL",
    hash: "sql..2024",
    verifyUrl: "/certificates/SQLclmsCertificate.pdf",
    verifyButtonText: "View Certificate",
  },
  {
    id: "oracle-design",
    title: "Database Design",
    level: "Course Completion Award",
    issuer: "Oracle Academy",
    icon: "schema",
    status: "COMPLETED",
    issued: "2024",
    validityLabel: "VALIDATION",
    validityValue: "PERPETUAL",
    hash: "dsgn..2024",
    verifyUrl: "/certificates/DesignclmsCertificate.pdf",
    verifyButtonText: "View Certificate",
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

export interface CertificateItem {
  title: string;
  issuer: string;
  year: string;
  verifyUrl: string;
  logo: string;
  initials: string;
}

// Logo asli taruh di public/logos/ lalu isi field logo dengan path-nya, mis. "/logos/bnsp.svg"
export const CERTIFICATES: CertificateItem[] = [
  {
    title: "MikroTik Certified Network Associate (MTCNA)",
    issuer: "MikroTik",
    year: "2025",
    verifyUrl: "https://mikrotik.com/certificates",
    logo: "",
    initials: "MTK",
  },
  {
    title: "MikroTik Certified Routing Engineer (MTCRE)",
    issuer: "MikroTik",
    year: "2025",
    verifyUrl: "https://mikrotik.com/certificates",
    logo: "",
    initials: "MTK",
  },
  {
    title: "Database Programming with SQL",
    issuer: "Oracle Academy",
    year: "2024",
    verifyUrl: "/certificates/SQLclmsCertificate.pdf",
    logo: "",
    initials: "ORA",
  },
  {
    title: "Database Design",
    issuer: "Oracle Academy",
    year: "2024",
    verifyUrl: "/certificates/DesignclmsCertificate.pdf",
    logo: "",
    initials: "ORA",
  },
];
