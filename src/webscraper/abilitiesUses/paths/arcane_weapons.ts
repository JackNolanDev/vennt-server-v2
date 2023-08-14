import { UsesMap } from "../../../utils/types";

export const ARCANE_WEAPONS_USES: Record<string, UsesMap> = {
  "Spell Hand I: Arcane Weapons": {
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
          attr: { arcane_acc: 5, arcane_dmg: 1 },
        },
      },
    ],
  },
  "Spell Hand II: Arcane Weapons": {
    adjust: {
      time: "permanent",
      attr: {
        arcane_dmg: "arcane_dmg + free_hands - 1",
        arcane_acc: "arcane_acc + (5 * free_hands) - 5",
      },
    },
  },
  "Spell Hand III: Arcane Weapons": {
    adjust: {
      time: "permanent",
      attr: {
        arcane_dmg: "arcane_dmg + free_hands",
        arcane_acc: "arcane_acc + (5 * free_hands)",
      },
    },
  },
  "Spell Hand IV: Arcane Weapons": {
    adjust: {
      time: "permanent",
      attr: {
        arcane_dmg: "arcane_dmg + free_hands",
        arcane_acc: "arcane_acc + (5 * free_hands)",
      },
    },
  },
};
