import { UsesMap } from "../utils/types";

export const SHOP_ITEM_USES: Record<string, UsesMap> = {
  "Elixir of Energy": {
    roll: { dice: "6d6", attr: "vim", heal: { recovery_shock: 6 } },
  },
  "Elixir of Focus": {
    roll: { dice: "3d6", attr: "mp", heal: { recovery_shock: 6 } },
  },
  "Elixir of Life": {
    roll: { dice: "6d6", attr: "hp", heal: { recovery_shock: 6 } },
  },
  Godfire: {
    roll: { dice: "2d6", attr: "hp", heal: { recovery_shock: 2 } },
  },
  "Potion, Healing": {
    roll: { dice: "3d6", attr: "hp" },
  },
  "Potion, Mana": {
    roll: { dice: "2d6", attr: "mp" },
  },
  "Potion, Vigor": {
    roll: { dice: "4d6", attr: "vim" },
  },
  "Sour Blessing": {
    roll: { dice: "4d6", attr: "hp", heal: { recovery_shock: 3 } },
  },
  Tea: {
    roll: { dice: "1d6", attr: "mp" },
  },
  "Fighter Candy": {
    heal: {
      attr: { hp: 1, vim: 3, recovery_shock: 1 },
    },
  },
  Rations: {
    heal: {
      attr: { hp: 1, mp: 1, vim: 3 },
    },
  },
  "Rations, Expensive": {
    heal: {
      attr: { hp: 3, mp: 3, vim: 9 },
    },
  },
  "Tasty Water": {
    heal: {
      attr: { hp: 3, mp: 3, vim: 6 },
    },
  },
  "Tasty Water, Deluxe": {
    heal: {
      attr: { hp: 6, mp: 6, vim: 12 },
    },
  },
  "Alcohol, Fancy": {
    adjust: {
      time: "rest",
      attr: { cha: 1, wis: 1 },
    },
  },
  "Barkskin Potion": {
    adjust: {
      time: "encounter",
      attr: { armor: 4 },
    },
  },
  "Coffee, Fancy": {
    roll: { dice: "1d6", attr: "mp" },
    adjust: {
      time: "encounter",
      attr: { per: 1, agi: 1 },
    },
  },
  "Rockskin Potion": {
    adjust: {
      time: "encounter",
      attr: { armor: 7, speed: "speed/2" },
    },
  },
  Ambrosia: {
    heal: {
      attr: { hp: 10000, vim: 10000, mp: 10000, recovery_shock: 9 },
    },
  },
  "Backpack, Armored": {
    adjust: {
      time: "permanent",
      attr: { armor: 2 },
    },
  },
  "Lockpick set": {
    check: {
      bonus: "+2",
      attr: "dex",
      label: "Check made to open lock. Breaks on failure!",
    },
  },
  "Lockpick set, Improved": {
    check: { bonus: "+4", attr: "dex", label: "Check made to open lock" },
  },
  Spyglass: {
    check: { bonus: "+(2*tek)", attr: "per" },
  },
  "Periscoping Eyes": {
    check: { bonus: "+tek", attr: "per" },
  },
  "Six Lens Goggles": {
    check: { bonus: "+1", attr: "per" },
  },
  "Synesthetic Sonic Goggles": {
    check: { bonus: "+2", attr: "per" },
  },
  Crowbar: {
    check: { bonus: "+1", attr: "str" },
  },
  "Wheelchair, Combat": {
    adjust: { time: "permanent", attr: { free_hands: 1 } },
  },
  "Wrench, Multipurpose": { check: { bonus: "+2", attr: "tek" } },
};
