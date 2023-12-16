import { UsesMap } from "vennt-library";

export const SHADOW_ARCANA_USES: Record<string, UsesMap> = {
  "Shadow Bolt": {
    weapons: [
      { category: "Arcane", dmg: "0", label: "Half cast" },
      { category: "Arcane", dmg: "1d6", label: "Regular cast" },
      { category: "Arcane", dmg: "2d6", label: "Double cast" },
    ],
  },
  "Shadow's Camouflage": {
    optional_heal: [
      { attr: { alerts: 2 }, label: "Half cast" },
      { attr: { alerts: 3 }, label: "Regular cast" },
      { attr: { alerts: 5 }, label: "Double cast" },
    ],
  },
  "Shadow Dagger": {
    weapons: [
      { category: "Blade", dmg: "1d6", label: "Half cast (Blade)" },
      { category: "Blade", dmg: "1d6+4", label: "Regular cast (Blade)" },
      { category: "Blade", dmg: "1d6+10", label: "Double cast (Blade)" },
      { category: "Thrown", dmg: "1d6", label: "Half cast (Thrown)" },
      { category: "Thrown", dmg: "1d6+4", label: "Regular cast (Thrown)" },
      { category: "Thrown", dmg: "1d6+10", label: "Double cast (Thrown)" },
    ],
  },
  "Death's Embrace": {
    weapons: [
      { category: "Arcane", dmg: "1d6+2", label: "Half cast" },
      { category: "Arcane", dmg: "2d6+4", label: "Regular cast" },
      { category: "Arcane", dmg: "3d6+6", label: "Double cast" },
    ],
  },
  Shadefire: {
    weapons: [
      { category: "Arcane", dmg: "1d6+spi", label: "Half cast" },
      { category: "Arcane", dmg: "2d6+spi", label: "Regular cast" },
      { category: "Arcane", dmg: "3d6+spi", label: "Double cast" },
    ],
  },
};
