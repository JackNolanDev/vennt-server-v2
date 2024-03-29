import {
  handleTransaction,
  unwrapResultOrError,
  wrapSuccessResult,
} from "../utils/db";
import pool from "../utils/pool";
import {
  FullEntityFlux,
  PartialEntityFlux,
  Result,
  UncompleteEntityFlux,
} from "vennt-library";
import {
  sqlDeleteFlux,
  sqlFetchFluxById,
  sqlInsertFlux,
  sqlUpdateFlux,
} from "./sql";

export const dbInsertFlux = async (
  entityId: string,
  flux: UncompleteEntityFlux
): Promise<Result<FullEntityFlux>> => {
  const result = await sqlInsertFlux(pool, entityId, [flux]);
  return result.success ? wrapSuccessResult(result.result[0]) : result;
};

export const dbUpdateFlux = (
  partialFlux: PartialEntityFlux,
  fluxId: string,
  entityId: string
): Promise<Result<FullEntityFlux>> => {
  return handleTransaction(async (tx) => {
    const currentFlux = unwrapResultOrError(
      await sqlFetchFluxById(tx, fluxId, entityId)
    );
    const newFlux = { ...currentFlux, ...partialFlux };
    return sqlUpdateFlux(tx, fluxId, newFlux);
  });
};

export const dbDeleteFlux = (
  fluxId: string,
  entityId: string
): Promise<Result<boolean>> => {
  return sqlDeleteFlux(pool, fluxId, entityId);
};
