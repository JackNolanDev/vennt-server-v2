import { UncompleteEntityAbility, attributeNameValidator } from "vennt-library";

export const addProgrammaticUses = (ability: UncompleteEntityAbility): void => {
  handleWeaponAbilities(ability);
};

const handleWeaponAbilities = (ability: UncompleteEntityAbility): void => {
  const weaponRegex =
    /When you attack with an? (?<weaponType>\w*) weapon you gain \+(?<acc>\d*) Accuracy and \+(?<dmg>\d*) damage/i;
  const weaponAbility = ability.effect.match(weaponRegex);
  if (!weaponAbility || !weaponAbility.groups) {
    return;
  }

  const weaponType = weaponAbility.groups.weaponType?.toLowerCase();
  const acc = parseInt(weaponAbility.groups.acc);
  const dmg = parseInt(weaponAbility.groups.dmg);
  if (!weaponType || isNaN(acc) || isNaN(dmg)) {
    return;
  }

  const weaponAcc = `${weaponType}_acc`;
  const weaponDmg = `${weaponType}_dmg`;

  const parsedWeaponAcc = attributeNameValidator.safeParse(weaponAcc);
  const parsedWeaponDmg = attributeNameValidator.safeParse(weaponDmg);
  if (!parsedWeaponAcc.success || !parsedWeaponDmg.success) {
    return;
  }

  ability.uses = {
    ...ability.uses,
    adjust: {
      time: "permanent",
      attr: {
        [parsedWeaponAcc.data]: acc,
        [parsedWeaponDmg.data]: dmg,
      },
    },
  };
};
