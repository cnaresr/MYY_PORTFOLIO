import { useCallback, useMemo, useRef, useState } from 'react';

export interface UploadedFile {
  id: string;
  file: File;
  /** Object URL for image previews (null for non-images). */
  preview: string | null;
}

export interface FileUploadOptions {
  /** Allow selecting more than one file. */
  multiple?: boolean;
  /** Maximum number of files accepted. */
  maxFiles?: number;
  /** Maximum per-file size in bytes. */
  maxSize?: number;
  /** Accept attribute, e.g. "image/*,.pdf". */
  accept?: string;
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'] as const;
  let value = bytes;
  let idx = 0;
  while (value >= 1024 && idx < units.length - 1) {
    value /= 1024;
    idx += 1;
  }
  const rounded = idx === 0 ? value : Math.round(value * 10) / 10;
  return `${rounded} ${units[idx]}`;
}

/**
 * Client-side file picker state. Mirrors the reference hook's surface
 * (files/errors + removeFile/openFileDialog/getInputProps) but is entirely
 * local — nothing uploads. The caller is responsible for shipping the File to
 * a server endpoint, e.g. /api/admin/upload.
 */
export function useFileUpload({
  multiple = false,
  maxFiles = 1,
  maxSize = 10 * 1024 * 1024,
  accept,
}: FileUploadOptions = {}) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const openFileDialog = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const addFiles = useCallback(
    (incoming: FileList | File[]) => {
      const list = Array.from(incoming);
      const nextErrors: string[] = [];

      if (!multiple && list.length > 1) {
        nextErrors.push('Select a single file.');
      }

      let allowed = list;
      if (accept) {
        const accepted = accept
          .split(',')
          .map((a) => a.trim())
          .filter(Boolean);
        allowed = list.filter((f) =>
          accepted.some((a) => {
            if (a === 'image/*') return f.type.startsWith('image/');
            if (a.endsWith('/*')) return f.type.startsWith(a.slice(0, -1));
            return f.type === a || (a.startsWith('.') && f.name.toLowerCase().endsWith(a));
          })
        );
        if (allowed.length < list.length) {
          nextErrors.push('Some files were skipped — unsupported type.');
        }
      }

      if (maxSize) {
        allowed = allowed.filter((f) => {
          if (f.size > maxSize) {
            nextErrors.push(`"${f.name}" exceeds ${formatBytes(maxSize)}.`);
            return false;
          }
          return true;
        });
      }

      const room = Math.max(0, maxFiles - files.length);
      if (allowed.length > room) {
        nextErrors.push(`Too many files — limit is ${maxFiles}.`);
        allowed = allowed.slice(0, room);
      }

      const appended: UploadedFile[] = allowed.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      }));

      setFiles((prev) => (multiple ? [...prev, ...appended] : appended));
      setErrors(nextErrors);
    },
    [accept, maxFiles, maxSize, multiple, files.length]
  );

  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clearFiles = useCallback(() => {
    setFiles((prev) => {
      prev.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
      return [];
    });
    setErrors([]);
  }, []);

  const getInputProps = useCallback(
    () => ({
      ref: inputRef,
      type: 'file' as const,
      multiple,
      accept,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) addFiles(e.target.files);
        // Allow re-selecting the same file.
        e.target.value = '';
      },
    }),
    [multiple, accept, addFiles]
  );

  const val = useMemo(
    () => ({ files, errors }),
    [files, errors]
  );
  const actions = useMemo(
    () => ({ removeFile, clearFiles, openFileDialog, getInputProps }),
    [removeFile, clearFiles, openFileDialog, getInputProps]
  );

  return [val, actions] as const;
}