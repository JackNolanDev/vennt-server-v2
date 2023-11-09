import { UsesMap } from "vennt-library";

export const HERO_USES: Record<string, UsesMap> = {
  "Budding Hero": {
    adjust: { time: "permanent", attr: { max_hero: 3 } },
    heal: { attr: { hero: 6 } },
  },
  Fortune: {
    inputs: [
      {
        type: "number",
        key: "X",
        label: "Hero Points",
        min: 0,
        max: "hero",
        default: 0,
      },
    ],
    heal: { attr: { sp: "1000 + 500 * X" } },
  },
  "Rally to Advance": { adjust: { time: "encounter", attr: { speed: 3 } } },
  "Rally to Arms": { adjust: { time: "encounter", attr: { acc: 10 } } },
  "Heroic Haste": { heal: { attr: { reactions: 1 } } },
  "Legendary Haste": { heal: { attr: { actions: 1 } } },
  "Epic Haste": {
    optional_heal: [
      { attr: { actions: 2 }, label: "Gain 2 Actions" },
      { attr: { reactions: 3 }, label: "Gain 3 Reactions" },
    ],
    hide_default_use_button: true,
  },
  "Thief's Celerity": { adjust: { time: "permanent", attr: { agi: 1 } } },
  "Scientist's Curiosity": { adjust: { time: "permanent", attr: { wis: 1 } } },
  "Navigator's Eye": { adjust: { time: "permanent", attr: { per: 1 } } },
  "Musician's Fingers": { adjust: { time: "permanent", attr: { dex: 1 } } },
  "Tinker's Touch": { adjust: { time: "permanent", attr: { tek: 1 } } },
  "Scholar's Memory": { adjust: { time: "permanent", attr: { int: 1 } } },
  "Aeronaut's Arms": { adjust: { time: "permanent", attr: { str: 1 } } },
  "Noble's Wit": { adjust: { time: "permanent", attr: { cha: 1 } } },
  "Seer's Soul": { adjust: { time: "permanent", attr: { spi: 1 } } },
  "Hardy Hero": { adjust: { time: "permanent", attr: { max_hp: 6 } } },
  "Hero's Fortune": {
    heal: { attr: { sp: "1000 + 500 * hero", hero: "-hero" } },
  },
};
