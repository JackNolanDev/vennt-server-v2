import { UsesMap } from "../../../utils/types";

export const MAGUS_USES: Record<string, UsesMap> = {
  "Spell Hand I: Magus": {
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: { type: "attr", attr: "free_hands" },
          right: { type: "const", const: "2" },
          operator: "gte",
        },
        adjust: { time: "permanent", attr: { casting: 1 } },
        check: {
          attr: "casting",
          bonus: "+1",
          label: "When at least 3m from all allies",
        },
      },
    ],
  },
  "Spell Hand II: Magus": {
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: { type: "attr", attr: "free_hands" },
          right: { type: "const", const: "2" },
          operator: "gte",
        },
        adjust: { time: "permanent", attr: { casting: 1 } },
      },
    ],
  },
  "Spell Hand III: Magus": {
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: { type: "attr", attr: "free_hands" },
          right: { type: "const", const: "2" },
          operator: "gte",
        },
        adjust: { time: "permanent", attr: { casting: 1 } },
      },
    ],
  },
};
