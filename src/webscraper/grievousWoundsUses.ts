import { UsesMap } from "vennt-library";

export const GRIEVOUS_WOUNDS_USES: Record<string, UsesMap> = {
  "Achilles’ Heel": { adjust: { time: "permanent", attr: { speed: -3 } } },
  Amnesia: { adjust: { time: "permanent", attr: { int: -2 } } },
  "Arr!": { adjust: { time: "permanent", attr: { per: -1 } } },
  "Arrow to the Knee": { adjust: { time: "permanent", attr: { speed: -2 } } },
  "Bad Back": {
    adjust: { time: "permanent", attr: { speed: -2, carrying_capacity: -20 } },
  },
  Blinded: { adjust: { time: "permanent", attr: { per: -2 } } },
  "Broken Arm": {
    adjust: { time: "permanent", attr: { dex: -1, free_hands: -1 } },
  },
  "Broken Leg": { adjust: { time: "permanent", attr: { speed: -2, agi: -1 } } },
  "Broken Ribs": { adjust: { time: "permanent", attr: { str: -2 } } },
  "Burnt Out": { adjust: { time: "permanent", attr: { spi: -1 } } },
  "Burnt Tongue": {
    adjust: {
      time: "permanent",
      dice: { casting: { end: "-2" }, cha: { end: "-2" } },
    },
  },
  Chilled: { adjust: { time: "permanent", attr: { agi: -1 } } },
  Concussed: { adjust: { time: "permanent", attr: { per: -1, int: -1 } } },
  "Cool Scar": {
    inputs: [
      {
        type: "radio",
        key: "scar_choice",
        choices: { "No Negatives": [], "Lose Spirit": [], "Lose Charisma": [] },
      },
    ],
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "scar_choice" },
          right: { type: "const", const: "Lose Spirit" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { spi: -1 } },
      },
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "scar_choice" },
          right: { type: "const", const: "Lose Charisma" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { cha: -1 } },
      },
    ],
  },
  "Dain Bramage": { adjust: { time: "permanent", attr: { int: -1 } } },
  Deafened: { adjust: { time: "permanent", attr: { per: -2 } } },
  "Elbow Pierced": { adjust: { time: "permanent", attr: { dex: -1 } } },
  "Gone Dark": { adjust: { time: "permanent", attr: { per: -2 } } },
  "Gory Leg Wound": { adjust: { time: "permanent", attr: { speed: -3 } } },
  "Gut Slice": { adjust: { time: "permanent", attr: { str: -1 } } },
  "I Bit My Tongue": {
    adjust: {
      time: "permanent",
      dice: { spi: { end: "-1" }, cha: { end: "-1" } },
    },
  },
  "I See the Light": { adjust: { time: "permanent", attr: { wis: 1 } } },
  "I’m So Cold…": { adjust: { time: "permanent", attr: { dex: -1 } } },
  "In the Shoulder": {
    adjust: { time: "permanent", attr: { str: -1, free_hands: -1 } },
  },
  "Lame Scar": {
    inputs: [
      {
        type: "radio",
        key: "scar_choice",
        choices: { "Lose Spirit": [], "Lose Charisma": [] },
      },
    ],
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "scar_choice" },
          right: { type: "const", const: "Lose Spirit" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { spi: -1 } },
      },
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "scar_choice" },
          right: { type: "const", const: "Lose Charisma" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { cha: -1 } },
      },
    ],
  },
  Lethargy: { adjust: { time: "permanent", attr: { max_vim: "max_vim/2" } } },
  "Missing Digits": { adjust: { time: "permanent", attr: { dex: -1 } } },
  "Missing Ear": { adjust: { time: "permanent", attr: { agi: -1 } } },
  "Muscle Weakness": {
    adjust: { time: "permanent", attr: { str: -1, dex: -1 } },
  },
  "Muscle Spasms": { adjust: { time: "permanent", dice: { dex: { ebb: 1 } } } },
  Overburnt: {
    adjust: { time: "permanent", attr: { burn_damage_resistance: -1 } },
  },
  "Pierced Hamstring": { adjust: { time: "permanent", attr: { speed: -3 } } },
  "Pierced in the Hand": {
    adjust: { time: "permanent", attr: { dex: -1, free_hands: -1 } },
  },
  "Punctured Lung": {
    adjust: { time: "permanent", attr: { max_hp: -3, speed: -2 } },
  },
  "Right Between the Eyes": {
    adjust: { time: "permanent", attr: { int: -1 } },
  },
  "Right in the Ear": { adjust: { time: "permanent", attr: { agi: -1 } } },
  "Ruined Hand": {
    adjust: { time: "permanent", attr: { dex: -1, free_hands: -1 } },
  },
  "Ruined Leg": { adjust: { time: "permanent", attr: { speed: -3 } } },
  "Ruptured Kidney": { adjust: { time: "permanent", attr: { str: -1 } } },
  Schizophrenia: { adjust: { time: "permanent", attr: { wis: -1 } } },
  "Seeing Triple": {
    adjust: {
      time: "permanent",
      dice: { per: { end: "-2" } },
      attr: { acc: -30 },
    },
  },
  "Severed Hand": {
    adjust: { time: "permanent", attr: { dex: -1, free_hands: -1 } },
  },
  "Shattered Hand": {
    adjust: { time: "permanent", attr: { dex: -1, free_hands: -1 } },
  },
  Shrunken: {
    adjust: { time: "permanent", attr: { speed: -4, str: -1, agi: 1 } },
  },
  "Slashed Across the Eyes": {
    adjust: { time: "permanent", attr: { per: -2 } },
  },
  "Sliced Bicep": { adjust: { time: "permanent", attr: { str: -1 } } },
  "Sliced Nerve": { adjust: { time: "permanent", attr: { agi: -1 } } },
  "Spastic Muscles": { adjust: { time: "permanent", attr: { dex: -1 } } },
  "That Shouldn’t Bend Like That": {
    adjust: {
      time: "permanent",
      attr: { speed: -2, carrying_capacity: "carrying_capacity/2" },
    },
  },
  "Ugly Scar": {
    inputs: [
      {
        type: "radio",
        key: "scar_choice",
        choices: { "Lose Spirit": [], "Lose Charisma": [] },
      },
    ],
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "scar_choice" },
          right: { type: "const", const: "Lose Spirit" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { spi: -1 } },
      },
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "scar_choice" },
          right: { type: "const", const: "Lose Charisma" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { cha: -1 } },
      },
    ],
  },
  "Ugly Wound": {
    inputs: [
      {
        type: "radio",
        key: "scar_choice",
        choices: { "Lose Spirit": [], "Lose Charisma": [] },
      },
    ],
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "scar_choice" },
          right: { type: "const", const: "Lose Spirit" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { spi: -1 } },
      },
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "scar_choice" },
          right: { type: "const", const: "Lose Charisma" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { cha: -1 } },
      },
    ],
  },
  Vertigo: { adjust: { time: "permanent", attr: { agi: -1 } } },
  Vulnerable: {
    inputs: [
      {
        type: "radio",
        key: "vul_choice",
        choices: { "1": [], "2": [], "3": [], "4": [], "5": [], "6": [] },
      },
    ],
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "vul_choice" },
          right: { type: "const", const: "1" },
          operator: "equals",
        },
        adjust: {
          time: "permanent",
          attr: { slashing_damage_resistance: -1, bleed_damage_resistance: -1 },
        },
      },
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "vul_choice" },
          right: { type: "const", const: "2" },
          operator: "equals",
        },
        adjust: {
          time: "permanent",
          attr: { piercing_damage_resistance: -1, bleed_damage_resistance: -1 },
        },
      },
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "vul_choice" },
          right: { type: "const", const: "3" },
          operator: "equals",
        },
        adjust: {
          time: "permanent",
          attr: { bludgeoning_damage_resistance: -1 },
        },
      },
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "vul_choice" },
          right: { type: "const", const: "4" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { burn_damage_resistance: -1 } },
      },
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "vul_choice" },
          right: { type: "const", const: "5" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { galvanic_damage_resistance: -1 } },
      },
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "vul_choice" },
          right: { type: "const", const: "6" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { magical_damage_resistance: -1 } },
      },
    ],
  },
  "Weak Joints": {
    adjust: { time: "permanent", attr: { speed: -2, max_vim: -5 } },
    inputs: [
      {
        type: "radio",
        key: "scar_choice",
        choices: { "Lose Spirit": [], "Lose Charisma": [] },
      },
    ],
    criteria_benefits: [
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "scar_choice" },
          right: { type: "const", const: "Lose Spirit" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { spi: -1 } },
      },
      {
        criteria: {
          type: "comp",
          left: { type: "key", key: "scar_choice" },
          right: { type: "const", const: "Lose Charisma" },
          operator: "equals",
        },
        adjust: { time: "permanent", attr: { cha: -1 } },
      },
    ],
  },
};
