import { z } from "zod";

const NAME_MAX = 100;
const PASSWORD_MIN = 6;
const PASSWORD_MAX = 2000;
const ABILITY_MAX = 2000;
const ITEM_MAX = 2000;
const COMMENT_MAX = 2000;
const CHANGELOG_MAX = 200;
export const ATTRIBUTE_MIN = -15;
export const ATTRIBUTE_MAX = 15;
export const ATTRIBUTES = [
  "per",
  "tek",
  "agi",
  "dex",
  "int",
  "spi",
  "str",
  "wis",
  "cha",
] as const;
export const CHARACTER_GIFTS = [
  "Alertness",
  "Craft",
  "Alacrity",
  "Finesse",
  "Mind",
  "Magic",
  "Rage",
  "Science",
  "Charm",
  "None",
] as const;
export const ATTRIBUTES_SET = new Set<EntityAttribute>(ATTRIBUTES);

// GENERAL FIELDS

export const idValidator = z.string().uuid();
export const nameValidator = z.string().min(1).max(NAME_MAX);

// ACCOUNT FIELDS

export const emailValidator = z.string().email();
export const passwordValidator = z.string().min(PASSWORD_MIN).max(PASSWORD_MAX);
export const roleValidator = z.enum(["USER", "ADMIN"]);

export const signupRequestValidator = z.object({
  username: nameValidator,
  email: emailValidator,
  password: passwordValidator,
});

export const loginRequestValidator = z.object({
  username: nameValidator,
  password: passwordValidator,
});

export const accountInfoValidator = z.object({
  id: idValidator,
  username: nameValidator,
  email: emailValidator,
  role: roleValidator,
});

export const dangerousAccountInfoValidator = accountInfoValidator.extend({
  password: passwordValidator,
});

// ENTITY FIELDS

export const attributeValidator = z
  .number()
  .int()
  .gte(ATTRIBUTE_MIN)
  .lte(ATTRIBUTE_MAX);
export const combatStatValidator = z.number().int().min(0);
export const giftValidator = z.enum(CHARACTER_GIFTS);
export const entityTypeValidator = z.enum(["CHARACTER"]);
export const baseAttributeFieldValidator = z.enum(ATTRIBUTES);

// NOTE: ALL FUTURE ATTRIBUTES SHOULD BE optional()

export const attributesValidator = z.object({
  agi: attributeValidator,
  cha: attributeValidator,
  dex: attributeValidator,
  int: attributeValidator,
  per: attributeValidator,
  spi: attributeValidator,
  str: attributeValidator,
  tek: attributeValidator,
  wis: attributeValidator,
  hp: combatStatValidator,
  max_hp: combatStatValidator,
  mp: combatStatValidator,
  max_mp: combatStatValidator,
  vim: combatStatValidator,
  max_vim: combatStatValidator,
  hero: combatStatValidator.optional(),
  max_hero: combatStatValidator.optional(),
  init: z.number().int(),
  speed: z.number().int().min(0),
  xp: z.number().int().optional(),
  sp: z.number().int().optional(),
  armor: z.number().int().optional(),
  burden: z.number().int().optional(),
  casting: z.number().int().optional(),
  level: z.number().int().optional(),
  acc: z.number().int().optional(),
  radius: z.number().optional(),
  reach: z.number().optional(),
});

// non-number attributes go here
export const otherAttributesValidator = z.object({
  gift: giftValidator.optional(),
});

export const entityValidator = z.object({
  name: nameValidator,
  type: entityTypeValidator,
  attributes: attributesValidator,
  other_fields: otherAttributesValidator,
});

export const fullEntityValidator = entityValidator.extend({
  id: idValidator,
  owner: idValidator,
});

// USES

export const useAttrMapValidator = z.record(
  z.string().min(1).max(NAME_MAX),
  z.union([z.number().int(), z.string().min(1).max(NAME_MAX)])
);
export const useRollValidator = z.object({
  dice: z.string().max(NAME_MAX),
  attr: z.string().max(NAME_MAX),
});
export const useHealValidator = z.object({
  attr: useAttrMapValidator,
});
export const useAdjustValidator = z.object({
  time: z.enum(["turn", "encounter", "rest", "permanent"]),
  attr: useAttrMapValidator,
});
export const useCheckValidator = z.object({
  bonus: z.string().min(1).max(NAME_MAX),
  attr: z.string().min(1).max(NAME_MAX),
});
export const usesValidator = z.object({
  roll: useRollValidator.optional(),
  heal: useHealValidator.optional(),
  adjust: useAdjustValidator.optional(),
  check: useCheckValidator.optional(),
});

