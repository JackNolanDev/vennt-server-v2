import { handleTransaction, parseFirst, parseList, wrapErrorResult, wrapSuccessResult } from "../utils/db"
import pool from "../utils/pool";
import { UncompleteCollectedEntity, FullCollectedEntity, fullEntityValidator, Result, FullEntity, fullAbilityValidator, FullEntityAbility, FullEntityChangelog, FullEntityItem, fullAttributeChangelogValidator, fullItemValidator } from "../utils/types"

const ENTITY_COLUMNS = "id, owner, name, type, attributes, other_fields";
const ABILTIY_COLUMNS = "id, entity_id, name, effect, custom_fields, uses, comment, active";
const CHANGELOG_COLUMNS = "id, entity_id, attr, msg, prev, time";
const ITEM_COLUMNS = `id, entity_id, name, bulk, "desc", type, custom_fields, uses, comment, active`;

export const dbInsertCollectedEntity = async (collected: UncompleteCollectedEntity, owner: string): Promise<Result<FullCollectedEntity>> => {
  if (collected.abilities.length > 100 || collected.changelog.length > 100 || collected.items.length > 100) {
    return wrapErrorResult( "trying to insert too much on initial insert", 400)
  }
  return handleTransaction(async (tx) => {
    const entityRes = await tx.query(
      `INSERT INTO vennt.entities (owner, name, type, attributes, other_fields)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ${ENTITY_COLUMNS}`,
    [owner, collected.entity.name, collected.entity.type, collected.entity.attributes, collected.entity.other_fields]);
    const completeEntity = parseFirst(entityRes, fullEntityValidator, 500);
    if (!completeEntity.success) {
      return completeEntity;
    }
    const entity = completeEntity.result;

    // const abilitiesRes = await tx.query(
    //   `INSERT INTO vennt.abilities (name, owner, type, attributes, other_fields) VALUES () RETURNING id, name, owner, type, attributes, other_fields`
    // )
    return wrapSuccessResult({
      entity,
      abilities: [],
      items: [],
      changelog: [],
    })
  })
}

export const dbListEntities = async (owner: string): Promise<Result<FullEntity[]>> => {
  const res = await pool.query(`SELECT ${ENTITY_COLUMNS} FROM vennt.entities WHERE owner = $1`, [owner]);
  return parseList(res, fullEntityValidator);
}

export const dbFetchEntityById = async (id: string): Promise<Result<FullEntity>> => {
  return parseFirst(await pool.query(`SELECT ${ENTITY_COLUMNS} FROM vennt.entities WHERE id = $1`, [id]), fullEntityValidator);
}

export const dbFetchAbilitiesByEntityId = async (id: string): Promise<Result<FullEntityAbility[]>> => {
  return parseList(await pool.query(`SELECT ${ABILTIY_COLUMNS} FROM vennt.abilities WHERE entity_id = $1`, [id]), fullAbilityValidator);
}

export const dbFetchChangelogByEntityId = async (id: string): Promise<Result<FullEntityChangelog[]>> => {
  return parseList(await pool.query(`SELECT ${CHANGELOG_COLUMNS} FROM vennt.attribute_changelog WHERE entity_id = $1`, [id]), fullAttributeChangelogValidator);
}

export const dbFetchItemsByEntityId = async (id: string): Promise<Result<FullEntityItem[]>> => {
  return parseList(await pool.query(`SELECT ${ITEM_COLUMNS} FROM vennt.items WHERE entity_id = $1`, [id]), fullItemValidator);
}


export const dbFetchCollectedEntity = async (id: string): Promise<Result<FullCollectedEntity>> => {
  const entity = await dbFetchEntityById(id);
  if (!entity.success) return entity;

  const abilities = await dbFetchAbilitiesByEntityId(id);
  if (!abilities.success) return abilities;

  const changelog = await dbFetchChangelogByEntityId(id);
  if (!changelog.success) return changelog;

  const items = await dbFetchItemsByEntityId(id);
  if (!items.success) return items;

  return wrapSuccessResult({
    entity: entity.result,
    abilities: abilities.result,
    changelog: changelog.result,
    items: items.result,
  })
}

export const dbUserOwnsEntity = async (id: string): Promise<Result<boolean>> => {
  const entity = await dbFetchEntityById(id);
  if (!entity.success) return entity;

  return wrapSuccessResult(entity.result.owner === id);
}
