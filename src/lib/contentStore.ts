import fs from 'fs';
import path from 'path';

const ALLOWED_FILES = [
  'profile.json',
  'skills.json',
  'tech-stack.json',
  'projects.json',
  'certificates.json',
  'inquiries.json',
  'about-me.json',
] as const;

type ContentFileName = typeof ALLOWED_FILES[number];

function getContentDir(): string {
  return path.resolve(process.cwd(), 'content');
}

export function readContentFile<T>(fileName: ContentFileName): T {
  if (!ALLOWED_FILES.includes(fileName)) {
    throw new Error(`Access denied: Invalid content file target "${fileName}"`);
  }

  const filePath = path.join(getContentDir(), fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Content file not found: ${fileName}`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(raw) as T;
}

export function writeContentFile<T>(fileName: ContentFileName, data: T): void {
  if (!ALLOWED_FILES.includes(fileName)) {
    throw new Error(`Access denied: Invalid content file target "${fileName}"`);
  }

  const contentDir = getContentDir();
  if (!fs.existsSync(contentDir)) {
    fs.mkdirSync(contentDir, { recursive: true });
  }

  const filePath = path.join(contentDir, fileName);
  const tmpPath = path.join(contentDir, `${fileName}.${Date.now()}.tmp`);

  const serialized = JSON.stringify(data, null, 2);

  // Validate that it parses cleanly before writing
  JSON.parse(serialized);

  // Write to temporary file first
  fs.writeFileSync(tmpPath, serialized, 'utf-8');

  // Atomically rename to target file
  fs.renameSync(tmpPath, filePath);
}

// Typed convenience accessors
export function getProfileData() {
  return readContentFile<any>('profile.json');
}

export function saveProfileData(data: any) {
  writeContentFile('profile.json', data);
}

export function getSkillsData() {
  return readContentFile<any>('skills.json');
}

export function saveSkillsData(data: any) {
  writeContentFile('skills.json', data);
}

export function getTechStackData() {
  return readContentFile<any>('tech-stack.json');
}

export function saveTechStackData(data: any) {
  writeContentFile('tech-stack.json', data);
}

export function getProjectsData() {
  return readContentFile<any[]>('projects.json');
}

export function saveProjectsData(data: any[]) {
  writeContentFile('projects.json', data);
}

export function getCertificatesData() {
  return readContentFile<any[]>('certificates.json');
}

export function saveCertificatesData(data: any[]) {
  writeContentFile('certificates.json', data);
}

export function getInquiriesData() {
  return readContentFile<any[]>('inquiries.json');
}

export function saveInquiriesData(data: any[]) {
  writeContentFile('inquiries.json', data);
}

export function getAboutMeData() {
  try {
    return readContentFile<any>('about-me.json');
  } catch (e) {
    return null;
  }
}

export function saveAboutMeData(data: any) {
  writeContentFile('about-me.json', data);
}
