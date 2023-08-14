import { UsesMap } from "../../../utils/types";

export const SPELLCASTER_USES: Record<string, UsesMap> = {
  "Spellcaster's Vigor": {
    inputs: [
      {
        type: "radio",
        key: "vigor_selection",
        choices: {
          default: [],
          "-3 max HP": [],
          "-3 max HP & -6 max Vim": [],
        },
      },
    ],
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "vigor_selection" },
          right: { type: "const", const: "default" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { max_mp: 3 } },
      },
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "vigor_selection" },
          right: { type: "const", const: "-3 max HP" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { max_mp: 6, max_hp: -3 } },
      },
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "vigor_selection" },
          right: { type: "const", const: "-3 max HP & -6 max Vim" },
          operator: "equals",
        },
        adjust: {
          time: "permanent",
          attr: { max_mp: 6, max_hp: -3, max_vim: -6 },
        },
      },
    ],
  },
  "Spell Hand I: Spellcaster": {
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
  "Spell Hand II: Spellcaster": {
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
  "Spell Hand III: Spellcaster": {
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
