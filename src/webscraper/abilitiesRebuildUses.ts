import { PathsAndAbilities } from "../utils/types";
import { ABILITY_USES } from "./abilitiesUses";

export const rebuildAbilityUses = (
  abilities: PathsAndAbilities
): PathsAndAbilities => {
  abilities.abilities.forEach((ability) => {
    if (ABILITY_USES[ability.name]) {
      ability.uses = ABILITY_USES[ability.name];
    }
  });
  return abilities;
};
