import { UsesMap } from "../../../utils/types";

export const MAGICIAN_USES: Record<string, UsesMap> = {
  "Spell Training": {
    expose_combat_stats: ["casting"],
    adjust: {
      time: "permanent",
      attr: {
        casting: "casting + spi - burden",
      },
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
    },
  },
};
