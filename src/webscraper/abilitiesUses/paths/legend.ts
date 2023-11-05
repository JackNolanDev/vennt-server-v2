import { UsesMap } from "vennt-library";

export const LEGEND_USES: Record<string, UsesMap> = {
  "Legendary Action": {
    adjust: { time: "permanent", attr: { actions_on_turn: 1 } },
  },
  "Legendary Reaction": {
    adjust: { time: "permanent", attr: { reactions_on_turn: 1 } },
  },
  "Legendary Heroism": { heal: { attr: { hero: 1 } } },
  "Moment to Shine": { heal: { attr: { action: 1 } } },
};