// ABILITIES

export const abilityCostValidator = z.object({
  mp: z.number().int().optional(),
  vim: z.number().int().optional(),
  hp: z.number().int().optional(),
  hero: z.number().int().optional(),
  actions: z.number().int().optional(),
  reactions: z.number().int().optional(),
  attack: z.boolean().optional(),
  passive: z.boolean().optional(),
});

export const abilityFieldsValidator = z.object({
  cost: abilityCostValidator.optional(),
  activation: z.string().max(NAME_MAX).optional(),
  expedited: z.string().max(NAME_MAX).optional(),
  flavor: z.string().max(ABILITY_MAX).optional(),
  path: z.string().max(NAME_MAX).optional(),
  purchase: z.string().max(NAME_MAX).optional(),
  unlocks: z.string().max(NAME_MAX).optional(),
  partial_unlocks: z.string().max(NAME_MAX).optional(),
  prereq: z.string().max(NAME_MAX).optional(),
  mp_cost: z.number().int().array().length(3).optional(),
  cast_dl: z.number().int().array().length(3).optional(),
  build_dc: z.string().max(NAME_MAX).optional(),
  build_time: z.string().max(NAME_MAX).optional(),
  range: z.string().max(NAME_MAX).optional(),
});

export const abilityValidator = z.object({
  name: nameValidator,
  effect: z.string().min(1).max(ABILITY_MAX),
  custom_fields: abilityFieldsValidator.optional().nullable(),
  uses: usesValidator.optional().nullable(),
  comment: z.string().max(COMMENT_MAX).optional().nullable(),
  active: z.boolean(),
});

export const fullAbilityValidator = abilityValidator.extend({
  id: idValidator,
  entoity_id: idValidator,
});

// ITEMS

export const itemFieldsValidator = z.object({
  attr: z.string().max(NAME_MAX).optional(),
  category: z.string().max(NAME_MAX).optional(),
  courses: z.string().max(NAME_MAX).optional(),
  dmg: z.string().max(NAME_MAX).optional(),
  range: z.string().max(NAME_MAX).optional(),
  special: z.string().max(ITEM_MAX).optional(),
  weapon_type: z.string().max(NAME_MAX).optional(), // TODO: replace with enum?
});

export const ITEM_TYPE_EQUIPMENT = "equipment";
export const ITEM_TYPE_CONSUMABLE = "consumable";
export const ITEM_TYPE_CONTAINER = "container";
export const ITEM_TYPE_ARMOR = "armor";
export const ITEM_TYPE_SHIELD = "shield";
export const ITEM_TYPE_WEAPON = "weapon";

export const itemTypeValidator = z.enum([
  ITEM_TYPE_EQUIPMENT,
  ITEM_TYPE_CONSUMABLE,
  ITEM_TYPE_CONTAINER,
  ITEM_TYPE_ARMOR,
  ITEM_TYPE_SHIELD,
  ITEM_TYPE_WEAPON,
]);

export const itemValidator = z.object({
  name: nameValidator,
  bulk: z.number().int(),
  desc: z.string().max(ITEM_MAX),
  type: itemTypeValidator,
  custom_fields: itemFieldsValidator.optional().nullable(),
  uses: usesValidator.optional().nullable(),
  comment: z.string().max(COMMENT_MAX).optional().nullable(),
  active: z.boolean(),
});

export const fullItemValidator = itemValidator.extend({
  id: idValidator,
  entity_id: idValidator,
});

// CHANGELOG

export const attributeChangelogValidator = z.object({
  attr: attributesValidator.keyof(),
  msg: z.string().max(CHANGELOG_MAX),
  prev: z.string().max(NAME_MAX),
  time: z.date(), // TODO: might technically actually just be a string or something like that
});

export const fullAttributeChangelogValidator =
  attributeChangelogValidator.extend({
    id: idValidator,
    entity_id: idValidator,
  });

