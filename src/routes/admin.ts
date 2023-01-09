import express from "express";
import type { Request, Response } from "express";
import { requireAdmin } from "../utils/middleware";
import { jsonStorageKeyValidator } from "../utils/types";
import { pushResponse, parseParam } from "../utils/express";
import { JSON_STORAGE_BUCKET } from "../daos/jsonStorageDao";
import { handleUpdateJsonStorage } from "../logic/jsonStorageLogic";
import { configureS3BucketCors } from "../utils/s3";

const updateJsonStorage = async (req: Request, res: Response) => {
  const key = parseParam(req, res, "key", jsonStorageKeyValidator);
  if (!key) return;
  pushResponse(res, await handleUpdateJsonStorage(key));
};

const configureBucketCors = async (req: Request, res: Response) => {
  pushResponse(res, await configureS3BucketCors(JSON_STORAGE_BUCKET));
};

const router = express.Router();
router.post("/storage/:key", requireAdmin, updateJsonStorage);
router.post("/bucket/configure/storage", requireAdmin, configureBucketCors);
export default router;
