import { UsesMap } from "../../../utils/types";

export const HEROIC_ARCANA_USES: Record<string, UsesMap> = {
  "Dauntless Dashing": {
    adjust: {
      time: "permanent",
      attr: {
        speed: "speed + (spi / 2)",
      },
    },
  },
};
