import { UsesMap } from "vennt-library";

export const SOLDIER_USES: Record<string, UsesMap> = {
  "Soldier's Training": { adjust: { time: "permanent", attr: { init: 3 } } },
  "Soldier's Vigor": { adjust: { time: "permanent", attr: { max_hp: 3 } } },
  "Hold Steady": {
    heal: { attr: { reactions: "actions", actions: "-actions" } },
  },
  "Steady On Guard": { heal: { attr: { reactions: 1 } } },
};
