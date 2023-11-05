import { UsesMap } from "vennt-library";

export const SPELLSWORD_USES: Record<string, UsesMap> = {
  "Spell Hand I: Spellsword": {
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: { type: "attr", attr: "free_hands" },
          right: { type: "const", const: "1" },
          operator: "gte",
        },
        adjust: {
          time: "permanent",
          attr: { casting: 1, arcane_dmg: 1 },
        },
      },
    ],
  },
  "Spell Hand II: Spellsword": {
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: { type: "attr", attr: "free_hands" },
          right: { type: "const", const: "1" },
          operator: "gte",
        },
        adjust: {
          time: "permanent",
          attr: { casting: 1, arcane_dmg: 1 },
        },
      },
    ],
  },
};
