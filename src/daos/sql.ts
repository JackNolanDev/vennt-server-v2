import { format } from "@scaleleap/pg-format";
import { PoolClient, Pool } from "pg";
import {
  parseFirst,
  parseFirstVal,
  parseList,
  wrapSuccessResult,
} from "../utils/db";
import {
  AccountInfo,
  CAMPAIGN_ROLE_GM,
  Campaign,
  CampaignDesc,
  CampaignEntity,
  CampaignInvite,
  CampaignInviteLink,
  CampaignInviteWithDetails,
  CampaignMember,
  CampaignRole,
  CampaignWithRole,
  ComputedAttributes,
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
  PostCampaign,
  PostCampaignInvite,
  PostCampaignInviteLink,
  Result,
  UncompleteEntity,
  UncompleteEntityChangelog,
  UncompleteEntityFlux,
  UncompleteEntityText,
} from "vennt-library";

export type TX = PoolClient | Pool;

export const ACCOUNTS_TABLE = "vennt.accounts";
export const ENTITIES_TABLE = "vennt.entities";
export const ABILITIES_TABLE = "vennt.abilities";
export const ATTRIBUTE_CHANGELOG_TABLE = "vennt.attribute_changelog";
export const ITEMS_TABLE = "vennt.items";
export const ENTITY_TEXT_TABLE = "vennt.entity_text";
export const FLUX_TABLE = "vennt.flux";
export const CAMPAIGNS_TABLE = "vennt.campaigns";
export const CAMPAIGN_INVITES_TABLE = "vennt.campaign_invites";
export const CAMPAIGN_INVITE_LINKS_TABLE = "vennt.campaign_invite_links";
export const CAMPAIGN_MEMBERS_TABLE = "vennt.campaign_members";
export const CAMPAIGN_ENTITIES_TABLE = "vennt.campaign_entities";

export const INSERT_ENTITY_COLUMNS = `owner, name, "type", attributes, other_fields, "public", computed_attributes`;
export const INSERT_ABILITY_COLUMNS = `id, entity_id, name, effect, custom_fields, uses, comment, active`;
export const INSERT_CHANGELOG_COLUMNS = `entity_id, attr, msg, prev`;
export const INSERT_ITEM_COLUMNS = `id, entity_id, name, bulk, "desc", "type", custom_fields, uses, comment, active`;
export const INSERT_ENTITY_TEXT_COLUMNS = `entity_id, "key", "text", "public"`;
export const INSERT_FLUX_COLUMNS = `entity_id, "type", "text", metadata`;

export const ENTITY_COLUMNS = `${ENTITIES_TABLE}.id, ${ENTITIES_TABLE}.owner, ${ENTITIES_TABLE}.name, ${ENTITIES_TABLE}.type, \
  ${ENTITIES_TABLE}.attributes, ${ENTITIES_TABLE}.other_fields, ${ENTITIES_TABLE}.public, ${ENTITIES_TABLE}.computed_attributes`;
export const ABILITY_COLUMNS = `${ABILITIES_TABLE}.id, ${ABILITIES_TABLE}.entity_id, ${ABILITIES_TABLE}.name, ${ABILITIES_TABLE}.effect, \
  ${ABILITIES_TABLE}.custom_fields, ${ABILITIES_TABLE}.uses, ${ABILITIES_TABLE}.comment, ${ABILITIES_TABLE}.active`;
export const CHANGELOG_COLUMNS = `${ATTRIBUTE_CHANGELOG_TABLE}.id, ${ATTRIBUTE_CHANGELOG_TABLE}.entity_id, ${ATTRIBUTE_CHANGELOG_TABLE}.attr, \
  ${ATTRIBUTE_CHANGELOG_TABLE}.msg, ${ATTRIBUTE_CHANGELOG_TABLE}.prev, ${ATTRIBUTE_CHANGELOG_TABLE}.time`;
export const ITEM_COLUMNS = `${ITEMS_TABLE}.id, ${ITEMS_TABLE}.entity_id, ${ITEMS_TABLE}.name, ${ITEMS_TABLE}.bulk, ${ITEMS_TABLE}.desc, \
  ${ITEMS_TABLE}.type, ${ITEMS_TABLE}.custom_fields, ${ITEMS_TABLE}.uses, ${ITEMS_TABLE}.comment, ${ITEMS_TABLE}.active`;
