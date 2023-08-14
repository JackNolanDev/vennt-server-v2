import { UsesMap } from "../../../utils/types";

export const FIGHTER_USES: Record<string, UsesMap> = {
  "Sleight of Hand": {
    check: {
      attr: "dex",
      bonus: "+3",
      label: "Requires quick and/or quiet hand movements"
    },
  },
  "Take a Breather": {
    roll: { dice: "1d6+str", attr: "vim", heal: { mp: 1 } },
  },
  "Great Initiative": {
    adjust: { time: "permanent", attr: { init: 4 } },
  },
};
