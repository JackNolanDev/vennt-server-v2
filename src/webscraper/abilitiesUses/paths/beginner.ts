import { UsesMap } from "../../../utils/types";

export const BEGINNER_USES: Record<string, UsesMap> = {
  "Repairman's Ratchet": {
    weapons: [{ category: "Aggressive", dmg: "1d6+6", attr: "tek" }],
  },
  "All-In-One Ratchet": {
    weapons: [{ category: "Aggressive", dmg: "1d6+6", attr: "tek" }],
  },
  "Inquiring Mind": {
    check: {
      attr: "wis",
      bonus: "+int",
      label: "When attempting to solve a Puzzle encounter",
    },
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
  Flawed: { adjust: { time: "permanent", attr: { xp: 100 } } },
  "In the Spotlight": {
    optional_heal: [
      { attr: { hero: 4 }, label: "When first taking this ability" },
      {
        attr: { hero: 1 },
        label: "When you are the only character in a Scene",
      },
    ],
  },
};
