import multer from "multer";
import path from "path";
import fs from "fs";
import { v4 as uuidv4 } from "uuid";
import { Request } from "express";
import { env } from "../../config/env";
import { AppError } from "../errors/AppError";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/jpg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

const storage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    // Files are namespaced by lawFirmId — keeps each tenant's documents in
    // their own folder on disk, mirroring the DB-level multi-tenant isolation.
    const lawFirmId = req.auth?.lawFirmId || "unassigned";
    const dir = path.join(process.cwd(), env.storage.localUploadDir, lawFirmId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const safeName = `${Date.now()}-${uuidv4()}${ext}`;
    cb(null, safeName);
  },
});

function fileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error("Unsupported file type. Allowed: PDF, JPG, PNG, WEBP, DOC, DOCX"));
  }
  cb(null, true);
}

export const documentUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

// Library resources (Acts, Gazette PDFs, etc.) — Company-managed, not tenant-scoped,
// so files go under a flat uploads/library/ folder instead of per-lawFirmId.
const libraryStorage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const dir = path.join(process.cwd(), env.storage.localUploadDir, "library");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  },
});

export const libraryUpload = multer({
  storage: libraryStorage,
  fileFilter,
  limits: { fileSize: MAX_FILE_SIZE_BYTES },
});

// Profile photos — small, image-only, own folder so they're easy to serve/cache separately.
const AVATAR_MAX_SIZE_BYTES = 3 * 1024 * 1024; // 3MB — a profile photo never needs to be huge
const avatarStorage = multer.diskStorage({
  destination: (req: Request, file, cb) => {
    const dir = path.join(process.cwd(), env.storage.localUploadDir, "avatars");
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${req.auth?.userId || "user"}-${Date.now()}${ext}`);
  },
});

function avatarFileFilter(req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const imageTypes = new Set(["image/jpeg", "image/png", "image/jpg", "image/webp"]);
  if (!imageTypes.has(file.mimetype)) {
    return cb(new Error("Profile photo must be an image (JPG, PNG, or WEBP)"));
  }
  cb(null, true);
}

export const avatarUpload = multer({
  storage: avatarStorage,
  fileFilter: avatarFileFilter,
  limits: { fileSize: AVATAR_MAX_SIZE_BYTES },
});

export function mapMulterError(err: unknown): AppError {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return AppError.badRequest("File is too large. Maximum size is 10MB.");
    }
    return AppError.badRequest(err.message);
  }
  if (err instanceof Error) {
    return AppError.badRequest(err.message);
  }
  return AppError.badRequest("File upload failed");
}
