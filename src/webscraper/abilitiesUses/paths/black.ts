import { UsesMap } from "../../../utils/types";

export const BLACK_USES: Record<string, UsesMap> = {
  Mundane: {
    adjust: { time: "permanent", attr: { max_hero: "3" } },
  },
  "Cold-Blooded": {
    adjust: {
      time: "permanent",
      attr: { burn_damage_resistance: -2 },
    },
  },
  Hemophilia: {
    adjust: {
      time: "permanent",
      attr: { bleed_damage_resistance: -2 },
    },
  },
  Uninspired: {
    adjust: {
      time: "permanent",
      attr: { casting: -6, max_mp: "max_mp / 2" },
    },
  },
  Unmagical: {
    adjust: {
      time: "permanent",
      attr: { casting: -1000, magical_damage_resistance: 1 },
    },
    check: {
      attr: "wis",
      bonus: "+3",
      label: "Resisting magical effects",
    },
  },
};
