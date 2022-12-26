import express from "express";
import type { Request, Response } from "express";
import { requireLoggedIn } from "../utils/middleware";
import {
  parseBody,
  pushResponse,
  resError,
  validateParam,
} from "../utils/express";
import { idValidator, partialItemValidator } from "../utils/types";
import { dbDeleteItem, dbUpdateItem } from "../daos/itemDao";

const updateItem = async (req: Request, res: Response) => {
  const body = parseBody(req, res, partialItemValidator);
  if (!body) return;
  if (Object.keys(body).length === 0) {
    resError(res, "body is empty", 400);
    return;
  }
  const id = validateParam(req, res, "id", idValidator);
  if (!id) return;
  pushResponse(res, await dbUpdateItem(body, id, req.session.account.id));
};

const deleteItem = async (req: Request, res: Response) => {
  const id = validateParam(req, res, "id", idValidator);
  if (!id) return;
  pushResponse(res, await dbDeleteItem(id, req.session.account.id));
};

const router = express.Router();
router.patch("/:id", requireLoggedIn, updateItem);
router.delete("/:id", requireLoggedIn, deleteItem);
export default router;
