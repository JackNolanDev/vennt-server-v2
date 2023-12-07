import { UsesMap } from "vennt-library";

export const LEADER_USES: Record<string, UsesMap> = {
  "Command Haste": {
    inputs: [
      {
        type: "number",
        key: "allies_effected",
        label: "Number of Allies Effected",
        min: 0,
        default: 0,
      },
    ],
    heal: { attr: { vim: "-(4*allies_effected)" } },
  },
};
