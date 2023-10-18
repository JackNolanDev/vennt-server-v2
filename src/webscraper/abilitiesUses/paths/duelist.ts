import { UsesMap } from "../../../utils/types";

export const DUELIST_USES: Record<string, UsesMap> = {
  "Fast Feet I": { adjust: { time: "permanent", attr: { speed: 1 } } },
  "En Garde": { heal: { attr: { alerts: 1 } } },
  "Fencer's Grip": {
    check: {
      attr: "cha",
      bonus: "+1",
      label: "If you have shaken your opponents hand this Encounter",
    },
  },
  "Dueling Mastery": {
    check: {
      attr: "dmg",
      dice_settings: { explodes: true },
      label: "On Basic Attack",
    },
  },
};
