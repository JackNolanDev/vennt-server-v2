import { UsesMap } from "vennt-library";

export const FIGHTER_USES: Record<string, UsesMap> = {
  Roll: {
    heal: { attr: { alerts: 1 } },
    check: { attr: "agi", bonus: "+3", label: "Costs addition 2 Vim" },
  },
  "Ninja Roll": {
    heal: { attr: { alerts: 2 } },
    check: {
      attr: "agi",
      bonus: "+6",
      label: "Costs addition 2 Vim",
    },
  },
  "Easy Target": { adjust: { time: "encounter", attr: { armor: 2 } } },
  "Toughen Up": { adjust: { time: "turn", attr: { burden: "0", armor: 2 } } },
  "Sleight of Hand": {
    check: {
      attr: "dex",
      bonus: "+3",
      label: "Requires quick and/or quiet hand movements",
    },
  },
  "Take a Breather": {
    roll: { dice: "1d6+str", attr: "vim", heal: { mp: 1 } },
  },
  Prepare: { heal: { attr: { alerts: 1 } } },
  "Great Initiative": {
    adjust: { time: "permanent", attr: { init: 4 } },
  },
  "Center Self": { heal: { attr: { hp: "3 + wis", alerts: 1 } } },
  Instinct: { heal: { attr: { reaction: 1 } } },
};
