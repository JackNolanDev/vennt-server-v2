import {
  dbGetJSONDocument,
  dbUpsertJSONDocument,
} from "../daos/jsonStorageDao";
import { wrapErrorResult } from "../utils/db";
import {
  ABILITIES_KEY,
  ABILITIES_KEY_OLD,
  JsonStorageKey,
  PathsAndAbilities,
  Result,
  SHOP_ITEMS_KEY,
  ShopItem,
  WEAPON_TYPES_KEY,
} from "../utils/types";
import { fetchAbilities } from "../webscraper/abilities";
import { rebuildAbilityUses } from "../webscraper/abilitiesRebuildUses";
import { fetchShopItems } from "../webscraper/shopItems";
import { rebuildItemUses } from "../webscraper/shopItemsRebuildUses";
import { fetchWeaponTypes } from "../webscraper/weaponTypes";
import { mergeAbilities } from "./mergeAbilities";

export const handleUpdateJsonStorage = async (
  key: JsonStorageKey
): Promise<Result<boolean>> => {
  switch (key) {
    case WEAPON_TYPES_KEY:
      return handleUpdateWeaponTypes();
    case SHOP_ITEMS_KEY:
      return handleUpdateShopItems();
    case ABILITIES_KEY:
      return handleUpdateAbilities();
    case ABILITIES_KEY_OLD:
      return handleUpdateAbilitiesForwardCompatible();
    default:
      console.log(
        `handleUpdateJsonStorage - unexpected json storage key: ${key}`
      );
  }
  return wrapErrorResult("key type not handled", 400);
};

const handleUpdateWeaponTypes = async (): Promise<Result<boolean>> => {
  const weaponTypes = await fetchWeaponTypes();
  return dbUpsertJSONDocument(WEAPON_TYPES_KEY, weaponTypes);
};

const handleUpdateShopItems = async (): Promise<Result<boolean>> => {
  const weaponTypes = await dbGetJSONDocument<ShopItem[]>(WEAPON_TYPES_KEY);
  const shopItems = await fetchShopItems(weaponTypes);
  return dbUpsertJSONDocument(SHOP_ITEMS_KEY, shopItems);
};

const handleUpdateAbilities = async (): Promise<Result<boolean>> => {
  const abilities = await fetchAbilities();
  return dbUpsertJSONDocument(ABILITIES_KEY, abilities);
};

const handleUpdateAbilitiesForwardCompatible = async (): Promise<
  Result<boolean>
> => {
  const oldAbilities = await dbGetJSONDocument<PathsAndAbilities>(
    ABILITIES_KEY_OLD
  );
  const newAbilities = await fetchAbilities();
  const abilities = mergeAbilities(oldAbilities, newAbilities);
  const updatedAbilities = rebuildAbilityUses(abilities);
  return dbUpsertJSONDocument(ABILITIES_KEY, updatedAbilities);
};

export const handleRebuildUses = async (
  key: JsonStorageKey
): Promise<Result<boolean>> => {
  switch (key) {
    case SHOP_ITEMS_KEY:
      return handleRebuildUsesShopItems();
    case ABILITIES_KEY:
      return handleRebuildUsesAbilities();
    default:
      console.log(
        `handleUpdateJsonStorage - unexpected json storage key: ${key}`
      );
  }
  return wrapErrorResult("key type not handled", 400);
};

const handleRebuildUsesShopItems = async (): Promise<Result<boolean>> => {
  const shopItems = await dbGetJSONDocument<ShopItem[]>(SHOP_ITEMS_KEY);
  const updatedShopItems = rebuildItemUses(shopItems);
  return dbUpsertJSONDocument(SHOP_ITEMS_KEY, updatedShopItems);
};

const handleRebuildUsesAbilities = async (): Promise<Result<boolean>> => {
  const abilities = await dbGetJSONDocument<PathsAndAbilities>(ABILITIES_KEY);
  const updatedAbilities = rebuildAbilityUses(abilities);
  return dbUpsertJSONDocument(ABILITIES_KEY, updatedAbilities);
};
