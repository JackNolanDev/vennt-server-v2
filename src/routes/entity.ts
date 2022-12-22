import express from "express";
import type { Request, Response } from "express";
import {
  adjustAttributesValidator,
  collectedEntityValidator,
  filterChangelogValidator,
  idValidator,
} from "../utils/types";
import {
  entityEditPermission,
  parseBody,
  pushResponse,
  resError,
} from "../utils/express";
import {
  dbFetchCollectedEntity,
  dbFilterChangelog,
  dbInsertCollectedEntity,
  dbListEntities,
  dbUpdateEntityAttributes,
} from "../daos/entityDao";
import { requireLoggedIn } from "../utils/middleware";

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
  const id = req.params.id;
  if (!idValidator.safeParse(id).success) {
    resError(res, "Invalid id", 400);
    return;
  }
  pushResponse(res, await dbFetchCollectedEntity(id));
};

const updateEntityAttributes = async (req: Request, res: Response) => {
  const body = parseBody(req, res, adjustAttributesValidator);
  if (!body) return;
  const id = req.params.id;
  if (!idValidator.safeParse(id).success) {
    resError(res, "Invalid id", 400);
    return;
  }
  if (Object.keys(body.attributes).length === 0) {
    resError(res, "Attributes is empty", 400);
  }
  pushResponse(
    res,
    await dbUpdateEntityAttributes(id, body, req.session.account.id)
  );
};

const filterChangelog = async (req: Request, res: Response) => {
  const body = parseBody(req, res, filterChangelogValidator);
  if (!body) return;
  const id = req.params.id;
  if (!idValidator.safeParse(id).success) {
    resError(res, "Invalid id", 400);
    return;
  }
  if (await entityEditPermission(res, id, req.session.account.id)) return;
  pushResponse(res, await dbFilterChangelog(id, body.attributes));
};

const router = express.Router();
router.post("", requireLoggedIn, addFullEntity);
router.get("", requireLoggedIn, listEntities);
router.get("/:id", requireLoggedIn, fetchCollectedEntity);
router.patch("/:id/attributes", requireLoggedIn, updateEntityAttributes);
router.patch("/:id/changelog", requireLoggedIn, filterChangelog);
export default router;