export const ENTITY_TEXT_COLUMNS = `${ENTITY_TEXT_TABLE}.id, ${ENTITY_TEXT_TABLE}.entity_id, ${ENTITY_TEXT_TABLE}.key, ${ENTITY_TEXT_TABLE}.text, \
  ${ENTITY_TEXT_TABLE}.public`;
export const FLUX_COLUMNS = `${FLUX_TABLE}.id, ${FLUX_TABLE}.entity_id, ${FLUX_TABLE}.type, ${FLUX_TABLE}.text, ${FLUX_TABLE}.metadata`;
export const CAMPAIGN_COLUMNS = `${CAMPAIGNS_TABLE}.id, ${CAMPAIGNS_TABLE}.name, ${CAMPAIGNS_TABLE}.in_combat, ${CAMPAIGNS_TABLE}.init_index, \
  ${CAMPAIGNS_TABLE}.init_round, ${CAMPAIGNS_TABLE}.desc`;
export const CAMPAIGN_INVITE_LINKS_COLUMNS = `${CAMPAIGN_INVITE_LINKS_TABLE}.id, ${CAMPAIGN_INVITE_LINKS_TABLE}.campaign_id, \
  ${CAMPAIGN_INVITE_LINKS_TABLE}.hash, ${CAMPAIGN_INVITE_LINKS_TABLE}.created, ${CAMPAIGN_INVITE_LINKS_TABLE}.expires`;

// ENTITIES

