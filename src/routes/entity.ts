import express from "express";
import type { Request } from "express";
import {
  FullCollectedEntity,
  FullEntity,
  FullEntityAbility,
  FullEntityChangelog,
  FullEntityFlux,
  FullEntityItem,
  FullEntityText,
  Result,
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
import { validateEditEntityPermission, wrapHandler } from "../utils/express";
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
import { dbInsertAbilities } from "../daos/abilityDao";
import {
  dbDeleteEntityText,
  dbInsertEntityText,
  dbUpdateEntityText,
  dbUpdateEntityTextPermission,
} from "../daos/entityTextDao";
import { dbDeleteFlux, dbInsertFlux, dbUpdateFlux } from "../daos/fluxDao";
import { validateAuthHeader, validateOptionalAuthHeader } from "../utils/jwt";

const addFullEntity = async (
  req: Request
): Promise<Result<FullCollectedEntity>> => {
  const account = validateAuthHeader(req);
  const body = collectedEntityWithChangelogValidator.parse(req.body);
  return await dbInsertCollectedEntity(body, account.id);
};

const listEntities = async (req: Request): Promise<Result<FullEntity[]>> => {
  const account = validateAuthHeader(req);
  return await dbListEntities(account.id);
};

const fetchCollectedEntity = async (
  req: Request
): Promise<Result<FullCollectedEntity>> => {
  const account = validateOptionalAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  return await dbFetchCollectedEntity(id, account?.id);
};

const updateEntity = async (req: Request): Promise<Result<FullEntity>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const body = partialEntityValidator.parse(req.body);
  return await dbUpdateEntity(id, account.id, body);
};

const deleteEntity = async (req: Request): Promise<Result<boolean>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  validateEditEntityPermission(account, id);
  return await dbDeleteEntity(id);
};

const updateEntityAttributes = async (
  req: Request
): Promise<Result<FullEntity>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const body = adjustAttributesValidator.parse(req.body);
  return await dbUpdateEntityAttributes(id, body, account.id);
};

const filterChangelog = async (req: Request): Promise<Result<boolean>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  validateEditEntityPermission(account, id);
  const body = filterChangelogValidator.parse(req.body);
  return await dbFilterChangelog(id, body.attributes);
};

const getAttrChangelog = async (
  req: Request
): Promise<Result<FullEntityChangelog[]>> => {
  const id = idValidator.parse(req.params.id);
  const attr = attributeNameValidator.parse(req.params.attr);
  return await dbFetchChangelogByEntityIdAttribute(id, attr);
};

const insertAbilities = async (
  req: Request
): Promise<Result<FullEntityAbility[]>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  validateEditEntityPermission(account, id);
  const abilities = abilityValidator.array().parse(req.body);
  return await dbInsertAbilities(id, abilities);
};

const insertItems = async (req: Request): Promise<Result<FullEntityItem[]>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  validateEditEntityPermission(account, id);
  const items = itemValidator.array().parse(req.body);
  return await dbInsertItems(id, items);
};

const insertEntityText = async (
  req: Request
): Promise<Result<FullEntityText>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  validateEditEntityPermission(account, id);
  const text = entityTextValidator.parse(req.body);
  return await dbInsertEntityText(id, text);
};

const updateEntityText = async (req: Request): Promise<Result<boolean>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  validateEditEntityPermission(account, id);
  const key = entityTextKeyValidator.parse(req.params.key);
  const body = entityTextTextValidator.parse(req.body);
  return await dbUpdateEntityText(id, key, body.text);
};

const updateEntityTextPermission = async (
  req: Request
): Promise<Result<boolean>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  validateEditEntityPermission(account, id);
  const key = entityTextKeyValidator.parse(req.params.key);
  const permission = entityTextPermissionValidator.parse(req.body);
  return await dbUpdateEntityTextPermission(id, key, permission.public);
};

const deleteEntityText = async (req: Request): Promise<Result<boolean>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  validateEditEntityPermission(account, id);
  const key = entityTextKeyValidator.parse(req.params.key);
  return await dbDeleteEntityText(id, key);
};

const insertFlux = async (req: Request): Promise<Result<FullEntityFlux>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  validateEditEntityPermission(account, id);
  const flux = entityFluxValidator.parse(req.body);
  return await await dbInsertFlux(id, flux);
};

// TODO: I think the permission logic for update flux / delete flux is broken

const updateFlux = async (req: Request): Promise<Result<FullEntityFlux>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  validateEditEntityPermission(account, id);
  const flux = partialEntityFluxValidator.parse(req.body);
  const fluxId = idValidator.parse(req.params.fluxId);
  return await dbUpdateFlux(flux, fluxId);
};

const deleteFlux = async (req: Request): Promise<Result<boolean>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  validateEditEntityPermission(account, id);
  const fluxId = idValidator.parse(req.params.fluxId);
  return await dbDeleteFlux(fluxId);
};

const router = express.Router();
router.post("", wrapHandler(addFullEntity));
router.get("", wrapHandler(listEntities));
router.get("/:id", wrapHandler(fetchCollectedEntity));
router.patch("/:id", wrapHandler(updateEntity));
router.delete("/:id", wrapHandler(deleteEntity));
router.patch("/:id/attributes", wrapHandler(updateEntityAttributes));
router.patch("/:id/changelog", wrapHandler(filterChangelog));
router.get("/:id/changelog/:attr", wrapHandler(getAttrChangelog));
router.post("/:id/abilities", wrapHandler(insertAbilities));
router.post("/:id/items", wrapHandler(insertItems));
router.post("/:id/text", wrapHandler(insertEntityText));
router.put("/:id/text/:key", wrapHandler(updateEntityText));
router.put(
  "/:id/text/:key/permission",
  wrapHandler(updateEntityTextPermission)
);
router.delete("/:id/text/:key", wrapHandler(deleteEntityText));
router.post("/:id/flux", wrapHandler(insertFlux));
router.patch("/:id/flux/:fluxId", wrapHandler(updateFlux));
router.delete("/:id/flux/:fluxId", wrapHandler(deleteFlux));
export default router;
