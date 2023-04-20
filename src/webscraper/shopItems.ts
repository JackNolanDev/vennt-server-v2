import axios from "axios";
import { CheerioAPI, load } from "cheerio";
import { EntityItemType, ShopItem } from "../utils/types";
import { SHOP_ITEM_USES } from "./shopItemsUses";
import { parseBulk, parseCourses, parseSP } from "./webscraperUtils";

const EQUIPMENT_URL = "https://vennt.fandom.com/wiki/Equipment";
const CONSUMABLE_URL = "https://vennt.fandom.com/wiki/Consumables";
const CONTAINER_URL = "https://vennt.fandom.com/wiki/Item_Containers";
const ADVANCED_WEAPONS_URL = "https://vennt.fandom.com/wiki/Advanced_weapons";
const ADVANCED_AMMO_URL = "https://vennt.fandom.com/wiki/Advanced_ammo";
const GRENADES_URL = "https://vennt.fandom.com/wiki/Grenades";
const ARMOR_URL = "https://vennt.fandom.com/wiki/Armor";

const specialBulkMap: Record<string, number> = {
  "Camping Supplies": 5,
  "Tinker's Kit": 5,
  Ornithopter: 5,
  "Fighter Candy": 0,
};

const defaultWeapons: ShopItem[] = [
  {
    type: "weapon",
    section: "Basic Weapons",
    bulk: 1,
    name: "Melee Blade",
    courses: "",
    cost: "0 sp",
    sp: 0,
    desc:
      "All Three Rivers Guild adventurers are equipped with a sharp Blade to keep at their side for " +
      "close quarters encounters. You can make a melee attack at adjacent enemies. This weapon uses " +
      "your Dexterity as its weapon Attribute and deals 1d6+3 damage.",
    weapon_type: "Melee",
    attr: "dex",
    dmg: "1d6+3",
    range: "1m",
  },
  {
    type: "weapon",
    section: "Basic Weapons",
    bulk: 1,
    name: "Ranged Sidearm",
    courses: "",
    cost: "0 sp",
    sp: 0,
    desc:
      "All Three Rivers Guild adventurers are equipped with a Sidearm pistol that can shoot at a distance. " +
      "You can make a ranged attack at anything you can see. This weapon uses your Dexterity as its weapon " +
      "Attribute and deals 1d6 damage.",
    weapon_type: "Ranged",
    attr: "dex",
    dmg: "1d6",
    range: "15m",
  },
];

const parseTable = (
  $: CheerioAPI,
  selector: string,
  type: EntityItemType,
  section: string,
  includesCourses = true
): ShopItem[] => {
  const items: ShopItem[] = [];
  // Adventuring Gear table
  const table = $(selector);
  const tableElements = table.children("tr");
  tableElements.each((idx, row) => {
    if (idx === 0) {
      // first row for wiki tables is header
      return;
    }
    const item: ShopItem = {
      type,
      section,
      bulk: 1,
      desc: "",
      cost: "",
    };
    const rowElements = $(row).children("td");
    rowElements.each((idx, el) => {
      const text = $(el).text().trim();
      // skip the second column when courses are not in the table
      const switchIdx = includesCourses ? idx : idx === 0 ? 0 : idx + 1;
      switch (switchIdx) {
        case 0:
          item.name = text;
          // include data that's hard to automatically parse
          if (specialBulkMap[text] !== undefined) {
            item.bulk = specialBulkMap[text];
          }
          break;
        case 1:
          item.courses = parseCourses(text);
          break;
        case 2:
          item.cost = text;
          item.sp = parseSP(text);
          break;
        case 3:
          item.desc = text;
          break;
      }
    });
    items.push(item);
  });
  return items;
};

const getContainers = (page: string): ShopItem[] => {
  const $ = load(page);
  const items: ShopItem[] = [];
  const table = $("#mw-content-text > div > table > tbody");
  const tableElements = table.children("tr");
  tableElements.each((idx, row) => {
    if (idx === 0) {
      // first row for wiki tables is header
      return;
    }
    const item: ShopItem = {
      type: "container",
      section: "Item Containers",
      courses: "",
      bulk: 0,
      desc: "",
      cost: "",
    };
    const rowElements = $(row).children("td");
    rowElements.each((idx, el) => {
      const text = $(el).text().trim();
      switch (idx) {
        case 0:
          item.name = text;
          break;
        case 1:
          item.cost = text;
          item.sp = parseSP(text);
          break;
        case 2:
          item.bulk = parseBulk(text);
          break;
        case 3:
          item.desc = text;
          break;
      }
    });
    items.push(item);
  });
  return items;
};

const weaponSections: Record<string, keyof ShopItem> = {
  Type: "category",
  Cost: "cost",
};

