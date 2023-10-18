import { UsesMap } from "../../../utils/types";

export const PROTAGONIST_USES: Record<string, UsesMap> = {
  "Heroic Flourish": { adjust: { time: "permanent", attr: { max_hero: -3 } } },
  "Hero in Flux": { adjust: { time: "permanent", attr: { max_hero: -3 } } },
  "Naturally Awesome": {
    adjust: {
      time: "permanent",
      attr: { max_hero: -3, heroic_creativity_bonus: 1 },
    },
  },
  "Exceptional Training": {
    adjust: { time: "permanent", attr: { max_hero: -3 } },
  },
  "Heroic Epic": { heal: { attr: { hero: 1 } } },
  "The Assistant": { heal: { attr: { hero: 1 } } },
};
