import { z } from "zod";

export const NAME_MAX = 100;
export const PASSWORD_MIN = 6;
export const PASSWORD_MAX = 2_000;
export const ABILITY_MAX = 7_000;
export const ABILITY_PREREQ_MAX = 200;
export const ITEM_MAX = 2_000;
export const COMMENT_MAX = 2_000;
export const CHANGELOG_MAX = 200;
export const ATTRIBUTE_MIN = -15;
export const ATTRIBUTE_MAX = 15;
export const ENTITY_TEXT_MAX = 10_000;
export const ENTITY_FLUX_MAX = 500;
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
export const optionalIdValidator = idValidator.optional();
export const nameValidator = z.string().min(1).max(NAME_MAX);
export const equationValidator = z.union([
  z.number().int(),
  z.string().min(1).max(NAME_MAX),
]);

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

export const accountTokenValidator = z.object({
  token: z.string(),
});

// ENTITY FIELDS

export const attributeValidator = z
  .number()
  .int()
  .gte(ATTRIBUTE_MIN)
  .lte(ATTRIBUTE_MAX)
  .default(0);
export const combatStatValidator = z.number().int().min(0);
export const giftValidator = z.enum(CHARACTER_GIFTS);
export const entityTypeValidator = z.enum(["CHARACTER", "COG"]);
export const baseAttributeFieldValidator = z.enum(ATTRIBUTES);

// NOTE: ALL FUTURE ATTRIBUTES SHOULD BE optional()

export const builtInAttributesValidator = z.object({
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
  L: z.number().int().optional(),
  radius: z.number().optional(),
  reach: z.number().int().optional(),
  shield: z.number().int().optional(),
  bluespace: z.number().int().optional(),
  trii: z.number().int().optional(),
  max_trii: z.number().int().optional(),
  free_hands: z.number().int().optional(),
  carrying_capacity: z.number().int().optional(),
  alerts: z.number().int().optional(),
  max_alerts: z.number().int().optional(),
  recovery_shock: z.number().int().optional(),
  acc: z.number().int().optional(),
  dmg: z.number().int().optional(),
  actions: combatStatValidator.optional(),
  reactions: combatStatValidator.optional(),
  actions_on_turn: z.number().int().optional(),
  reactions_on_turn: z.number().int().optional(),
  // WEAPON SPECIFIC BONUSES
  aggressive_acc: z.number().int().optional(),
  aggressive_dmg: z.number().int().optional(),
  arcane_acc: z.number().int().optional(),
  arcane_dmg: z.number().int().optional(),
  balanced_acc: z.number().int().optional(),
  balanced_dmg: z.number().int().optional(),
  blade_acc: z.number().int().optional(),
  blade_dmg: z.number().int().optional(),
  bow_acc: z.number().int().optional(),
  bow_dmg: z.number().int().optional(),
  brawling_acc: z.number().int().optional(),
  brawling_dmg: z.number().int().optional(),
  brutal_acc: z.number().int().optional(),
  brutal_dmg: z.number().int().optional(),
  cannon_acc: z.number().int().optional(),
  cannon_dmg: z.number().int().optional(),
  great_acc: z.number().int().optional(),
  great_dmg: z.number().int().optional(),
  grenade_acc: z.number().int().optional(),
  grenade_dmg: z.number().int().optional(),
  hookwhip_acc: z.number().int().optional(),
  hookwhip_dmg: z.number().int().optional(),
  improvised_acc: z.number().int().optional(),
  improvised_dmg: z.number().int().optional(),
  polearm_acc: z.number().int().optional(),
  polearm_dmg: z.number().int().optional(),
  protector_acc: z.number().int().optional(),
  protector_dmg: z.number().int().optional(),
  rifle_acc: z.number().int().optional(),
  rifle_dmg: z.number().int().optional(),
  shotgun_acc: z.number().int().optional(),
  shotgun_dmg: z.number().int().optional(),
  sidearm_acc: z.number().int().optional(),
  sidearm_dmg: z.number().int().optional(),
  thrown_acc: z.number().int().optional(),
  thrown_dmg: z.number().int().optional(),
  tinkertech_acc: z.number().int().optional(),
  tinkertech_dmg: z.number().int().optional(),
  unarmed_acc: z.number().int().optional(),
  unarmed_dmg: z.number().int().optional(),
  whip_acc: z.number().int().optional(),
  whip_dmg: z.number().int().optional(),
  // DAMAGE RESISTANCE
  fall_damage_resistance: z.number().int().optional(),
  vim_damage_resistance: z.number().int().optional(),
  burn_damage_resistance: z.number().int().optional(),
  bleed_damage_resistance: z.number().int().optional(),
  stun_damage_resistance: z.number().int().optional(),
  paralysis_damage_resistance: z.number().int().optional(),
  attribute_damage_resistance: z.number().int().optional(),
  galvanic_damage_resistance: z.number().int().optional(),
  magical_damage_resistance: z.number().int().optional(),
  physical_damage_resistance: z.number().int().optional(),
  piercing_damage_resistance: z.number().int().optional(),
  slashing_damage_resistance: z.number().int().optional(),
  bludgeoning_damage_resistance: z.number().int().optional(),
  // SPECIAL DAMAGE
  burning: combatStatValidator.optional(),
  bleeding: combatStatValidator.optional(),
  paralysis: combatStatValidator.optional(),
  stun: combatStatValidator.optional(),
  agi_dmg: combatStatValidator.optional(),
  cha_dmg: combatStatValidator.optional(),
  dex_dmg: combatStatValidator.optional(),
  int_dmg: combatStatValidator.optional(),
  per_dmg: combatStatValidator.optional(),
  spi_dmg: combatStatValidator.optional(),
  str_dmg: combatStatValidator.optional(),
  tek_dmg: combatStatValidator.optional(),
  wis_dmg: combatStatValidator.optional(),
});

