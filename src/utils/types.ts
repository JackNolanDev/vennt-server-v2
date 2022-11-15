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
export const giftValidator = z.enum([
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
]);
export const entityTypeValidator = z.enum(["CHARACTER"]);

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
  hp_max: combatStatValidator,
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
  gift: giftValidator.optional(),
});

export const entityValidator = z.object({
  id: idValidator,
  name: nameValidator,
  type: entityTypeValidator,
  attributes: attributesValidator,
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
  custom_fields: abilityFieldsValidator.optional(),
  uses: usesValidator.optional(),
  comment: z.string().max(COMMENT_MAX).optional(),
  active: z.boolean(),
});

export const fullAbilityValidator = abilityValidator.extend({
  id: idValidator,
  entity_id: idValidator,
})

// ITEMS

export const itemFieldsValidator = z.object({
  equipped: z.boolean().optional(),
  attr: z.string().max(NAME_MAX).optional(),
  category: z.string().max(NAME_MAX).optional(),
  courses: z.string().max(NAME_MAX).optional(),
  dmg: z.string().max(NAME_MAX).optional(),
  range: z.string().max(NAME_MAX).optional(),
  special: z.string().max(ITEM_MAX).optional(),
  weapon_type: z.string().max(NAME_MAX).optional(), // TODO: replace with enum?
});

export const itemValidator = z.object({
  name: nameValidator,
  bulk: z.number().int(),
  desc: z.string().max(ITEM_MAX),
  type: z.enum([
    "equipment",
    "consumable",
    "container",
    "armor",
    "shield",
    "weapon",
  ]),
  custom_fields: itemFieldsValidator.optional(),
  uses: usesValidator.optional(),
  comment: z.string().max(COMMENT_MAX).optional(),
  active: z.boolean(),
});

export const fullItemValidator = itemValidator.extend({
  id: idValidator,
  entity_id: idValidator,
})

// CHANGELOG

export const attributeChangelogValidator = z.object({
  attr: z.string().max(NAME_MAX),
  msg: z.string().max(CHANGELOG_MAX),
  prev: z.union([z.number(), z.string().max(NAME_MAX)]),
  time: z.date(), // TODO: might technically actually just be a string or something like that
});

export const fullAttributeChangelogValidator = attributeChangelogValidator.extend({
  id: idValidator,
  entity_id: idValidator,
})

// FULL ENTITY

export const collectedEntityValidator = z.object({
  entity: entityValidator,
  abilities: abilityValidator.array(),
  items: itemValidator.array(),
  changelog: attributeChangelogValidator.array(),
});

export type SignupRequest = z.infer<typeof signupRequestValidator>;
export type LoginRequest = z.infer<typeof loginRequestValidator>;
export type AccountInfo = z.infer<typeof accountInfoValidator>;
export type DangerousAccountInfo = z.infer<
  typeof dangerousAccountInfoValidator
>;
export type Entity = z.infer<typeof entityValidator>;
export type collectedEntity = z.infer<typeof collectedEntityValidator>;

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
