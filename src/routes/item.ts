import express from "express";
import type { Request } from "express";
import { idValidator, partialItemValidator } from "../utils/types";
import { dbDeleteItem, dbUpdateItem } from "../daos/itemDao";
import { validateAuthHeader } from "../utils/jwt";
import { wrapHandler } from "../utils/express";

const updateItem = async (req: Request) => {
  const account = validateAuthHeader(req);
  const body = partialItemValidator.parse(req.body);
  const id = idValidator.parse(req.params.id);
  return await dbUpdateItem(body, id, account.id);
};

const deleteItem = async (req: Request) => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  return await dbDeleteItem(id, account.id);
};

const router = express.Router();
router.patch("/:id", wrapHandler(updateItem));
router.delete("/:id", wrapHandler(deleteItem));
export default router;