export const attributeNameValidator = z
  .string()
  .min(1)
  .max(NAME_MAX)
  .toLowerCase()
  .regex(/^\w+$/u, "Contains no spaces. Use '_' instead.");
export const attributeValValidator = z.number().int();
export const attributesValidator = builtInAttributesValidator.catchall(
  attributeValValidator
);

export const validAttributes = Object.keys(
  builtInAttributesValidator.keyof().Values
) as EntityAttribute[];

// COG CREATION FIELDS

export const COG_ATTRIBUTE_LEVELS = [
  "weak",
  "moderate",
  "strong",
  "exceptional",
] as const;

export const cogAttributeLevelValidator = z.enum(COG_ATTRIBUTE_LEVELS);

export const cogCreateOptionsValidator = z.object({
  name: z.string(),
  level: z.string().or(z.number()),
  type: z.string(),
  desc: z.string(),
  attrOverrides: z.record(
    baseAttributeFieldValidator,
    cogAttributeLevelValidator
  ),
  abilitySelection: z.record(z.string(), z.string()),
  variableAbilityCost: z.record(z.string(), z.string().or(z.number())),
});

export type CogAttributeLevel = z.infer<typeof cogAttributeLevelValidator>;
export type CogCreateOptions = z.infer<typeof cogCreateOptionsValidator>;

// DICE SETTINGS

export const diceOtherTogglesValidator = z.record(
  z.string(),
  z.object({
    toggled: z.boolean(),
  })
);
export const diceSettingsValidator = z.object({
  explodes: z.boolean().optional(),
  rr1s: z.boolean().optional(),
  drop: z.number().int().optional(),
  fatigued: z.boolean().optional(),
  end: z.string().max(NAME_MAX).optional(),
  flow: z.number().int().optional(),
  ebb: z.number().int().optional(),
  otherToggles: diceOtherTogglesValidator.optional(),
  adjust: equationValidator.optional(),
  count: z.number().optional(),
  sides: z.number().optional(),
});

export type DiceOtherToggles = z.infer<typeof diceOtherTogglesValidator>;
export type DiceSettings = z.infer<typeof diceSettingsValidator>;

// non-number attributes go here
export const otherAttributesValidator = z.object({
  gift: giftValidator.optional(),
  second_gift: giftValidator.optional(),
  cog_type: z.string().max(NAME_MAX).optional(),
  cog_creation_options: cogCreateOptionsValidator.optional(),
  dice_settings: diceSettingsValidator.optional(),
  in_combat: z.boolean().optional(),
});

export const entityValidator = z.object({
  name: nameValidator,
  type: entityTypeValidator,
  attributes: attributesValidator,
  other_fields: otherAttributesValidator,
  public: z.boolean().default(false),
});

export const fullEntityValidator = entityValidator.extend({
  id: idValidator,
  owner: idValidator,
});

export const partialEntityValidator = fullEntityValidator
  .omit({ id: true })
  .partial()
  .refine((ability) => Object.keys(ability).length > 0, {
    message: "Partial entity is empty",
  });

