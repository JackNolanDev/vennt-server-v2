import { format } from "@scaleleap/pg-format";
import { PoolClient, Pool } from "pg";
import { parseFirst, parseList, wrapSuccessResult } from "../utils/db";
import {
  EntityAttribute,
  EntityAttributes,
  FullEntity,
  FullEntityAbility,
  FullEntityChangelog,
  FullEntityItem,
  Result,
  UncompleteEntity,
  UncompleteEntityAbility,
  UncompleteEntityChangelog,
  UncompleteEntityItem,
} from "../utils/types";

export type TX = PoolClient | Pool;

const ENTITIES_TABLE = "vennt.entities";
const ABILITIES_TABLE = "vennt.abilities";
const ATTRIBUTE_CHANGELOG_TABLE = "vennt.attribute_changelog";
const ITEMS_TABLE = "vennt.items";

const INSERT_ENTITY_COLUMNS = "owner, name, type, attributes, other_fields";
const INSERT_ABILITY_COLUMNS =
  "entity_id, name, effect, custom_fields, uses, comment, active";
const INSERT_CHANGELOG_COLUMNS = "entity_id, attr, msg, prev";
const INSERT_ITEM_COLUMNS = `entity_id, name, bulk, "desc", type, custom_fields, uses, comment, active`;
const ENTITY_COLUMNS = `id, ${INSERT_ENTITY_COLUMNS}`;
const ABILTIY_COLUMNS = `id, ${INSERT_ABILITY_COLUMNS}`;
const CHANGELOG_COLUMNS = `id, ${INSERT_CHANGELOG_COLUMNS}, time`;
const ITEM_COLUMNS = `id, ${INSERT_ITEM_COLUMNS}`;

export const sqlInsertEntity = async (
  tx: TX,
  owner: string,
  entity: UncompleteEntity
): Promise<Result<FullEntity>> => {
  return parseFirst(
    await tx.query(
      `INSERT INTO ${ENTITIES_TABLE} (${INSERT_ENTITY_COLUMNS})
    VALUES ($1, $2, $3, $4, $5)
    RETURNING ${ENTITY_COLUMNS}`,
      [owner, entity.name, entity.type, entity.attributes, entity.other_fields]
    ),
    500
  );
};

export const sqlInsertAbilities = async (
  tx: TX,
  entity: string,
  abilities: UncompleteEntityAbility[]
): Promise<Result<FullEntityAbility[]>> => {
  if (abilities.length === 0) {
    return wrapSuccessResult([]);
  }
  const abilityRows = abilities.map((ability) => [
    entity,
    ability.name,
    ability.effect,
    ability.custom_fields,
    ability.uses,
    ability.comment,
    ability.active,
  ]);
  return parseList(
    await tx.query(
      format(
        `INSERT INTO ${ABILITIES_TABLE} (${INSERT_ABILITY_COLUMNS})
          VALUES %L
          RETURNING ${ABILTIY_COLUMNS}`,
        abilityRows
      )
    )
  );
};

export const sqlInsertChangelog = async (
  tx: TX,
  entity: string,
  changelog: UncompleteEntityChangelog[]
): Promise<Result<FullEntityChangelog[]>> => {
  if (changelog.length === 0) {
    return wrapSuccessResult([]);
  }
  const changelogRows = changelog.map((row) => [
    entity,
    row.attr,
    row.msg,
    row.prev,
  ]);
  return parseList(
    await tx.query(
      format(
        `INSERT INTO ${ATTRIBUTE_CHANGELOG_TABLE} (${INSERT_CHANGELOG_COLUMNS})
        VALUES %L
        RETURNING ${CHANGELOG_COLUMNS}`,
        changelogRows
      )
    )
  );
};

export const sqlInsertItems = async (
  tx: TX,
  entity: string,
  items: UncompleteEntityItem[]
): Promise<Result<FullEntityItem[]>> => {
  if (items.length === 0) {
    return wrapSuccessResult([]);
  }
  const itemRows = items.map((item) => [
    entity,
    item.name,
    item.bulk,
    item.desc,
    item.type,
    item.custom_fields,
    item.uses,
    item.comment,
    item.active,
  ]);
  return parseList(
    await tx.query(
      format(
        `INSERT INTO ${ITEMS_TABLE} (${INSERT_ITEM_COLUMNS})
        VALUES %L
        RETURNING ${ITEM_COLUMNS}`,
        itemRows
      )
    )
  );
};

export const sqlListEntities = async (
  tx: TX,
  owner: string
): Promise<Result<FullEntity[]>> => {
  return parseList(
    await tx.query(
      `SELECT ${ENTITY_COLUMNS} FROM ${ENTITIES_TABLE} WHERE owner = $1`,
      [owner]
    )
  );
};

export const sqlFetchEntityById = async (
  tx: TX,
  id: string
): Promise<Result<FullEntity>> => {
  return parseFirst(
    await tx.query(
      `SELECT ${ENTITY_COLUMNS} FROM ${ENTITIES_TABLE} WHERE id = $1`,
      [id]
    )
  );
};

export const sqlFetchAbilitiesByEntityId = async (
  tx: TX,
  id: string
): Promise<Result<FullEntityAbility[]>> => {
  return parseList(
    await tx.query(
      `SELECT ${ABILTIY_COLUMNS} FROM ${ABILITIES_TABLE} WHERE entity_id = $1`,
      [id]
    )
  );
};

export const sqlFetchChangelogByEntityId = async (
  tx: TX,
  id: string
): Promise<Result<FullEntityChangelog[]>> => {
  return parseList(
    await tx.query(
      `SELECT ${CHANGELOG_COLUMNS} FROM ${ATTRIBUTE_CHANGELOG_TABLE} WHERE entity_id = $1`,
      [id]
    )
  );
};

export const sqlFetchItemsByEntityId = async (
  tx: TX,
  id: string
): Promise<Result<FullEntityItem[]>> => {
  return parseList(
    await tx.query(
      `SELECT ${ITEM_COLUMNS} FROM ${ITEMS_TABLE} WHERE entity_id = $1`,
      [id]
    )
  );
};

export const sqlUpdateEntityAttributes = async (
  tx: TX,
  id: string,
  attributes: EntityAttributes
): Promise<Result<FullEntity>> => {
  return parseFirst(
    await tx.query(
      `UPDATE ${ENTITIES_TABLE} SET attributes = $1 WHERE id = $2 RETURNING ${ENTITY_COLUMNS}`,
      [attributes, id]
    ),
    500
  );
};

export const sqlFilterChangelog = async (tx: TX, entityId: string, attributes: EntityAttribute[]): Promise<Result<boolean>> => {
  await tx.query(format(`DELETE FROM ${ATTRIBUTE_CHANGELOG_TABLE} WHERE attr IN (%L)`, attributes));
  return wrapSuccessResult(true);
}