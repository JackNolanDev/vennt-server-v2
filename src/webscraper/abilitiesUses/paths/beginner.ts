import { UsesMap } from "../../../utils/types";

export const BEGINNER_USES: Record<string, UsesMap> = {
  "Repairman's Ratchet": {
    weapons: [{ category: "Tinkertech", dmg: "1d6+6" }],
  },
  "Small Creature": {
    adjust: { time: "permanent", attr: { str: -2, agi: 1, dex: 1, speed: -2 } },
  },
  "Large Creature": {
    adjust: {
      time: "permanent",
      attr: {
        str: 2,
        agi: -2,
        dex: -2,
        speed: 3,
      },
      dice: {
        aggressive_dmg: { end: "+1d6" },
        balanced_dmg: { end: "+1d6" },
        bow_dmg: { end: "+1d6" },
        brawling_dmg: { end: "+1d6" },
        brutal_dmg: { end: "+1d6" },
        great_dmg: { end: "+1d6" },
        hookwhip_dmg: { end: "+1d6" },
        improvised_dmg: { end: "+1d6" },
        polearm_dmg: { end: "+1d6" },
        protector_dmg: { end: "+1d6" },
        thrown_dmg: { end: "+1d6" },
        unarmed_dmg: { end: "+1d6" },
        whip_dmg: { end: "+1d6" },
      },
    },
  },
};
