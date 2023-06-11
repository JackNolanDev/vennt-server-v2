import { UsesMap } from "../../../utils/types";

export const MAGICIAN_USES: Record<string, UsesMap> = {
  "Spell Training": {
    expose_combat_stats: ["casting"],
    adjust: {
      time: "permanent",
      attr: {
        casting: "casting + spi - burden",
      }
    },
  },
}
