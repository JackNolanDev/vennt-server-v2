import { UsesMap } from "vennt-library";

export const TINKER_USES: Record<string, UsesMap> = {
  "Forge Onward!": {
    adjust: {
      time: "permanent",
      attr: {
        aggressive_dmg: 3,
        balanced_dmg: 3,
        bow_dmg: 3,
        brawling_dmg: 3,
        brutal_dmg: 3,
        great_dmg: 3,
        hookwhip_dmg: 3,
        improvised_dmg: 3,
        polearm_dmg: 3,
        protector_dmg: 3,
        thrown_dmg: 3,
        unarmed_dmg: 3,
        whip_dmg: 3,
      },
    },
  },
  "Tinker's Training": {
    expose_combat_stats: ["bluespace"],
    adjust: {
      time: "permanent",
      attr: { bluespace: "bluespace + (int * int)" },
    },
  },
};
