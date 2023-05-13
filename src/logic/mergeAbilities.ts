import {
  PathDetails,
  PathsAndAbilities,
  UncompleteEntityAbility,
} from "../utils/types";

const corePaths = [
  "Path of the Beginner",
  "Path of the Fighter",
  "Path of the Magician",
  "Path of the Scholar",
  "Path of the Tinker",
  "Path of the Barbarian",
  "Path of the Duelist",
  "Path of the Duke",
  "Path of the Fluid Fighter",
  "Path of the Gunner",
  "Path of the Knight",
  "Path of the Marksman",
  "Path of the Rogue",
  "Path of the Rover",
  "Path of the Cantrips",
  "Path of the Divination Arcana",
  "Path of the Magus",
  "Path of the Raw Arcana",
  "Path of the Shadow Arcana",
  "Path of the Temporal Arcana",
  "Path of the Thaumaturgy Arcana",
  "Path of the Universalist Arcana",
  "Path of the Wizard",
  "Path of the Alchemist",
  "Path of the Artificer",
  "Path of the Bard",
  "Path of the Fluke",
  "Path of the Investigator",
  "Path of the Leader",
  "Path of the Physician",
  "Path of the Savant",
  "Path of the Tactician",
  "Path of the Armor Tinker",
  "Path of the Artillery Tinker",
  "Path of the Automaton Tinker",
  "Path of the Blacksmith",
  "Path of the Gadget Tinker",
  "Path of the Transport Tinker",
  "Path of the Colorful",
  "Path of the Hero",
  "Path of the Armed",
];

export const mergeAbilities = (
  oldAbilities: PathsAndAbilities,
  newAbilities: PathsAndAbilities
): PathsAndAbilities => {
  const pathMap = oldAbilities.paths.reduce<Record<string, PathDetails>>(
    (acc, path) => {
      acc[path.name] = path;
      return acc;
    },
    {}
  );
  newAbilities.paths.forEach((path) => {
    pathMap[path.name] = path;
  });
  const pathList = Object.values(pathMap);

  const abilityMap = oldAbilities.abilities.reduce<
    Record<string, UncompleteEntityAbility>
  >((acc, ability) => {
    acc[ability.name] = ability;
    return acc;
  }, {});
  newAbilities.abilities.forEach((ability) => {
    if (
      abilityMap[ability.name] ||
      corePaths.includes(ability.custom_fields?.path ?? "")
    ) {
      // Two cases for adding new definitions
      // 1. Overwriting something that is already in the paths (always use new versions)
      // 2. ONLY add new paths from the core set, for now.
      abilityMap[ability.name] = ability;
    }
  });
  const abilityList = Object.values(abilityMap);

  return { paths: pathList, abilities: abilityList };
};
