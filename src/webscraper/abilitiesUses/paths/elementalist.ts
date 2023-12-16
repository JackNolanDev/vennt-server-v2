import { UsesMap } from "vennt-library";

export const ELEMENTALIST_USES: Record<string, UsesMap> = {
  "Pressure Blast": {
    weapons: [
      { category: "Arcane", dmg: "1d6", label: "Half cast" },
      { category: "Arcane", dmg: "2d6+2", label: "Regular cast" },
      { category: "Arcane", dmg: "3d6+4", label: "Double cast" },
    ],
  },
  "Water Whip": {
    weapons: [
      { category: "Arcane", dmg: "0", label: "Half cast" },
      { category: "Arcane", dmg: "1d6", label: "Regular cast" },
      { category: "Arcane", dmg: "2d6", label: "Double cast" },
    ],
    optional_heal: [{ attr: { alerts: 1 }, label: "Successfully cast" }],
  },
};
