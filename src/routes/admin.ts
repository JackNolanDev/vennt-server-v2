import express from "express";
import type { Request } from "express";
import { Result, jsonStorageKeyValidator } from "vennt-library";
import { validateAdmin, wrapHandler } from "../utils/express";
import { JSON_STORAGE_BUCKET } from "../daos/jsonStorageDao";
import {
  handleRebuildUses,
  handleUpdateJsonStorage,
} from "../logic/jsonStorageLogic";
import { configureS3BucketCors } from "../utils/s3";

const updateJsonStorage = async (req: Request): Promise<Result<boolean>> => {
  validateAdmin(req);
  const key = jsonStorageKeyValidator.parse(req.params.key);
  return await handleUpdateJsonStorage(key);
};

const updateUses = async (req: Request): Promise<Result<boolean>> => {
  validateAdmin(req);
  const key = jsonStorageKeyValidator.parse(req.params.key);
  return await handleRebuildUses(key);
};

const configureBucketCors = async (req: Request): Promise<Result<boolean>> => {
  validateAdmin(req);
  return await configureS3BucketCors(JSON_STORAGE_BUCKET);
};

const router = express.Router();
router.post("/storage/:key", wrapHandler(updateJsonStorage));
router.post("/storage/:key/uses", wrapHandler(updateUses));
router.post("/bucket/configure/storage", wrapHandler(configureBucketCors));
export default router;
