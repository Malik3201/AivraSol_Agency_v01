import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const UPLOAD_ROOT = path.resolve(process.cwd(), "uploads", "reviews");

if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

// Whitelisted file kinds. Keep MIME + extension in sync — we validate both.
const IMAGE_EXT = ["jpg", "jpeg", "png", "webp", "gif"];
const VIDEO_EXT = ["mp4", "mov", "webm"];
const DOC_EXT = ["pdf", "doc", "docx"];
const DESIGN_EXT = ["ai", "psd", "fig", "xd", "zip"];

const IMAGE_MIME = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const VIDEO_MIME = ["video/mp4", "video/quicktime", "video/webm"];
const DOC_MIME = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
// Design/archive files often arrive as octet-stream — accept that too and rely on extension check.
const DESIGN_MIME = [
  "application/zip",
  "application/x-zip-compressed",
  "application/postscript",
  "image/vnd.adobe.photoshop",
  "application/octet-stream",
];

const ALLOWED_EXT = new Set([
  ...IMAGE_EXT,
  ...VIDEO_EXT,
  ...DOC_EXT,
  ...DESIGN_EXT,
]);
const ALLOWED_MIME = new Set([
  ...IMAGE_MIME,
  ...VIDEO_MIME,
  ...DOC_MIME,
  ...DESIGN_MIME,
]);

export const MAX_FILES = 10;
export const MAX_IMAGE_DOC_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50MB
// Hard upper bound enforced by multer. Per-kind limits are checked in the controller.
const MULTER_MAX = MAX_VIDEO_BYTES;

function categorize(ext) {
  if (IMAGE_EXT.includes(ext)) return "image";
  if (VIDEO_EXT.includes(ext)) return "video";
  if (DOC_EXT.includes(ext)) return "document";
  if (DESIGN_EXT.includes(ext)) return "design";
  return "other";
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_ROOT),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const stamp = Date.now().toString(36);
    const rand = crypto.randomBytes(8).toString("hex");
    cb(null, `review-${stamp}-${rand}${ext}`);
  },
});

function fileFilter(_req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
  if (!ALLOWED_EXT.has(ext)) {
    return cb(new Error(`File type .${ext} is not allowed`));
  }
  if (!ALLOWED_MIME.has((file.mimetype || "").toLowerCase())) {
    // Some browsers report octet-stream for design files. Allow if extension is approved.
    if (!DESIGN_EXT.includes(ext)) {
      return cb(new Error(`Unsupported MIME type: ${file.mimetype}`));
    }
  }
  cb(null, true);
}

export const reviewUpload = multer({
  storage,
  fileFilter,
  limits: {
    files: MAX_FILES,
    fileSize: MULTER_MAX,
  },
});

// Validates per-kind size after multer accepts the file.
export function validateReviewFiles(files) {
  for (const file of files) {
    const ext = path.extname(file.originalname).toLowerCase().replace(".", "");
    const kind = categorize(ext);
    const limit = kind === "video" ? MAX_VIDEO_BYTES : MAX_IMAGE_DOC_BYTES;
    if (file.size > limit) {
      const mb = Math.round(limit / (1024 * 1024));
      return `File "${file.originalname}" exceeds the ${mb}MB limit for ${kind} files`;
    }
  }
  return null;
}

export { UPLOAD_ROOT, categorize };
