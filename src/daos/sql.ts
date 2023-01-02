import { format } from "@scaleleap/pg-format";
import { PoolClient, Pool } from "pg";
import {
  parseFirst,
  parseFirstVal,
  parseList,
  wrapSuccessResult,
} from "../utils/db";
import {
  EntityAttribute,
  EntityAttributes,
  EntityItem,
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

export const ENTITIES_TABLE = "vennt.entities";
export const ABILITIES_TABLE = "vennt.abilities";
export const ATTRIBUTE_CHANGELOG_TABLE = "vennt.attribute_changelog";
export const ITEMS_TABLE = "vennt.items";
export const JSON_STORAGE_TABLE = "vennt.json_storage";

export const INSERT_ENTITY_COLUMNS = `owner, name, type, attributes, other_fields`;
export const INSERT_ABILITY_COLUMNS = `entity_id, name, effect, custom_fields, uses, comment, active`;
export const INSERT_CHANGELOG_COLUMNS = `entity_id, attr, msg, prev`;
export const INSERT_ITEM_COLUMNS = `entity_id, name, bulk, "desc", type, custom_fields, uses, comment, active`;
export const ENTITY_COLUMNS = `${ENTITIES_TABLE}.id, ${ENTITIES_TABLE}.owner, ${ENTITIES_TABLE}.name, ${ENTITIES_TABLE}.type, \
  ${ENTITIES_TABLE}.attributes, ${ENTITIES_TABLE}.other_fields`;
export const ABILTIY_COLUMNS = `${ABILITIES_TABLE}.id, ${ABILITIES_TABLE}.entity_id, ${ABILITIES_TABLE}.name, ${ABILITIES_TABLE}.effect, \
  ${ABILITIES_TABLE}.custom_fields, ${ABILITIES_TABLE}.uses, ${ABILITIES_TABLE}.comment, ${ABILITIES_TABLE}.active`;
export const CHANGELOG_COLUMNS = `${ATTRIBUTE_CHANGELOG_TABLE}.id, ${ATTRIBUTE_CHANGELOG_TABLE}.entity_id, ${ATTRIBUTE_CHANGELOG_TABLE}.attr, \
  ${ATTRIBUTE_CHANGELOG_TABLE}.msg, ${ATTRIBUTE_CHANGELOG_TABLE}.prev, ${ATTRIBUTE_CHANGELOG_TABLE}.time`;
export const ITEM_COLUMNS = `${ITEMS_TABLE}.id, ${ITEMS_TABLE}.entity_id, ${ITEMS_TABLE}.name, ${ITEMS_TABLE}.bulk, ${ITEMS_TABLE}.desc, \
  ${ITEMS_TABLE}.type, ${ITEMS_TABLE}.custom_fields, ${ITEMS_TABLE}.uses, ${ITEMS_TABLE}.comment, ${ITEMS_TABLE}.active`;

// ENTITIES

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

// ABILITIES

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

// CHANGELOG

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

export const sqlFilterChangelog = async (
  tx: TX,
  entityId: string,
  attributes: EntityAttribute[]
): Promise<Result<boolean>> => {
  await tx.query(
    format(
      `DELETE FROM ${ATTRIBUTE_CHANGELOG_TABLE} WHERE entity_id = $1 AND attr IN (%L)`,
      attributes
    ),
    [entityId]
  );
  return wrapSuccessResult(true);
};

// ITEMS

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

export const sqlFetchItemWithOwnerById = async (
  tx: TX,
  itemId: string
): Promise<Result<FullEntityItem & { owner: string }>> => {
  return parseFirst(
    await tx.query(
      `SELECT ${ITEM_COLUMNS}, ${ENTITIES_TABLE}.owner
    FROM ${ITEMS_TABLE} JOIN ${ENTITIES_TABLE} ON ${ITEMS_TABLE}.entity_id = ${ENTITIES_TABLE}.id
    WHERE ${ITEMS_TABLE}.id = $1`,
      [itemId]
    )
  );
};

export const sqlFetchItemOwnerById = async (
  tx: TX,
  itemId: string
): Promise<Result<string>> => {
  return parseFirstVal(
    await tx.query(
      `SELECT ${ENTITIES_TABLE}.owner
      FROM ${ITEMS_TABLE} JOIN ${ENTITIES_TABLE} ON ${ITEMS_TABLE}.entity_id = ${ENTITIES_TABLE}.id
      WHERE ${ITEMS_TABLE}.id = $1`,
      [itemId]
    ),
    "owner"
  );
};

export const sqlUpdateItem = async (
  tx: TX,
  itemId: string,
  item: EntityItem
): Promise<Result<FullEntityItem>> => {
  return parseFirst(
    await tx.query(
      `UPDATE ${ITEMS_TABLE}
    SET name = $1, bulk = $2, "desc" = $3, type = $4, custom_fields = $5, uses = $6, comment = $7, active = $8
    WHERE id = $9
    RETURNING ${ITEM_COLUMNS}`,
      [
        item.name,
        item.bulk,
        item.desc,
        item.type,
        item.custom_fields,
        item.uses,
        item.comment,
        item.active,
        itemId,
      ]
    )
  );
};

export const sqlDeleteItem = async (
  tx: TX,
  itemId: string
): Promise<Result<boolean>> => {
  await tx.query(`DELETE FROM ${ITEMS_TABLE} WHERE id = $1`, [itemId]);
  return wrapSuccessResult(true);
};
