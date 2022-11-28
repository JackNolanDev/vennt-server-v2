import { format } from "@scaleleap/pg-format";
import {
  handleTransaction,
  parseFirst,
  parseList,
  wrapErrorResult,
  wrapSuccessResult,
} from "../utils/db";
import pool from "../utils/pool";
import {
  UncompleteCollectedEntity,
  FullCollectedEntity,
  fullEntityValidator,
  Result,
  FullEntity,
  fullAbilityValidator,
  FullEntityAbility,
  FullEntityChangelog,
  FullEntityItem,
  fullAttributeChangelogValidator,
  fullItemValidator,
} from "../utils/types";

const INSERT_ENTITY_COLUMNS = "owner, name, type, attributes, other_fields";
const INSERT_ABILITY_COLUMNS =
  "entity_id, name, effect, custom_fields, uses, comment, active";
const INSERT_CHANGELOG_COLUMNS = "entity_id, attr, msg, prev";
const INSERT_ITEM_COLUMNS = `entity_id, name, bulk, "desc", type, custom_fields, uses, comment, active`;
const ENTITY_COLUMNS = `id, ${INSERT_ENTITY_COLUMNS}`;
const ABILTIY_COLUMNS = `id, ${INSERT_ABILITY_COLUMNS}`;
const CHANGELOG_COLUMNS = `id, ${INSERT_CHANGELOG_COLUMNS}`;
const ITEM_COLUMNS = `id, ${INSERT_ITEM_COLUMNS}`;

export const dbInsertCollectedEntity = async (
  collected: UncompleteCollectedEntity,
  owner: string
): Promise<Result<FullCollectedEntity>> => {
  if (
    collected.abilities.length > 100 ||
    collected.changelog.length > 100 ||
    collected.items.length > 100
  ) {
    return wrapErrorResult("trying to insert too much on initial insert", 400);
  }
  return handleTransaction(async (tx) => {
    const entityRes = await tx.query(
      `INSERT INTO vennt.entities (${INSERT_ENTITY_COLUMNS})
      VALUES ($1, $2, $3, $4, $5)
      RETURNING ${ENTITY_COLUMNS}`,
      [
        owner,
        collected.entity.name,
        collected.entity.type,
        collected.entity.attributes,
        collected.entity.other_fields,
      ]
    );

    const entity = parseFirst(entityRes, fullEntityValidator, 500);
    if (!entity.success) return entity;

    let abilities: FullEntityAbility[] = [];
    if (collected.abilities.length > 0) {
      const abilityRows = collected.abilities.map((ability) => [
        entity.result.id,
        ability.name,
        ability.effect,
        ability.custom_fields,
        ability.uses,
        ability.comment,
        ability.active,
      ]);
      const abilitiesRes = parseList(
        await tx.query(
          format(
            `INSERT INTO vennt.abilities (${INSERT_ABILITY_COLUMNS})
            VALUES %L
            RETURNING ${ABILTIY_COLUMNS}`,
            abilityRows
          )
        ),
        fullAbilityValidator
      );
      if (!abilitiesRes.success) {
        return abilitiesRes;
      } else {
        abilities = abilitiesRes.result;
      }
    }

    let changelog: FullEntityChangelog[] = [];
    if (collected.changelog.length > 0) {
      const changelogRows = collected.changelog.map((row) => [
        entity.result.id,
        row.attr,
        row.msg,
        row.prev,
      ]);
      const changelogRes = parseList(
        await tx.query(
          format(
            `INSERT INTO vennt.attribute_changelog (${INSERT_CHANGELOG_COLUMNS})
            VALUES %L
            RETURNING ${CHANGELOG_COLUMNS}`,
            changelogRows
          )
        ),
        fullAttributeChangelogValidator
      );
      if (!changelogRes.success) {
        return changelogRes;
      } else {
        changelog = changelogRes.result;
      }
    }

    let items: FullEntityItem[] = [];
    if (collected.items.length > 0) {
      const itemRows = collected.items.map((item) => [
        entity.result.id,
        item.name,
        item.bulk,
        item.desc,
        item.type,
        item.custom_fields,
        item.uses,
        item.comment,
        item.active,
      ]);
      const itemsRes = parseList(
        await tx.query(
          format(
            `INSERT INTO vennt.items (${INSERT_ITEM_COLUMNS})
            VALUES %L
            RETURNING ${ITEM_COLUMNS}`,
            itemRows
          )
        ),
        fullItemValidator
      );
      if (!itemsRes.success) {
        return itemsRes;
      } else {
        items = itemsRes.result;
      }
    }

    return wrapSuccessResult({
      entity: entity.result,
      abilities,
      changelog,
      items,
    });
  });
};

export const dbListEntities = async (
  owner: string
): Promise<Result<FullEntity[]>> => {
  const res = await pool.query(
    `SELECT ${ENTITY_COLUMNS} FROM vennt.entities WHERE owner = $1`,
    [owner]
  );
  return parseList(res, fullEntityValidator);
};

export const dbFetchEntityById = async (
  id: string
): Promise<Result<FullEntity>> => {
  return parseFirst(
    await pool.query(
      `SELECT ${ENTITY_COLUMNS} FROM vennt.entities WHERE id = $1`,
      [id]
    ),
    fullEntityValidator
  );
};

export const dbFetchAbilitiesByEntityId = async (
  id: string
): Promise<Result<FullEntityAbility[]>> => {
  return parseList(
    await pool.query(
      `SELECT ${ABILTIY_COLUMNS} FROM vennt.abilities WHERE entity_id = $1`,
      [id]
    ),
    fullAbilityValidator
  );
};

export const dbFetchChangelogByEntityId = async (
  id: string
): Promise<Result<FullEntityChangelog[]>> => {
  return parseList(
    await pool.query(
      `SELECT ${CHANGELOG_COLUMNS} FROM vennt.attribute_changelog WHERE entity_id = $1`,
      [id]
    ),
    fullAttributeChangelogValidator
  );
};

export const dbFetchItemsByEntityId = async (
  id: string
): Promise<Result<FullEntityItem[]>> => {
  return parseList(
    await pool.query(
      `SELECT ${ITEM_COLUMNS} FROM vennt.items WHERE entity_id = $1`,
      [id]
    ),
    fullItemValidator
  );
};

export const dbFetchCollectedEntity = async (
  id: string
): Promise<Result<FullCollectedEntity>> => {
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
  });
};

export const dbUserOwnsEntity = async (
  id: string
): Promise<Result<boolean>> => {
  const entity = await dbFetchEntityById(id);
  if (!entity.success) return entity;

  return wrapSuccessResult(entity.result.owner === id);
};
