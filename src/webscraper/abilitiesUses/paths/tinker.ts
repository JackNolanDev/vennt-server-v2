import { UsesMap } from "../../../utils/types";

export const TINKER_USES: Record<string, UsesMap> = {
  "Tinker's Training": {
    expose_combat_stats: ["bluespace"],
    adjust: {
      time: "permanent",
      attr: {
        bluespace: "bluespace + (int * int)",
      },
    },
  },
};
