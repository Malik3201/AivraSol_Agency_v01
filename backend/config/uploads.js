import fs from "fs";
import os from "os";
import path from "path";

let cachedRoot = null;

function tryEnsureWritable(dir) {
  try {
    fs.mkdirSync(dir, { recursive: true });
    fs.accessSync(dir, fs.constants.W_OK);
    return true;
  } catch {
    return false;
  }
}

// Picks the first writable location for uploads. On serverless platforms
// (Vercel, AWS Lambda) the project root is read-only, so we fall back to the
// OS temp dir (e.g. /tmp). Note: tmp storage is ephemeral on serverless; for
// production, swap to a cloud object store (Cloudinary/S3).
export function getUploadsRoot() {
  if (cachedRoot) return cachedRoot;

  const candidates = [
    process.env.UPLOAD_DIR && path.resolve(process.env.UPLOAD_DIR),
    path.resolve(process.cwd(), "uploads"),
    path.resolve(os.tmpdir(), "aivrasol-uploads"),
  ].filter(Boolean);

  for (const dir of candidates) {
    if (tryEnsureWritable(dir)) {
      cachedRoot = dir;
      console.log("📁 Uploads root:", cachedRoot);
      return cachedRoot;
    }
  }

  // Nothing writable: return the last candidate; multer will surface a clear
  // error at request time rather than crashing module load.
  cachedRoot = candidates[candidates.length - 1];
  console.warn(
    "⚠️ No writable upload location found; defaulting to",
    cachedRoot
  );
  return cachedRoot;
}

export function getReviewsUploadDir() {
  const dir = path.join(getUploadsRoot(), "reviews");
  tryEnsureWritable(dir);
  return dir;
}
