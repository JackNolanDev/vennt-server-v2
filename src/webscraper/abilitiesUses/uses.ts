import { UsesMap } from "../../utils/types";
import { AIR_ARCANA_USES } from "./paths/air_arcana";
import { ARCANE_DUELIST_USES } from "./paths/arcane_duelist";
import { ARCANE_WEAPONS_USES } from "./paths/arcane_weapons";
import { BARBARIAN_USES } from "./paths/barbarian";
import { BEGINNER_USES } from "./paths/beginner";
import { BLACKSMITH_USES } from "./paths/blacksmith";
import { FIGHTER_USES } from "./paths/fighter";
import { FOCUSED_FIST_USES } from "./paths/focused_fist";
import { GIFTED_MAGICIAN_USES } from "./paths/gifted_magician";
import { HEROIC_ARCANA_USES } from "./paths/heroic_arcana";
import { LIGHTNING_ARCANA_USES } from "./paths/lightning_arcana";
import { MAGICIAN_USES } from "./paths/magician";
import { MAGUS_USES } from "./paths/magus";
import { NATURE_ARCANA_USES } from "./paths/nature_arcana";
import { NECROMANCY_ARCANA_USES } from "./paths/necromancy_arcana";
import { SPELLCASTER_USES } from "./paths/spellcaster";
import { SPELLSWORD_USES } from "./paths/spellsword";
import { TINKER_USES } from "./paths/tinker";
import { UNIVERSALIST_ARCANA_USES } from "./paths/universalist_arcana";

export const REPEATABLE_SIGNIFIERS = [
  "may be purchased multiple times",
  "may be taken multiple times",
  "take this ability multiple times",
  "this ability can be taken multiple times",
  "you must meet the minimum level specified to purchase a bonus",
];

// TODO: Should probably organize this by path to make it easier to maintain / split into different files
export const ABILITY_USES: Record<string, UsesMap> = {
  ...AIR_ARCANA_USES,
  ...ARCANE_DUELIST_USES,
  ...ARCANE_WEAPONS_USES,
  ...BARBARIAN_USES,
  ...BEGINNER_USES,
  ...BLACKSMITH_USES,
  ...FIGHTER_USES,
  ...FOCUSED_FIST_USES,
  ...GIFTED_MAGICIAN_USES,
  ...HEROIC_ARCANA_USES,
  ...LIGHTNING_ARCANA_USES,
  ...MAGICIAN_USES,
  ...MAGUS_USES,
  ...NATURE_ARCANA_USES,
  ...NECROMANCY_ARCANA_USES,
  ...SPELLCASTER_USES,
  ...SPELLSWORD_USES,
  ...TINKER_USES,
  ...UNIVERSALIST_ARCANA_USES,
};
