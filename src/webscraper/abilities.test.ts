import { describe, expect, test } from "bun:test";
import { UncompleteEntityAbility } from "vennt-library";
import { parseActivation } from "./abilities";

const BASE_ABILITY: UncompleteEntityAbility = {
  name: "test",
  effect: "test effect",
  active: false,
  custom_fields: {},
};

describe("parseActivation", () => {
  test("validate parseActivation sets cost map", () => {
    const duplicate = structuredClone(BASE_ABILITY);
    parseActivation("Activation: 2 Actions", duplicate);
    expect(duplicate.custom_fields?.activation).toBe("2 Actions");
    expect(duplicate.custom_fields?.cost).toStrictEqual({ actions: 2 });
  });
  test("validate parseActivation sets spell cost maps", () => {
    const duplicate = structuredClone(BASE_ABILITY);
    parseActivation("Activation: 2 Vim, [ 3 / 2 / 1 ] Action(s)", duplicate);
    expect(duplicate.custom_fields?.activation).toBe(
      "2 Vim, [ 3 / 2 / 1 ] Action(s)"
    );
    expect(duplicate.custom_fields?.cost).toStrictEqual({ vim: 2 });
    expect(duplicate.custom_fields?.spell_cost).toStrictEqual([
      { actions: 3 },
      { actions: 2 },
      { actions: 1 },
    ]);
  });
});
