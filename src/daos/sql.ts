import { format } from "@scaleleap/pg-format";
import { PoolClient, Pool } from "pg";
import {
  parseFirst,
  parseFirstVal,
  parseList,
  wrapSuccessResult,
} from "../utils/db";
import {
  EntityAbility,
  EntityAttribute,
  EntityAttributes,
  EntityItem,
  EntityTextKey,
  FullEntity,
  FullEntityAbility,
  FullEntityChangelog,
  FullEntityFlux,
  FullEntityItem,
  FullEntityText,
  Result,
  UncompleteEntity,
  UncompleteEntityAbility,
  UncompleteEntityChangelog,
  UncompleteEntityFlux,
  UncompleteEntityItem,
  UncompleteEntityText,
} from "../utils/types";

export type TX = PoolClient | Pool;

export const ENTITIES_TABLE = "vennt.entities";
export const ABILITIES_TABLE = "vennt.abilities";
export const ATTRIBUTE_CHANGELOG_TABLE = "vennt.attribute_changelog";
export const ITEMS_TABLE = "vennt.items";
export const ENTITY_TEXT_TABLE = "vennt.entity_text";
export const FLUX_TABLE = "vennt.flux";

export const INSERT_ENTITY_COLUMNS = `owner, name, "type", attributes, other_fields, "public"`;
export const INSERT_ABILITY_COLUMNS = `entity_id, name, effect, custom_fields, uses, comment, active`;
export const INSERT_CHANGELOG_COLUMNS = `entity_id, attr, msg, prev`;
export const INSERT_ITEM_COLUMNS = `entity_id, name, bulk, "desc", "type", custom_fields, uses, comment, active`;
export const INSERT_ENTITY_TEXT_COLUMNS = `entity_id, "key", "text", "public"`;
export const INSERT_FLUX_COLUMNS = `entity_id, "type", "text", metadata`;

export const ENTITY_COLUMNS = `${ENTITIES_TABLE}.id, ${ENTITIES_TABLE}.owner, ${ENTITIES_TABLE}.name, ${ENTITIES_TABLE}.type, \
  ${ENTITIES_TABLE}.attributes, ${ENTITIES_TABLE}.other_fields, ${ENTITIES_TABLE}.public`;
export const ABILITY_COLUMNS = `${ABILITIES_TABLE}.id, ${ABILITIES_TABLE}.entity_id, ${ABILITIES_TABLE}.name, ${ABILITIES_TABLE}.effect, \
  ${ABILITIES_TABLE}.custom_fields, ${ABILITIES_TABLE}.uses, ${ABILITIES_TABLE}.comment, ${ABILITIES_TABLE}.active`;
export const CHANGELOG_COLUMNS = `${ATTRIBUTE_CHANGELOG_TABLE}.id, ${ATTRIBUTE_CHANGELOG_TABLE}.entity_id, ${ATTRIBUTE_CHANGELOG_TABLE}.attr, \
  ${ATTRIBUTE_CHANGELOG_TABLE}.msg, ${ATTRIBUTE_CHANGELOG_TABLE}.prev, ${ATTRIBUTE_CHANGELOG_TABLE}.time`;
export const ITEM_COLUMNS = `${ITEMS_TABLE}.id, ${ITEMS_TABLE}.entity_id, ${ITEMS_TABLE}.name, ${ITEMS_TABLE}.bulk, ${ITEMS_TABLE}.desc, \
  ${ITEMS_TABLE}.type, ${ITEMS_TABLE}.custom_fields, ${ITEMS_TABLE}.uses, ${ITEMS_TABLE}.comment, ${ITEMS_TABLE}.active`;
export const ENTITY_TEXT_COLUMNS = `${ENTITY_TEXT_TABLE}.id, ${ENTITY_TEXT_TABLE}.entity_id, ${ENTITY_TEXT_TABLE}.key, ${ENTITY_TEXT_TABLE}.text, \
  ${ENTITY_TEXT_TABLE}.public`;
