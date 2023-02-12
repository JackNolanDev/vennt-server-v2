import express from "express";
import type { Request } from "express";
import { idValidator, partialAbilityValidator } from "../utils/types";
import { dbDeleteAbility, dbUpdateAbility } from "../daos/abilityDao";
import { validateAuthHeader } from "../utils/jwt";
import { wrapHandler } from "../utils/express";

const updateAbility = async (req: Request) => {
  const account = validateAuthHeader(req);
  const body = partialAbilityValidator.parse(req.body);
  const id = idValidator.parse(req.params.id);
  return await dbUpdateAbility(body, id, account.id);
};

const deleteAbility = async (req: Request) => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  return await dbDeleteAbility(id, account.id);
};

const router = express.Router();
router.patch("/:id", wrapHandler(updateAbility));
router.delete("/:id", wrapHandler(deleteAbility));
export default router;
