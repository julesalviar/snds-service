import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import multer from 'multer';

const documentUploadDir = path.join(os.tmpdir(), 'snds-uploads');

export const multerOptions = {
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10mb
};

/** Disk storage for documents (5–20MB) to avoid loading large files into RAM. */
export const multerDocumentOptions = {
  storage: multer.diskStorage({
    destination(_req, _file, cb) {
      fs.mkdirSync(documentUploadDir, { recursive: true });
      cb(null, documentUploadDir);
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname) || '';
      const name = `${Date.now()}-${Math.random().toString(36).slice(2, 14)}${ext}`;
      cb(null, name);
    },
  }),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20mb
};