export const FLUX_COLUMNS = `${FLUX_TABLE}.id, ${FLUX_TABLE}.entity_id, ${FLUX_TABLE}.type, ${FLUX_TABLE}.text, ${FLUX_TABLE}.metadata`;

// ENTITIES

export const sqlInsertEntity = async (
  tx: TX,
  owner: string,
  entity: UncompleteEntity
): Promise<Result<FullEntity>> => {
  return parseFirst(
    await tx.query(
      `INSERT INTO ${ENTITIES_TABLE} (${INSERT_ENTITY_COLUMNS})
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING ${ENTITY_COLUMNS}`,
      [
        owner,
        entity.name,
        entity.type,
        entity.attributes,
        entity.other_fields,
        entity.public,
      ]
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
  entityId: string
): Promise<Result<FullEntity>> => {
  return parseFirst(
    await tx.query(
      `SELECT ${ENTITY_COLUMNS} FROM ${ENTITIES_TABLE} WHERE id = $1`,
      [entityId]
    )
  );
};

export const sqlUpdateEntityAttributes = async (
  tx: TX,
  entityId: string,
  attributes: EntityAttributes
): Promise<Result<FullEntity>> => {
  return parseFirst(
    await tx.query(
      `UPDATE ${ENTITIES_TABLE} SET attributes = $1 WHERE id = $2 RETURNING ${ENTITY_COLUMNS}`,
      [attributes, entityId]
    ),
    500
  );
};

export const sqlUpdateEntity = async (
  tx: TX,
  entityId: string,
  entity: FullEntity
): Promise<Result<FullEntity>> => {
  return parseFirst(
    await tx.query(
      `UPDATE ${ENTITIES_TABLE}
      SET owner = $1, name = $2, "type" = $3, attributes = $4, other_fields = $5, "public" = $6
      WHERE id = $7
      RETURNING ${ENTITY_COLUMNS}`,
      [
        entity.owner,
        entity.name,
        entity.type,
        entity.attributes,
        entity.other_fields,
        entity.public,
        entityId,
      ]
    ),
    500
  );
};

export const sqlDeleteEntity = async (
  tx: TX,
  entityId: string
): Promise<Result<boolean>> => {
  await tx.query(`DELETE FROM ${ENTITIES_TABLE} WHERE id = $1`, [entityId]);
  return wrapSuccessResult(true);
};

// ABILITIES

export const sqlInsertAbilities = async (
  tx: TX,
  entityId: string,
  abilities: UncompleteEntityAbility[]
): Promise<Result<FullEntityAbility[]>> => {
  if (abilities.length === 0) {
    return wrapSuccessResult([]);
  }
  const abilityRows = abilities.map((ability) => [
    entityId,
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
        RETURNING ${ABILITY_COLUMNS}`,
        abilityRows
      )
    )
  );
};

export const sqlFetchAbilitiesByEntityId = async (
  tx: TX,
  entityId: string
): Promise<Result<FullEntityAbility[]>> => {
  return parseList(
    await tx.query(
      `SELECT ${ABILITY_COLUMNS} FROM ${ABILITIES_TABLE} WHERE entity_id = $1`,
      [entityId]
    )
  );
};

export const sqlFetchAbilityWithOwnerById = async (
  tx: TX,
  abilityId: string
): Promise<Result<FullEntityAbility & { owner: string }>> => {
  return parseFirst(
    await tx.query(
      `SELECT ${ABILITY_COLUMNS}, ${ENTITIES_TABLE}.owner
      FROM ${ABILITIES_TABLE} JOIN ${ENTITIES_TABLE} ON ${ABILITIES_TABLE}.entity_id = ${ENTITIES_TABLE}.id
      WHERE ${ABILITIES_TABLE}.id = $1`,
      [abilityId]
    )
  );
};

export const sqlFetchAbilityOwnerById = async (
  tx: TX,
  abilityId: string
): Promise<Result<string>> => {
  return parseFirstVal(
    await tx.query(
      `SELECT ${ENTITIES_TABLE}.owner
      FROM ${ABILITIES_TABLE} JOIN ${ENTITIES_TABLE} ON ${ABILITIES_TABLE}.entity_id = ${ENTITIES_TABLE}.id
      WHERE ${ABILITIES_TABLE}.id = $1`,
      [abilityId]
    )
  );
};

export const sqlUpdateAbility = async (
  tx: TX,
  abilityId: string,
  ability: EntityAbility
): Promise<Result<FullEntityAbility>> => {
  return parseFirst(
    await tx.query(
      `UPDATE ${ABILITIES_TABLE}
      SET name = $1, effect = $2, custom_fields = $3, uses = $4, comment = $5, active = $6
      WHERE id = $7
      RETURNING ${ABILITY_COLUMNS}`,
      [
        ability.name,
        ability.effect,
        ability.custom_fields,
        ability.uses,
        ability.comment,
        ability.active,
        abilityId,
      ]
    )
  );
};

export const sqlDeleteAbility = async (
  tx: TX,
  abilityId: string
): Promise<Result<boolean>> => {
  await tx.query(`DELETE FROM ${ABILITIES_TABLE} WHERE id = $1`, [abilityId]);
  return wrapSuccessResult(true);
};

// CHANGELOG

export const sqlInsertChangelog = async (
  tx: TX,
  entityId: string,
  changelog: UncompleteEntityChangelog[]
): Promise<Result<FullEntityChangelog[]>> => {
  if (changelog.length === 0) {
    return wrapSuccessResult([]);
  }
  const changelogRows = changelog.map((row) => [
    entityId,
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
  entityId: string
): Promise<Result<FullEntityChangelog[]>> => {
  return parseList(
    await tx.query(
      `SELECT ${CHANGELOG_COLUMNS}
      FROM ${ATTRIBUTE_CHANGELOG_TABLE}
      WHERE entity_id = $1
      ORDER BY time ASC`,
      [entityId]
    )
  );
};

export const sqlFetchChangelogByEntityIdAttribute = async (
  tx: TX,
  id: string,
  attr: EntityAttribute
): Promise<Result<FullEntityChangelog[]>> => {
  return parseList(
    await tx.query(
      `SELECT ${CHANGELOG_COLUMNS}
      FROM ${ATTRIBUTE_CHANGELOG_TABLE}
      WHERE entity_id = $1 AND attr = $2
      ORDER BY time ASC`,
      [id, attr]
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
  entityId: string,
  items: UncompleteEntityItem[]
): Promise<Result<FullEntityItem[]>> => {
  if (items.length === 0) {
    return wrapSuccessResult([]);
  }
  const itemRows = items.map((item) => [
    entityId,
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
  entityId: string
): Promise<Result<FullEntityItem[]>> => {
  return parseList(
    await tx.query(
      `SELECT ${ITEM_COLUMNS} FROM ${ITEMS_TABLE} WHERE entity_id = $1`,
      [entityId]
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
    )
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
      SET name = $1, bulk = $2, "desc" = $3, "type" = $4, custom_fields = $5, uses = $6, comment = $7, active = $8
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

// ENTITY TEXT

export const sqlInsertEntityText = async (
  tx: TX,
  entityId: string,
  text: UncompleteEntityText[]
): Promise<Result<FullEntityText[]>> => {
  if (text.length === 0) {
    return wrapSuccessResult([]);
  }
  const textRows = text.map((row) => [entityId, row.key, row.text, row.public]);
  return parseList(
    await tx.query(
      format(
        `INSERT INTO ${ENTITY_TEXT_TABLE} (${INSERT_ENTITY_TEXT_COLUMNS})
        VALUES %L
        RETURNING ${ENTITY_TEXT_COLUMNS}`,
        textRows
      )
    )
  );
};

export const sqlFetchEntityTextByEntityId = async (
  tx: TX,
  entityId: string,
  onlyPublic?: boolean
): Promise<Result<FullEntityText[]>> => {
  return parseList(
    await tx.query(
      `SELECT ${ENTITY_TEXT_COLUMNS} FROM ${ENTITY_TEXT_TABLE} WHERE entity_id = $1 AND ($2 OR public = TRUE)`,
      [entityId, !onlyPublic]
    )
  );
};

export const sqlUpdateEntityText = async (
  tx: TX,
  entityId: string,
  key: EntityTextKey,
  text: string
): Promise<Result<boolean>> => {
  await tx.query(
    `UPDATE ${ENTITY_TEXT_TABLE} SET "text" = $1 WHERE entity_id = $2 AND key = $3`,
    [text, entityId, key]
  );
  return wrapSuccessResult(true);
};

export const sqlUpdateEntityTextPermission = async (
  tx: TX,
  entityId: string,
  key: EntityTextKey,
  permission: boolean
): Promise<Result<boolean>> => {
  await tx.query(
    `UPDATE ${ENTITY_TEXT_TABLE} SET "public" = $1 WHERE entity_id = $2 AND key = $3`,
    [permission, entityId, key]
  );
  return wrapSuccessResult(true);
};

export const sqlDeleteEntityText = async (
  tx: TX,
  entityId: string,
  key: EntityTextKey
): Promise<Result<boolean>> => {
  await tx.query(
    `DELETE FROM ${ENTITY_TEXT_TABLE} WHERE entity_id = $1 AND key = $2`,
    [entityId, key]
  );
  return wrapSuccessResult(true);
};

// FLUX

export const sqlInsertFlux = async (
  tx: TX,
  entityId: string,
  flux: UncompleteEntityFlux[]
): Promise<Result<FullEntityFlux[]>> => {
  if (flux.length === 0) {
    return wrapSuccessResult([]);
  }
  const fluxRows = flux.map((row) => [
    entityId,
    row.type,
    row.text,
    row.metadata,
  ]);
  return parseList(
    await tx.query(
      format(
        `INSERT INTO ${FLUX_TABLE} (${INSERT_FLUX_COLUMNS})
        VALUES %L
        RETURNING ${FLUX_COLUMNS}`,
        fluxRows
      )
    )
  );
};

export const sqlFetchFluxByEntityId = async (
  tx: TX,
  entityId: string
): Promise<Result<FullEntityFlux[]>> => {
  return parseList(
    await tx.query(
      `SELECT ${FLUX_COLUMNS} FROM ${FLUX_TABLE} WHERE entity_id = $1`,
      [entityId]
    )
  );
};

export const sqlFetchFluxById = async (
  tx: TX,
  fluxId: string,
  entityId: string
): Promise<Result<FullEntityFlux>> => {
  return parseFirst(
    await tx.query(
      `SELECT ${FLUX_COLUMNS} FROM ${FLUX_TABLE} WHERE id = $1 AND entity_id = $2`,
      [fluxId, entityId]
    )
  );
};

export const sqlUpdateFlux = async (
  tx: TX,
  fluxId: string,
  flux: UncompleteEntityFlux
): Promise<Result<FullEntityFlux>> => {
  return parseFirst(
    await tx.query(
      `UPDATE ${FLUX_TABLE}
      SET "type" = $1, "text" = $2, metadata = $3
      WHERE id = $4
      RETURNING ${FLUX_COLUMNS}`,
      [flux.type, flux.text, flux.metadata, fluxId]
    )
  );
};

export const sqlDeleteFlux = async (
  tx: TX,
  fluxId: string,
  entityId: string
): Promise<Result<boolean>> => {
  await tx.query(`DELETE FROM ${FLUX_TABLE} WHERE id = $1 AND entity_is = $2`, [
    fluxId,
    entityId,
  ]);
  return wrapSuccessResult(true);
};