// USES

export const itemFieldsValidator = z.object({
  attr: z.string().max(NAME_MAX).optional(),
  category: z.string().max(NAME_MAX).optional(),
  courses: z.string().max(NAME_MAX).optional(),
  dmg: z.string().max(NAME_MAX).optional(),
  range: z.string().max(NAME_MAX).optional(),
  special: z.string().max(ITEM_MAX).optional(),
  weapon_type: z.string().max(NAME_MAX).optional(), // TODO: replace with enum?
  dc_cost: z.number().int().optional(),
  in_storage: z.boolean().optional(),
  not_evadable: z.boolean().optional(),
});
export const weaponFieldsWithOptionalLabel = itemFieldsValidator.extend({
  label: z.string().max(NAME_MAX).optional(),
});

export const useAttrMapValidator = z.record(
  attributeNameValidator,
  equationValidator
);
export const useRollValidator = z.object({
  dice: z.string().max(NAME_MAX),
  attr: attributeNameValidator,
  heal: useAttrMapValidator.optional(),
});
export const useHealValidator = z.object({
  attr: useAttrMapValidator,
});
export const useAdjustValidator = z.object({
  time: z.enum(["turn", "encounter", "rest", "permanent"]),
  attr: useAttrMapValidator.optional(),
  dice: z.record(attributeNameValidator, diceSettingsValidator).optional(),
});
export const criteriaFieldOperator = z.enum([
  "equals",
  "gte",
  "gt",
  "lte",
  "lt",
]);
export type CriteriaFieldOperator = z.infer<typeof criteriaFieldOperator>;
export const useCriteriaCompFieldAttrValidator = z.object({
  type: z.literal("attr"),
  attr: attributeNameValidator,
});
export type UseCriteriaCompFieldAttr = z.infer<
  typeof useCriteriaCompFieldAttrValidator
>;
export const useCriteriaCompFieldAbilityValidator = z.object({
  type: z.literal("ability_field"),
  path: z.string().min(1).array(),
});
export type UseCriteriaCompFieldAbilityField = z.infer<
  typeof useCriteriaCompFieldAbilityValidator
>;
export const useCriteriaCompFieldKeyValidator = z.object({
  type: z.literal("key"),
  key: z.string().min(1),
});
export type UseCriteriaCompFieldKey = z.infer<
  typeof useCriteriaCompFieldKeyValidator
>;
export const useCriteriaCompFieldConstValidator = z.object({
  type: z.literal("const"),
  const: z.string().min(1),
});
export type UseCriteriaCompFieldCost = z.infer<
  typeof useCriteriaCompFieldConstValidator
>;
export const useCriteriaCompFieldEquationValidator = z.object({
  type: z.literal("equation"),
  equation: z.string().min(1),
});
export type UseCriteriaCompFieldEquation = z.infer<
  typeof useCriteriaCompFieldEquationValidator
>;
export const useCriteriaCompFieldValidator = z.union([
  useCriteriaCompFieldAttrValidator,
  useCriteriaCompFieldAbilityValidator,
  useCriteriaCompFieldKeyValidator,
  useCriteriaCompFieldConstValidator,
  useCriteriaCompFieldEquationValidator,
]);
export type UseCriteriaCompField = z.infer<
  typeof useCriteriaCompFieldValidator
>;
export const useCriteriaCompValidator = z.object({
  type: z.literal("comp"),
  left: useCriteriaCompFieldValidator,
  right: useCriteriaCompFieldValidator,
  operator: criteriaFieldOperator,
});
export type UseCriteriaComp = z.infer<typeof useCriteriaCompValidator>;
export const useCriteriaSpecialValidator = z.object({
  type: z.literal("special"),
  name: z.enum(["isSpell"]),
});
export type UseCriteriaSpecial = z.infer<typeof useCriteriaSpecialValidator>;
export const useCriteriaBaseValidatorBase = z.object({
  type: z.literal("base"),
  operator: z.enum(["every", "some"]),
});
export type UseCriteriaBase = z.infer<typeof useCriteriaBaseValidatorBase> & {
  tests: Array<z.infer<typeof useCriteriaValidator>>;
};
export const useCriteriaBaseValidator: z.ZodType<UseCriteriaBase> =
  useCriteriaBaseValidatorBase.extend({
    tests: z.array(z.lazy(() => useCriteriaValidator)),
  });
