import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import multer from 'multer';

const uploadDir = path.join(os.tmpdir(), 'snds-uploads');

const allowedImageMimeTypes = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

/** Disk storage for images (10MB) - processes from file path to avoid loading entire image into RAM. */
export const multerImageOptions = {
  storage: multer.diskStorage({
    destination(_req, _file, cb) {
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname) || '.jpg';
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 14)}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10mb
  fileFilter(_req, file, cb) {
    if (allowedImageMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid image type. Allowed: ${allowedImageMimeTypes.join(', ')}`));
    }
  },
};

/** Disk storage for documents (5–20MB) to avoid loading large files into RAM. */
export const multerDocumentOptions = {
  storage: multer.diskStorage({
    destination(_req, _file, cb) {
      fs.mkdirSync(uploadDir, { recursive: true });
      cb(null, uploadDir);
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname) || '';
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 14)}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20mb
};
