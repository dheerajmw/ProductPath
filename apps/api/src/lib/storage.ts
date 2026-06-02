import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { ALLOWED_UPLOAD_EXTENSIONS, MAX_UPLOAD_BYTES } from "@productpath/shared";

export interface StoredObject {
  key: string;
  url: string;
  sizeBytes: number;
  contentType: string;
}

const DANGEROUS_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".msi", ".dll", ".js", ".html"];

function uploadRoot() {
  return process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
}

function extensionOf(filename: string) {
  const ext = path.extname(filename).toLowerCase();
  return ext || "";
}

export function validateUpload(filename: string, sizeBytes: number, contentType: string) {
  const ext = extensionOf(filename);
  if (sizeBytes > MAX_UPLOAD_BYTES) {
    throw new StorageError(`File exceeds ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB limit`, 400, "FILE_TOO_LARGE");
  }
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    throw new StorageError("File type not allowed", 400, "FILE_TYPE_BLOCKED");
  }
  if (!ALLOWED_UPLOAD_EXTENSIONS.includes(ext as (typeof ALLOWED_UPLOAD_EXTENSIONS)[number])) {
    throw new StorageError(
      `Allowed types: ${ALLOWED_UPLOAD_EXTENSIONS.join(", ")}`,
      400,
      "FILE_TYPE_NOT_ALLOWED",
    );
  }
  if (contentType.startsWith("application/x-msdownload")) {
    throw new StorageError("File failed security check", 400, "FILE_BLOCKED");
  }
}

/** Stub virus scan: reject empty buffers and obvious executables. */
export function scanBuffer(buffer: Buffer, filename: string) {
  if (buffer.length === 0) {
    throw new StorageError("Empty file", 400, "FILE_EMPTY");
  }
  const ext = extensionOf(filename);
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    throw new StorageError("File failed security check", 400, "FILE_BLOCKED");
  }
  if (buffer.slice(0, 2).toString("hex") === "4d5a") {
    throw new StorageError("File failed security check", 400, "FILE_BLOCKED");
  }
}

export class StorageError extends Error {
  constructor(
    message: string,
    public statusCode = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "StorageError";
  }
}

export async function putObject(params: {
  key: string;
  body: Buffer;
  contentType: string;
}): Promise<StoredObject> {
  const root = uploadRoot();
  const dest = path.join(root, params.key);
  await fs.mkdir(path.dirname(dest), { recursive: true });
  await fs.writeFile(dest, params.body);

  const base = process.env.API_URL ?? "http://localhost:4000";
  return {
    key: params.key,
    url: `${base}/uploads/${params.key}`,
    sizeBytes: params.body.length,
    contentType: params.contentType,
  };
}

export async function getSignedUrl(key: string): Promise<string> {
  const base = process.env.API_URL ?? "http://localhost:4000";
  return `${base}/uploads/${key}`;
}

export function buildObjectKey(userId: string, submissionId: string, filename: string) {
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
  const id = crypto.randomBytes(8).toString("hex");
  return `${userId}/${submissionId}/${id}-${safe}`;
}
