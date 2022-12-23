import {
  dbGetJSONDocument,
  dbUpsertJSONDocument,
} from "../daos/jsonStorageDao";
import { wrapErrorResult } from "../utils/db";
import {
  JsonStorageKey,
  Result,
  SHOP_ITEMS_KEY,
  ShopItem,
  WEAPON_TYPES_KEY,
} from "../utils/types";
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
  if (!weaponTypes.success) {
    return wrapErrorResult("No weapon types in db", 500);
  }
  const shopItems = await fetchShopItems(weaponTypes.result);
  return dbUpsertJSONDocument(SHOP_ITEMS_KEY, shopItems);
};
