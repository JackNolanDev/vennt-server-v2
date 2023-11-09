import { load } from "cheerio";
import { ShopItem } from "vennt-library";
import { parseAttr, parseBulk, parseSP } from "./webscraperUtils";

const WEAPONS_URL = "https://vennt.fandom.com/wiki/Weapons";

const sectionMap: Record<string, keyof ShopItem> = {
  Type: "weapon_type",
  Range: "range",
  Bulk: "bulk",
  Attribute: "attr",
  "Common Examples": "examples",
  Cost: "cost",
  Damage: "dmg",
  Special: "special",
};

const getWeaponTypes = (page: string): ShopItem[] => {
  const weapons: ShopItem[] = [];
  const $ = load(page);
  const weaponHeadlines = $("h3 .mw-headline");
  weaponHeadlines.each((_, el) => {
    if (!el.parent) {
      return;
    }
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
          case "weapon_type":
            weapon.weapon_type = text;
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
    addWeaponUses(weapon);
    weapons.push(weapon);
  });
  return weapons;
};

const addWeaponUses = (weapon: ShopItem): void => {
  let handsUsed = 1;
  if (
    weapon.name &&
    ["Unarmed", "Thrown", "Improvised", "Grenade"].includes(weapon.name)
  ) {
    handsUsed = 0;
  } else if (weapon.weapon_type?.includes("Two-Handed")) {
    handsUsed = 2;
  }
  if (handsUsed > 0) {
    weapon.uses = {
      adjust: { time: "permanent", attr: { free_hands: -handsUsed } },
    };
  }
};

export const fetchWeaponTypes = async () => {
  console.log("starting to web scrape weapon types");
  const weaponTypes = await fetch(WEAPONS_URL)
    .then((response) => response.text())
    .then((text) => getWeaponTypes(text));
  console.log("complete web scrape weapon types");
  return weaponTypes;
};