export const sqlInsertEntity = async (
  tx: TX,
  owner: string,
  entity: UncompleteEntity & { computed_attributes: ComputedAttributes }
): Promise<Result<FullEntity>> => {
  return parseFirst(
    await tx.query(
      `INSERT INTO ${ENTITIES_TABLE} (${INSERT_ENTITY_COLUMNS})
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING ${ENTITY_COLUMNS}`,
      [
        owner,
        entity.name,
        entity.type,
        entity.attributes,
        entity.other_fields,
        entity.public,
        entity.computed_attributes,
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
  entityId: string,
  forUpdate?: boolean
): Promise<Result<FullEntity>> => {
  const readLock = forUpdate ? "FOR UPDATE" : "";
  return parseFirst(
    await tx.query(
      `SELECT ${ENTITY_COLUMNS} FROM ${ENTITIES_TABLE} WHERE id = $1 ${readLock}`,
      [entityId]
    )
  );
};

export const sqlUpdateEntityAttributes = async (
  tx: TX,
  entityId: string,
  attributes: EntityAttributes,
  computedAttributes?: ComputedAttributes | null
): Promise<Result<FullEntity>> => {
  const updateComputedAttributes = computedAttributes
    ? ", computed_attributes = $3"
    : "";
  const computedAttributesParams = computedAttributes
    ? [computedAttributes]
    : [];
  return parseFirst(
    await tx.query(
      `UPDATE ${ENTITIES_TABLE} SET attributes = $1 ${updateComputedAttributes} WHERE id = $2 RETURNING ${ENTITY_COLUMNS}`,
      [attributes, entityId, ...computedAttributesParams]
    ),
    500
  );
};

export const sqlUpdateEntity = async (
  tx: TX,
  entityId: string,
  entity: FullEntity,
  computedAttributes?: ComputedAttributes | null
): Promise<Result<FullEntity>> => {
  const updateComputedAttributes = computedAttributes
    ? ", computed_attributes = $8"
    : "";
  const computedAttributesParams = computedAttributes
    ? [computedAttributes]
    : [];
  return parseFirst(
    await tx.query(
      `UPDATE ${ENTITIES_TABLE}
      SET owner = $1, name = $2, "type" = $3, attributes = $4, other_fields = $5, "public" = $6
      ${updateComputedAttributes}
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
        ...computedAttributesParams,
      ]
    ),
    500
  );
};

export const sqlUpdateEntityComputedAttributes = async (
  tx: TX,
  entityId: string,
  computedAttributes: ComputedAttributes
): Promise<Result<ComputedAttributes>> => {
  return parseFirstVal(
    await tx.query(
      `UPDATE ${ENTITIES_TABLE} SET computed_attributes = $1 WHERE id = $2 RETURNING computed_attributes`,
      [computedAttributes, entityId]
    )
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
  abilities: FullEntityAbility[]
): Promise<Result<FullEntityAbility[]>> => {
  if (abilities.length === 0) {
    return wrapSuccessResult([]);
  }
  const abilityRows = abilities.map((ability) => [
    ability.id,
    ability.entity_id,
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

export const sqlFetchFunctionalAbilitiesByEntityId = async (
  tx: TX,
  entityId: string
): Promise<Result<FullEntityAbility[]>> => {
  return parseList(
    await tx.query(
      `SELECT ${ABILITY_COLUMNS} FROM ${ABILITIES_TABLE} WHERE entity_id = $1 AND uses IS NOT NULL`,
      [entityId]
    )
  );
};

export const sqlFetchAbilityById = async (
  tx: TX,
  abilityId: string,
  forUpdate?: boolean
): Promise<Result<FullEntityAbility>> => {
  const readLock = forUpdate ? "FOR UPDATE" : "";
  return parseFirst(
    await tx.query(
      `SELECT ${ABILITY_COLUMNS} FROM ${ABILITIES_TABLE} WHERE id = $1 ${readLock}`,
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
  items: FullEntityItem[]
): Promise<Result<FullEntityItem[]>> => {
  if (items.length === 0) {
    return wrapSuccessResult([]);
  }
  const itemRows = items.map((item) => [
    item.id,
    item.entity_id,
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

export const sqlFetchFunctionalItemsByEntityId = async (
  tx: TX,
  entityId: string
): Promise<Result<FullEntityItem[]>> => {
  return parseList(
    await tx.query(
      `SELECT ${ITEM_COLUMNS} FROM ${ITEMS_TABLE} WHERE entity_id = $1 AND uses IS NOT NULL`,
      [entityId]
    )
  );
};

export const sqlFetchItemById = async (
  tx: TX,
  itemId: string,
  forUpdate?: boolean
): Promise<Result<FullEntityItem>> => {
  const readLock = forUpdate ? "FOR UPDATE" : "";
  return parseFirst(
    await tx.query(
      `SELECT ${ITEM_COLUMNS} FROM ${ITEMS_TABLE} WHERE id = $1 ${readLock}`,
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
  publicOnly?: boolean
): Promise<Result<FullEntityText[]>> => {
  const publicOnlyCheck = publicOnly ? "AND public = TRUE" : "";
  return parseList(
    await tx.query(
      `SELECT ${ENTITY_TEXT_COLUMNS} FROM ${ENTITY_TEXT_TABLE} WHERE entity_id = $1 ${publicOnlyCheck}`,
      [entityId]
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

// CAMPAIGNS

export const sqlInsertCampaign = async (
  tx: TX,
  campaign: PostCampaign
): Promise<Result<Campaign>> => {
  return parseFirst(
    await tx.query(
      `INSERT INTO ${CAMPAIGNS_TABLE} (name, "desc")
      VALUES ($1, $2)
      RETURNING ${CAMPAIGN_COLUMNS}`,
      [campaign.name, campaign.desc]
    ),
    500
  );
};

export const sqlFetchCampaignById = async (
  tx: TX,
  campaignId: string
): Promise<Result<Campaign>> => {
  return parseFirst(
    await tx.query(
      `SELECT ${CAMPAIGN_COLUMNS} FROM ${CAMPAIGNS_TABLE} WHERE id = $1`,
      [campaignId]
    )
  );
};

export const sqlUpdateCampaignDesc = async (
  tx: TX,
  campaignId: string,
  { desc }: CampaignDesc
): Promise<Result<boolean>> => {
  await tx.query(`UPDATE ${CAMPAIGNS_TABLE} SET "desc" = $1 WHERE id = $2`, [
    desc,
    campaignId,
  ]);
  return wrapSuccessResult(true);
};

export const sqlListCampaignsForAccount = async (
  tx: TX,
  accountId: string
): Promise<Result<CampaignWithRole[]>> => {
  return parseList(
    await tx.query(
      `SELECT ${CAMPAIGN_COLUMNS}, cm.role
      FROM ${CAMPAIGNS_TABLE}
      JOIN ${CAMPAIGN_MEMBERS_TABLE} cm ON cm.campaign_id = ${CAMPAIGNS_TABLE}.id
      WHERE cm.account_id = $1`,
      [accountId]
    )
  );
};

export const sqlInsertCampaignInvite = async (
  tx: TX,
  invite: PostCampaignInvite,
  from: AccountInfo
): Promise<Result<CampaignInvite>> => {
  return parseFirst(
    await tx.query(
      `INSERT INTO ${CAMPAIGN_INVITES_TABLE} (campaign_id, "from", "to", "role")
      SELECT $1, $2, a.id, $3
      FROM ${ACCOUNTS_TABLE} a
      WHERE a.username = $4
      RETURNING ${CAMPAIGN_INVITES_TABLE}.id, ${CAMPAIGN_INVITES_TABLE}.campaign_id, ${CAMPAIGN_INVITES_TABLE}.role, ${CAMPAIGN_INVITES_TABLE}.created,
        $4 AS to, $5 AS from`,
      [invite.campaign_id, from.id, invite.role, invite.to, from.username]
    ),
    500
  );
};

export const sqlFetchCampaignInvitesByCampaignId = async (
  tx: TX,
  campaignId: string
): Promise<Result<CampaignInvite[]>> => {
  return parseList(
    await tx.query(
      `SELECT ci.id, ci.campaign_id, ci.role, ci.created, af.username AS from, at.username AS to
      FROM ${CAMPAIGN_INVITES_TABLE} ci
      JOIN ${ACCOUNTS_TABLE} af ON af.id = ci.from
      JOIN ${ACCOUNTS_TABLE} at ON at.id = ci.to
      WHERE ci.campaign_id = $1
    `,
      [campaignId]
    )
  );
};

export const sqlFetchCampaignInvitesByRecipientId = async (
  tx: TX,
  recipientId: string,
  recipientUsername: string
): Promise<Result<CampaignInviteWithDetails[]>> => {
  return parseList(
    await tx.query(
      `SELECT ci.id, ci.campaign_id, ci.role, ci.created, a.username AS from, $2 AS to, c.name, c.desc
      FROM ${CAMPAIGN_INVITES_TABLE} ci
      JOIN ${ACCOUNTS_TABLE} a ON a.id = ci.from
      JOIN ${CAMPAIGNS_TABLE} c ON c.id = ci.campaign_id
      WHERE ci.to = $1
    `,
      [recipientId, recipientUsername]
    )
  );
};

// Allow account to delete the invite if they are the recipient, or a GM on the relevant campaign
export const sqlDeleteCampaignInvite = async (
  tx: TX,
  inviteId: string,
  accountId: string
): Promise<Result<boolean>> => {
  await tx.query(
    `DELETE FROM ${CAMPAIGN_INVITES_TABLE}
    WHERE id = $1
    AND ("to" = $2 OR EXISTS (
      SELECT *
      FROM ${CAMPAIGN_MEMBERS_TABLE} cm
      WHERE cm.campaign_id = ${CAMPAIGN_INVITES_TABLE}.campaign_id
      AND cm.account_id = $2
      AND cm.role = 'GM'
    ))`,
    [inviteId, accountId]
  );
  return wrapSuccessResult(true);
};

export const sqlInsertCampaignInviteLink = async (
  tx: TX,
  invite: PostCampaignInviteLink
): Promise<Result<CampaignInviteLink>> => {
  return parseFirst(
    await tx.query(
      `INSERT INTO ${CAMPAIGN_INVITE_LINKS_TABLE} (campaign_id, "hash", expires)
      VALUES ($1, $2, CURRENT_TIMESTAMP + interval '1' minute * $3)
      RETURNING *`,
      [invite.campaign_id, invite.hash, invite.minutes_to_expire]
    )
  );
};

export const sqlFetchCampaignInviteLinksByCampaignId = async (
  tx: TX,
  campaignId: string
): Promise<Result<CampaignInviteLink[]>> => {
  return parseList(
    await tx.query(
      `SELECT ${CAMPAIGN_INVITE_LINKS_COLUMNS}
      FROM ${CAMPAIGN_INVITE_LINKS_TABLE}
      WHERE campaign_id = $1 AND expires > CURRENT_TIMESTAMP`,
      [campaignId]
    )
  );
};

export const sqlFetchCampaignByCampaignInviteLink = async (
  tx: TX,
  hash: string
): Promise<Result<Campaign>> => {
  return parseFirst(
    await tx.query(
      `SELECT ${CAMPAIGN_COLUMNS}
      FROM ${CAMPAIGNS_TABLE}
      WHERE id = (
        SELECT campaign_id
        FROM ${CAMPAIGN_INVITE_LINKS_TABLE}
        WHERE hash = $1 AND expires > CURRENT_TIMESTAMP
      )`,
      [hash]
    )
  );
};

export const sqlDeleteCampaignInviteLink = async (
  tx: TX,
  campaignInviteLinkId: string,
  campaignId: string
): Promise<Result<boolean>> => {
  await tx.query(
    `DELETE FROM ${CAMPAIGN_INVITE_LINKS_TABLE} WHERE id = $1 AND campaign_id = $2`,
    [campaignInviteLinkId, campaignId]
  );
  return wrapSuccessResult(true);
};

export const sqlInsertCampaignMember = async (
  tx: TX,
  campaignId: string,
  accountId: string,
  role: CampaignRole
): Promise<Result<CampaignMember>> => {
  return parseFirst(
    await tx.query(
      `WITH inserted_campaign_member as (
        INSERT INTO ${CAMPAIGN_MEMBERS_TABLE} (campaign_id, account_id, "role")
        VALUES ($1, $2, $3)
        RETURNING *
      )
      SELECT inserted_campaign_member.*, ${ACCOUNTS_TABLE}.username
      FROM inserted_campaign_member
      JOIN ${ACCOUNTS_TABLE} ON ${ACCOUNTS_TABLE}.id = inserted_campaign_member.account_id`,
      [campaignId, accountId, role]
    ),
    500
  );
};

export const sqlInsertCampaignMemberFromInvite = async (
  tx: TX,
  inviteId: string,
  accountId: string
): Promise<Result<CampaignMember>> => {
  return parseFirst(
    await tx.query(
      `WITH inserted_campaign_member as (
        INSERT INTO ${CAMPAIGN_MEMBERS_TABLE} (campaign_id, account_id, "role")
        SELECT ci.campaign_id, ci.to, ci.role
        FROM ${CAMPAIGN_INVITES_TABLE} ci WHERE ci.id = $1 AND ci.to = $2
        RETURNING ${CAMPAIGN_MEMBERS_TABLE}.*
      )
      SELECT icm.*, a.username
      FROM inserted_campaign_member icm
      JOIN ${ACCOUNTS_TABLE} a ON a.id = icm.account_id`,
      [inviteId, accountId]
    ),
    500
  );
};

export const sqlFetchCampaignMembersByCampaignId = async (
  tx: TX,
  campaignId: string
): Promise<Result<CampaignMember[]>> => {
  return parseList(
    await tx.query(
      `SELECT cm.id, cm.campaign_id, cm.account_id, a.username, cm.role
      FROM ${CAMPAIGN_MEMBERS_TABLE} cm
      JOIN ${ACCOUNTS_TABLE} a ON a.id = cm.account_id
      WHERE cm.campaign_id = $1
    `,
      [campaignId]
    )
  );
};

export const sqlFetchCampaignRole = async (
  tx: TX,
  campaignId: string,
  accountId: string
): Promise<Result<CampaignRole>> => {
  return parseFirstVal(
    await tx.query(
      `SELECT "role" FROM ${CAMPAIGN_MEMBERS_TABLE} WHERE campaign_id = $1 AND account_id = $2`,
      [campaignId, accountId]
    )
  );
};

export const sqlValidateCampaignHasGM = async (
  tx: TX,
  campaignId: string
): Promise<Result<boolean>> => {
  return parseFirstVal(
    await tx.query(
      `SELECT EXISTS (SELECT id FROM ${CAMPAIGN_MEMBERS_TABLE} WHERE campaign_id = $1 AND "role" = $2)`,
      [campaignId, CAMPAIGN_ROLE_GM]
    )
  );
};

export const sqlUpdateCampaignMemberRole = async (
  tx: TX,
  campaignId: string,
  accountId: string,
  role: CampaignRole
): Promise<Result<CampaignRole>> => {
  return parseFirstVal(
    await tx.query(
      `UPDATE ${CAMPAIGN_MEMBERS_TABLE}
      SET "role" = $1
      WHERE campaign_id = $2 AND account_id = $3
      RETURNING "role"`,
      [role, campaignId, accountId]
    )
  );
};

export const sqlRemoveCampaignMember = async (
  tx: TX,
  campaignId: string,
  accountId: string
): Promise<Result<boolean>> => {
  await tx.query(
    `DELETE FROM ${CAMPAIGN_MEMBERS_TABLE} WHERE campaign_id = $1 AND account_id = $2`,
    [campaignId, accountId]
  );
  return wrapSuccessResult(true);
};

export const sqlInsertCampaignEntity = async (
  tx: TX,
  campaignId: string,
  entityId: string,
  gmOnly: boolean
): Promise<Result<CampaignEntity>> => {
  return parseFirst(
    await tx.query(
      `WITH inserted_campaign_entity as (
        INSERT INTO ${CAMPAIGN_ENTITIES_TABLE} (campaign_id, entity_id, gm_only)
        VALUES ($1, $2, $3)
        RETURNING *
      )
      SELECT ice.entity_id, ice.gm_only, e.owner, e.name, e.type, e.attributes, e.other_fields
      FROM inserted_campaign_entity ice
      JOIN ${ENTITIES_TABLE} e ON e.id = ice.entity_id`,
      [campaignId, entityId, gmOnly]
    ),
    500
  );
};

export const sqlFetchCampaignEntitiesByCampaignId = async (
  tx: TX,
  campaignId: string,
  includeGmOnly?: boolean
): Promise<Result<CampaignEntity[]>> => {
  const gmOnlyCheck = includeGmOnly ? "" : "AND ce.gm_only = FALSE";
  return parseList(
    await tx.query(
      `SELECT ce.entity_id, ce.gm_only, e.owner, e.name, e.type, e.attributes, e.other_fields, e.computed_attributes
      FROM ${CAMPAIGN_ENTITIES_TABLE} ce
      JOIN ${ENTITIES_TABLE} e ON e.id = ce.entity_id
      WHERE ce.campaign_id = $1 ${gmOnlyCheck}
    `,
      [campaignId]
    )
  );
};

export const sqlRemoveCampaignEntity = async (
  tx: TX,
  campaignId: string,
  entityId: string
): Promise<Result<boolean>> => {
  await tx.query(
    `DELETE FROM ${CAMPAIGN_ENTITIES_TABLE} WHERE campaign_id = $1 AND entity_id = $2`,
    [campaignId, entityId]
  );
  return wrapSuccessResult(true);
};

export const sqlValidateAccountCanEditEntity = async (
  tx: TX,
  accountId: string,
  entityId: string,
  campaignId?: string
): Promise<Result<boolean>> => {
  let campaignCheck = "";
  const args = [entityId, accountId];
  if (campaignId) {
    campaignCheck = `OR EXISTS (
      SELECT 1
      FROM ${CAMPAIGN_ENTITIES_TABLE} ce
      JOIN ${CAMPAIGN_MEMBERS_TABLE} cm ON cm.campaign_id = ce.campaign_id
      WHERE ce.entity_id = $1 AND cm.account_id = $2 AND cm.role = 'GM' AND ce.campaign_id = $3
    )`;
    args.push(campaignId);
  }
  return parseFirstVal(
    await tx.query(
      `SELECT EXISTS (
      SELECT 1
      FROM ${ENTITIES_TABLE} e
      WHERE e.id = $1 AND e.owner = $2
    ) ${campaignCheck} AS valid`,
      args
    )
  );
};

export type EntityPermissions =
  | {
      result: string;
      public: boolean;
      source: "entities";
    }
  | {
      result: CampaignRole;
      public: false;
      source: "campaigns";
    };
export const sqlFetchEntityPermissions = async (
  tx: TX,
  entityId: string,
  campaignParams?: { accountId: string; campaignId: string }
): Promise<Result<EntityPermissions[]>> => {
  let campaignCheck = "";
  const args = [entityId];
  if (campaignParams) {
    const { accountId, campaignId } = campaignParams;
    campaignCheck = `UNION 
    SELECT cm.role as result, FALSE as public, 'campaigns' as source
    FROM ${CAMPAIGN_ENTITIES_TABLE} ce
    JOIN ${CAMPAIGN_MEMBERS_TABLE} cm ON cm.campaign_id = ce.campaign_id
    WHERE ce.entity_id = $1 AND cm.account_id = $2 AND cm.campaign_id = $3`;
    args.push(accountId, campaignId);
  }
  return parseList(
    await tx.query(
      `SELECT e.owner::text as result, e.public, 'entities' as source
      FROM vennt.entities e
      WHERE e.id = $1
      ${campaignCheck}`,
      args
    )
  );
};
