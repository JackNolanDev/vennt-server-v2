import express from "express";
import type { Request, Response } from "express";
import { requireLoggedIn } from "../utils/middleware";
import { parseBody, pushResponse, parseParam } from "../utils/express";
import { idValidator, partialItemValidator } from "../utils/types";
import { dbDeleteItem, dbUpdateItem } from "../daos/itemDao";

const updateItem = async (req: Request, res: Response) => {
  const body = parseBody(req, res, partialItemValidator);
  if (!body) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  pushResponse(res, await dbUpdateItem(body, id, req.session.account.id));
};

const deleteItem = async (req: Request, res: Response) => {
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  pushResponse(res, await dbDeleteItem(id, req.session.account.id));
};

const router = express.Router();
router.patch("/:id", requireLoggedIn, updateItem);
router.delete("/:id", requireLoggedIn, deleteItem);
export default router;
