import { PathsAndAbilities } from "vennt-library";
import { ABILITY_USES } from "./abilitiesUses/uses";

export const rebuildAbilityUses = (
  abilities: PathsAndAbilities
): PathsAndAbilities => {
  abilities.abilities.forEach((ability) => {
    if (ABILITY_USES[ability.name]) {
      console.log(`rebuildUses: Updating ${ability.name}`);
      ability.uses = ABILITY_USES[ability.name];
    }
  });
  return abilities;
};
