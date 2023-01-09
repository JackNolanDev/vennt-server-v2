import express from "express";
import type { Request, Response } from "express";
import {
  abilityValidator,
  adjustAttributesValidator,
  attributeNameValidator,
  collectedEntityValidator,
  filterChangelogValidator,
  idValidator,
  itemValidator,
} from "../utils/types";
import {
  entityEditPermission,
  parseBody,
  parseParam,
  pushResponse,
  resError,
} from "../utils/express";
import {
  dbFetchChangelogByEntityIdAttribute,
  dbFetchCollectedEntity,
  dbFilterChangelog,
  dbInsertCollectedEntity,
  dbListEntities,
  dbUpdateEntityAttributes,
} from "../daos/entityDao";
import { dbInsertItems } from "../daos/itemDao";
import { requireLoggedIn } from "../utils/middleware";
import { dbInsertAbilities } from "../daos/abilityDao";

const addFullEntity = async (req: Request, res: Response) => {
  const body = parseBody(req, res, collectedEntityValidator);
  if (!body) return;

  pushResponse(
    res,
    await dbInsertCollectedEntity(body, req.session.account.id)
  );
};

const listEntities = async (req: Request, res: Response) => {
  pushResponse(res, await dbListEntities(req.session.account.id));
};

const fetchCollectedEntity = async (req: Request, res: Response) => {
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  pushResponse(res, await dbFetchCollectedEntity(id));
};

const updateEntityAttributes = async (req: Request, res: Response) => {
  const body = parseBody(req, res, adjustAttributesValidator);
  if (!body) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  if (Object.keys(body.attributes).length === 0) {
    resError(res, "Attributes is empty", 400);
    return;
  }
  pushResponse(
    res,
    await dbUpdateEntityAttributes(id, body, req.session.account.id)
  );
};

const filterChangelog = async (req: Request, res: Response) => {
  const body = parseBody(req, res, filterChangelogValidator);
  if (!body) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  if (await entityEditPermission(res, id, req.session.account.id)) return;
  pushResponse(res, await dbFilterChangelog(id, body.attributes));
};

const getAttrChangelog = async (req: Request, res: Response) => {
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  const attr = parseParam(req, res, "keu", attributeNameValidator);
  if (!attr) return;
  pushResponse(res, await dbFetchChangelogByEntityIdAttribute(id, attr));
};

const insertAbilities = async (req: Request, res: Response) => {
  const body = parseBody(req, res, abilityValidator.array());
  if (!body) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  if (await entityEditPermission(res, id, req.session.account.id)) return;
  pushResponse(res, await dbInsertAbilities(id, body));
};

const insertItems = async (req: Request, res: Response) => {
  const body = parseBody(req, res, itemValidator.array());
  if (!body) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  if (await entityEditPermission(res, id, req.session.account.id)) return;
  pushResponse(res, await dbInsertItems(id, body));
};

const router = express.Router();
router.post("", requireLoggedIn, addFullEntity);
router.get("", requireLoggedIn, listEntities);
router.get("/:id", requireLoggedIn, fetchCollectedEntity);
router.patch("/:id/attributes", requireLoggedIn, updateEntityAttributes);
router.patch("/:id/changelog", requireLoggedIn, filterChangelog);
router.get(":/id/changelog/:attr", requireLoggedIn, getAttrChangelog);
router.post("/:id/abilities", requireLoggedIn, insertAbilities);
router.post("/:id/items", requireLoggedIn, insertItems);
export default router;
