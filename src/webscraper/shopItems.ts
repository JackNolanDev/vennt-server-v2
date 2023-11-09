import { CheerioAPI, load } from "cheerio";
import { EntityItemType, ITEM_TYPE_EQUIPMENT, ShopItem } from "vennt-library";
import { SHOP_ITEM_USES } from "./shopItemsUses";
import { parseBulk, parseSP, sleep } from "./webscraperUtils";

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
  Wheelchair: 20,
  "Wheelchair, Combat": 20,
  "Mystic Jezail": 2,
};

const itemTypeOverride: Record<string, EntityItemType> = {
  "Lockpick set": ITEM_TYPE_EQUIPMENT,
  "Lockpick set, Improved": ITEM_TYPE_EQUIPMENT,
};

const addSpecialItemDetails = (item: ShopItem): void => {
  if (!item.name) {
    return;
  }
  if (specialBulkMap[item.name]) {
    item.bulk = specialBulkMap[item.name];
  }
  if (itemTypeOverride[item.name]) {
    item.type = itemTypeOverride[item.name];
  }
  if (SHOP_ITEM_USES[item.name]) {
    item.uses = SHOP_ITEM_USES[item.name];
  }
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
    uses: {
      adjust: {
        time: "permanent",
        attr: { free_hands: -1 },
      },
    },
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
    uses: {
      adjust: {
        time: "permanent",
        attr: { free_hands: -1 },
      },
    },
  },
];

