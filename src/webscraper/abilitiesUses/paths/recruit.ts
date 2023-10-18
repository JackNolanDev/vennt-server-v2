import { UsesMap } from "../../../utils/types";

export const RECRUIT_USES: Record<string, UsesMap> = {
  Brawn: {
    adjust: {
      time: "encounter",
      attr: {
        aggressive_dmg: 3,
        balanced_dmg: 3,
        blade_dmg: 3,
        brawling_dmg: 3,
        brutal_dmg: 3,
        great_dmg: 3,
        hookwhip_dmg: 3,
        improvised_dmg: 3,
        polearm_dmg: 3,
        protector_dmg: 3,
        unarmed_dmg: 3,
        whip_dmg: 3,
      },
      dice: { attr: { end: "+3" } },
    },
  },
  "Guard Up": { adjust: { time: "turn", attr: { armor: 6 } } },
};
