import { UsesMap } from "../../../utils/types";

export const KNIGHT_USES: Record<string, UsesMap> = {
  "Tank Stance": {
    adjust: {
      time: "rest",
      attr: { armor: "armor + burden", speed: "speed - burden" },
    },
  },
  "Armor Proficiency I": {
    adjust: { time: "permanent", attr: { burden: -1 } },
  },
  "Armor Proficiency II": {
    adjust: { time: "permanent", attr: { burden: -1 } },
  },
  "Armor Proficiency III": {
    adjust: { time: "permanent", attr: { burden: -1 } },
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: { type: "attr", attr: "burden" },
          right: { type: "const", const: "0" },
          operator: "lte",
        },
      },
    ],
  },
  "Shield Mastery": {
    // TODO: technically this should only be true when the person actually has a shield equipped and would effect the shield, but this is probably fine
    adjust: { time: "permanent", attr: { shield: 3, burden: -1 } },
  },
  Fortify: { adjust: { time: "turn", attr: { armor: 6 } } },
  "Holy Protector": {
    inputs: [{ type: "number", key: "X", min: 0, max: "spi", default: 0 }],
    heal: { attr: { hp: "(cha+spi)*X", mp: "-X" } },
  },
  "Heroic Defense": {
    inputs: [{ type: "number", key: "X", min: 0, max: "mp", default: 0 }],
    adjust: { time: "encounter", attr: { armor: "armor + X" } },
    heal: { attr: { mp: "-X" } },
  },
  "Chivalrous Rush": {
    inputs: [{ type: "number", key: "X", min: 0, max: "spi", default: 0 }],
    heal: { attr: { vim: "-X" } },
  },
  "Light of the Paladin": { adjust: { time: "permanent", attr: { dmg: 6 } } },
  "Knight's Instincts": {
    inputs: [{ type: "number", key: "X", min: 0, max: "str", default: 0 }],
    adjust: { time: "turn", attr: { armor: "armor + 2*X" } },
    heal: { attr: { vim: "-X" } },
  },
};
