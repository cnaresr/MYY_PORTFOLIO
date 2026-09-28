import React, { useCallback, useEffect, useRef, useState } from 'react';
import ReactCrop, {
  centerCrop,
  makeAspectCrop,
  type Crop,
  type PixelCrop,
} from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import {
  CheckCircle2Icon,
  CropIcon,
  FileIcon,
  Loader2Icon,
  RotateCcwIcon,
  UploadIcon,
  XIcon,
} from 'lucide-react';
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentPicker,
  AttachmentTitle,
  AttachmentTrigger,
} from '../ui/attachment';
import { formatBytes, useFileUpload } from '../../hooks/use-file-upload';

interface AvatarUploaderProps {
  /** Current avatar path (e.g. "/images/portrait.jpg"). */
  value: string;
  /** Receives the new public path after a successful upload. */
  onChange: (path: string) => void;
  /** Called after a successful upload so the parent can force a preview refresh. */
  onUploaded?: (path: string) => void;
}

type Stage = 'pick' | 'crop' | 'uploading' | 'done' | 'error';

function centerAspectCrop(width: number, height: number, aspect: number): Crop {
  const crop = makeAspectCrop({ unit: '%', width: 90 }, aspect, width, height);
  return centerCrop(crop, width, height);
}

/**
 * Convert a cropped area of the source image into a PNG Blob.
 */
async function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/png');
  });
}

/**
 * Avatar picker with a crop step: pick a file -> adjust 1:1 crop -> apply ->
 * upload the cropped result to /api/admin/upload. The returned public path is
 * pushed into the parent profile state (DB-free JSON store).
 */
