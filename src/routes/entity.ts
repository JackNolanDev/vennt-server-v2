import express from "express";
import type { Request, Response } from "express";
import {
  abilityValidator,
  adjustAttributesValidator,
  attributeNameValidator,
  collectedEntityWithChangelogValidator,
  entityFluxValidator,
  entityTextKeyValidator,
  entityTextPermissionValidator,
  entityTextTextValidator,
  entityTextValidator,
  filterChangelogValidator,
  idValidator,
  itemValidator,
  partialEntityFluxValidator,
  partialEntityValidator,
} from "../utils/types";
import {
  entityEditPermission,
  parseBody,
  parseParam,
  pushResponse,
} from "../utils/express";
import {
  dbDeleteEntity,
  dbFetchChangelogByEntityIdAttribute,
  dbFetchCollectedEntity,
  dbFilterChangelog,
  dbInsertCollectedEntity,
  dbListEntities,
  dbUpdateEntity,
  dbUpdateEntityAttributes,
} from "../daos/entityDao";
import { dbInsertItems } from "../daos/itemDao";
import { requireLoggedIn } from "../utils/middleware";
import { dbInsertAbilities } from "../daos/abilityDao";
import {
  dbDeleteEntityText,
  dbInsertEntityText,
  dbUpdateEntityText,
  dbUpdateEntityTextPermission,
} from "../daos/entityTextDao";
import { z } from "zod";
import { dbDeleteFlux, dbInsertFlux, dbUpdateFlux } from "../daos/fluxDao";

const addFullEntity = async (req: Request, res: Response) => {
  const body = parseBody(req, res, collectedEntityWithChangelogValidator);
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
  pushResponse(res, await dbFetchCollectedEntity(id, req.session.account?.id));
};

const updateEntity = async (req: Request, res: Response) => {
  const body = parseBody(req, res, partialEntityValidator);
  if (!body) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  pushResponse(res, await dbUpdateEntity(id, req.session.account.id, body));
};

const deleteEntity = async (req: Request, res: Response) => {
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  if (await entityEditPermission(res, id, req.session.account.id)) return;
  pushResponse(res, await dbDeleteEntity(id));
};

const updateEntityAttributes = async (req: Request, res: Response) => {
  const body = parseBody(req, res, adjustAttributesValidator);
  if (!body) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
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
  const attr = parseParam(req, res, "attr", attributeNameValidator);
  if (!attr) return;
  pushResponse(res, await dbFetchChangelogByEntityIdAttribute(id, attr));
};

const insertAbilities = async (req: Request, res: Response) => {
  const abilities = parseBody(req, res, abilityValidator.array());
  if (!abilities) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  if (await entityEditPermission(res, id, req.session.account.id)) return;
  pushResponse(res, await dbInsertAbilities(id, abilities));
};

const insertItems = async (req: Request, res: Response) => {
  const items = parseBody(req, res, itemValidator.array());
  if (!items) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  if (await entityEditPermission(res, id, req.session.account.id)) return;
  pushResponse(res, await dbInsertItems(id, items));
};

const insertEntityText = async (req: Request, res: Response) => {
  const text = parseBody(req, res, entityTextValidator);
  if (!text) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  if (await entityEditPermission(res, id, req.session.account.id)) return;
  pushResponse(res, await dbInsertEntityText(id, text));
};

const updateEntityText = async (req: Request, res: Response) => {
  const body = parseBody(req, res, entityTextTextValidator);
  if (!body) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  const key = parseParam(req, res, "key", entityTextKeyValidator);
  if (!key) return;
  if (await entityEditPermission(res, id, req.session.account.id)) return;
  pushResponse(res, await dbUpdateEntityText(id, key, body.text));
};

const updateEntityTextPermission = async (req: Request, res: Response) => {
  const permission = parseBody(req, res, entityTextPermissionValidator);
  if (!permission) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  const key = parseParam(req, res, "key", entityTextKeyValidator);
  if (!key) return;
  if (await entityEditPermission(res, id, req.session.account.id)) return;
  pushResponse(res, await dbUpdateEntityTextPermission(id, key, permission.public));
};

const deleteEntityText = async (req: Request, res: Response) => {
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  const key = parseParam(req, res, "key", entityTextKeyValidator);
  if (!key) return;
  if (await entityEditPermission(res, id, req.session.account.id)) return;
  pushResponse(res, await dbDeleteEntityText(id, key));
};

const insertFlux = async (req: Request, res: Response) => {
  const flux = parseBody(req, res, entityFluxValidator);
  if (!flux) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  if (await entityEditPermission(res, id, req.session.account.id)) return;
  pushResponse(res, await dbInsertFlux(id, flux));
};

const updateFlux = async (req: Request, res: Response) => {
  const flux = parseBody(req, res, partialEntityFluxValidator);
  if (!flux) return;
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  const fluxId = parseParam(req, res, "fluxId", idValidator);
  if (!fluxId) return;
  if (await entityEditPermission(res, id, req.session.account.id)) return;
  pushResponse(res, await dbUpdateFlux(flux, fluxId));
};

const deleteFlux = async (req: Request, res: Response) => {
  const id = parseParam(req, res, "id", idValidator);
  if (!id) return;
  const fluxId = parseParam(req, res, "fluxId", idValidator);
  if (!fluxId) return;
  if (await entityEditPermission(res, id, req.session.account.id)) return;
  pushResponse(res, await dbDeleteFlux(fluxId));
};

const router = express.Router();
router.post("", requireLoggedIn, addFullEntity);
router.get("", requireLoggedIn, listEntities);
router.get("/:id", fetchCollectedEntity);
router.patch("/:id", requireLoggedIn, updateEntity);
router.delete("/:id", requireLoggedIn, deleteEntity);
router.patch("/:id/attributes", requireLoggedIn, updateEntityAttributes);
router.patch("/:id/changelog", requireLoggedIn, filterChangelog);
router.get("/:id/changelog/:attr", requireLoggedIn, getAttrChangelog);
router.post("/:id/abilities", requireLoggedIn, insertAbilities);
router.post("/:id/items", requireLoggedIn, insertItems);
router.post("/:id/text", requireLoggedIn, insertEntityText);
router.put("/:id/text/:key", requireLoggedIn, updateEntityText);
router.put(
  "/:id/text/:key/permission",
  requireLoggedIn,
  updateEntityTextPermission
);
router.delete("/:id/text/:key", requireLoggedIn, deleteEntityText);
router.post("/:id/flux", requireLoggedIn, insertFlux);
router.patch("/:id/flux/:fluxId", requireLoggedIn, updateFlux);
router.delete("/:id/flux/:fluxId", requireLoggedIn, deleteFlux);
export default router;
