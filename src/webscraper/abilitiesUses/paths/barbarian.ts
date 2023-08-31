import { UsesMap } from "../../../utils/types";

export const BARBARIAN_USES: Record<string, UsesMap> = {
  "Tough Skin": { adjust: { time: "permanent", attr: { armor: 2 } } },
  "Iron Skin": { adjust: { time: "permanent", attr: { armor: 2 } } },
  "Steel Skin": { adjust: { time: "permanent", attr: { armor: 2 } } },
  "Barbaric Reflexes": { heal: { attr: { reaction: 1 } } },
};