export const AvatarUploader: React.FC<AvatarUploaderProps> = ({ value, onChange, onUploaded }) => {
  const [{ files, errors }, { removeFile, openFileDialog, getInputProps, clearFiles }] =
    useFileUpload({
      multiple: false,
      maxFiles: 1,
      maxSize: 10 * 1024 * 1024,
      accept: 'image/*',
    });

  const [stage, setStage] = useState<Stage>('pick');
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropFileName, setCropFileName] = useState<string>('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [message, setMessage] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  const entry = files[0] ?? null;

  // Free the object URL when the crop source changes/unmounts.
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  const startCrop = useCallback((file: File) => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    setCropSrc(url);
    setCropFileName(file.name);
    setStage('crop');
    setMessage(null);
  }, []);

  const onImageLoaded = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const { width, height } = e.currentTarget;
      setCrop(centerAspectCrop(width, height, 1));
      setCompletedCrop(centerAspectCrop(width, height, 1) as PixelCrop);
    },
    []
  );

  const applyCropAndUpload = useCallback(async () => {
    const img = imgRef.current;
    if (!img || !completedCrop) return;

    // Draw the selected crop area onto an offscreen canvas at natural scale.
    const scaleX = img.naturalWidth / img.width;
    const scaleY = img.naturalHeight / img.height;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(completedCrop.width * scaleX);
    canvas.height = Math.round(completedCrop.height * scaleY);
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(
      img,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );

    try {
      const blob = await canvasToBlob(canvas);
      const croppedFile = new File([blob], cropFileName.replace(/\.[^.]+$/, '') + '-cropped.png', {
        type: 'image/png',
      });

      setStage('uploading');
      const body = new FormData();
      body.append('file', croppedFile);

      const res = await fetch('/api/admin/upload', { method: 'POST', body });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setStage('error');
        setMessage(data?.error || 'Upload failed.');
        return;
      }

      setStage('done');
      setMessage(`Saved as ${data.path}`);
      onChange(data.path);
      onUploaded?.(data.path);
    } catch {
      setStage('error');
      setMessage('Failed while processing the cropped image.');
    }
  }, [completedCrop, cropFileName, onChange, onUploaded]);

  const resetAll = () => {
    clearFiles();
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setCropSrc(null);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setStage('pick');
    setMessage(null);
  };

  const busy = stage === 'uploading';

  return (
    <div className="space-y-2">
      {/* Current asset */}
      <div className="flex items-center gap-3">
        <div className="size-14 rounded-lg overflow-hidden border border-cockpit-line bg-cockpit shrink-0">
          {value ? (
            <img src={value} alt="Current avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full grid place-items-center text-cockpit-faint">
              <FileIcon className="size-5" />
            </div>
          )}
        </div>
        <div className="min-w-0">
          <div className="font-['Space_Grotesk'] text-xs font-bold text-cockpit-text">Current portrait</div>
          <div className="font-mono text-[10px] text-cockpit-muted truncate">{value || 'No asset set'}</div>
        </div>
      </div>

      {stage === 'crop' && cropSrc ? (
        /* ---- Crop step ---- */
        <div className="border border-cockpit-line rounded-xl p-3 bg-cockpit-raised space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-cockpit-muted flex items-center gap-1.5">
              <CropIcon className="size-3.5" /> Crop portrait (1:1)
            </span>
            <button
              type="button"
              onClick={resetAll}
              className="text-cockpit-faint hover:text-cockpit-text transition-colors"
              aria-label="Cancel crop"
            >
              <XIcon className="size-4" />
            </button>
          </div>
          <div className="max-h-72 overflow-auto rounded-lg">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={1}
              keepSelection
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={cropSrc}
                alt="Crop source"
                onLoad={onImageLoaded}
                className="max-w-full block"
              />
            </ReactCrop>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={applyCropAndUpload}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 disabled:opacity-50 text-emerald-300 ring-1 ring-emerald-500/30 font-mono text-[11px] font-bold transition-colors"
            >
              {busy ? <Loader2Icon className="size-3.5 animate-spin" /> : <CheckCircle2Icon className="size-3.5" />}
              {busy ? 'Uploading…' : 'Apply Crop & Upload'}
            </button>
            <button
              type="button"
              onClick={() => {
                const img = imgRef.current;
                if (!img) return;
                const c = centerAspectCrop(img.width, img.height, 1);
                setCrop(c);
                setCompletedCrop(c as PixelCrop);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cockpit-line bg-cockpit hover:bg-cockpit-hover text-cockpit-text font-mono text-[11px] font-medium transition-colors"
            >
              <RotateCcwIcon className="size-3.5" /> Reset
            </button>
          </div>
        </div>
      ) : (
        /* ---- Pick step ---- */
        <AttachmentPicker state="idle">
          <AttachmentMedia>
            {busy ? <Loader2Icon className="animate-spin" /> : <UploadIcon />}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{busy ? 'Uploading…' : 'Choose a photo'}</AttachmentTitle>
            <AttachmentDescription>Images up to 10 MB — crop to 1:1, saved to /images/</AttachmentDescription>
          </AttachmentContent>
          <AttachmentTrigger
            type="button"
            aria-haspopup="dialog"
            aria-label="Choose a photo to upload"
            disabled={busy}
            onClick={openFileDialog}
          />
          <input
            {...getInputProps()}
            onChange={(e) => {
              const input = e.target as HTMLInputElement;
              const picked = input.files?.[0];
              if (picked) startCrop(picked);
            }}
            className="sr-only"
            tabIndex={-1}
            aria-label="Choose a photo to upload"
          />
        </AttachmentPicker>
      )}

      {errors.length > 0 && (
        <p className="text-rose-400 text-xs font-mono" role="alert">
          {errors[0]}
        </p>
      )}

      {/* Picked file row (crop / done states) */}
      {entry && stage !== 'crop' && (
        <Attachment state={stage === 'error' ? 'error' : stage === 'uploading' ? 'uploading' : 'idle'} size="sm">
          <AttachmentMedia variant="image">
            {entry.preview ? (
              <img src={entry.preview} alt="" width={64} height={64} className="w-full h-full object-cover" loading="lazy" decoding="async" />
            ) : (
              <FileIcon />
            )}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{entry.file.name}</AttachmentTitle>
            <AttachmentDescription>
              {formatBytes(entry.file.size)}
              {stage === 'done' && ' • uploaded'}
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            {stage === 'done' && <CheckCircle2Icon className="size-4 text-emerald-400" />}
            <AttachmentAction
              type="button"
              aria-label={`Remove ${entry.file.name}`}
              onClick={() => {
                removeFile(entry.id);
                resetAll();
              }}
            >
              <XIcon aria-hidden="true" />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      )}

      {message && (
        <p
          className={`text-[11px] font-mono ${stage === 'error' ? 'text-rose-400' : 'text-emerald-300'}`}
          role="status"
        >
          {message}
        </p>
      )}
    </div>
  );
};
