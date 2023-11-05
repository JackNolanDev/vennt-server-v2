import { UsesMap } from "vennt-library";

export const UNIVERSALIST_ARCANA_USES: Record<string, UsesMap> = {
  "Arcane Burst": {
    weapons: [
      { category: "Arcane", dmg: "1d6", label: "Base Damage" },
      { category: "Arcane", dmg: "1d6+spi", label: "Increased Damage" },
    ],
  },
  "Arcane Thunder": {
    inputs: [{ type: "number", key: "X", min: 3, max: 8 }],
    weapons: [{ category: "Arcane", dmg: "(X)d6 + 3*X" }],
  },
  "Force Blast": {
    weapons: [
      { category: "Arcane", dmg: "spi" },
      { category: "Arcane", dmg: "1d6+spi" },
      { category: "Arcane", dmg: "3d6+spi" },
    ],
  },
  "Missile Barrage": {
    weapons: [{ category: "Arcane", dmg: "1d6+spi" }],
  },
};
