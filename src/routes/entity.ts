import express from "express";
import type { Request } from "express";
import {
  FullCollectedEntity,
  FullCollectedEntityWithChangelog,
  FullEntity,
  FullEntityAbility,
  FullEntityChangelog,
  FullEntityFlux,
  FullEntityItem,
  FullEntityText,
  PostAbilitiesResponse,
  PostItemsResponse,
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
  optionalIdValidator,
  partialEntityFluxValidator,
  partialEntityValidator,
} from "vennt-library";
import { validateEditEntityPermission, wrapHandler } from "../utils/express";
import {
  dbDeleteEntity,
  dbFetchChangelogByEntityIdAttribute,
  dbFetchCollectedEntity,
  dbFetchCollectedEntityFull,
  dbFilterChangelog,
  dbInsertCollectedEntity,
  dbListEntities,
  dbUpdateEntity,
  dbUpdateEntityAttributes,
  dbUserCanReadPublicOnlyFields,
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
import { unwrapResultOrError } from "../utils/db";

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
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  const publicOnly = unwrapResultOrError(
    await dbUserCanReadPublicOnlyFields(id, account?.id, campaignId)
  );
  return await dbFetchCollectedEntity(id, publicOnly);
};

const updateEntity = async (req: Request): Promise<Result<FullEntity>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const body = partialEntityValidator.parse(req.body);
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  await validateEditEntityPermission(account, id, campaignId);
  return await dbUpdateEntity(id, body);
};

const deleteEntity = async (req: Request): Promise<Result<boolean>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  // PURPOSELY NOT INCLUDING CAMPAIGN IN VALIDATION
  await validateEditEntityPermission(account, id);
  return await dbDeleteEntity(id);
};

const fetchCollectedEntityFull = async (
  req: Request
): Promise<Result<FullCollectedEntityWithChangelog>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  await validateEditEntityPermission(account, id, campaignId);
  return await dbFetchCollectedEntityFull(id);
};

const updateEntityAttributes = async (
  req: Request
): Promise<Result<FullEntity>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const body = adjustAttributesValidator.parse(req.body);
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  await validateEditEntityPermission(account, id, campaignId);
  return await dbUpdateEntityAttributes(id, body);
};

const filterChangelog = async (req: Request): Promise<Result<boolean>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const body = filterChangelogValidator.parse(req.body);
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  await validateEditEntityPermission(account, id, campaignId);
  return await dbFilterChangelog(id, body.attributes);
};

const getAttrChangelog = async (
  req: Request
): Promise<Result<FullEntityChangelog[]>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const attr = attributeNameValidator.parse(req.params.attr);
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  await validateEditEntityPermission(account, id, campaignId);
  return await dbFetchChangelogByEntityIdAttribute(id, attr);
};

const insertAbilities = async (
  req: Request
): Promise<Result<PostAbilitiesResponse>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  await validateEditEntityPermission(account, id, campaignId);
  const abilities = abilityValidator.array().parse(req.body);
  return await dbInsertAbilities(id, abilities);
};

const insertItems = async (
  req: Request
): Promise<Result<PostItemsResponse>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  await validateEditEntityPermission(account, id, campaignId);
  const items = itemValidator.array().parse(req.body);
  return await dbInsertItems(id, items);
};

const insertEntityText = async (
  req: Request
): Promise<Result<FullEntityText>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  await validateEditEntityPermission(account, id, campaignId);
  const text = entityTextValidator.parse(req.body);
  return await dbInsertEntityText(id, text);
};

const updateEntityText = async (req: Request): Promise<Result<boolean>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  await validateEditEntityPermission(account, id, campaignId);
  const key = entityTextKeyValidator.parse(req.params.key);
  const body = entityTextTextValidator.parse(req.body);
  return await dbUpdateEntityText(id, key, body.text);
};

const updateEntityTextPermission = async (
  req: Request
): Promise<Result<boolean>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  // PURPOSELY NOT INCLUDING CAMPAIGN IN VALIDATION
  await validateEditEntityPermission(account, id);
  const key = entityTextKeyValidator.parse(req.params.key);
  const permission = entityTextPermissionValidator.parse(req.body);
  return await dbUpdateEntityTextPermission(id, key, permission.public);
};

const deleteEntityText = async (req: Request): Promise<Result<boolean>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  // PURPOSELY NOT INCLUDING CAMPAIGN IN VALIDATION
  await validateEditEntityPermission(account, id);
  const key = entityTextKeyValidator.parse(req.params.key);
  return await dbDeleteEntityText(id, key);
};

const insertFlux = async (req: Request): Promise<Result<FullEntityFlux>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  await validateEditEntityPermission(account, id, campaignId);
  const flux = entityFluxValidator.parse(req.body);
  return await await dbInsertFlux(id, flux);
};

const updateFlux = async (req: Request): Promise<Result<FullEntityFlux>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  await validateEditEntityPermission(account, id, campaignId);
  const flux = partialEntityFluxValidator.parse(req.body);
  const fluxId = idValidator.parse(req.params.fluxId);
  return await dbUpdateFlux(flux, fluxId, id);
};

const deleteFlux = async (req: Request): Promise<Result<boolean>> => {
  const account = validateAuthHeader(req);
  const id = idValidator.parse(req.params.id);
  const campaignId = optionalIdValidator.parse(req.query.campaign_id);
  await validateEditEntityPermission(account, id, campaignId);
  const fluxId = idValidator.parse(req.params.fluxId);
  return await dbDeleteFlux(fluxId, id);
};

const router = express.Router();
router.post("", wrapHandler(addFullEntity));
router.get("", wrapHandler(listEntities));
router.get("/:id", wrapHandler(fetchCollectedEntity));
router.patch("/:id", wrapHandler(updateEntity));
router.delete("/:id", wrapHandler(deleteEntity));
router.get("/:id/full", wrapHandler(fetchCollectedEntityFull));
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
