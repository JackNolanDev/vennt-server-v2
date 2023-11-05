import { UsesMap } from "vennt-library";

export const MAGUS_USES: Record<string, UsesMap> = {
  "Arcane Exertion": { heal: { attr: { mp: "int+str" } } },
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
  "Spell Hand I": {
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
  "Spell Hand II": {
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
  "Spell Hand III": {
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
  "Confidence of the Magus": {
    optional_heal: [
      {
        attr: { mp: 1 },
        label:
          "On Successful Regular Cast Spell, gain 1 temp MP, must be used by the end of your turn",
      },
      {
        attr: { mp: 2 },
        label:
          "On Successful Double Cast Spell, gain 2 temp MP, must be used by the end of your turn",
      },
    ],
  },
};
