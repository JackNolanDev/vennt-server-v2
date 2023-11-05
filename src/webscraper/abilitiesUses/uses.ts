import { UsesMap } from "vennt-library";
import { AIR_ARCANA_USES } from "./paths/air_arcana";
import { ARCANE_DUELIST_USES } from "./paths/arcane_duelist";
import { ARCANE_WEAPONS_USES } from "./paths/arcane_weapons";
import { ATTACKER_USES } from "./paths/attacker";
import { BARBARIAN_USES } from "./paths/barbarian";
import { BEGINNER_USES } from "./paths/beginner";
import { BLACK_USES } from "./paths/black";
import { BLACKSMITH_USES } from "./paths/blacksmith";
import { DUELIST_USES } from "./paths/duelist";
import { FIGHTER_USES } from "./paths/fighter";
import { FOCUSED_FIST_USES } from "./paths/focused_fist";
import { GIFTED_MAGICIAN_USES } from "./paths/gifted_magician";
import { HERO_USES } from "./paths/hero";
import { HEROIC_ARCANA_USES } from "./paths/heroic_arcana";
import { INQUISITOR_USES } from "./paths/inquisitor";
import { KNIGHT_USES } from "./paths/knight";
import { LEGEND_USES } from "./paths/legend";
import { LIGHTNING_ARCANA_USES } from "./paths/lightning_arcana";
import { MAGICIAN_USES } from "./paths/magician";
import { MAGUS_USES } from "./paths/magus";
import { NATURE_ARCANA_USES } from "./paths/nature_arcana";
import { NECROMANCY_ARCANA_USES } from "./paths/necromancy_arcana";
import { PROTAGONIST_USES } from "./paths/protagonist";
import { RECRUIT_USES } from "./paths/recruit";
import { SAVANT_USES } from "./paths/savant";
import { SCHOLAR_USES } from "./paths/scholar";
import { SOLDIER_USES } from "./paths/soldier";
import { SPELLCASTER_USES } from "./paths/spellcaster";
import { SPELLSWORD_USES } from "./paths/spellsword";
import { TACTICIAN_USES } from "./paths/tactician";
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
  ...ATTACKER_USES,
  ...BARBARIAN_USES,
  ...BEGINNER_USES,
  ...BLACK_USES,
  ...BLACKSMITH_USES,
  ...DUELIST_USES,
  ...FIGHTER_USES,
  ...FOCUSED_FIST_USES,
  ...GIFTED_MAGICIAN_USES,
  ...HERO_USES,
  ...HEROIC_ARCANA_USES,
  ...INQUISITOR_USES,
  ...KNIGHT_USES,
  ...LEGEND_USES,
  ...LIGHTNING_ARCANA_USES,
  ...MAGICIAN_USES,
  ...MAGUS_USES,
  ...NATURE_ARCANA_USES,
  ...NECROMANCY_ARCANA_USES,
  ...PROTAGONIST_USES,
  ...RECRUIT_USES,
  ...SAVANT_USES,
  ...SCHOLAR_USES,
  ...SOLDIER_USES,
  ...SPELLCASTER_USES,
  ...SPELLSWORD_USES,
  ...TACTICIAN_USES,
  ...TINKER_USES,
  ...UNIVERSALIST_ARCANA_USES,
};

/*
Query examining most used but unsupported abilities

SELECT COUNT(*), a.name
FROM vennt.abilities a
JOIN vennt.entities e ON a.entity_id = e.id
WHERE a.uses IS NULL
AND e.type = 'CHARACTER'
GROUP BY a.name
ORDER BY COUNT(*) DESC
LIMIT 50;
*/
