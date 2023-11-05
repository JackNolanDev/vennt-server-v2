import { UsesMap } from "vennt-library";

export const LIGHTNING_ARCANA_USES: Record<string, UsesMap> = {
  "Thunder Strike": {
    weapons: [
      { category: "Arcane", dmg: "3+spi" },
      { category: "Arcane", dmg: "1d6+spi" },
      { category: "Arcane", dmg: "1d6+3+spi" },
    ],
  },
  Bolt: {
    weapons: [
      { category: "Arcane", dmg: "1d6+3+spi" },
      { category: "Arcane", dmg: "2d6+6+spi" },
      { category: "Arcane", dmg: "3d6+9+spi" },
    ],
  },
  "Chain Lightning": {
    weapons: [
      { category: "Arcane", dmg: "1d6+3+spi" },
      { category: "Arcane", dmg: "2d6+6+spi" },
      { category: "Arcane", dmg: "3d6+9+spi" },
    ],
  },
};