// COLLECTED ENTITY

export const collectedEntityValidator = z.object({
  entity: entityValidator,
  abilities: abilityValidator.array(),
  items: itemValidator.array(),
  changelog: fullAttributeChangelogValidator.array(),
});

export const fullCollectedEntityValidator = z.object({
  entity: fullEntityValidator,
  abilities: fullAbilityValidator.array(),
  items: fullItemValidator.array(),
  changelog: attributeChangelogValidator.array(),
});

// Type definitions

export type SignupRequest = z.infer<typeof signupRequestValidator>;
export type LoginRequest = z.infer<typeof loginRequestValidator>;
export type AccountInfo = z.infer<typeof accountInfoValidator>;
export type DangerousAccountInfo = z.infer<
  typeof dangerousAccountInfoValidator
>;
export type CharacterGift = z.infer<typeof giftValidator>;
export type EntityType = z.infer<typeof entityTypeValidator>;
export type EntityAttributes = z.infer<typeof attributesValidator>;
export type EntityAttribute = keyof EntityAttributes;
export type BaseEntityAttribute = z.infer<typeof baseAttributeFieldValidator>;
export type Entity = z.infer<typeof entityValidator>;
export type FullEntity = z.infer<typeof fullEntityValidator>;
export type UncompleteCollectedEntity = z.infer<
  typeof collectedEntityValidator
>;
export type FullCollectedEntity = z.infer<typeof fullCollectedEntityValidator>;
export type CollectedEntity = UncompleteCollectedEntity | FullCollectedEntity;
export type UsesMap = z.infer<typeof usesValidator>;
export type EntityItemType = z.infer<typeof itemTypeValidator>;
export type UncompleteEntityItem = z.infer<typeof itemValidator>;
export type FullEntityItem = z.infer<typeof fullItemValidator>;
export type EntityItem = UncompleteEntityItem | FullEntityItem;
export type UncompleteEntityAbility = z.infer<typeof abilityValidator>;
export type FullEntityAbility = z.infer<typeof fullAbilityValidator>;
export type EntityAbility = UncompleteEntityAbility | FullEntityAbility;
export type UncompleteEntityChangelog = z.infer<
  typeof attributeChangelogValidator
>;
export type FullEntityChangelog = z.infer<
  typeof fullAttributeChangelogValidator
>;
export type EntityChangelog = UncompleteEntityChangelog | FullEntityChangelog;

export type UpdatedEntityAttributes = {
  [attr in EntityAttribute]?: {
    // TODO: add reason for values shifting
    base?: number;
    val: number;
  };
};

// SERVER TYPES

export type SuccessResult<T> = {
  success: true;
  result: T;
};
export type ErrorResult = {
  success: false;
  error: string;
  code: number;
};

export type Result<T> = SuccessResult<T> | ErrorResult;

// TODO: can probably add regex validators to a lot of string fields
// TODO: VERY IMPORTANT: update database to match types here

// FRONTEND TYPES
export type HTMLString = string;

export type DiceToggle = {
  attr?: EntityAttribute;
  end?: string;
  diceNumberAdjust?: number;
  default?: boolean; // currently not really supported
};
export type DiceToggles = {
  [key: string]: DiceToggle;
};
export type DiceOtherToggles = {
  [key: string]: {
    toggled: boolean;
  };
};
export type DiceSettings = {
  explodes?: boolean;
  rr1s?: boolean;
  drop?: number;
  fatigued?: boolean;
  end?: string;
  flow?: boolean;
  ebb?: boolean;
  otherToggles?: DiceOtherToggles;
  adjust?: number | string;
  count?: number;
  sides?: number;
};
export type DiceCommands = {
  discord: string;
  roll20: string;
  web: string;
  settings: DiceSettings;
};

export type ShopItem = {
  name?: string;
  bulk: number;
  desc: string;
  type: EntityItemType;
  section?: string;
  courses?: string;
  category?: string;
  weaponType?: string;
  range?: string;
  attr?: string;
  dmg?: string;
  special?: string;
  cost: string;
  sp?: number;
  examples?: string;
  uses?: UsesMap;
};

export type ConsolidatedItem = FullEntityItem & {
  ids: string[];
};
