import { UsesMap } from "../../../utils/types";

export const ARCANE_DUELIST_USES: Record<string, UsesMap> = {
  "Rock Blast": {
    weapons: [
      { category: "Arcane", dmg: "0", label: "Half cast" },
      { category: "Arcane", dmg: "1d6", label: "Regular cast" },
      { category: "Arcane", dmg: "3d6", label: "Double cast" },
      {
        category: "Arcane",
        dmg: "1d6",
        not_evadable: true,
        label: "Half cast - On dirt",
      },
      {
        category: "Arcane",
        dmg: "2d6",
        not_evadable: true,
        label: "Regular cast - On dirt",
      },
      {
        category: "Arcane",
        dmg: "4d6",
        not_evadable: true,
        label: "Double cast - On dirt",
      },
    ],
  },
};
