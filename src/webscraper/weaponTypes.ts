import axios from "axios";
import { load } from "cheerio";
import { ShopItem } from "../utils/types";

const WEAPONS_URL = "https://vennt.fandom.com/wiki/Weapons";

const sectionMap: Record<string, keyof ShopItem> = {
  Type: "weaponType",
  Range: "range",
  Bulk: "bulk",
  Attribute: "attr",
  "Common Examples": "examples",
  Cost: "cost",
  Damage: "dmg",
  Special: "special",
};

const attrMap = {
  Agility: "agi",
  Dexterity: "dex",
  Charisma: "cha",
  Intelligence: "int",
  Perception: "per",
  Spirit: "spi",
  Strength: "str",
  Technology: "tek",
  Wisdom: "wis",
};

const parseAttr = (text: string): string => {
  for (const [old, rep] of Object.entries(attrMap)) {
    text = text.replace(old, rep); // rewrite attributes
  }
  return text;
};

const parseBulk = (text: string): number => {
  let bulk = parseInt(text);
  if (isNaN(bulk)) {
    bulk = 0;
  }
  return bulk;
};

const parseSP = (text: string): number | undefined => {
  const numVal = parseInt(text);
  if (text.includes("sp") && !isNaN(numVal)) {
    return numVal;
  }
  return undefined;
};

const getWeaponTypes = (page: string): ShopItem[] => {
  const weapons: ShopItem[] = [];
  const $ = load(page);
  const weaponHeadlines = $("h3 .mw-headline");
  weaponHeadlines.each((_, el) => {
    if (el.parent) {
      const weapon: ShopItem = {
        bulk: 0,
        desc: "",
        type: "weapon",
        cost: "",
      };
      weapon.category = $(el).text();
      weapon.type = "weapon";
      const parent = $(el.parent);
      parent.nextUntil("h3").each((_, el) => {
        const section = $(el).children("b").first().text();
        if (sectionMap[section] !== undefined) {
          let text = $(el)
            .text()
            .substring(section.length + 2);
          text = text.trim(); // clean up the string
          switch (sectionMap[section]) {
            case "attr":
              weapon.attr = parseAttr(text);
              break;
            case "bulk":
              weapon.bulk = parseBulk(text);
              break;
            case "cost":
              weapon.sp = parseSP(text);
              weapon.cost = text;
              break;
            case "weaponType":
              weapon.weaponType = text;
              break;
            case "examples":
              weapon.examples = text;
              break;
            case "dmg":
              weapon.dmg = text;
              break;
            case "special":
              weapon.special = text;
              break;
          }
        } else {
          const text = $(el).text().trim();
          if (text.length > 5) {
            weapon.desc = text;
          }
        }
      });
      weapons.push(weapon);
    }
  });
  return weapons;
};

export const fetchWeaponTypes = async () => {
  return await axios.get(WEAPONS_URL).then((response) => {
    return getWeaponTypes(response.data);
  });
};