const getAdvancedWeapons = (
  page: string,
  weaponTypes: ShopItem[]
): ShopItem[] => {
  const weapons: ShopItem[] = [];
  const $ = load(page);
  const weaponHeadlines = $("h3 .mw-headline");
  weaponHeadlines.each((_, el) => {
    if (!el.parent) {
      return;
    }
    const weapon: Partial<ShopItem> = {
      section: "Advanced Weapons",
      courses: "Weapons",
    };
    let fullWeapon: ShopItem = {
      type: "equipment",
      bulk: 0,
      desc: "",
      cost: "",
    };
    weapon.name = $(el).text();
    const parent = $(el.parent);
    parent.nextUntil("h3").each((_, el) => {
      const section = $(el).children("b").first().text();
      if (weaponSections[section] !== undefined) {
        let text = $(el)
          .text()
          .substring(section.length + 2);
        text = text.trim(); // clean up the string
        if (weaponSections[section] === "category") {
          const weaponTemplate = weaponTypes.find(
            (type) => type.category === text
          );
          if (weaponTemplate !== undefined) {
            fullWeapon = weaponTemplate;
          }
        } else if (weaponSections[section] === "cost") {
          weapon.sp = parseSP(text);
        }
      } else {
        const text = $(el).text().trim();
        if (text.length > 5) {
          const italicsText = $(el).children("i").first().text();
          if (text === italicsText) {
            weapon.desc = italicsText;
          } else {
            let newSpecial = text;
            if (weapon.special) {
              newSpecial = `${weapon.special}. ${text}`;
            }
            if (newSpecial.length > 500) {
              weapon.special = text;
            } else {
              weapon.special = newSpecial;
            }
          }
        }
      }
    });
    const compiledWeapon: ShopItem = { ...fullWeapon, ...weapon };
    delete compiledWeapon.examples;
    weapons.push(compiledWeapon);
  });
  return weapons;
};

const getGrenades = (page: string, weaponTypes: ShopItem[]): ShopItem[] => {
  const $ = load(page);
  const grenades: ShopItem[] = [];
  const template = weaponTypes.find((type) => type.category === "Grenade");
  if (!template) {
    console.error("Did not find the grenade base template!");
    return [];
  }
  const table = $("#mw-content-text > div > table > tbody");
  const tableElements = table.children("tr");
  tableElements.each((idx, row) => {
    if (idx === 0) {
      // first row for wiki tables is header
      return;
    }
    const grenade: ShopItem = { ...template, section: "Grenades" };
    const rowElements = $(row).children("td");
    let specialDmg = "";
    rowElements.each((idx, el) => {
      const text = $(el).text().trim();
      switch (idx) {
        case 0:
          grenade.name = text;
          break;
        case 1:
          grenade.courses = parseCourses(text);
          break;
        case 2:
          grenade.dmg = text;
          break;
        case 3:
          specialDmg = `Blast Damage: ${text}`;
          break;
        case 4:
          if (specialDmg.length > 0) {
            specialDmg = `${specialDmg}, Blast Radius: ${text}.`;
          }
          break;
        case 5:
          grenade.cost = text;
          grenade.sp = parseSP(text);
          break;
        case 6:
          // swap desc and special fields of the base grenade
          if (grenade.special) {
            grenade.desc = grenade.special;
            grenade.special = `${specialDmg} ${text}`;
          }
          break;
      }
    });
    delete grenade.examples;
    grenades.push(grenade);
  });
  return grenades;
};

const getAdvancedAmmo = (page: string): ShopItem[] => {
  const $ = load(page);
  const items: ShopItem[] = [];
  const table = $("#mw-content-text > div > table > tbody");
  const tableElements = table.children("tr");
  tableElements.each((idx, row) => {
    if (idx === 0) {
      // first row for wiki tables is header
      return;
    }
    const item: ShopItem = {
      type: "consumable",
      section: "Advanced Ammo",
      courses: "weapons",
      bulk: 0,
      desc: "",
      cost: "",
    };
    const rowElements = $(row).children("td");
    rowElements.each((idx, el) => {
      const text = $(el).text().trim();
      switch (idx) {
        case 0:
          item.name = `${text} Ammo`;
          break;
        case 1:
          item.cost = text;
          item.sp = parseSP(text);
          break;
        case 2:
          item.desc = text;
          break;
      }
    });
    items.push(item);
  });
  return items;
};