export const useCriteriaValidator = z.union([
  useCriteriaCompValidator,
  useCriteriaSpecialValidator,
  useCriteriaBaseValidator,
]);
export type UseCriteria = z.infer<typeof useCriteriaValidator>;
export const useAdjustAbilityCostValidator = z.object({
  adjust_cost: equationValidator,
});
export const useCheckValidator = z.object({
  bonus: z.string().min(1).max(NAME_MAX).optional(),
  attr: attributeNameValidator,
  dice_settings: diceSettingsValidator.optional(),
  label: z.string().min(1).max(NAME_MAX).optional(),
});
export const useExposeCombatStats = attributeNameValidator.array();
export const useCriteriaBenefit = z.object({
  criteria: useCriteriaValidator,
  adjust: useAdjustValidator.optional(),
  adjust_ability_cost: useAdjustAbilityCostValidator.optional(),
  check: useCheckValidator.optional(),
});
export const useCriteriaBenefitResults = useCriteriaBenefit.array();
export const useInputBase = z.object({
  key: z.string().min(1).max(NAME_MAX),
  label: z.string().min(1).max(NAME_MAX).optional(),
});
export const useRadioInputBase = useInputBase.extend({
  type: z.literal("radio"),
});
export type UseRadioInput = z.infer<typeof useRadioInputBase> & {
  choices: Record<string, UseInputs>;
};
export const useRadioInput: z.ZodType<UseRadioInput> = useRadioInputBase.extend(
  {
    choices: z.record(
      z.string().min(1),
      z.lazy(() => useInputs)
    ),
  }
);
export const useTextInput = useInputBase.extend({
  type: z.literal("text"),
});
export type UseTextInput = z.infer<typeof useTextInput>;
export const useNumberInput = useInputBase.extend({
  type: z.literal("number"),
  min: equationValidator.optional(),
  max: equationValidator.optional(),
  default: equationValidator.optional(),
});
export type UseNumberInput = z.infer<typeof useNumberInput>;
export const useInput = z.union([useRadioInput, useTextInput, useNumberInput]);
export const useInputs = useInput.array();
export type UseInputs = z.infer<typeof useInputs>;
export const usesValidator = z.object({
  roll: useRollValidator.optional(),
  heal: useHealValidator.optional(),
  adjust: useAdjustValidator.optional(),
  adjust_ability_cost: useAdjustAbilityCostValidator.optional(),
  check: useCheckValidator.optional(),
  expose_combat_stats: useExposeCombatStats.optional(),
  inputs: useInputs.optional(),
  criteria_benefits: useCriteriaBenefitResults.optional(),
  weapons: weaponFieldsWithOptionalLabel.array().optional(),
});

// ABILITIES

export const abilityCostNumberValidator = z.object({
  mp: z.number().int().optional(),
  vim: z.number().int().optional(),
  hp: z.number().int().optional(),
  hero: z.number().int().optional(),
  actions: z.number().int().optional(),
  reactions: z.number().int().optional(),
});

export const abilityCostBooleanValidator = z.object({
  attack: z.boolean().optional(),
  passive: z.boolean().optional(),
  respite: z.boolean().optional(),
  rest: z.boolean().optional(),
  intermission: z.boolean().optional(),
});

export const abilityCostValidator = abilityCostNumberValidator.merge(
  abilityCostBooleanValidator
);

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
  repeatable: z.boolean().optional(),
  times_taken: z.number().int().min(0).optional(),
  keys: z.record(z.string().min(1), z.string().min(1)).optional(),
});

export const abilityFieldsNameValidator = abilityFieldsValidator.keyof();

export const abilityValidator = z.object({
  name: nameValidator,
  effect: z.string().min(1).max(ABILITY_MAX),
  custom_fields: abilityFieldsValidator.optional().nullable(),
  uses: usesValidator.optional().nullable().catch(null), // if something in uses is invalid, default to null.
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
  uses: usesValidator.optional().nullable().catch(null), // if something in uses is invalid, default to null.
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
  uses: usesValidator.optional().nullable().catch(null), // if something in uses is invalid, default to null.
});

// CHANGELOG

export const attributeChangelogValidator = z.object({
  attr: attributeNameValidator,
  msg: z.string().max(CHANGELOG_MAX),
  prev: z.number().optional().nullable(),
});

export const fullAttributeChangelogValidator =
  attributeChangelogValidator.extend({
    id: idValidator,
    entity_id: idValidator,
    time: z.string().datetime(),
  });

// ENTITY_TEXT

