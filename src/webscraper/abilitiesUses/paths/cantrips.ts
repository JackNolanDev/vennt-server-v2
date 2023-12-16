import { UsesMap } from "vennt-library";

export const CANTRIPS_USES: Record<string, UsesMap> = {
  Numinity: {
    weapons: [
      { attr: "dex", dmg: "2", label: "Half cast" },
      { attr: "dex", dmg: "1d6+3", label: "Regular cast" },
      { attr: "dex", dmg: "2d6+4", label: "Double cast" },
    ],
  },
};
