import { UsesMap } from "../../../utils/types";

export const FOCUSED_FIST_USES: Record<string, UsesMap> = {
  "Trii of Life": {
    expose_combat_stats: ["trii"],
    adjust: {
      time: "permanent",
      attr: {
        trii: 0,
        max_trii: "max_trii + spi + wis",
      },
    },
  },
};
