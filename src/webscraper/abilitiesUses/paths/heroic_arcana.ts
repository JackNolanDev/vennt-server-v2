import { UsesMap } from "vennt-library";

export const HEROIC_ARCANA_USES: Record<string, UsesMap> = {
  "Dauntless Dashing": {
    adjust: {
      time: "permanent",
      attr: { speed: "speed + (spi / 2)" },
    },
  },
};
