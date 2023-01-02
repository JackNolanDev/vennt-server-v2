import { writeFileSync } from "fs";
import {
  dbGetJSONDocument,
  dbUpsertJSONDocument,
} from "../daos/jsonStorageDao";
import { wrapErrorResult, wrapSuccessResult } from "../utils/db";
import {
  ABILITIES_ITEMS_KEY,
  JsonStorageKey,
  Result,
  SHOP_ITEMS_KEY,
  ShopItem,
  WEAPON_TYPES_KEY,
} from "../utils/types";
import { fetchAbilities } from "../webscraper/abilities";
import { fetchShopItems } from "../webscraper/shopItems";
import { fetchWeaponTypes } from "../webscraper/weaponTypes";

export const handleUpdateJsonStorage = async (
  key: JsonStorageKey
): Promise<Result<boolean>> => {
  switch (key) {
    case WEAPON_TYPES_KEY:
      return handleUpdateWeaponTypes();
    case SHOP_ITEMS_KEY:
      return handleUpdateShopItems();
    case ABILITIES_ITEMS_KEY:
      return handleUpdateAbilities();
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
  if (!weaponTypes.success) return weaponTypes;
  const shopItems = await fetchShopItems(weaponTypes.result);
  return dbUpsertJSONDocument(SHOP_ITEMS_KEY, shopItems);
};

const handleUpdateAbilities = async (): Promise<Result<boolean>> => {
  const response = await fetchAbilities();
  writeFileSync("abilities.json", JSON.stringify(response));
  return wrapSuccessResult(true);
};