const getArmor = (page: string): ShopItem[] => {
  const $ = load(page);
  const items: ShopItem[] = [];
  const tables = $(".wikitable");
  tables.each((idx, table) => {
    if (idx === 0) {
      const armorElements = $(table).children().first().children("tr");
      armorElements.each((idx, row) => {
        if (idx === 0) {
          // first row for wiki tables is header
          return;
        }
        const item: ShopItem = {
          type: "armor",
          section: "Armor",
          uses: { adjust: { time: "permanent", attr: {} } },
          bulk: 0,
          desc: "",
          cost: "",
        };
        const rowElements = $(row).children("td");
        let armorValue = "";
        let parsedArmor: number | undefined;
        let parsedBurden: number | undefined;
        rowElements.each((idx, el) => {
          const text = $(el).text().trim();
          switch (idx) {
            case 0:
              item.name = text;
              break;
            case 1:
              armorValue = `Armor Value: ${text}`;
              parsedArmor = parseInt(text);
              if (!isNaN(parsedArmor) && item.uses && item.uses.adjust) {
                item.uses.adjust.attr.armor = parsedArmor;
              }
              break;
            case 2:
              item.desc = `${armorValue}, Burden: ${text}`;
              parsedBurden = parseInt(text);
              if (!isNaN(parsedBurden) && item.uses && item.uses.adjust) {
                item.uses.adjust.attr.burden = parsedBurden;
              }
              break;
            case 3:
              item.bulk = parseBulk(text);
              break;
            case 4:
              item.cost = text;
              item.sp = parseSP(text);
              break;
          }
        });
        items.push(item);
      });
    } else if (idx === 1) {
      const shieldElements = $(table).children().first().children("tr");
      shieldElements.each((idx, row) => {
        if (idx === 0) {
          // first row for wiki tables is header
          return;
        }
        const item: ShopItem = {
          type: "shield",
          section: "Shields",
          uses: { adjust: { time: "permanent", attr: {} } },
          bulk: 0,
          desc: "",
          cost: "",
        };
        const rowElements = $(row).children("td");
        let shieldBonus = "";
        let parsedShield: number | undefined;
        let parsedBurden: number | undefined;
        let parsedHandsUsed: number | undefined;
        rowElements.each((idx, el) => {
          const text = $(el).text().trim();
          switch (idx) {
            case 0:
              item.name = text;
              break;
            case 1:
              shieldBonus = `Shield Bonus: ${text}`;
              parsedShield = parseInt(text);
              if (!isNaN(parsedShield) && item.uses && item.uses.adjust) {
                item.uses.adjust.attr.shield = parsedShield;
              }
              break;
            case 2:
              item.special = `Hands Required to Equip: ${text}`;
              parsedHandsUsed = parseInt(text);
              if (!isNaN(parsedHandsUsed) && item.uses && item.uses.adjust) {
                item.uses.adjust.attr.free_hands = -parsedHandsUsed;
              }
              break;
            case 3:
              item.desc = `${shieldBonus}, Burden: ${text}`;
              parsedBurden = parseInt(text);
              if (!isNaN(parsedBurden) && item.uses && item.uses.adjust) {
                item.uses.adjust.attr.burden = parsedBurden;
              }
              break;
            case 4:
              item.bulk = parseBulk(text);
              break;
            case 5:
              item.cost = text;
              item.sp = parseSP(text);
              break;
          }
        });
        items.push(item);
      });
    }
  });
  return items;
};

export const fetchShopItems = async (
  weaponTypes: ShopItem[]
): Promise<ShopItem[]> => {
  console.log("starting to web scrape shop items");
  const equipment = await axios.get(EQUIPMENT_URL).then((response) => {
    const $ = load(response.data);
    // Adventuring Gear table
    const gear = parseTable(
      $,
      "#mw-content-text > div > table:nth-child(6) > tbody",
      "equipment",
      "Adventuring Gear",
      false
    );
    // Unusual Devices table
    const devices = parseTable(
      $,
      "#mw-content-text > div > table:nth-child(10) > tbody",
      "equipment",
      "Unusual Devices"
    );
    return gear.concat(devices);
  });
  const consumables = await axios.get(CONSUMABLE_URL).then((response) => {
    const $ = load(response.data);
    // Mundane Consumables table
    const mundane = parseTable(
      $,
      "#mw-content-text > div > table:nth-child(7) > tbody",
      "consumable",
      "Mundane Consumables"
    );
    // Unusual Consumables table
    const unusual = parseTable(
      $,
      "#mw-content-text > div > table:nth-child(11) > tbody",
      "consumable",
      "Unusual Consumables"
    );
    return mundane.concat(unusual);
  });
  const containers = await axios.get(CONTAINER_URL).then((response) => {
    return getContainers(response.data);
  });
  const advancedWeapons = await axios
    .get(ADVANCED_WEAPONS_URL)
    .then((response) => {
      return getAdvancedWeapons(response.data, weaponTypes);
    });
  const grenades = await axios.get(GRENADES_URL).then((response) => {
    return getGrenades(response.data, weaponTypes);
  });
  const advancedAmmo = await axios.get(ADVANCED_AMMO_URL).then((response) => {
    return getAdvancedAmmo(response.data);
  });
  const armor = await axios.get(ARMOR_URL).then((response) => {
    return getArmor(response.data);
  });
  const items = equipment.concat(
    consumables,
    advancedAmmo,
    containers,
    defaultWeapons,
    grenades,
    advancedWeapons,
    armor
  );

  // add custom uses
  items.forEach((item) => {
    if (item.name && SHOP_ITEM_USES[item.name]) {
      item.uses = SHOP_ITEM_USES[item.name];
    }
  });

  console.log("complete web scrape shop items");
  return items;
};
