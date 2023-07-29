import { UsesMap } from "../../../utils/types";

export const SPELLCASTER_USES: Record<string, UsesMap> = {
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
          bonus: "+1",
          label: "When at least 3m from all allies"
        },
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
};
