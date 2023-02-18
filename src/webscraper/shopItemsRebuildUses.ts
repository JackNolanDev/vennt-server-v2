import { ShopItem } from "../utils/types";
import { SHOP_ITEM_USES } from "./shopItemsUses";

/**
 * Rebuilds the given list of shop item's uses without recalling the webscraper
 * @param shopItems
 */
export const rebuildItemUses = (shopItems: ShopItem[]): ShopItem[] => {
  shopItems.forEach((item) => {
    if (item.name && SHOP_ITEM_USES[item.name]) {
      item.uses = SHOP_ITEM_USES[item.name];
    }
  });
  return shopItems;
};