export const entityTextKeyValidator = z.enum(["NOTES", "DESC", "BACKSTORY"]);

export const entityTextTextValidator = z.object({
  text: z.string().max(ENTITY_TEXT_MAX),
});

export const entityTextPermissionValidator = z.object({
  public: z.boolean().default(false),
});

export const entityTextValidator = entityTextTextValidator
  .merge(entityTextPermissionValidator)
  .extend({
    key: entityTextKeyValidator,
  });

export const fullEntityTextValidator = entityTextValidator.extend({
  id: idValidator,
  entity_id: idValidator,
});

// ENTITY_FLUX

export const fluxTypeValidator = z.enum([
  "QUEST",
  "TIDE",
  "GRATE",
  "DAM",
  "EFFLUENT",
  "DELTA",
]);

export const fluxMetadataValidator = z.object({
  effect: z.string().max(ENTITY_FLUX_MAX).optional(),
});

export const entityFluxValidator = z.object({
  type: fluxTypeValidator,
  text: z.string().max(ENTITY_FLUX_MAX),
  metadata: fluxMetadataValidator.optional().nullable(),
});

export const fullEntityFluxValidator = entityFluxValidator.extend({
  id: idValidator,
  entity_id: idValidator,
});

export const partialEntityFluxValidator = entityFluxValidator
  .partial()
  .refine((ability) => Object.keys(ability).length > 0, {
    message: "Partial flux is empty",
  });

// COLLECTED ENTITY

export const collectedEntityValidator = z.object({
  entity: entityValidator,
  abilities: abilityValidator.array(),
  items: itemValidator.array(),
  text: entityTextValidator.array(),
  flux: entityFluxValidator.array(),
});

export const fullCollectedEntityValidator = z.object({
  entity: fullEntityValidator,
  abilities: fullAbilityValidator.array(),
  items: fullItemValidator.array(),
  text: fullEntityTextValidator.array(),
  flux: fullEntityFluxValidator.array(),
});

export const collectedEntityWithChangelogValidator =
  collectedEntityValidator.extend({
    changelog: attributeChangelogValidator.array(),
  });

export const fullCollectedEntityWithChangelogValidator =
  fullCollectedEntityValidator.extend({
    changelog: fullAttributeChangelogValidator.array(),
  });

// CAMPAIGNS

export const CAMPAIGN_ROLE_SPECTATOR = "SPECTATOR";
export const CAMPAIGN_ROLE_PLAYER = "PLAYER";
export const CAMPAIGN_ROLE_GM = "GM";
export const CAMPAIGN_ROLES = [
  CAMPAIGN_ROLE_SPECTATOR,
  CAMPAIGN_ROLE_PLAYER,
  CAMPAIGN_ROLE_GM,
] as const;
export const campaignRoleValidator = z.enum(CAMPAIGN_ROLES);

export const postCampaignValidator = z.object({
  name: nameValidator,
  desc: z.string().max(COMMENT_MAX),
});

export const campaignValidator = postCampaignValidator.extend({
  id: idValidator,
  in_combat: z.boolean(),
  init_index: z.number().int().nonnegative(),
  init_round: z.number().int().nonnegative(),
});

export const campaignWithRoleValidator = campaignValidator.extend({
  role: campaignRoleValidator,
});

export const postCampaignInviteValidator = z.object({
  campaign_id: idValidator,
  to: nameValidator,
  role: campaignRoleValidator,
});

export const campaignInviteValidator = postCampaignInviteValidator.extend({
  id: idValidator,
  from: nameValidator,
  created: z.string().datetime(),
});

export const campaignInviteWithDetailsValidator =
  campaignInviteValidator.extend({
    name: nameValidator,
    desc: z.string().max(COMMENT_MAX),
  });

export const campaignMemberValidator = z.object({
  id: idValidator,
  campaign_id: idValidator,
  account_id: idValidator,
  username: nameValidator,
  role: campaignRoleValidator,
});

export const postCampaignEntityValidator = z.object({
  entity_id: idValidator,
  gm_only: z.boolean(),
});

export const campaignEntityValidator = postCampaignEntityValidator.extend({
  owner: idValidator,
  name: nameValidator,
  type: entityTypeValidator,
  attributes: attributesValidator,
  other_fields: otherAttributesValidator,
});

