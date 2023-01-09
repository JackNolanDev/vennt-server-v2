import express from "express";
import type { Request, Response } from "express";
import { requireLoggedIn } from "../utils/middleware";
import { parseBody, parseParam, pushResponse } from "../utils/express";
import { idValidator, partialAbilityValidator } from "../utils/types";
import { dbDeleteAbility, dbUpdateAbility } from "../daos/abilityDao";

const updateAbility = async (req: Request, res: Response) => {
  const body = parseBody(req, res, partialAbilityValidator);
  if (!body) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  pushResponse(res, await dbUpdateAbility(body, id, req.session.account.id));
};

const deleteAbility = async (req: Request, res: Response) => {
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  pushResponse(res, await dbDeleteAbility(id, req.session.account.id));
};

const router = express.Router();
router.patch("/:id", requireLoggedIn, updateAbility);
router.delete("/:id", requireLoggedIn, deleteAbility);
export default router;
