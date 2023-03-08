import { UsesMap } from "../utils/types";

export const REPEATABLE_SIGNIFIERS = [
  "may be purchased multiple times",
  "may be taken multiple times",
  "take this ability multiple times",
  "can be taken multiple times",
];

export const ABILITY_USES: Record<string, UsesMap> = {
  "Spell Training": {
    expose_combat_stats: ["casting"],
  },
  "Dauntless Dashing": {
    adjust: {
      time: "permanent",
      attr: {
        speed: "speed + (spi / 2)",
      },
    },
  },
  "Mage Prestige": {
    inputs: [
      {
        type: "radio",
        key: "prestige_selection",
        choices: {
          Jack: [],
          Hybrid: [
            { type: "text", key: "hybrid_arcana_1" },
            { type: "text", key: "hybrid_arcana_2" },
            { type: "text", key: "hybrid_arcana_3" },
          ],
          Archmage: [{ type: "text", key: "archmage_arcana" }]
        },
      },
    ],
    criteria_benefits: [
      {
        criteria: {
          type: "base",
          operator: "every",
          tests: [
            {
              type: "key",
              key: "prestige_selection",
              operator: "equals",
              value: "Jack",
            },
            {
              type: "special",
              name: "isSpell"
            }
          ]
        },
        adjust_ability_cost: { adjust_cost: -100 }
      },
      {
        criteria: {
          type: "base",
          operator: "every",
          tests: [
            {
              type: "key",
              key: "prestige_selection",
              operator: "equals",
              value: "Hybrid",
            },
            {
              type: "special",
              name: "isSpell"
            },
            {
              type: "base",
              operator: "some",
              tests: [
                {
                  type: "field",
                  path: ["custom_fields", "path"],
                  operator: "equals",
                  key: "hybrid_arcana_1",
                },
                {
                  type: "field",
                  path: ["custom_fields", "path"],
                  operator: "equals",
                  key: "hybrid_arcana_2",
                },
                {
                  type: "field",
                  path: ["custom_fields", "path"],
                  operator: "equals",
                  key: "hybrid_arcana_3",
                },
              ]
            }
          ]
        },
        adjust_ability_cost: { adjust_cost: -100 },
        check: {
          attr: "casting",
          bonus: "+1",
        }
      },
      {
        criteria: {
          type: "base",
          operator: "every",
          tests: [
            {
              type: "key",
              key: "prestige_selection",
              operator: "equals",
              value: "Archmage",
            },
            {
              type: "special",
              name: "isSpell"
            },
            {
              type: "field",
              path: ["custom_fields", "path"],
              operator: "equals",
              key: "archmage_arcana",
            },
          ]
        },
        adjust_ability_cost: { adjust_cost: -100 },
        check: {
          attr: "casting",
          bonus: "+3",
        }
      },
    ],
  },
};
