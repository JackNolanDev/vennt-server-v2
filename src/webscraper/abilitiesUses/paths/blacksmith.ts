import { UsesMap } from "../../../utils/types";

export const BLACKSMITH_USES: Record<string, UsesMap> = {
  "Junk Collector": {
    expose_combat_stats: ["junk"],
    adjust: {
      time: "permanent",
      attr: { junk: 0 }, // should make the attribute appear
    },
  },
}
