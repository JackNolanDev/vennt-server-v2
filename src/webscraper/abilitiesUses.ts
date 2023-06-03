import { UsesMap } from "../utils/types";

export const REPEATABLE_SIGNIFIERS = [
  "may be purchased multiple times",
  "may be taken multiple times",
  "take this ability multiple times",
  "this ability can be taken multiple times",
  "you must meet the minimum level specified to purchase a bonus"
];

export const ABILITY_USES: Record<string, UsesMap> = {
  "Spell Training": {
    expose_combat_stats: ["casting"],
  },
  "Tinker's Training": {
    expose_combat_stats: ["bluespace"],
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
            { type: "text", key: "hybrid_arcane_1" },
            { type: "text", key: "hybrid_arcane_2" },
            { type: "text", key: "hybrid_arcane_3" },
          ],
          Archmage: [{ type: "text", key: "archmage_arcana" }],
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
              type: "comp",
              left: {
                type: "key",
                key: "prestige_selection",
              },
              right: {
                type: "const",
                const: "Jack",
              },
              operator: "equals",
            },
            {
              type: "special",
              name: "isSpell",
            },
          ],
        },
        adjust_ability_cost: { adjust_cost: -100 },
      },
      {
        criteria: {
          type: "base",
          operator: "every",
          tests: [
            {
              type: "comp",
              left: {
                type: "key",
                key: "prestige_selection",
              },
              right: {
                type: "const",
                const: "Hybrid",
              },
              operator: "equals",
            },
            {
              type: "special",
              name: "isSpell",
            },
            {
              type: "base",
              operator: "some",
              tests: [
                {
                  type: "comp",
                  left: {
                    type: "ability_field",
                    path: ["custom_fields", "path"],
                  },
                  right: {
                    type: "key",
                    key: "hybrid_arcane_1",
                  },
                  operator: "equals",
                },
                {
                  type: "comp",
                  left: {
                    type: "ability_field",
                    path: ["custom_fields", "path"],
                  },
                  right: {
                    type: "key",
                    key: "hybrid_arcane_2",
                  },
                  operator: "equals",
                },
                {
                  type: "comp",
                  left: {
                    type: "ability_field",
                    path: ["custom_fields", "path"],
                  },
                  right: {
                    type: "key",
                    key: "hybrid_arcane_3",
                  },
                  operator: "equals",
                },
              ],
            },
          ],
        },
        adjust_ability_cost: { adjust_cost: -100 },
        check: {
          attr: "casting",
          bonus: "+1",
        },
      },
      {
        criteria: {
          type: "base",
          operator: "every",
          tests: [
            {
              type: "comp",
              left: {
                type: "key",
                key: "prestige_selection",
              },
              right: {
                type: "const",
                const: "Archmage",
              },
              operator: "equals",
            },
            {
              type: "special",
              name: "isSpell",
            },
            {
              type: "comp",
              left: {
                type: "ability_field",
                path: ["custom_fields", "path"],
              },
              right: {
                type: "key",
                key: "archmage_arcana",
              },
              operator: "equals",
            },
          ],
        },
        adjust_ability_cost: { adjust_cost: -100 },
        check: {
          attr: "casting",
          bonus: "+3",
        },
      },
    ],
  },
  "Spell Hand I: Spellcaster": {
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: {
            type: "attr",
            attr: "free_hands",
          },
          right: {
            type: "const",
            const: "2",
          },
          operator: "gte",
        },
        adjust: {
          time: "permanent",
          attr: {
            casting: 1,
          },
        },
        check: {
          attr: "casting",
          bonus: "+1"
        }
      },
    ],
  },
  "Spell Hand II: Spellcaster": {
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: {
            type: "attr",
            attr: "free_hands",
          },
          right: {
            type: "const",
            const: "2",
          },
          operator: "gte",
        },
        adjust: {
          time: "permanent",
          attr: {
            casting: 1,
          },
        },
      },
    ],
  },
  "Spell Hand III: Spellcaster": {
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: {
            type: "attr",
            attr: "free_hands",
          },
          right: {
            type: "const",
            const: "2",
          },
          operator: "gte",
        },
        adjust: {
          time: "permanent",
          attr: {
            casting: 1,
          },
        },
      },
    ],
  },
  "Spell Hand I: Spellsword": {
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: {
            type: "attr",
            attr: "free_hands",
          },
          right: {
            type: "const",
            const: "1",
          },
          operator: "gte",
        },
        adjust: {
          time: "permanent",
          attr: {
            casting: 1,
            arcane_dmg: 1,
          },
        },
      },
    ],
  },
  "Spell Hand II: Spellsword": {
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: {
            type: "attr",
            attr: "free_hands",
          },
          right: {
            type: "const",
            const: "1",
          },
          operator: "gte",
        },
        adjust: {
          time: "permanent",
          attr: {
            casting: 1,
            arcane_dmg: 1,
          },
        },
      },
    ],
  },
  "Spell Hand I: Arcane Weapons": {
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: {
            type: "attr",
            attr: "free_hands",
          },
          right: {
            type: "const",
            const: "1",
          },
          operator: "gte",
        },
        adjust: {
          time: "permanent",
          attr: {
            arcane_acc: 5,
            arcane_dmg: 1,
          },
        },
      },
    ],
  },
  "Spell Hand II: Arcane Weapons": {
    adjust: {
      time: "permanent",
      attr: {
        arcane_acc: "arcane_acc + free_hands - 1",
        arcane_dmg: "arcane_dmg + (5 * free_hands) - 5",
      },
    },
  },
  "Spell Hand III: Arcane Weapons": {
    adjust: {
      time: "permanent",
      attr: {
        arcane_acc: "arcane_acc + free_hands",
        arcane_dmg: "arcane_dmg + (5 * free_hands)",
      },
    },
  },
  "Spell Hand IV: Arcane Weapons": {
    adjust: {
      time: "permanent",
      attr: {
        arcane_acc: "arcane_acc + free_hands",
        arcane_dmg: "arcane_dmg + (5 * free_hands)",
      },
    },
  },
  "Sleight of Hand": {
    check: {
      attr: "dex",
      bonus: "+3"
    },
  },
};
