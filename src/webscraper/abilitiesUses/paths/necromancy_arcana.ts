import { UsesMap } from "../../../utils/types";

export const NECROMANCY_ARCANA_USES: Record<string, UsesMap> = {
  "Necrotic Touch": {
    weapons: [
      { category: "Arcane", dmg: "1d6+3" },
      { category: "Arcane", dmg: "2d6+6" },
      { category: "Arcane", dmg: "3d6+9" },
    ],
  },
};
