import { UsesMap } from "../../../utils/types";

export const MAGICIAN_USES: Record<string, UsesMap> = {
  "Defensive Aura": {
    inputs: [
      {
        type: "number",
        key: "mp_cost",
        min: 0,
        max: 2,
        default: 0,
      },
    ],
    heal: {
      attr: {
        alerts: 2,
        actions: "3 - mp_cost",
        mp: "-mp_cost",
      },
    },
  },
  "Spell Training": {
    expose_combat_stats: ["casting"],
    adjust: {
      time: "permanent",
      attr: { casting: "casting + spi - burden" },
    },
  },
  "Raw Energy": {
    weapons: [
      {
        category: "Arcane",
        dmg: "1d6",
        label: "0 MP",
      },
      {
        category: "Arcane",
        dmg: "1d6+spi",
        label: "1 MP",
      },
      {
        category: "Arcane",
        dmg: "3d6+spi",
        label: "3 MP",
      },
    ],
    check: {
      attr: "str",
      bonus: "+3",
      label: "Raw Energy Bonus (Pay 1 MP)",
    },
  },
  Replenish: { heal: { attr: { mp: 2 } } },
};