export const fullCampaignDetailsValidator = z.object({
  campaign: campaignValidator,
  invites: campaignInviteValidator.array().optional(),
  members: campaignMemberValidator.array(),
  entities: campaignEntityValidator.array(),
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
export const ABILITIES_KEY_OLD = "VENNT_ABILITIES_0.13.7";

export const jsonStorageKeyValidator = z.enum([
  WEAPON_TYPES_KEY,
  SHOP_ITEMS_KEY,
  ABILITIES_KEY,
  ABILITIES_KEY_OLD,
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
export type AccountToken = z.infer<typeof accountTokenValidator>;
export type DangerousAccountInfo = z.infer<
  typeof dangerousAccountInfoValidator
>;
export type CharacterGift = z.infer<typeof giftValidator>;
export type EntityType = z.infer<typeof entityTypeValidator>;
export type EntityAttributes = z.infer<typeof attributesValidator>;
export type EntityAttribute = z.infer<typeof attributeNameValidator>;
export type BaseEntityAttribute = z.infer<typeof baseAttributeFieldValidator>;
export type EntityFields = z.infer<typeof otherAttributesValidator>;
export type UncompleteEntity = z.infer<typeof entityValidator>;
export type FullEntity = z.infer<typeof fullEntityValidator>;
export type Entity = UncompleteEntity | FullEntity;
export type PartialEntity = z.infer<typeof partialEntityValidator>;
export type UncompleteCollectedEntity = z.infer<
  typeof collectedEntityValidator
>;
export type FullCollectedEntity = z.infer<typeof fullCollectedEntityValidator>;
export type CollectedEntity = UncompleteCollectedEntity | FullCollectedEntity;
export type UncompleteCollectedEntityWithChangelog = z.infer<
  typeof collectedEntityWithChangelogValidator
>;
export type FullCollectedEntityWithChangelog = z.infer<
  typeof fullCollectedEntityWithChangelogValidator
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
export type AbilityCostMapNumber = z.infer<typeof abilityCostNumberValidator>;
export type AbilityCostMapBoolean = z.infer<typeof abilityCostBooleanValidator>;
export type AbilityCostMap = z.infer<typeof abilityCostValidator>;
export type EntityAbilityFieldsStrings = z.infer<
  typeof abilityFieldsValidatorStrings
>;
export type EntityAbilityFields = z.infer<typeof abilityFieldsNameValidator>;
export type EntityTextKey = z.infer<typeof entityTextKeyValidator>;
export type UncompleteEntityText = z.infer<typeof entityTextValidator>;
export type FullEntityText = z.infer<typeof fullEntityTextValidator>;
export type EntityFluxType = z.infer<typeof fluxTypeValidator>;
export type UncompleteEntityFlux = z.infer<typeof entityFluxValidator>;
export type FullEntityFlux = z.infer<typeof fullEntityFluxValidator>;
export type PartialEntityFlux = z.infer<typeof partialEntityFluxValidator>;
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
export type PathsAndAbilities = z.infer<typeof pathsAndAbilitiesValidator>;

export type CampaignRole = z.infer<typeof campaignRoleValidator>;
export type PostCampaign = z.infer<typeof postCampaignValidator>;
export type Campaign = z.infer<typeof campaignValidator>;
export type CampaignWithRole = z.infer<typeof campaignWithRoleValidator>;
export type PostCampaignInvite = z.infer<typeof postCampaignInviteValidator>;
export type CampaignInvite = z.infer<typeof campaignInviteValidator>;
export type CampaignInviteWithDetails = z.infer<
  typeof campaignInviteWithDetailsValidator
>;
export type PostCampaignEntity = z.infer<typeof postCampaignEntityValidator>;
export type CampaignMember = z.infer<typeof campaignMemberValidator>;
export type CampaignEntity = z.infer<typeof campaignEntityValidator>;
export type FullCampaignDetails = z.infer<typeof fullCampaignDetailsValidator>;

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

export type SaveState = "EDITING" | "SAVING" | "SAVED";

export type UpdatedEntityAttribute = {
  base?: number;
  val: number;
  reason?: string[];
  items?: EntityItem[];
  abilities?: EntityAbility[];
  dice?: DiceSettings;
};

export type UpdatedEntityAttributes = Partial<
  Record<string, UpdatedEntityAttribute>
>;

export type DiceToggle = {
  attr?: EntityAttribute;
  setting: DiceSettings;
  default?: boolean; // currently not really supported
  label?: string;
};
export type DiceToggles = {
  [key: string]: DiceToggle;
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

export type PathTree = Record<
  string,
  { children: PathTree; abilities: string[] }
>;
