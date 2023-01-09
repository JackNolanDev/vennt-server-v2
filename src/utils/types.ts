import { z } from "zod";

export const NAME_MAX = 100;
export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 2000;
export const ABILITY_MAX = 6000;
export const ABILITY_PREREQ_MAX = 200;
export const ITEM_MAX = 2000;
export const COMMENT_MAX = 2000;
export const CHANGELOG_MAX = 200;
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
  shield: z.number().optional(),
});

export const attributeNameValidator = attributesValidator.keyof();

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
  attributeNameValidator,
  z.union([z.number().int(), z.string().min(1).max(NAME_MAX)])
);
export const useRollValidator = z.object({
  dice: z.string().max(NAME_MAX),
  attr: attributeNameValidator,
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
  attr: attributeNameValidator,
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

export const abilityFieldsValidatorStrings = z.object({
  activation: z.string().max(NAME_MAX).optional(),
  expedited: z.string().max(NAME_MAX).optional(),
  flavor: z.string().max(ABILITY_MAX).optional(),
  path: z.string().max(NAME_MAX).optional(),
  purchase: z.string().max(NAME_MAX).optional(),
  unlocks: z.string().max(NAME_MAX).optional(),
  partial_unlocks: z.string().max(NAME_MAX).optional(),
  prereq: z.string().max(ABILITY_PREREQ_MAX).optional(),
  build_dc: z.string().max(NAME_MAX).optional(),
  build_time: z.string().max(NAME_MAX).optional(),
  range: z.string().max(NAME_MAX).optional(),
});

export const abilityFieldsValidator = abilityFieldsValidatorStrings.extend({
  cost: abilityCostValidator.optional(),
  mp_cost: z.number().int().array().length(3).optional(),
  cast_dl: z.number().int().array().length(3).optional(),
  not_req: z.boolean().optional(),
});

export const abilityValidator = z.object({
  name: nameValidator,
  effect: z.string().min(1).max(ABILITY_MAX),
  custom_fields: abilityFieldsValidator.optional().nullable(),
  uses: usesValidator.optional().nullable(),
  comment: z.string().max(COMMENT_MAX).optional().nullable(),
  active: z.boolean(),
});

export const partialAbilityValidator = abilityValidator
  .partial()
  .refine((ability) => Object.keys(ability).length > 0, {
    message: "Partial ability is empty",
  });

export const fullAbilityValidator = abilityValidator.extend({
  id: idValidator,
  entity_id: idValidator,
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

export const partialItemValidator = itemValidator
  .partial()
  .refine((item) => Object.keys(item).length > 0, {
    message: "Partial item is empty",
  });

export const fullItemValidator = itemValidator.extend({
  id: idValidator,
  entity_id: idValidator,
});

export const shopItemValidator = itemFieldsValidator.extend({
  name: nameValidator.optional(),
  bulk: z.number().int(),
  desc: z.string().max(ITEM_MAX),
  type: itemTypeValidator,
  cost: z.string().max(NAME_MAX),
  sp: z.number().int().optional(),
  section: z.string().max(NAME_MAX).optional(),
  examples: z.string().max(ITEM_MAX).optional(),
  uses: usesValidator.optional(),
});

// CHANGELOG

export const attributeChangelogValidator = z.object({
  attr: attributesValidator.keyof(),
  msg: z.string().max(CHANGELOG_MAX),
  prev: z.number().optional(),
});

export const fullAttributeChangelogValidator =
  attributeChangelogValidator.extend({
    id: idValidator,
    entity_id: idValidator,
    time: z.string().datetime(),
  });

// COLLECTED ENTITY

export const collectedEntityValidator = z.object({
  entity: entityValidator,
  abilities: abilityValidator.array(),
  items: itemValidator.array(),
});

export const fullCollectedEntityValidator = z.object({
  entity: fullEntityValidator,
  abilities: fullAbilityValidator.array(),
  items: fullItemValidator.array(),
});

export const collectedEntityWithChangelogValidator =
  collectedEntityValidator.extend({
    changelog: attributeChangelogValidator.array(),
  });

// other endpoints

export const partialAttributesValidator = attributesValidator.partial();
export const adjustAttributesValidator = z.object({
  message: z.string().max(CHANGELOG_MAX).optional(),
  attributes: partialAttributesValidator.refine(
    (attrs) => Object.keys(attrs).length > 0,
    { message: "Attributes is empty" }
  ),
});

export const filterChangelogValidator = z.object({
  attributes: attributeNameValidator.array(),
});

export const WEAPON_TYPES_KEY = "VENNT_WEAPON_TYPES";
export const SHOP_ITEMS_KEY = "VENNT_SHOP_ITEMS";
export const ABILITIES_KEY = "VENNT_ABILITIES";

export const jsonStorageKeyValidator = z.enum([
  WEAPON_TYPES_KEY,
  SHOP_ITEMS_KEY,
  ABILITIES_KEY,
]);

export const pathDetailsValidator = z.object({
  name: z.string(),
  url: z.string().url(),
  desc: z.string(),
  reqs: z.string().optional(),
  completionBonus: z.string().optional(),
});

export const pathsAndAbilitiesValidator = z.object({
  paths: pathDetailsValidator.array(),
  abilities: abilityValidator.array(),
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
export type EntityAttribute = z.infer<typeof attributeNameValidator>;
export type BaseEntityAttribute = z.infer<typeof baseAttributeFieldValidator>;
export type UncompleteEntity = z.infer<typeof entityValidator>;
export type FullEntity = z.infer<typeof fullEntityValidator>;
export type Entity = UncompleteEntity | FullEntity;
export type UncompleteCollectedEntity = z.infer<
  typeof collectedEntityValidator
>;
export type FullCollectedEntity = z.infer<typeof fullCollectedEntityValidator>;
export type CollectedEntity = UncompleteCollectedEntity | FullCollectedEntity;
export type UncompleteCollectedEntityWithChangelog = z.infer<
  typeof collectedEntityWithChangelogValidator
>;
export type UsesMap = z.infer<typeof usesValidator>;
export type UsesRoll = z.infer<typeof useRollValidator>;
export type UsesHeal = z.infer<typeof useHealValidator>;
export type UsesAdjust = z.infer<typeof useAdjustValidator>;
export type UsesCheck = z.infer<typeof useCheckValidator>;
export type EntityItemType = z.infer<typeof itemTypeValidator>;
export type UncompleteEntityItem = z.infer<typeof itemValidator>;
export type FullEntityItem = z.infer<typeof fullItemValidator>;
export type EntityItem = UncompleteEntityItem | FullEntityItem;
export type PartialEntityItem = z.infer<typeof partialItemValidator>;
export type UncompleteEntityAbility = z.infer<typeof abilityValidator>;
export type FullEntityAbility = z.infer<typeof fullAbilityValidator>;
export type EntityAbility = UncompleteEntityAbility | FullEntityAbility;
export type PartialEntityAbility = z.infer<typeof partialAbilityValidator>;
export type EntityAbilityFieldsStrings = z.infer<
  typeof abilityFieldsValidatorStrings
>;
export type UncompleteEntityChangelog = z.infer<
  typeof attributeChangelogValidator
>;
export type FullEntityChangelog = z.infer<
  typeof fullAttributeChangelogValidator
>;
export type EntityChangelog = UncompleteEntityChangelog | FullEntityChangelog;
export type PartialEntityAttributes = z.infer<
  typeof partialAttributesValidator
>;
export type UseAttrMap = z.infer<typeof useAttrMapValidator>;
export type UpdateEntityAttributes = z.infer<typeof adjustAttributesValidator>;
export type FilterChangelogBody = z.infer<typeof filterChangelogValidator>;
export type JsonStorageKey = z.infer<typeof jsonStorageKeyValidator>;
export type ShopItem = z.infer<typeof shopItemValidator>;
export type PathDetails = z.infer<typeof pathDetailsValidator>;
export type PathsAndAbilites = z.infer<typeof pathsAndAbilitiesValidator>;

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

export type UpdatedEntityAttributes = {
  [attr in EntityAttribute]?: {
    // TODO: add reason for values shifting
    base?: number;
    val: number;
  };
};

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

export type ConsolidatedItem = FullEntityItem & {
  ids: string[];
};
