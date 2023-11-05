import { UsesMap } from "vennt-library";

export const SAVANT_USES: Record<string, UsesMap> = {
  "Well-Read": { adjust: { time: "permanent", dice: { int: { end: "+2" } } } },
  "Advanced Apotelesms": {
    adjust: { time: "permanent", attr: { casting: -1 } },
  },
  "Tome of Esoteria": {
    adjust: { time: "permanent", attr: { casting: -1 } },
  },
  "Exceptional Inscriptions": {
    adjust: { time: "permanent", attr: { casting: -1 } },
  },
  "Brilliant Star": {
    adjust: { time: "permanent", attr: { casting: -1 } },
  },
  "Celestial Divinations": {
    adjust: { time: "permanent", attr: { casting: -1 } },
  },
  "Savant of Astrologian Magic": {
    adjust: { time: "rest", attr: { xp: "xp + (200*int)" } },
  },
};
