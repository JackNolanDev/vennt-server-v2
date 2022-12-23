import express from "express";
import type { Request, Response } from "express";
import { requireAdmin } from "../utils/middleware";
import { jsonStorageKeyValidator } from "../utils/types";
import { pushResponse, validateParam } from "../utils/express";
import { dbGetJSONDocument } from "../daos/jsonStorageDao";
import { handleUpdateJsonStorage } from "../logic/jsonStorageLogic";

const updateJsonStorage = async (req: Request, res: Response) => {
  const key = validateParam(req, res, "key", jsonStorageKeyValidator);
  if (!key) return;
  pushResponse(res, await handleUpdateJsonStorage(key));
};

const fetchJsonStorage = async (req: Request, res: Response) => {
  const key = validateParam(req, res, "key", jsonStorageKeyValidator);
  if (!key) return;
  pushResponse(res, await dbGetJSONDocument(key));
};

const router = express.Router();
router.post("/:key", requireAdmin, updateJsonStorage);
router.get("/:key", fetchJsonStorage);
export default router;