const parseTable = (
  $: CheerioAPI,
  selector: string,
  type: EntityItemType,
  section: string,
  courses?: string
): ShopItem[] => {
  const items: ShopItem[] = [];
  // Adventuring Gear table
  const table = $(selector);
  const tableElements = table.children("tr");
  tableElements.each((idx, row) => {
    if (idx <= 1) {
      // first 2 rows for wiki tables is header
      return;
    }
    const item: ShopItem = {
      type,
      section,
      courses,
      bulk: 1,
      desc: "",
      cost: "",
    };
    const rowElements = $(row).children("td");
    rowElements.each((idx, el) => {
      const text = $(el).text().trim();
      switch (idx) {
        case 0:
          item.name = text;
          // include data that's hard to automatically parse
          if (specialBulkMap[text] !== undefined) {
            item.bulk = specialBulkMap[text];
          }
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
    if (specialBulkMap[weapon.name] !== undefined) {
      weapon.bulk = specialBulkMap[weapon.name];
    }
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
  const selectors = [
    { selector: "#mw-content-text > div > table:nth-child(12) > tbody" },
    {
      selector: "#mw-content-text > div > table:nth-child(15) > tbody",
      courses: "Damages",
    },
  ];
  selectors.forEach((selector) => {
    const table = $(selector.selector);
    const tableElements = table.children("tr");
    tableElements.each((idx, row) => {
      if (idx === 0) {
        // first row for wiki tables is header
        return;
      }
      const grenade: ShopItem = {
        ...template,
        section: "Grenades",
        courses: selector.courses,
      };
      const rowElements = $(row).children("td");
      let specialDmg = "";
      rowElements.each((idx, el) => {
        const text = $(el).text().trim();
        switch (idx) {
          case 0:
            grenade.name = text;
            break;
          case 1:
            grenade.dmg = text;
            break;
          case 2:
            specialDmg = `Blast Damage: ${text}`;
            break;
          case 3:
            if (specialDmg.length > 0) {
              specialDmg = `${specialDmg}, Blast Radius: ${text}.`;
            }
            break;
          case 4:
            grenade.cost = text;
            grenade.sp = parseSP(text);
            break;
          case 5:
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
              if (!isNaN(parsedArmor) && item.uses && item.uses.adjust?.attr) {
                item.uses.adjust.attr.armor = parsedArmor;
              }
              break;
            case 2:
              item.desc = `${armorValue}, Burden: ${text}`;
              parsedBurden = parseInt(text);
              if (!isNaN(parsedBurden) && item.uses && item.uses.adjust?.attr) {
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
              if (!isNaN(parsedShield) && item.uses && item.uses.adjust?.attr) {
                item.uses.adjust.attr.shield = parsedShield;
              }
              break;
            case 2:
              item.special = `Hands Required to Equip: ${text}`;
              parsedHandsUsed = parseInt(text);
              if (
                !isNaN(parsedHandsUsed) &&
                item.uses &&
                item.uses.adjust?.attr
              ) {
                item.uses.adjust.attr.free_hands = -parsedHandsUsed;
              }
              break;
            case 3:
              item.desc = `${shieldBonus}, Burden: ${text}`;
              parsedBurden = parseInt(text);
              if (!isNaN(parsedBurden) && item.uses && item.uses.adjust?.attr) {
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
  const equipment = await fetch(EQUIPMENT_URL)
    .then((response) => response.text())
    .then((text) => {
      const $ = load(text);
      const mundaneBasic = parseTable(
        $,
        "#mw-content-text > div > table:nth-child(12) > tbody",
        "equipment",
        "Mundane Basic Equipment"
      );
      const unusualBasic = parseTable(
        $,
        "#mw-content-text > div > table:nth-child(14) > tbody",
        "equipment",
        "Unusual Basic Equipment"
      );
      const rareBasic = parseTable(
        $,
        "#mw-content-text > div > table:nth-child(16) > tbody",
        "equipment",
        "Rare Basic Equipment (Cannot be purchased)"
      );
      const mundaneCombat = parseTable(
        $,
        "#mw-content-text > div > table:nth-child(19) > tbody",
        "equipment",
        "Mundane Combat Equipment",
        "Combat"
      );
      const unusualCombat = parseTable(
        $,
        "#mw-content-text > div > table:nth-child(20) > tbody",
        "equipment",
        "Unusual Combat Equipment",
        "Combat"
      );
      return mundaneBasic.concat(
        unusualBasic,
        rareBasic,
        mundaneCombat,
        unusualCombat
      );
    });
  console.log("equipment done");

  await sleep(2000);

  const consumables = await fetch(CONSUMABLE_URL)
    .then((response) => response.text())
    .then((text) => {
      const $ = load(text);
      const mundaneBasic = parseTable(
        $,
        "#mw-content-text > div > table:nth-child(12) > tbody",
        "consumable",
        "Mundane Basic Consumables"
      );
      const unusualBasic = parseTable(
        $,
        "#mw-content-text > div > table:nth-child(13) > tbody",
        "consumable",
        "Unusual Basic Consumables"
      );
      const rareBasic = parseTable(
        $,
        "#mw-content-text > div > table:nth-child(14) > tbody",
        "consumable",
        "Rare Basic Consumables (Cannot be purchased)"
      );
      const mundaneHeroic = parseTable(
        $,
        "#mw-content-text > div > table:nth-child(17) > tbody",
        "consumable",
        "Mundane Heroic Consumables",
        "Heroism"
      );
      const mundaneDamage = parseTable(
        $,
        "#mw-content-text > div > table:nth-child(20) > tbody",
        "consumable",
        "Mundane Damage Consumables",
        "Damages"
      );
      const unusualDamage = parseTable(
        $,
        "#mw-content-text > div > table:nth-child(22) > tbody",
        "consumable",
        "Unusual Damage Consumables",
        "Damages"
      );
      const mundaneBaseCourse = parseTable(
        $,
        "#mw-content-text > div > table:nth-child(27) > tbody",
        "consumable",
        "Mundane Base Course Consumables",
        "Heroism, Combat, Conditions, Damages, Surroundings, Wounds, Flux, Deltas"
      );
      const unusualBaseCourse = parseTable(
        $,
        "#mw-content-text > div > table:nth-child(28) > tbody",
        "consumable",
        "Unusual Base Course Consumables",
        "Heroism, Combat, Conditions, Damages, Surroundings, Wounds, Flux, Deltas"
      );
      return mundaneBasic.concat(
        unusualBasic,
        rareBasic,
        mundaneHeroic,
        mundaneDamage,
        unusualDamage,
        mundaneBaseCourse,
        unusualBaseCourse
      );
    });
  console.log("consumables done");

  await sleep(2000);

  const containers = await fetch(CONTAINER_URL)
    .then((response) => response.text())
    .then((text) => getContainers(text));
  console.log("containers done");

  await sleep(2000);

  const advancedWeapons = await fetch(ADVANCED_WEAPONS_URL)
    .then((response) => response.text())
    .then((text) => getAdvancedWeapons(text, weaponTypes));
  console.log("advanced weapons done");

  await sleep(2000);

  const grenades = await fetch(GRENADES_URL)
    .then((response) => response.text())
    .then((text) => getGrenades(text, weaponTypes));
  console.log("grenades done");

  await sleep(2000);

  const advancedAmmo = await fetch(ADVANCED_AMMO_URL)
    .then((response) => response.text())
    .then((text) => getAdvancedAmmo(text));
  console.log("ammo done");

  await sleep(2000);

  const armor = await fetch(ARMOR_URL)
    .then((response) => response.text())
    .then((text) => getArmor(text));
  console.log("armor done");

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
    addSpecialItemDetails(item);
  });

  console.log("complete web scrape shop items");
  return items;
};
