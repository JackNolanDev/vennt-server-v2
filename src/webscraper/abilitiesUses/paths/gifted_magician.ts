import { UsesMap } from "../../../utils/types";

export const GIFTED_MAGICIAN_USES: Record<string, UsesMap> = {
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
}
