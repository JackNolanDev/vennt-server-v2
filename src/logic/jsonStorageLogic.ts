import {
  dbGetJSONDocument,
  dbUpsertJSONDocument,
} from "../daos/jsonStorageDao";
import { wrapErrorResult } from "../utils/db";
import {
  ABILITIES_KEY,
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

export const handleUpdateJsonStorage = async (
  key: JsonStorageKey
): Promise<Result<boolean>> => {
  switch (key) {
    case WEAPON_TYPES_KEY:
      return handleUpdateWeaponTypes(key);
    case SHOP_ITEMS_KEY:
      return handleUpdateShopItems(key);
    case ABILITIES_KEY:
      return handleUpdateAbilities(key);
    default:
      console.log(
        `handleUpdateJsonStorage - unexpected json storage key: ${key}`
      );
  }
  return wrapErrorResult("key type not handled", 400);
};

const handleUpdateWeaponTypes = async (
  key: JsonStorageKey
): Promise<Result<boolean>> => {
  const weaponTypes = await fetchWeaponTypes();
  return dbUpsertJSONDocument(key, weaponTypes);
};

const handleUpdateShopItems = async (
  key: JsonStorageKey
): Promise<Result<boolean>> => {
  const weaponTypes = await dbGetJSONDocument<ShopItem[]>(key);
  const shopItems = await fetchShopItems(weaponTypes);
  return dbUpsertJSONDocument(key, shopItems);
};

const handleUpdateAbilities = async (
  key: JsonStorageKey
): Promise<Result<boolean>> => {
  const abilities = await fetchAbilities();
  return dbUpsertJSONDocument(key, abilities);
};

export const handleRebuildUses = async (
  key: JsonStorageKey
): Promise<Result<boolean>> => {
  switch (key) {
    case SHOP_ITEMS_KEY:
      return handleRebuildUsesShopItems(key);
    case ABILITIES_KEY:
      return handleRebuildUsesAbilities(key);
    default:
      console.log(
        `handleUpdateJsonStorage - unexpected json storage key: ${key}`
      );
  }
  return wrapErrorResult("key type not handled", 400);
};

const handleRebuildUsesShopItems = async (
  key: JsonStorageKey
): Promise<Result<boolean>> => {
  const shopItems = await dbGetJSONDocument<ShopItem[]>(key);
  const updatedShopItems = rebuildItemUses(shopItems);
  return dbUpsertJSONDocument(key, updatedShopItems);
};

const handleRebuildUsesAbilities = async (
  key: JsonStorageKey
): Promise<Result<boolean>> => {
  const abilities = await dbGetJSONDocument<PathsAndAbilities>(key);
  const updatedAbilities = rebuildAbilityUses(abilities);
  return dbUpsertJSONDocument(key, updatedAbilities);
};
