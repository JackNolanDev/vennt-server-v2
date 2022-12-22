import { UsesMap } from "../utils/types";

export const SHOP_ITEM_USES: Record<string, UsesMap> = {
  "Elixir of Energy*": {
    roll: { dice: "6d6", attr: "vim" },
  },
  "Elixir of Focus*": {
    roll: { dice: "3d6", attr: "mp" },
  },
  "Elixir of Life*": {
    roll: { dice: "6d6", attr: "hp" },
  },
  Godfire: {
    roll: { dice: "2d6", attr: "hp" },
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
    roll: { dice: "4d6", attr: "hp" },
  },
  Tea: {
    roll: { dice: "1d6", attr: "mp" },
  },
  "Fighter Candy": {
    heal: {
      attr: { hp: 1, vim: 3 },
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
  "Alcohol, Fancy*": {
    adjust: {
      time: "rest",
      attr: { cha: 1, wis: 1 },
    },
  },
  "Barkskin Potion": {
    adjust: {
      time: "encounter",
      attr: { armor: 3 },
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
  "Backpack, Armored": {
    adjust: {
      time: "permanent",
      attr: { armor: 2 },
    },
  },
  "Lockpick set, Improved": {
    check: { bonus: "+3", attr: "dex" },
  },
};
