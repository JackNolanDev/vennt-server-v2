import express from "express";
import type { Request } from "express";
import {
  idValidator,
  optionalIdValidator,
  partialItemValidator,
} from "vennt-library";
import { dbDeleteItem, dbUpdateItem } from "../daos/itemDao";
import { validateAuthHeader } from "../utils/jwt";
import { wrapHandler } from "../utils/express";

const updateItem = async (req: Request) => {
  const account = validateAuthHeader(req);
  const body = partialItemValidator.parse(req.body);
  const id = idValidator.parse(req.params.id);
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  return await dbUpdateItem(body, id, account.id, campaignId);
};

const deleteItem = async (req: Request) => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  return await dbDeleteItem(id, account.id, campaignId);
};

const router = express.Router();
router.patch("/:id", wrapHandler(updateItem));
router.delete("/:id", wrapHandler(deleteItem));
export default router;
