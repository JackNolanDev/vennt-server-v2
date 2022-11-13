import express from "express";
import type { Request, Response } from "express";
import { fullEntityValidator } from "../utils/types";
import { parseBody } from "../utils/express";

const addEntity = async (req: Request, res: Response) => {
  const body = parseBody(req, res, fullEntityValidator);
  if (!body) {
    return;
  }
  // 1. insert entity into db
  // 2. insert items / abilities / changelog
  res.sendStatus(200);
}


const router = express.Router();
router.post("/full", addEntity);
export default router;
